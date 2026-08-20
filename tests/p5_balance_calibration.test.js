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
import { engine } from '../src/engine/instance.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getQuantumUpgradeEligibility } from '../src/eras/quantum/eligibility.js';
import { getSupernovaEligibility, getSupernovaOutcome, getStellarMachineSnapshot } from '../src/eras/stellar/selectors.js';
import { computePlasmaStep } from '../src/eras/plasma/evaluator.js';
import { getPlasmaUpgradePurchaseDetails, getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { getInitialGameState, replaceRuntimeState, gameState } from '../src/core/state.js';
import { createInitialState } from '../src/state/createInitialState.js';

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
          eligibilityReason = elig.temperatureReady ? 'TEMPERATURE_LTE_3000K' : 'PROTONS_GTE_25K';
          if (strategyName === 'COOLING') break;
        }

        if (state.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold || 25000)) {
          recombEligibleAt = elapsed;
          eligibilityReason = 'PROTONS_GTE_25K';
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
      console.log(`- Time to Recombination: ${protonRes.recombEligibleAt}s (${(protonRes.recombEligibleAt / 60).toFixed(1)} min)`);
      console.log(`- Eligibility Reason: ${protonRes.eligibilityReason}`);
      console.log(`- Protons at end: ${protonRes.finalProtons.toLocaleString()} / 25,000 (${((protonRes.finalProtons / 25000) * 100).toFixed(2)}%)`);
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

  // =========================================================================
  // SECTION 5: Era II Proton Threshold Sweep & Classification
  // =========================================================================
  describe('Section 5: Era II Proton Threshold Sweep & Classification', () => {
    it('sweeps candidate Proton thresholds (10k, 25k, 50k, 100k, 1M) against Cooling route baseline', () => {
      console.log('\n================================================================================');
      console.log('P5.4B SECTION 5: ERA II PROTON THRESHOLD SWEEP & CLASSIFICATION');
      console.log('================================================================================');

      // 1. Cooling baseline
      const coolingState = getInitialGameState();
      coolingState.activeEpoch = 2;
      coolingState.unfold.introCompleted = true;
      coolingState.plasmaTemperature = new Decimal(5000000);
      coolingState.resources.quarks.amount = new Decimal(100);
      coolingState.resources.gluons.amount = new Decimal(50);
      coolingState.era2.posture = 'BALANCE';

      let coolingTime = null;
      for (let s = 1; s <= 5000; s++) {
        while ((coolingState.upgrades.plasma.quarkCondenser?.level || 0) === 0 && coolingState.resources.quarks.amount.lt(20)) {
          plasmaCommandHandlers.CLICK_CORE_ERA2(coolingState, {});
        }
        while ((coolingState.upgrades.plasma.gluonBinding?.level || 0) === 0 && (coolingState.upgrades.plasma.quarkCondenser?.level || 0) >= 3 && coolingState.resources.gluons.amount.lt(120)) {
          plasmaCommandHandlers.CLICK_CORE_ERA2(coolingState, {});
        }

        const qc = getPlasmaUpgradePurchaseDetails(coolingState, 'quarkCondenser');
        if (qc.isAffordable && qc.isEligible && (coolingState.upgrades.plasma.quarkCondenser?.level || 0) < 15) {
          coolingState.resources[qc.currencyKey].amount = coolingState.resources[qc.currencyKey].amount.minus(qc.cost);
          coolingState.upgrades.plasma.quarkCondenser.level = (coolingState.upgrades.plasma.quarkCondenser?.level || 0) + 1;
        }
        const gb = getPlasmaUpgradePurchaseDetails(coolingState, 'gluonBinding');
        if (gb.isAffordable && gb.isEligible && (coolingState.upgrades.plasma.gluonBinding?.level || 0) < 12) {
          coolingState.resources[gb.currencyKey].amount = coolingState.resources[gb.currencyKey].amount.minus(gb.cost);
          coolingState.upgrades.plasma.gluonBinding.level = (coolingState.upgrades.plasma.gluonBinding?.level || 0) + 1;
        }
        const lc = getPlasmaUpgradePurchaseDetails(coolingState, 'leptonHarvest');
        if (lc.isAffordable && lc.isEligible && (coolingState.upgrades.plasma.leptonHarvest?.level || 0) < 10) {
          coolingState.resources[lc.currencyKey].amount = coolingState.resources[lc.currencyKey].amount.minus(lc.cost);
          coolingState.upgrades.plasma.leptonHarvest.level = (coolingState.upgrades.plasma.leptonHarvest?.level || 0) + 1;
        }
        const pa = getPlasmaUpgradePurchaseDetails(coolingState, 'plasmaAutomation');
        if (pa.isAffordable && pa.isEligible && (coolingState.upgrades.plasma.plasmaAutomation?.level || 0) < 10) {
          coolingState.resources[pa.currencyKey].amount = coolingState.resources[pa.currencyKey].amount.minus(pa.cost);
          coolingState.upgrades.plasma.plasmaAutomation.level = (coolingState.upgrades.plasma.plasmaAutomation?.level || 0) + 1;
        }
        const br = getPlasmaUpgradePurchaseDetails(coolingState, 'baryoRadiator');
        if (br.isAffordable && br.isEligible && (coolingState.upgrades.plasma.baryoRadiator?.level || 0) < 10) {
          coolingState.resources[br.currencyKey].amount = coolingState.resources[br.currencyKey].amount.minus(br.cost);
          coolingState.upgrades.plasma.baryoRadiator.level = (coolingState.upgrades.plasma.baryoRadiator?.level || 0) + 1;
        }

        if ((coolingState.upgrades.plasma.baryoRadiator?.level || 0) > 0) {
          coolingState.era2.posture = 'CONDENSE';
        }

        const step = computePlasmaStep(coolingState, 1.0);
        coolingState.resources.quarks.amount = Decimal.max(0, coolingState.resources.quarks.amount.plus(step.deltas.quarks));
        coolingState.resources.gluons.amount = Decimal.max(0, coolingState.resources.gluons.amount.plus(step.deltas.gluons));
        coolingState.resources.leptons.amount = Decimal.max(0, coolingState.resources.leptons.amount.plus(step.deltas.leptons));
        coolingState.resources.protons.amount = Decimal.max(0, coolingState.resources.protons.amount.plus(step.deltas.protons));
        coolingState.resources.electrons.amount = Decimal.max(0, coolingState.resources.electrons.amount.plus(step.deltas.electrons));
        coolingState.resources.hydrogen.amount = Decimal.max(0, coolingState.resources.hydrogen.amount.plus(step.deltas.hydrogen));

        if (step.cooling.gt(0)) {
          coolingState.plasmaTemperature = Decimal.max(0, coolingState.plasmaTemperature.minus(step.cooling));
        }

        const elig = getRecombinationEligibility(coolingState);
        if (elig.isEligible && !coolingTime) {
          coolingTime = s;
          break;
        }
      }

      console.log(`COOLING BASELINE: Recombination reached at t=${coolingTime}s (${(coolingTime / 60).toFixed(1)} min) via Temp <= 3000 K.`);

      // 2. Proton Sweep
      const targets = [10000, 25000, 50000, 100000, 1000000];
      const results = {};
      for (const t of targets) results[t] = null;

      const protonState = getInitialGameState();
      protonState.activeEpoch = 2;
      protonState.unfold.introCompleted = true;
      protonState.plasmaTemperature = new Decimal(5000000);
      protonState.resources.quarks.amount = new Decimal(100);
      protonState.resources.gluons.amount = new Decimal(50);
      protonState.era2.posture = 'ACCUMULATE';

      let peakProtonRate = new Decimal(0);

      for (let s = 1; s <= 20000; s++) {
        while ((protonState.upgrades.plasma.quarkCondenser?.level || 0) === 0 && protonState.resources.quarks.amount.lt(20)) {
          plasmaCommandHandlers.CLICK_CORE_ERA2(protonState, {});
        }
        while ((protonState.upgrades.plasma.gluonBinding?.level || 0) === 0 && (protonState.upgrades.plasma.quarkCondenser?.level || 0) >= 3 && protonState.resources.gluons.amount.lt(120)) {
          plasmaCommandHandlers.CLICK_CORE_ERA2(protonState, {});
        }

        const qc = getPlasmaUpgradePurchaseDetails(protonState, 'quarkCondenser');
        if (qc.isAffordable && qc.isEligible && (protonState.upgrades.plasma.quarkCondenser?.level || 0) < 30) {
          protonState.resources[qc.currencyKey].amount = protonState.resources[qc.currencyKey].amount.minus(qc.cost);
          protonState.upgrades.plasma.quarkCondenser.level = (protonState.upgrades.plasma.quarkCondenser?.level || 0) + 1;
        }
        const gb = getPlasmaUpgradePurchaseDetails(protonState, 'gluonBinding');
        if (gb.isAffordable && gb.isEligible && (protonState.upgrades.plasma.gluonBinding?.level || 0) < 25) {
          protonState.resources[gb.currencyKey].amount = protonState.resources[gb.currencyKey].amount.minus(gb.cost);
          protonState.upgrades.plasma.gluonBinding.level = (protonState.upgrades.plasma.gluonBinding?.level || 0) + 1;
        }
        const lc = getPlasmaUpgradePurchaseDetails(protonState, 'leptonHarvest');
        if (lc.isAffordable && lc.isEligible && (protonState.upgrades.plasma.leptonHarvest?.level || 0) < 15) {
          protonState.resources[lc.currencyKey].amount = protonState.resources[lc.currencyKey].amount.minus(lc.cost);
          protonState.upgrades.plasma.leptonHarvest.level = (protonState.upgrades.plasma.leptonHarvest?.level || 0) + 1;
        }
        const pa = getPlasmaUpgradePurchaseDetails(protonState, 'plasmaAutomation');
        if (pa.isAffordable && pa.isEligible && (protonState.upgrades.plasma.plasmaAutomation?.level || 0) < 25) {
          protonState.resources[pa.currencyKey].amount = protonState.resources[pa.currencyKey].amount.minus(pa.cost);
          protonState.upgrades.plasma.plasmaAutomation.level = (protonState.upgrades.plasma.plasmaAutomation?.level || 0) + 1;
        }

        const step = computePlasmaStep(protonState, 1.0);
        protonState.resources.quarks.amount = Decimal.max(0, protonState.resources.quarks.amount.plus(step.deltas.quarks));
        protonState.resources.gluons.amount = Decimal.max(0, protonState.resources.gluons.amount.plus(step.deltas.gluons));
        protonState.resources.leptons.amount = Decimal.max(0, protonState.resources.leptons.amount.plus(step.deltas.leptons));
        protonState.resources.protons.amount = Decimal.max(0, protonState.resources.protons.amount.plus(step.deltas.protons));
        protonState.resources.electrons.amount = Decimal.max(0, protonState.resources.electrons.amount.plus(step.deltas.electrons));
        protonState.resources.hydrogen.amount = Decimal.max(0, protonState.resources.hydrogen.amount.plus(step.deltas.hydrogen));

        if (step.throughput.protonSynthesizer.gt(peakProtonRate)) {
          peakProtonRate = step.throughput.protonSynthesizer;
        }

        const currentProtons = protonState.resources.protons.amount.toNumber();
        for (const t of targets) {
          if (currentProtons >= t && !results[t]) {
            results[t] = {
              time: s,
              upgrades: {
                qc: protonState.upgrades.plasma.quarkCondenser?.level || 0,
                gb: protonState.upgrades.plasma.gluonBinding?.level || 0,
                synth: protonState.upgrades.plasma.plasmaAutomation?.level || 0
              },
              peakRate: peakProtonRate.toNumber()
            };
          }
        }
      }

      console.log('\nERA II PROTON THRESHOLD DECISION TABLE:');
      console.log('Threshold | Time (s / min)    | QC / GB / Synth | Peak Rate | Rel vs Cooling | Classification');
      console.log('--------------------------------------------------------------------------------------------------');
      for (const t of targets) {
        const res = results[t];
        if (res) {
          const min = (res.time / 60).toFixed(1);
          const rel = (res.time / coolingTime).toFixed(2);
          let cls = 'CREDIBLE ALTERNATIVE';
          if (res.time < 300) cls = 'TOO EASY';
          else if (res.time > 3000) cls = 'SLOW BUT STRATEGIC';
          console.log(`${String(t).padStart(9, ' ')} | ${String(res.time).padStart(5, ' ')}s (${String(min).padStart(4, ' ')}m) | ${res.upgrades.qc} / ${res.upgrades.gb} / ${res.upgrades.synth}       | ${res.peakRate.toFixed(2)} P/s | ${rel}x        | ${cls}`);
        } else {
          console.log(`${String(t).padStart(9, ' ')} | >20000s (>333m)   | 30 / 25 / 25    | ${peakProtonRate.toFixed(2)} P/s | >40x          | STILL DEAD`);
        }
      }

      expect(coolingTime).toBeLessThan(1000);
      expect(results[25000]).toBeDefined();
    });
  });

  // =========================================================================
  // SECTION 6: Full Natural Production Run (INFORMED & LOW_ATTENTION Profiles)
  // =========================================================================
  describe('Section 6: Full Natural Production Run (Informed & Low Attention)', () => {
    function executeNaturalRun(profileName, maxSeconds = 30000) {
      replaceRuntimeState(createInitialState());
      engine.loadState(gameState);

      const telemetry = {
        checkpoints: [],
        clicks: 0,
        routinePurchases: 0,
        strategicChanges: 0,
        compressions: 0,
        firstSupernova: null
      };

      const hit = (id, name, sec, details = {}) => {
        telemetry.checkpoints.push({ id, name, sec, ...details });
      };

      let lastGravTime = 0;
      let lastFuserTime = 0;

      for (let sec = 1; sec <= maxSeconds; sec++) {
        // ERA I
        if (gameState.activeEpoch === 1) {
          if (gameState.resources.quantumFluctuations.amount.lt(10) && (gameState.upgrades.quantum.gravityForce?.level || 0) === 0) {
            engine.dispatch({ type: 'CLICK_CORE' });
            telemetry.clicks++;
          }

          const qUpgrades = ['gravityForce', 'weakForce', 'electromagneticForce', 'vacuumResonance', 'strongForce'];
          for (const key of qUpgrades) {
            const elig = getQuantumUpgradeEligibility(gameState, key);
            const upState = gameState.upgrades.quantum[key];
            if (elig.unlocked && upState && gameState.resources.quantumFluctuations.amount.gte(upState.cost)) {
              const res = engine.dispatch({ type: 'BUY_UPGRADE', payload: { category: 'quantum', upgradeId: key } });
              if (res?.ok) {
                telemetry.routinePurchases++;
              }
            }
          }

          if (profileName === 'INFORMED') {
            if (gameState.coherence < 50 && gameState.era1.vacuumAllocation !== 'STABILIZATION') {
              engine.dispatch({ type: 'SET_ERA1_ALLOCATION', payload: { mode: 'STABILIZATION' } });
              telemetry.strategicChanges++;
            } else if (gameState.coherence >= 95 && gameState.era1.vacuumAllocation !== 'PROPAGATION') {
              engine.dispatch({ type: 'SET_ERA1_ALLOCATION', payload: { mode: 'PROPAGATION' } });
              telemetry.strategicChanges++;
            }
          }

          const inf = getInflationEligibility(gameState);
          if (inf.isEligible) {
            engine.dispatch({ type: 'TRIGGER_INFLATION' });
            hit('inflation', 'Cosmic Inflation executed -> Era II', sec);
          }
        }
        // ERA II
        else if (gameState.activeEpoch === 2) {
          if (gameState.upgrades.plasma.quarkCondenser.level === 0 && gameState.resources.quarks.amount.lt(20)) {
            engine.dispatch({ type: 'CLICK_CORE_ERA2' });
            telemetry.clicks++;
          }
          if (gameState.upgrades.plasma.quarkCondenser.level >= 3 && gameState.upgrades.plasma.gluonBinding.level === 0 && gameState.resources.gluons.amount.lt(120)) {
            engine.dispatch({ type: 'CLICK_CORE_ERA2' });
            telemetry.clicks++;
          }

          const pUpgrades = ['quarkCondenser', 'gluonBinding', 'leptonHarvest', 'plasmaAutomation', 'baryoRadiator'];
          for (const key of pUpgrades) {
            const details = getPlasmaUpgradePurchaseDetails(gameState, key);
            if (details.isEligible && details.isAffordable && !details.isMaxed) {
              const res = engine.dispatch({ type: 'BUY_UPGRADE_PLASMA', payload: { category: 'plasma', upgradeId: key } });
              if (res?.ok) {
                telemetry.routinePurchases++;
              }
            }
          }

          if (profileName === 'INFORMED') {
            if (gameState.upgrades.plasma.baryoRadiator.level > 0 && gameState.plasmaTemperature.gt(3000)) {
              if (gameState.era2.posture !== 'CONDENSE') {
                engine.dispatch({ type: 'SET_PLASMA_POSTURE', payload: { posture: 'CONDENSE' } });
                telemetry.strategicChanges++;
              }
            }
          }

          const rec = getRecombinationEligibility(gameState);
          if (rec.isEligible) {
            engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
            hit('recombination', 'Recombination executed -> Era III', sec);
          }
        }
        // ERA III
        else if (gameState.activeEpoch === 3) {
          const era3 = gameState.era3;
          const temp = era3.temperature.toNumber();
          const compressions = getCompressionsCompleted(gameState);

          if (!telemetry.era3Entry) {
            telemetry.era3Entry = sec;
            hit('e3_entry', 'Era III Entry', sec);
          }

          // Flares
          if (gameState.flares && gameState.flares.active) {
            engine.dispatch({ type: 'COLLECT_SOLAR_FLARE' });
            telemetry.routinePurchases++;
          }

          // Gravity Node - aggressive scaling to increase H inflow
          if (gameState.resources.hydrogen.amount.gte(era3.gravityCost)) {
            if (profileName === 'INFORMED' || (sec - lastGravTime >= 10)) {
              const res = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'gravity' } });
              if (res?.ok) {
                telemetry.routinePurchases++;
                lastGravTime = sec;
                if (!telemetry.firstGravity) {
                  telemetry.firstGravity = sec;
                  hit('first_gravity', 'First Gravity', sec, { grav: era3.gravity.toNumber() });
                }
              }
            }
          }

          // Fuser Node - scale with Gravity to convert H inflow
          const fuserCost = era3.fusionYield.eq(0) ? era3.fuserCostHydrogen : era3.fuserCostHelium;
          const fuserCur = era3.fusionYield.eq(0) ? gameState.resources.hydrogen.amount : gameState.resources.helium.amount;
          if (fuserCur.gte(fuserCost)) {
            if (era3.fusionYield.eq(0) || (profileName === 'INFORMED' && era3.fusionYield.lt(era3.gravity))) {
              const res = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'fuser' } });
              if (res?.ok) {
                telemetry.routinePurchases++;
                lastFuserTime = sec;
                if (!telemetry.firstFuser) {
                  telemetry.firstFuser = sec;
                  hit('first_fuser', 'First Fuser', sec, { fuser: era3.fusionYield.toNumber() });
                }
              }
            }
          }

          // Compression - prioritize reaching 2.0B K
          if (gameState.resources.helium.amount.gte(era3.compressCost)) {
            const res = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'compress' } });
            if (res?.ok) {
              telemetry.compressions++;
              telemetry.strategicChanges++;
              if (!telemetry.firstCompression) {
                telemetry.firstCompression = sec;
                hit('first_comp', 'First Compression', sec);
              }
            }
          }

          // Carbon Node (unlocked at >= 500M K, strategically bought at 2.0B K or when He is abundant)
          if (temp >= 2000000000 && era3.carbonYield.eq(0) && gameState.resources.helium.amount.gte(era3.carbonCostHelium)) {
            engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'carbon' } });
            telemetry.routinePurchases++;
          } else if (temp >= 2000000000 && era3.carbonYield.gt(0) && era3.carbonYield.lt(5) && gameState.resources.carbon.amount.gte(era3.carbonCostCarbon)) {
            engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'carbon' } });
            telemetry.routinePurchases++;
          }

          // Iron Node (unlocked at >= 2.0B K)
          if (temp >= 2000000000 && era3.ironYield.eq(0) && gameState.resources.carbon.amount.gte(era3.ironCostCarbon)) {
            engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'iron' } });
            telemetry.routinePurchases++;
          } else if (temp >= 2000000000 && era3.ironYield.gt(0) && era3.ironYield.lt(5) && gameState.resources.iron.amount.gte(era3.ironCostIron)) {
            engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'iron' } });
            telemetry.routinePurchases++;
          }

          // Stellar Architecture Upgrades (e.g. Efficient to reduce fuel costs)
          if (gameState.upgrades.stellar?.efficient && gameState.upgrades.stellar.efficient.level < 5 && gameState.resources.helium.amount.gte(gameState.upgrades.stellar.efficient.cost)) {
            const res = engine.dispatch({ type: 'BUY_UPGRADE_STELLAR', payload: { category: 'stellar', upgradeId: 'efficient' } });
            if (res?.ok) telemetry.routinePurchases++;
          }

          if (temp >= 10000000 && !telemetry.hit10M) {
            telemetry.hit10M = sec;
            hit('10M_K', '10M K Main Sequence', sec, { comp: compressions, grav: era3.gravity.toNumber(), fuser: era3.fusionYield.toNumber() });
          }

          if (temp >= 500000000 && !telemetry.hit500M) {
            telemetry.hit500M = sec;
            hit('500M_K', '500M K Carbon Threshold', sec, { comp: compressions, grav: era3.gravity.toNumber(), fuser: era3.fusionYield.toNumber() });
          }

          if (temp >= 2000000000 && !telemetry.hit2B) {
            telemetry.hit2B = sec;
            const snap = getStellarMachineSnapshot(gameState);
            hit('2B_K', '2.0B K Iron Threshold', sec, {
              comp: compressions,
              grav: era3.gravity.toNumber(),
              fuser: era3.fusionYield.toNumber(),
              h: gameState.resources.hydrogen.amount.toNumber(),
              he: gameState.resources.helium.amount.toNumber(),
              c: gameState.resources.carbon.amount.toNumber(),
              fe: gameState.resources.iron.amount.toNumber(),
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              dominantLimitingFlow: snap.bottleneck.label
            });
          }

          if (gameState.resources.carbon?.amount?.gt(0) && !telemetry.firstCarbon) {
            telemetry.firstCarbon = sec;
            hit('first_carbon', 'First Carbon Synthesized', sec);
          }

          if (gameState.resources.iron?.amount?.gt(0) && !telemetry.firstIron) {
            telemetry.firstIron = sec;
            const snap = getStellarMachineSnapshot(gameState);
            hit('first_iron', 'First Iron Synthesized', sec, {
              h: gameState.resources.hydrogen.amount.toNumber(),
              he: gameState.resources.helium.amount.toNumber(),
              c: gameState.resources.carbon.amount.toNumber(),
              fe: gameState.resources.iron.amount.toNumber(),
              grav: era3.gravity.toNumber(),
              fuser: era3.fusionYield.toNumber(),
              eff: gameState.upgrades.stellar?.efficient?.level || 0,
              mass: gameState.upgrades.stellar?.massive?.level || 0,
              comp: gameState.upgrades.stellar?.compact?.level || 0,
              cYld: era3.carbonYield.toNumber(),
              feYld: era3.ironYield.toNumber(),
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              dominantLimitingFlow: snap.bottleneck.label
            });
          }

          if (gameState.resources.iron?.amount?.gte(10) && !telemetry.hit10Fe) {
            telemetry.hit10Fe = sec;
            const snap = getStellarMachineSnapshot(gameState);
            hit('10_Fe', 'First 10 Iron Reached', sec, {
              elapsedSince2B: sec - telemetry.hit2B,
              h: gameState.resources.hydrogen.amount.toNumber(),
              he: gameState.resources.helium.amount.toNumber(),
              c: gameState.resources.carbon.amount.toNumber(),
              fe: gameState.resources.iron.amount.toNumber(),
              grav: era3.gravity.toNumber(),
              fuser: era3.fusionYield.toNumber(),
              eff: gameState.upgrades.stellar?.efficient?.level || 0,
              mass: gameState.upgrades.stellar?.massive?.level || 0,
              comp: gameState.upgrades.stellar?.compact?.level || 0,
              cYld: era3.carbonYield.toNumber(),
              feYld: era3.ironYield.toNumber(),
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              dominantLimitingFlow: snap.bottleneck.label
            });
          }

          if (gameState.resources.iron?.amount?.gte(100) && !telemetry.hit100Fe) {
            telemetry.hit100Fe = sec;
            const snap = getStellarMachineSnapshot(gameState);
            hit('100_Fe', 'First 100 Iron Reached', sec, {
              elapsedSince2B: sec - telemetry.hit2B,
              h: gameState.resources.hydrogen.amount.toNumber(),
              he: gameState.resources.helium.amount.toNumber(),
              c: gameState.resources.carbon.amount.toNumber(),
              fe: gameState.resources.iron.amount.toNumber(),
              grav: era3.gravity.toNumber(),
              fuser: era3.fusionYield.toNumber(),
              eff: gameState.upgrades.stellar?.efficient?.level || 0,
              mass: gameState.upgrades.stellar?.massive?.level || 0,
              comp: gameState.upgrades.stellar?.compact?.level || 0,
              cYld: era3.carbonYield.toNumber(),
              feYld: era3.ironYield.toNumber(),
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              dominantLimitingFlow: snap.bottleneck.label
            });
          }

          if (gameState.resources.iron?.amount?.gte(500) && !telemetry.hit500Fe) {
            telemetry.hit500Fe = sec;
            const snap = getStellarMachineSnapshot(gameState);
            hit('500_Fe', 'First 500 Iron Reached', sec, {
              elapsedSince2B: sec - telemetry.hit2B,
              h: gameState.resources.hydrogen.amount.toNumber(),
              he: gameState.resources.helium.amount.toNumber(),
              c: gameState.resources.carbon.amount.toNumber(),
              fe: gameState.resources.iron.amount.toNumber(),
              grav: era3.gravity.toNumber(),
              fuser: era3.fusionYield.toNumber(),
              eff: gameState.upgrades.stellar?.efficient?.level || 0,
              mass: gameState.upgrades.stellar?.massive?.level || 0,
              comp: gameState.upgrades.stellar?.compact?.level || 0,
              cYld: era3.carbonYield.toNumber(),
              feYld: era3.ironYield.toNumber(),
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              dominantLimitingFlow: snap.bottleneck.label
            });
          }

          if (gameState.resources.iron?.amount?.gte(1000) && !telemetry.hit1000Fe) {
            telemetry.hit1000Fe = sec;
            const snap = getStellarMachineSnapshot(gameState);
            hit('1000_Fe', '1,000 Iron Reached', sec, {
              elapsedSince2B: sec - telemetry.hit2B,
              h: gameState.resources.hydrogen.amount.toNumber(),
              he: gameState.resources.helium.amount.toNumber(),
              c: gameState.resources.carbon.amount.toNumber(),
              fe: gameState.resources.iron.amount.toNumber(),
              grav: era3.gravity.toNumber(),
              fuser: era3.fusionYield.toNumber(),
              eff: gameState.upgrades.stellar?.efficient?.level || 0,
              mass: gameState.upgrades.stellar?.massive?.level || 0,
              comp: gameState.upgrades.stellar?.compact?.level || 0,
              cYld: era3.carbonYield.toNumber(),
              feYld: era3.ironYield.toNumber(),
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              dominantLimitingFlow: snap.bottleneck.label
            });
          }

          const sReady = getSupernovaEligibility(gameState);
          if (sReady.canTrigger && !telemetry.firstSupernova) {
            const previewOutcome = getSupernovaOutcome(gameState);
            const snap = getStellarMachineSnapshot(gameState);

            // Execute authoritative Supernova
            const snRes = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });

            telemetry.firstSupernova = {
              time: sec,
              era3Time: sec - telemetry.era3Entry,
              since2B: sec - telemetry.hit2B,
              stardust: previewOutcome.rewards.stardust.toNumber(),
              pulsar: previewOutcome.rewards.pulsarShards.toNumber(),
              singularity: previewOutcome.rewards.singularityMass.toNumber(),
              remnant: previewOutcome.outcome,
              finalComp: compressions,
              finalGrav: era3.gravity.toNumber(),
              finalFuser: era3.fusionYield.toNumber(),
              clicks: telemetry.clicks,
              totalPurchases: telemetry.routinePurchases,
              totalCompressions: telemetry.compressions,
              dominantLimitingFlow: snap.bottleneck.label,
              reactionCapability: snap.thermalReactionMultiplier.toNumber(),
              postSupernovaState: gameState
            };
            hit('supernova_executed', 'Supernova Executed!', sec, telemetry.firstSupernova);
            break;
          }
        }

        advanceGameTick(1.0);
      }

      return { profileName, telemetry, gameState };
    }

    it('characterizes INFORMED profile through full natural First Supernova', () => {
      const run = executeNaturalRun('INFORMED', 600000);
      console.log('\n================================================================================');
      console.log('P5.4B INFORMED NATURAL FULL RUN TIMELINE & TELEMETRY (TO SUPERNOVA)');
      console.log('================================================================================');
      for (const cp of run.telemetry.checkpoints) {
        console.log(`- [t=${cp.sec}s / ${(cp.sec / 60).toFixed(1)}m / ${(cp.sec / 3600).toFixed(2)}h]: ${cp.name}`);
        if (cp.fe !== undefined) {
          console.log(`  H: ${cp.h.toFixed(1)} | He: ${cp.he.toFixed(1)} | C: ${cp.c.toFixed(1)} | Fe: ${cp.fe.toFixed(1)}`);
          console.log(`  Grav: Lvl ${cp.grav} | Fuser: Lvl ${cp.fuser} | Eff: Lvl ${cp.eff || 0} | Mass: Lvl ${cp.mass || 0} | Comp: Lvl ${cp.comp || 0}`);
          console.log(`  CYld: ${cp.cYld} | FeYld: ${cp.feYld} | Reaction Cap: ${cp.reactionCapability.toFixed(2)}x | Bottleneck: ${cp.dominantLimitingFlow}`);
          if (cp.elapsedSince2B) console.log(`  Elapsed Since 2.0B K: ${cp.elapsedSince2B}s (${(cp.elapsedSince2B / 3600).toFixed(2)}h)`);
        }
      }

      const sn = run.telemetry.firstSupernova;
      if (sn) {
        console.log('\nNATURAL INFORMED FIRST SUPERNOVA STATS:');
        console.log(`- Total Duration: ${sn.time}s (${(sn.time / 60).toFixed(1)}m, ${(sn.time / 3600).toFixed(2)}h)`);
        console.log(`- Era III Duration: ${sn.era3Time}s (${(sn.era3Time / 60).toFixed(1)}m, ${(sn.era3Time / 3600).toFixed(2)}h)`);
        console.log(`- 2.0B K -> Supernova: ${sn.since2B}s (${(sn.since2B / 60).toFixed(1)}m, ${(sn.since2B / 3600).toFixed(2)}h)`);
        console.log(`- Rewards: ${sn.stardust} Stardust, ${sn.pulsar} Pulsar Shards, ${sn.singularity} Singularity Mass`);
        console.log(`- Remnant: ${sn.remnant}`);
        console.log(`- Final Compressions: #${sn.finalComp}, Final Gravity: Lvl ${sn.finalGrav}, Final Fusers: Lvl ${sn.finalFuser}`);
        console.log(`- Interaction: ${sn.clicks} clicks, ${sn.totalPurchases} purchases, ${sn.totalCompressions} compressions`);
      } else {
        console.log('\nINFORMED RUN AT SIMULATION BOUND:');
        console.log(`- Final Temp: ${run.gameState.era3.temperature.toNumber()} K`);
        console.log(`- Final Compressions: #${getCompressionsCompleted(run.gameState)}`);
        console.log(`- Carbon Stock: ${run.gameState.resources.carbon.amount.toNumber()}`);
        console.log(`- Iron Stock: ${run.gameState.resources.iron.amount.toNumber()}`);
      }

      expect(run.telemetry.checkpoints.some(c => c.id === '10M_K')).toBe(true);
      expect(run.telemetry.checkpoints.some(c => c.id === '500M_K')).toBe(true);
      expect(run.telemetry.checkpoints.some(c => c.id === '2B_K')).toBe(true);
      expect(run.telemetry.checkpoints.some(c => c.id === '10_Fe')).toBe(true);
    });

    it('characterizes LOW_ATTENTION profile through full natural First Supernova', () => {
      const run = executeNaturalRun('LOW_ATTENTION', 35000);
      console.log('\n================================================================================');
      console.log('P5.4B LOW-ATTENTION NATURAL FULL RUN TIMELINE & TELEMETRY');
      console.log('================================================================================');
      for (const cp of run.telemetry.checkpoints) {
        console.log(`- [t=${cp.sec}s / ${(cp.sec / 60).toFixed(1)}m]: ${cp.name}`);
      }

      const sn = run.telemetry.firstSupernova;
      if (sn) {
        console.log('\nLOW-ATTENTION FIRST SUPERNOVA STATS:');
        console.log(`- Total Duration: ${sn.time}s (${(sn.time / 60).toFixed(1)}m, ${(sn.time / 3600).toFixed(2)}h)`);
        console.log(`- Era III Duration: ${sn.era3Time}s (${(sn.era3Time / 60).toFixed(1)}m, ${(sn.era3Time / 3600).toFixed(2)}h)`);
        console.log(`- Rewards: ${sn.stardust} Stardust, ${sn.pulsar} Pulsar Shards, ${sn.singularity} Singularity Mass`);
        console.log(`- Remnant: ${sn.remnant}`);
        console.log(`- Final Compressions: #${sn.finalComp}, Final Gravity: Lvl ${sn.finalGrav}, Final Fusers: Lvl ${sn.finalFuser}`);
      } else {
        console.log('\nLOW-ATTENTION RUN AT SIMULATION BOUND:');
        console.log(`- Final Temp: ${run.gameState.era3.temperature.toNumber()} K`);
        console.log(`- Final Compressions: #${getCompressionsCompleted(run.gameState)}`);
        console.log(`- Carbon Stock: ${run.gameState.resources.carbon.amount.toNumber()}`);
        console.log(`- Iron Stock: ${run.gameState.resources.iron.amount.toNumber()}`);
      }

      expect(run.telemetry.checkpoints.some(c => c.id === '10M_K')).toBe(true);
      expect(run.telemetry.checkpoints.some(c => c.id === '500M_K')).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 7: Bounded Second Run Early Acceleration
  // =========================================================================
  describe('Section 7: Bounded Second Run Early Acceleration', () => {
    it('compares early Stellar progression (60s, 180s, 300s) between Zero-Meta Run 1 and Legacy Run 2', () => {
      console.log('\n================================================================================');
      console.log('P5.4B SECTION 7: BOUNDED SECOND RUN EARLY ACCELERATION');
      console.log('================================================================================');

      function runBoundedStellar(legacyPurchases = {}, duration = 300) {
        replaceRuntimeState(createInitialState());
        engine.loadState(gameState);
        const st = gameState;
        st.activeEpoch = 3;
        st.unfold.introCompleted = true;
        st.era3.stage = 'Protostar';
        st.era3.temperature = new Decimal(0);
        st.era3.compressCost = new Decimal(10);
        st.resources.hydrogen.amount = new Decimal(0);
        st.resources.helium.amount = new Decimal(0);

        for (const [k, lvl] of Object.entries(legacyPurchases)) {
          if (st.upgrades.stardust[k]) st.upgrades.stardust[k].level = lvl;
        }

        const checkpoints = {};
        for (let s = 1; s <= duration; s++) {
          if (st.resources.helium.amount.gte(st.era3.compressCost)) {
            executeCompression(st);
          }

          if (st.resources.hydrogen.amount.gte(st.era3.gravityCost)) {
            st.resources.hydrogen.amount = st.resources.hydrogen.amount.minus(st.era3.gravityCost);
            st.era3.gravity = st.era3.gravity.plus(1);
            st.era3.gravityCost = st.era3.gravityCost.times(1.5).floor();
          }

          const fuserCost = st.era3.fusionYield.eq(0) ? st.era3.fuserCostHydrogen : st.era3.fuserCostHelium;
          const fuserCur = st.era3.fusionYield.eq(0) ? st.resources.hydrogen.amount : st.resources.helium.amount;
          if (fuserCur.gte(fuserCost)) {
            if (st.era3.fusionYield.eq(0)) {
              st.resources.hydrogen.amount = st.resources.hydrogen.amount.minus(fuserCost);
              st.era3.fusionYield = new Decimal(1);
            } else if (st.era3.fusionYield.lt(10)) {
              st.resources.helium.amount = st.resources.helium.amount.minus(fuserCost);
              st.era3.fusionYield = st.era3.fusionYield.plus(1);
              st.era3.fuserCostHelium = st.era3.fuserCostHelium.times(2.5).round();
            }
          }

          advanceGameTick(1.0);

          if (s === 60 || s === 180 || s === 300) {
            checkpoints[s] = {
              temp: st.era3.temperature.toNumber(),
              comp: getCompressionsCompleted(st),
              hInflow: getHydrogenProductionRate(st).toNumber(),
              heStock: st.resources.helium.amount.toNumber()
            };
          }
        }

        return checkpoints;
      }

      const run1 = runBoundedStellar({}, 300);
      const run2 = runBoundedStellar({
        thermalInsulation: 1,
        fusionDiscount: 1,
        autoCompressor: 1
      }, 300);

      console.log('EARLY STELLAR RUN ACCELERATION COMPARISON:');
      console.log('Time | Run 1 (Zero-Meta) Temp / Comp / Inflow | Run 2 (Legacy L1) Temp / Comp / Inflow | Acceleration Ratio');
      console.log('--------------------------------------------------------------------------------------------------------');
      for (const t of [60, 180, 300]) {
        const r1 = run1[t];
        const r2 = run2[t];
        const tempRatio = (r2.temp / r1.temp).toFixed(2);
        console.log(`${String(t).padStart(4, ' ')}s | ${(r1.temp / 1e6).toFixed(1)}M K / #${r1.comp} / ${r1.hInflow} H/s        | ${(r2.temp / 1e6).toFixed(1)}M K / #${r2.comp} / ${r2.hInflow} H/s        | ${tempRatio}x Temp gain`);
      }

      expect(run2[300].temp).toBeGreaterThan(run1[300].temp);
      expect(run2[300].comp).toBeGreaterThanOrEqual(run1[300].comp);
    });
  });
});
