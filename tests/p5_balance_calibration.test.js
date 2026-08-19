import { describe, it, expect } from 'vitest';
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import {
  getFusionFuelCost,
  getFusionFuelRequirement,
  getHydrogenProductionRate,
  getGravityMilestoneMultiplier,
  getStellarSpeedMultiplier,
  getCompressionScaling,
  getCompressionsCompleted,
  getCompressionHeatYield,
  executeCompression
} from '../src/eras/stellar/authority.js';
import { computePlasmaStep } from '../src/eras/plasma/evaluator.js';
import { getPlasmaUpgradePurchaseDetails, getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { getInitialGameState } from '../src/core/state.js';

describe('P5.4B: Calibration Surface & Route Viability Suite', () => {

  // =========================================================================
  // HELPER: Deterministic Compression Curve Simulation
  // =========================================================================
  function simulateCompressionCurve(costScaling, heatScaling = 1.15, baseHeat = 3500000, maxComp = 60, options = {}) {
    let cost = new Decimal(10);
    let temp = new Decimal(0);
    let cumHe = new Decimal(0);

    let cross10M = null;
    let cross500M = null;
    let cross2B = null;

    const history = [];

    for (let n = 0; n < maxComp; n++) {
      const milestoneMult = 1.0 + 0.05 * Math.floor(n / 10);
      const thermalInsulationMult = options.thermalInsulationLvl ? (1.0 + 0.20 * options.thermalInsulationLvl) : 1.0;
      const heatGain = new Decimal(baseHeat)
        .times(milestoneMult)
        .times(thermalInsulationMult)
        .times(new Decimal(heatScaling).pow(n))
        .round();

      temp = temp.plus(heatGain);
      cumHe = cumHe.plus(cost);

      history.push({
        compNumber: n + 1,
        cost: cost.toNumber(),
        heatGain: heatGain.toNumber(),
        temp: temp.toNumber(),
        cumHe: cumHe.toNumber()
      });

      if (!cross10M && temp.gte(10000000)) {
        cross10M = { compNumber: n + 1, cumHe: cumHe.toNumber(), cost: cost.toNumber(), temp: temp.toNumber() };
      }
      if (!cross500M && temp.gte(500000000)) {
        cross500M = { compNumber: n + 1, cumHe: cumHe.toNumber(), cost: cost.toNumber(), temp: temp.toNumber() };
      }
      if (!cross2B && temp.gte(2000000000)) {
        cross2B = { compNumber: n + 1, cumHe: cumHe.toNumber(), cost: cost.toNumber(), temp: temp.toNumber() };
        break;
      }

      cost = cost.times(costScaling).floor();
    }

    return { cross10M, cross500M, cross2B, history };
  }

  // =========================================================================
  // SECTION 1: Compression Cost Scaling Parameter Sweep
  // =========================================================================
  describe('Section 1: Compression Cost Scaling Parameter Sweep', () => {
    const costScalings = [1.20, 1.25, 1.30, 1.35, 1.40, 1.45, 1.50, 1.60, 1.75];
    const heatBase = 3500000;
    const heatGrowth = 1.15;

    it('sweeps cost scaling factors and records exact thresholds, fuel equivalents, and sustained-flow projections', () => {
      console.log('\n================================================================================');
      console.log('P5.4B SECTION 1: COMPRESSION COST SCALING PARAMETER SWEEP (Heat Growth: 1.15)');
      console.log('================================================================================');
      console.log('Scale | 10M Comp/CumHe/Cost        | 500M Comp/CumHe/Cost         | 2.0B Comp/CumHe/Cost            | Reduct vs 1.75');
      console.log('----------------------------------------------------------------------------------------------------------------');

      const results = {};
      const baselineRes = simulateCompressionCurve(1.75, heatGrowth, heatBase);

      for (const cs of costScalings) {
        const res = simulateCompressionCurve(cs, heatGrowth, heatBase);
        results[cs] = res;

        const reductionVsBaseline = (baselineRes.cross2B.cumHe / res.cross2B.cumHe);

        console.log(
          `${cs.toFixed(2)}  | ` +
          `#${res.cross10M.compNumber} / ${res.cross10M.cumHe.toString().padStart(6)} He / ${res.cross10M.cost.toString().padStart(4)} He | ` +
          `#${res.cross500M.compNumber} / ${res.cross500M.cumHe.toString().padStart(9)} He / ${res.cross500M.cost.toString().padStart(8)} He | ` +
          `#${res.cross2B.compNumber} / ${res.cross2B.cumHe.toString().padStart(12)} He / ${res.cross2B.cost.toString().padStart(10)} He | ` +
          `${reductionVsBaseline.toFixed(1).padStart(8)}x`
        );
      }

      // Assertions to verify sweep integrity
      expect(results[1.75].cross10M.compNumber).toBe(3);
      expect(results[1.75].cross10M.cumHe).toBe(56);
      expect(results[1.75].cross500M.compNumber).toBe(22);
      expect(results[1.75].cross500M.cumHe).toBe(2736471);
      expect(results[1.75].cross2B.compNumber).toBe(32);
      expect(results[1.75].cross2B.cumHe).toBe(737176323);

      // Verify crossing counts are constant across cost scalings because heat curve is identical
      for (const cs of costScalings) {
        expect(results[cs].cross10M.compNumber).toBe(3);
        expect(results[cs].cross500M.compNumber).toBe(22);
        expect(results[cs].cross2B.compNumber).toBe(32);
      }
    });

    it('calculates economic normalization and static sustained-flow projections across gravity levels', () => {
      console.log('\n================================================================================');
      console.log('P5.4B ECONOMIC NORMALIZATION & STATIC SUSTAINED-FLOW PROJECTIONS');
      console.log('================================================================================');
      console.log('Grav Inflows: Grav 10 = 105 H/s (10.5 He/s), Grav 20 = 220 H/s (22.0 He/s), Grav 50 = 625 H/s (62.5 He/s)');
      console.log('Scale | 2.0B CumHe | Run-1 H (10 H/He) | Eff L5 H (6.67 H/He) | Sustained @ Grav 10 | Grav 20   | Grav 50');
      console.log('-------------------------------------------------------------------------------------------------');

      for (const cs of costScalings) {
        const res = simulateCompressionCurve(cs, heatGrowth, heatBase);
        const cumHe2B = res.cross2B.cumHe;
        const hRun1 = cumHe2B * 10;
        const hEff5 = cumHe2B * (10 / 1.5); // 6.6667 H/He

        const tGrav10 = hRun1 / 105;
        const tGrav20 = hRun1 / 220;
        const tGrav50 = hRun1 / 625;

        const formatTime = sec => {
          if (sec < 60) return `${sec.toFixed(0)}s`;
          if (sec < 3600) return `${(sec / 60).toFixed(1)}m`;
          if (sec < 86400) return `${(sec / 3600).toFixed(1)}h`;
          return `${(sec / 86400).toFixed(1)}d`;
        };

        console.log(
          `${cs.toFixed(2)}  | ` +
          `${cumHe2B.toString().padStart(10)} | ` +
          `${hRun1.toString().padStart(17)} | ` +
          `${Math.round(hEff5).toString().padStart(20)} | ` +
          `${formatTime(tGrav10).padStart(19)} | ` +
          `${formatTime(tGrav20).padStart(9)} | ` +
          `${formatTime(tGrav50).padStart(9)}`
        );
      }
    });
  });

  // =========================================================================
  // SECTION 2: Secondary Heat Sensitivity
  // =========================================================================
  describe('Section 2: Secondary Heat Sensitivity Sweep', () => {
    const heatScalings = [1.15, 1.18, 1.20];
    const sampleCostScalings = [1.30, 1.35, 1.40];
    const heatBase = 3500000;

    it('evaluates whether one-knob cost scaling is sufficient vs two-knob cost + heat scaling', () => {
      console.log('\n================================================================================');
      console.log('P5.4B SECTION 2: SECONDARY HEAT SENSITIVITY SWEEP');
      console.log('================================================================================');
      console.log('Cost / Heat | 10M Crossing (Comp/CumHe) | 500M Crossing (Comp/CumHe) | 2.0B Crossing (Comp/CumHe)');
      console.log('-------------------------------------------------------------------------------------------');

      for (const cs of sampleCostScalings) {
        for (const hs of heatScalings) {
          const res = simulateCompressionCurve(cs, hs, heatBase);
          console.log(
            `C:${cs.toFixed(2)} H:${hs.toFixed(2)} | ` +
            `#${res.cross10M.compNumber} / ${res.cross10M.cumHe.toString().padStart(5)} He | ` +
            `#${res.cross500M.compNumber.toString().padStart(2)} / ${res.cross500M.cumHe.toString().padStart(7)} He | ` +
            `#${res.cross2B.compNumber.toString().padStart(2)} / ${res.cross2B.cumHe.toString().padStart(9)} He`
          );
        }
      }
    });
  });

  // =========================================================================
  // SECTION 3: Era II Route Viability (Cooling vs 1M Protons)
  // =========================================================================
  describe('Section 3: Era II High-Proton Route vs Cooling Route Simulation', () => {

    function runEra2Simulation(strategyName, maxSeconds = 10000) {
      const state = getInitialGameState();
      state.activeEpoch = 2;
      state.unfold.introCompleted = true;
      state.plasmaTemperature = new Decimal(5000000); // 5M K starting plasma temp
      state.resources.quarks.amount = new Decimal(100);
      state.resources.gluons.amount = new Decimal(50);
      state.resources.protons.amount = new Decimal(0);
      state.resources.electrons.amount = new Decimal(0);
      state.era2.posture = 'BALANCE';

      const dt = 1.0;
      let elapsed = 0;
      let recombEligibleAt = null;
      let eligibilityReason = null;
      let peakProtonRate = new Decimal(0);

      for (let step = 0; step < maxSeconds; step++) {
        elapsed += dt;

        // Bootstrapping clicks before automation generators exist
        while ((state.upgrades.plasma.quarkCondenser?.level || 0) === 0 && state.resources.quarks.amount.lt(20)) {
          plasmaCommandHandlers.CLICK_CORE_ERA2(state, {});
        }
        while ((state.upgrades.plasma.gluonBinding?.level || 0) === 0 && (state.upgrades.plasma.quarkCondenser?.level || 0) >= 3 && state.resources.gluons.amount.lt(120)) {
          plasmaCommandHandlers.CLICK_CORE_ERA2(state, {});
        }

        if (strategyName === 'COOLING') {
          const qc = getPlasmaUpgradePurchaseDetails(state, 'quarkCondenser');
          if (qc.isAffordable && qc.isEligible && (state.upgrades.plasma.quarkCondenser?.level || 0) < 15) {
            state.resources[qc.currencyKey].amount = state.resources[qc.currencyKey].amount.minus(qc.cost);
            state.upgrades.plasma.quarkCondenser.level = (state.upgrades.plasma.quarkCondenser?.level || 0) + 1;
          }

          const gb = getPlasmaUpgradePurchaseDetails(state, 'gluonBinding');
          if (gb.isAffordable && gb.isEligible && (state.upgrades.plasma.gluonBinding?.level || 0) < 12) {
            state.resources[gb.currencyKey].amount = state.resources[gb.currencyKey].amount.minus(gb.cost);
            state.upgrades.plasma.gluonBinding.level = (state.upgrades.plasma.gluonBinding?.level || 0) + 1;
          }

          const lc = getPlasmaUpgradePurchaseDetails(state, 'leptonHarvest');
          if (lc.isAffordable && lc.isEligible && (state.upgrades.plasma.leptonHarvest?.level || 0) < 10) {
            state.resources[lc.currencyKey].amount = state.resources[lc.currencyKey].amount.minus(lc.cost);
            state.upgrades.plasma.leptonHarvest.level = (state.upgrades.plasma.leptonHarvest?.level || 0) + 1;
          }

          const pa = getPlasmaUpgradePurchaseDetails(state, 'plasmaAutomation');
          if (pa.isAffordable && pa.isEligible && (state.upgrades.plasma.plasmaAutomation?.level || 0) < 10) {
            state.resources[pa.currencyKey].amount = state.resources[pa.currencyKey].amount.minus(pa.cost);
            state.upgrades.plasma.plasmaAutomation.level = (state.upgrades.plasma.plasmaAutomation?.level || 0) + 1;
          }

          const br = getPlasmaUpgradePurchaseDetails(state, 'baryoRadiator');
          if (br.isAffordable && br.isEligible && (state.upgrades.plasma.baryoRadiator?.level || 0) < 10) {
            state.resources[br.currencyKey].amount = state.resources[br.currencyKey].amount.minus(br.cost);
            state.upgrades.plasma.baryoRadiator.level = (state.upgrades.plasma.baryoRadiator?.level || 0) + 1;
          }

          if ((state.upgrades.plasma.baryoRadiator?.level || 0) > 0) {
            state.era2.posture = 'CONDENSE';
          }
        } else if (strategyName === 'PROTON_ACCUMULATION') {
          state.era2.posture = 'ACCUMULATE';

          const qc = getPlasmaUpgradePurchaseDetails(state, 'quarkCondenser');
          if (qc.isAffordable && qc.isEligible && (state.upgrades.plasma.quarkCondenser?.level || 0) < 30) {
            state.resources[qc.currencyKey].amount = state.resources[qc.currencyKey].amount.minus(qc.cost);
            state.upgrades.plasma.quarkCondenser.level = (state.upgrades.plasma.quarkCondenser?.level || 0) + 1;
          }

          const gb = getPlasmaUpgradePurchaseDetails(state, 'gluonBinding');
          if (gb.isAffordable && gb.isEligible && (state.upgrades.plasma.gluonBinding?.level || 0) < 25) {
            state.resources[gb.currencyKey].amount = state.resources[gb.currencyKey].amount.minus(gb.cost);
            state.upgrades.plasma.gluonBinding.level = (state.upgrades.plasma.gluonBinding?.level || 0) + 1;
          }

          const lc = getPlasmaUpgradePurchaseDetails(state, 'leptonHarvest');
          if (lc.isAffordable && lc.isEligible && (state.upgrades.plasma.leptonHarvest?.level || 0) < 10) {
            state.resources[lc.currencyKey].amount = state.resources[lc.currencyKey].amount.minus(lc.cost);
            state.upgrades.plasma.leptonHarvest.level = (state.upgrades.plasma.leptonHarvest?.level || 0) + 1;
          }

          const pa = getPlasmaUpgradePurchaseDetails(state, 'plasmaAutomation');
          if (pa.isAffordable && pa.isEligible && (state.upgrades.plasma.plasmaAutomation?.level || 0) < 25) {
            state.resources[pa.currencyKey].amount = state.resources[pa.currencyKey].amount.minus(pa.cost);
            state.upgrades.plasma.plasmaAutomation.level = (state.upgrades.plasma.plasmaAutomation?.level || 0) + 1;
          }
        }

        const stepResult = computePlasmaStep(state, dt);

        state.resources.quarks.amount = Decimal.max(0, state.resources.quarks.amount.plus(stepResult.deltas.quarks));
        state.resources.gluons.amount = Decimal.max(0, state.resources.gluons.amount.plus(stepResult.deltas.gluons));
        state.resources.leptons.amount = Decimal.max(0, state.resources.leptons.amount.plus(stepResult.deltas.leptons));
        state.resources.protons.amount = Decimal.max(0, state.resources.protons.amount.plus(stepResult.deltas.protons));
        state.resources.electrons.amount = Decimal.max(0, state.resources.electrons.amount.plus(stepResult.deltas.electrons));
        state.resources.hydrogen.amount = Decimal.max(0, state.resources.hydrogen.amount.plus(stepResult.deltas.hydrogen));

        if (stepResult.cooling.gt(0)) {
          state.plasmaTemperature = Decimal.max(0, state.plasmaTemperature.minus(stepResult.cooling));
        }

        const currentProtonRate = stepResult.throughput.protonSynthesizer;
        if (currentProtonRate.gt(peakProtonRate)) {
          peakProtonRate = currentProtonRate;
        }

        const elig = getRecombinationEligibility(state);
        if (elig.isEligible && !recombEligibleAt) {
          recombEligibleAt = elapsed;
          eligibilityReason = elig.temperatureReady ? 'TEMPERATURE_LTE_3000K' : 'PROTONS_GTE_1M';
          if (strategyName === 'COOLING') break;
        }

        if (state.resources.protons.amount.gte(1000000)) {
          recombEligibleAt = elapsed;
          eligibilityReason = 'PROTONS_GTE_1M';
          break;
        }
      }

      return {
        strategyName,
        elapsed,
        recombEligibleAt,
        eligibilityReason,
        finalTemp: state.plasmaTemperature.toNumber(),
        finalProtons: state.resources.protons.amount.toNumber(),
        finalQuarks: state.resources.quarks.amount.toNumber(),
        finalGluons: state.resources.gluons.amount.toNumber(),
        peakProtonRate: peakProtonRate.toNumber(),
        upgrades: {
          quarkCondenser: state.upgrades.plasma.quarkCondenser?.level || 0,
          gluonBinding: state.upgrades.plasma.gluonBinding?.level || 0,
          leptonHarvest: state.upgrades.plasma.leptonHarvest?.level || 0,
          plasmaAutomation: state.upgrades.plasma.plasmaAutomation?.level || 0,
          baryoRadiator: state.upgrades.plasma.baryoRadiator?.level || 0
        }
      };
    }

    it('characterizes Cooling Strategy vs Proton Accumulation Strategy', () => {
      console.log('\n================================================================================');
      console.log('P5.4B SECTION 3: ERA II ROUTE VIABILITY (Sensible Cooling vs Proton Accumulation)');
      console.log('================================================================================');

      const coolingRes = runEra2Simulation('COOLING', 5000);
      const protonRes = runEra2Simulation('PROTON_ACCUMULATION', 10000);

      console.log('STRATEGY A (COOLING):');
      console.log(`- Time to Recombination: ${coolingRes.recombEligibleAt}s (${(coolingRes.recombEligibleAt / 60).toFixed(1)} min)`);
      console.log(`- Eligibility Reason: ${coolingRes.eligibilityReason}`);
      console.log(`- Final Temp: ${coolingRes.finalTemp} K (Threshold: <= 3,000 K)`);
      console.log(`- Final Protons: ${coolingRes.finalProtons.toLocaleString()}`);
      console.log(`- Upgrades: QC Lvl ${coolingRes.upgrades.quarkCondenser}, Gluon Lvl ${coolingRes.upgrades.gluonBinding}, Synth Lvl ${coolingRes.upgrades.plasmaAutomation}, Radiator Lvl ${coolingRes.upgrades.baryoRadiator}`);

      console.log('\nSTRATEGY B (PROTON ACCUMULATION):');
      console.log(`- Time simulated: ${protonRes.elapsed}s (${(protonRes.elapsed / 60).toFixed(1)} min)`);
      console.log(`- Recombination Reached?: ${protonRes.recombEligibleAt ? `${protonRes.recombEligibleAt}s` : 'NOT REACHED'}`);
      console.log(`- Protons at end: ${protonRes.finalProtons.toLocaleString()} / 1,000,000 (${((protonRes.finalProtons / 1000000) * 100).toFixed(2)}%)`);
      console.log(`- Peak Proton Rate: ${protonRes.peakProtonRate.toFixed(2)} Protons/s`);
      console.log(`- Final Quarks: ${protonRes.finalQuarks.toLocaleString()}, Final Gluons: ${protonRes.finalGluons.toLocaleString()}`);
      console.log(`- Upgrades: QC Lvl ${protonRes.upgrades.quarkCondenser}, Gluon Lvl ${protonRes.upgrades.gluonBinding}, Synth Lvl ${protonRes.upgrades.plasmaAutomation}`);

      expect(coolingRes.recombEligibleAt).toBeLessThan(2000);
      expect(coolingRes.eligibilityReason).toBe('TEMPERATURE_LTE_3000K');
      expect(coolingRes.recombEligibleAt).toBeLessThan(protonRes.elapsed);
    });
  });

  // =========================================================================
  // SECTION 4: Legacy Sensitivity on Preferred Candidate
  // =========================================================================
  describe('Section 4: Legacy Sensitivity on Preferred Candidate', () => {
    it('models First-Supernova Legacy bonuses on Candidate 1.35 and Candidate 1.30', () => {
      console.log('\n================================================================================');
      console.log('P5.4B SECTION 4: LEGACY SENSITIVITY ON CANDIDATE 1.35 & 1.30');
      console.log('================================================================================');

      const c135_zero = simulateCompressionCurve(1.35, 1.15, 3500000);
      const c135_legacy = simulateCompressionCurve(1.35, 1.15, 3500000, 60, { thermalInsulationLvl: 1 });

      console.log('CANDIDATE 1.35 (Preferred Middle):');
      console.log(`- Zero-Meta 2.0B K: #${c135_zero.cross2B.compNumber} comp | ${c135_zero.cross2B.cumHe.toLocaleString()} cumHe | H cost (10 H/He): ${(c135_zero.cross2B.cumHe * 10).toLocaleString()} H`);
      console.log(`- Legacy L1 2.0B K: #${c135_legacy.cross2B.compNumber} comp | ${c135_legacy.cross2B.cumHe.toLocaleString()} cumHe | H cost (8 H/He): ${(c135_legacy.cross2B.cumHe * 8).toLocaleString()} H`);
      console.log(`- Acceleration: Thermal Insulation L1 reaches 2.0B K at Comp #${c135_legacy.cross2B.compNumber} (saving ${c135_zero.cross2B.compNumber - c135_legacy.cross2B.compNumber} compressions), reducing He demand by ${((1 - c135_legacy.cross2B.cumHe / c135_zero.cross2B.cumHe) * 100).toFixed(1)}% and total H by ${((1 - (c135_legacy.cross2B.cumHe * 8) / (c135_zero.cross2B.cumHe * 10)) * 100).toFixed(1)}%`);

      const c130_zero = simulateCompressionCurve(1.30, 1.15, 3500000);
      const c130_legacy = simulateCompressionCurve(1.30, 1.15, 3500000, 60, { thermalInsulationLvl: 1 });

      console.log('\nCANDIDATE 1.30 (Aggressive):');
      console.log(`- Zero-Meta 2.0B K: #${c130_zero.cross2B.compNumber} comp | ${c130_zero.cross2B.cumHe.toLocaleString()} cumHe | H cost (10 H/He): ${(c130_zero.cross2B.cumHe * 10).toLocaleString()} H`);
      console.log(`- Legacy L1 2.0B K: #${c130_legacy.cross2B.compNumber} comp | ${c130_legacy.cross2B.cumHe.toLocaleString()} cumHe | H cost (8 H/He): ${(c130_legacy.cross2B.cumHe * 8).toLocaleString()} H`);
      console.log(`- Acceleration: Thermal Insulation L1 reaches 2.0B K at Comp #${c130_legacy.cross2B.compNumber} (saving ${c130_zero.cross2B.compNumber - c130_legacy.cross2B.compNumber} compressions), reducing He demand by ${((1 - c130_legacy.cross2B.cumHe / c130_zero.cross2B.cumHe) * 100).toFixed(1)}% and total H by ${((1 - (c130_legacy.cross2B.cumHe * 8) / (c130_zero.cross2B.cumHe * 10)) * 100).toFixed(1)}%`);

      expect(c135_legacy.cross2B.compNumber).toBeLessThan(c135_zero.cross2B.compNumber);
      expect(c130_legacy.cross2B.compNumber).toBeLessThan(c130_zero.cross2B.compNumber);
    });
  });
});
