import { describe, it, expect } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { replaceRuntimeState, gameState } from '../src/core/state.js';
import { engine } from '../src/engine/instance.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getQuantumUpgradeEligibility } from '../src/eras/quantum/eligibility.js';
import { getPlasmaUpgradeEligibility, getPlasmaUpgradePurchaseDetails, getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { getSupernovaEligibility, getSupernovaOutcome, getGalacticIgnitionEligibility } from '../src/eras/stellar/selectors.js';
import {
  getFusionFuelRequirement,
  getFusionFuelCost,
  getHydrogenProductionRate,
  getCompressionScaling,
  getCompressionHeatYield,
  executeCompression,
  getCompressionsCompleted
} from '../src/eras/stellar/authority.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';

class TelemetryCollector {
  constructor(name) {
    this.name = name;
    this.checkpoints = [];
    this.activeClicks = 0;
    this.routinePurchases = 0;
    this.strategicChanges = 0;
    this.majorTransformations = 0;
    this.elapsedSeconds = 0;
    this.longestCheckpointGapSec = 0;
    this.lastCheckpointTime = 0;
    this.currentEra = 1;
  }

  checkpoint(label, primaryBottleneck, playerDecision, attentionReq) {
    const prevTime = this.checkpoints.length > 0 ? this.checkpoints[this.checkpoints.length - 1].elapsedSec : 0;
    const deltaSec = this.elapsedSeconds - prevTime;
    if (deltaSec > this.longestCheckpointGapSec) {
      this.longestCheckpointGapSec = deltaSec;
    }
    const cp = {
      label,
      era: this.currentEra,
      elapsedSec: this.elapsedSeconds,
      deltaSec,
      totalClicks: this.activeClicks,
      routinePurchases: this.routinePurchases,
      strategicChanges: this.strategicChanges,
      primaryBottleneck,
      playerDecision,
      attentionReq
    };
    this.checkpoints.push(cp);
    this.lastCheckpointTime = this.elapsedSeconds;
    return cp;
  }
}

export function runNaturalSimulation(profileName, strategyOptions = {}) {
  const state = createInitialState();
  replaceRuntimeState(state);
  const telemetry = new TelemetryCollector(profileName);

  const dt = 0.1;
  const maxGameSeconds = strategyOptions.maxSeconds || 14400;

  const checkpointsHit = new Set();

  function hitCheckpoint(id, label, bottleneck, decision, attention) {
    if (!checkpointsHit.has(id)) {
      checkpointsHit.add(id);
      telemetry.checkpoint(label, bottleneck, decision, attention);
    }
  }

  let lastActionTime = 0;
  let lastPostureChangeTime = 0;
  let lastAllocationChangeTime = 0;
  let manualCompressionCount = 0;
  let compressionsBefore10M = 0;

  const chosenArchitecture = strategyOptions.architecture || 'efficient';

  for (let sec = 0; sec < maxGameSeconds; sec += dt) {
    telemetry.elapsedSeconds = sec;
    telemetry.currentEra = gameState.activeEpoch;

    // Advance 1 simulation tick
    advanceGameTick(dt, null, { mode: 'live' });

    // Profile interaction cadence
    const interactionCadenceSec = strategyOptions.checkIntervalSec || 1.0;
    const canInteract = (sec - lastActionTime) >= interactionCadenceSec;

    // ==========================================
    // ERA 1: QUANTUM FOAM
    // ==========================================
    if (gameState.activeEpoch === 1) {
      if (gameState.resources.quantumFluctuations.amount.gt(0)) {
        hitCheckpoint('e1_first_qf', 'First meaningful passive production', 'Initial QF accumulation', 'Buy Gravity Force', 'Active');
      }

      // Handle allocation
      const resonanceLvl = gameState.upgrades.quantum.vacuumResonance.level;
      if (resonanceLvl > 0) {
        hitCheckpoint('e1_alloc_unlock', 'Vacuum Allocation unlock', 'Coherence / ED trade-off', 'Choose Allocation Mode', 'Low');
        
        if (canInteract && sec - lastAllocationChangeTime >= (strategyOptions.allocCooldownSec || 10)) {
          if (profileName === 'INFORMED') {
            if (gameState.upgrades.quantum.strongForce.level === 0) {
              if (gameState.era1.vacuumAllocation !== 'PROPAGATION') {
                engine.dispatch({ type: 'SET_VACUUM_ALLOCATION', payload: { allocation: 'PROPAGATION' } });
                telemetry.strategicChanges++;
                lastAllocationChangeTime = sec;
              }
            } else {
              if (gameState.coherence.lt(100) && gameState.era1.vacuumAllocation !== 'STABILIZATION') {
                engine.dispatch({ type: 'SET_VACUUM_ALLOCATION', payload: { allocation: 'STABILIZATION' } });
                telemetry.strategicChanges++;
                lastAllocationChangeTime = sec;
              } else if (gameState.coherence.gte(100) && gameState.era1.vacuumAllocation !== 'PROPAGATION') {
                engine.dispatch({ type: 'SET_VACUUM_ALLOCATION', payload: { allocation: 'PROPAGATION' } });
                telemetry.strategicChanges++;
                lastAllocationChangeTime = sec;
              }
            }
          } else if (profileName === 'LOW_ATTENTION') {
            if (gameState.era1.vacuumAllocation !== 'BALANCED') {
              engine.dispatch({ type: 'SET_VACUUM_ALLOCATION', payload: { allocation: 'BALANCED' } });
              telemetry.strategicChanges++;
              lastAllocationChangeTime = sec;
            }
          } else if (profileName === 'SIMPLE') {
            if (gameState.era1.vacuumAllocation !== 'PROPAGATION') {
              engine.dispatch({ type: 'SET_VACUUM_ALLOCATION', payload: { allocation: 'PROPAGATION' } });
              telemetry.strategicChanges++;
              lastAllocationChangeTime = sec;
            }
          }
        }
      }

      // Upgrades purchase
      if (canInteract) {
        if (gameState.resources.quantumFluctuations.amount.lt(10) && gameState.upgrades.quantum.gravityForce.level === 0) {
          engine.dispatch({ type: 'CLICK_CORE' });
          telemetry.activeClicks++;
          lastActionTime = sec;
        }

        const qUpgrades = ['gravityForce', 'weakForce', 'electromagneticForce', 'vacuumResonance', 'strongForce'];
        for (const key of qUpgrades) {
          const elig = getQuantumUpgradeEligibility(gameState, key);
          const upState = gameState.upgrades.quantum[key];
          if (elig.unlocked && gameState.resources.quantumFluctuations.amount.gte(upState.cost)) {
            const res = engine.dispatch({ type: 'BUY_UPGRADE', payload: { category: 'quantum', upgradeId: key } });
            if (res?.ok) {
              telemetry.routinePurchases++;
              lastActionTime = sec;
              if (key === 'vacuumResonance' && upState.level === 1) hitCheckpoint('e1_resonance', 'Vacuum Resonance unlocked', 'QF cost', 'Unlock Allocation & Surge Density', 'Medium');
              if (key === 'strongForce' && upState.level === 1) hitCheckpoint('e1_strong_force', 'Strong Force unlocked', 'QF cost', 'Massive QF & Density generation', 'Medium');
            }
          }
        }
      }

      // Check Inflation
      const inflElig = getInflationEligibility(gameState);
      if (inflElig.isEligible) {
        hitCheckpoint('e1_infl_ready', 'Inflation ready', 'None', 'Trigger Inflation', 'High');
        if (canInteract) {
          const inflRes = engine.dispatch({ type: 'TRIGGER_INFLATION' });
          if (inflRes?.ok) {
            telemetry.majorTransformations++;
            hitCheckpoint('e1_infl_exec', 'Inflation executed', 'None', 'Enter Era II', 'High');
            lastActionTime = sec;
          }
        }
      }
    }

    // ==========================================
    // ERA 2: PRIMORDIAL SOUP
    // ==========================================
    else if (gameState.activeEpoch === 2) {
      if (canInteract && gameState.upgrades.plasma.quarkCondenser.level === 0 && gameState.resources.quarks.amount.lt(20)) {
        engine.dispatch({ type: 'CLICK_CORE_ERA2' });
        telemetry.activeClicks++;
        lastActionTime = sec;
      }
      if (canInteract && gameState.upgrades.plasma.quarkCondenser.level >= 3 && gameState.upgrades.plasma.gluonBinding.level === 0 && gameState.resources.gluons.amount.lt(120)) {
        engine.dispatch({ type: 'CLICK_CORE_ERA2' });
        telemetry.activeClicks++;
        lastActionTime = sec;
      }

      // Posture strategy
      if (canInteract && sec - lastPostureChangeTime >= (strategyOptions.postureCooldownSec || 15)) {
        if (profileName === 'INFORMED') {
          if (gameState.plasmaTemperature.gt(3000) && gameState.upgrades.plasma.baryoRadiator.level > 0 && gameState.resources.protons.amount.gte(50)) {
            if (gameState.era2.posture !== 'CONDENSE') {
              engine.dispatch({ type: 'SET_PLASMA_POSTURE', payload: { posture: 'CONDENSE' } });
              telemetry.strategicChanges++;
              lastPostureChangeTime = sec;
              hitCheckpoint('e2_posture_switch', 'Meaningful posture switch to CONDENSE', 'Cooling rate', 'Accelerate universe cooling', 'Medium');
            }
          } else if (gameState.resources.quarks.amount.lt(500) || gameState.resources.gluons.amount.lt(200)) {
            if (gameState.era2.posture !== 'ACCUMULATE') {
              engine.dispatch({ type: 'SET_PLASMA_POSTURE', payload: { posture: 'ACCUMULATE' } });
              telemetry.strategicChanges++;
              lastPostureChangeTime = sec;
              hitCheckpoint('e2_posture_switch', 'Meaningful posture switch to ACCUMULATE', 'Matter generation', 'Accumulate Quarks and Gluons', 'Medium');
            }
          }
        } else if (profileName === 'LOW_ATTENTION') {
          if (gameState.era2.posture !== 'BALANCE') {
            engine.dispatch({ type: 'SET_PLASMA_POSTURE', payload: { posture: 'BALANCE' } });
            telemetry.strategicChanges++;
            lastPostureChangeTime = sec;
          }
        } else if (profileName === 'SIMPLE') {
          if (gameState.upgrades.plasma.baryoRadiator.level > 0 && gameState.era2.posture !== 'CONDENSE') {
            engine.dispatch({ type: 'SET_PLASMA_POSTURE', payload: { posture: 'CONDENSE' } });
            telemetry.strategicChanges++;
            lastPostureChangeTime = sec;
          }
        }
      }

      // Upgrades purchase
      if (canInteract) {
        const pUpgrades = ['quarkCondenser', 'gluonBinding', 'leptonHarvest', 'plasmaAutomation', 'baryoRadiator'];
        for (const key of pUpgrades) {
          const details = getPlasmaUpgradePurchaseDetails(gameState, key);
          if (details.isEligible && details.isAffordable && !details.isMaxed) {
            const res = engine.dispatch({ type: 'BUY_UPGRADE_PLASMA', payload: { category: 'plasma', upgradeId: key } });
            if (res?.ok) {
              telemetry.routinePurchases++;
              lastActionTime = sec;
              const upState = gameState.upgrades.plasma[key];
              if (key === 'quarkCondenser' && upState.level === 1) hitCheckpoint('e2_first_upg', 'First relevant Plasma upgrade', 'Quark count', 'Unlock Quark condensation', 'Medium');
              if (key === 'plasmaAutomation' && upState.level === 1) hitCheckpoint('e2_proton_synth', 'Proton Synthesizer unlocked', 'Quarks & Gluons', 'Produce Protons automatically', 'Medium');
              if (key === 'baryoRadiator' && upState.level === 1) hitCheckpoint('e2_radiator', 'Baryogenesis Radiator unlocked', 'Proton consumption vs Cooling', 'Active universe cooling', 'Medium');
            }
          }
        }
      }

      // Recombination eligibility check (OR condition: Protons >= 1M OR Temp <= 3000K)
      const recombElig = getRecombinationEligibility(gameState);
      if (recombElig.isEligible) {
        hitCheckpoint('e2_recomb_ready', 'Recombination ready (<=3000K or 1M Protons)', 'None', 'Trigger Recombination', 'High');
        if (canInteract) {
          const res = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
          if (res?.ok) {
            telemetry.majorTransformations++;
            hitCheckpoint('e2_recomb_exec', 'Recombination executed', 'None', 'Enter Era III (250 H seed)', 'High');
            lastActionTime = sec;
          }
        }
      }
    }

    // ==========================================
    // ERA 3: STELLAR DAWN (Protostar -> Main Sequence)
    // ==========================================
    else if (gameState.activeEpoch === 3) {
      // Flares collection
      if (gameState.flares && gameState.flares.active) {
        if (canInteract) {
          engine.dispatch({ type: 'COLLECT_SOLAR_FLARE' });
          telemetry.routinePurchases++;
        }
      }

      // Architecture purchase
      if (canInteract) {
        const archState = gameState.upgrades.stellar[chosenArchitecture];
        if (archState && archState.level < 5 && gameState.resources.helium.amount.gte(archState.cost)) {
          const res = engine.dispatch({ type: 'BUY_UPGRADE_STELLAR', payload: { category: 'stellar', upgradeId: chosenArchitecture } });
          if (res?.ok) {
            telemetry.routinePurchases++;
            lastActionTime = sec;
          }
        }
      }

      // Core Nodes purchase
      if (canInteract) {
        const era3 = gameState.era3;

        // 1. Gravity Node
        if (gameState.resources.hydrogen.amount.gte(era3.gravityCost)) {
          const res = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'gravity' } });
          if (res?.ok) {
            telemetry.routinePurchases++;
            hitCheckpoint('e3_first_gravity', 'First Gravity purchase', 'Hydrogen stock', 'Establish H inflow & Containment', 'High');
            lastActionTime = sec;
          }
        }

        // 2. Fuser Node
        const fuserCost = era3.fusionYield.eq(0) ? era3.fuserCostHydrogen : era3.fuserCostHelium;
        const fuserCur = era3.fusionYield.eq(0) ? gameState.resources.hydrogen.amount : gameState.resources.helium.amount;
        if (fuserCur.gte(fuserCost)) {
          const res = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'fuser' } });
          if (res?.ok) {
            telemetry.routinePurchases++;
            hitCheckpoint('e3_first_fuser', 'First Fuser purchase', 'Hydrogen / Helium stock', 'Start H -> He conversion', 'High');
            lastActionTime = sec;
          }
        }

        // 3. Compression Node
        if (gameState.resources.helium.amount.gte(era3.compressCost)) {
          const res = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'compress' } });
          if (res?.ok) {
            telemetry.routinePurchases++;
            manualCompressionCount++;
            const t = gameState.era3.temperature.toNumber();
            if (t < 10000000) compressionsBefore10M++;

            hitCheckpoint('e3_first_compress', 'First Compression', 'Helium stock', 'Increase Core Temperature', 'High');
            lastActionTime = sec;
          }
        }

        // Stage & Temperature checkpoints
        const temp = gameState.era3.temperature.toNumber();
        if (temp >= 10000000) {
          hitCheckpoint('e3_10m_main_seq', '10M K Main Sequence reached', 'Helium / Compression', 'Stage promotion', 'Medium');
        }
      }
    }
  }

  return {
    profileName,
    telemetry,
    checkpoints: telemetry.checkpoints,
    longestCheckpointGapSec: telemetry.longestCheckpointGapSec,
    manualCompressionCount,
    compressionsBefore10M,
    finalState: {
      activeEpoch: gameState.activeEpoch,
      temperature: gameState.era3?.temperature?.toNumber() || 0,
      stage: gameState.era3?.stage || '',
      supernovas: gameState.stats?.supernovas?.toNumber() || 0
    }
  };
}

describe('P5.4A: Natural-Run Evidence Reconciliation Suite', () => {

  // ============================================================================
  // LANE A: NATURAL FRESH-STATE OBSERVATION (Bounded Simulation)
  // ============================================================================
  describe('Lane A: Natural Fresh-State Observation (Bounded Simulation)', () => {
    it('characterizes Profile A (Informed), Profile B (Low Attention), and Profile C (Simple) to Main Sequence', () => {
      const profiles = [
        { name: 'INFORMED', options: { checkIntervalSec: 1.0, allocCooldownSec: 10, postureCooldownSec: 15, architecture: 'efficient', maxSeconds: 5000 } },
        { name: 'LOW_ATTENTION', options: { checkIntervalSec: 10.0, allocCooldownSec: 60, postureCooldownSec: 60, architecture: 'compact', maxSeconds: 6000 } },
        { name: 'SIMPLE', options: { checkIntervalSec: 3.0, allocCooldownSec: 30, postureCooldownSec: 30, architecture: 'massive', maxSeconds: 5500 } }
      ];

      for (const p of profiles) {
        console.log(`\n================================================================================`);
        console.log(`>>> LANE A: NATURAL OBSERVATION PROFILE: ${p.name}`);
        console.log(`================================================================================`);
        const res = runNaturalSimulation(p.name, p.options);

        console.log(`Checkpoints hit: ${res.checkpoints.length}`);
        console.log(`Longest Checkpoint Gap: ${res.longestCheckpointGapSec.toFixed(1)}s`);
        console.log(`Manual Compressions: Total=${res.manualCompressionCount} (Before 10M: ${res.compressionsBefore10M})`);
        console.log(`Final State: ActiveEpoch=${res.finalState.activeEpoch}, Stage=${res.finalState.stage}, Temp=${res.finalState.temperature} K`);

        console.log(`\nCHECKPOINT LOG (${p.name}):`);
        console.log(`-------------------------------------------------------------------------------------------------------------------------`);
        console.log(`Checkpoint                                | Elapsed (s) | Delta (s) | Clicks | Routine Buy | Strat Changes | Primary Bottleneck`);
        console.log(`-------------------------------------------------------------------------------------------------------------------------`);
        let prevBuys = 0;
        for (const cp of res.checkpoints) {
          const label = cp.label.padEnd(41, ' ');
          const elapsed = (cp.elapsedSec.toFixed(1) + 's').padStart(11, ' ');
          const delta = (cp.deltaSec.toFixed(1) + 's').padStart(9, ' ');
          const clicks = String(cp.totalClicks).padStart(6, ' ');
          const buys = String(cp.routinePurchases).padStart(11, ' ');
          const strat = String(cp.strategicChanges).padStart(13, ' ');
          const bneck = cp.primaryBottleneck;
          console.log(`${label} | ${elapsed} | ${delta} | ${clicks} | ${buys} | ${strat} | ${bneck}`);

          // Sanity assertion: cumulative buys must never decrease
          expect(cp.routinePurchases).toBeGreaterThanOrEqual(prevBuys);
          prevBuys = cp.routinePurchases;
        }

        expect(res.checkpoints.some(c => c.label.includes('Inflation executed'))).toBe(true);
        expect(res.checkpoints.some(c => c.label.includes('Recombination executed'))).toBe(true);
        expect(res.checkpoints.some(c => c.label.includes('10M K Main Sequence reached'))).toBe(true);
      }
    });
  });

  // ============================================================================
  // LANE B: EXACT AUTHORITY & MATHEMATICAL PROJECTION (Zero-Meta Baseline)
  // ============================================================================
  describe('Lane B: Exact Authority & Mathematical Projection (Zero-Meta Baseline)', () => {
    it('verifies exact H->He fuel cost authority: baseline is 10 H, NOT 50 H', () => {
      const state = createInitialState();

      // 1. Baseline: 0 fusionDiscount, 0 Efficient => 10 H / He
      expect(getFusionFuelRequirement(state).toNumber()).toBe(10);
      expect(getFusionFuelCost(state).toNumber()).toBe(10);

      // 2. Fusion Discount L1 => 8 H / He
      state.upgrades.stardust.fusionDiscount.level = 1;
      expect(getFusionFuelRequirement(state).toNumber()).toBe(8);
      expect(getFusionFuelCost(state).toNumber()).toBe(8);

      // 3. Efficient L5, 0 Fusion Discount => 10 / 1.5 = 6.6667 H / He
      state.upgrades.stardust.fusionDiscount.level = 0;
      state.upgrades.stellar.efficient.level = 5;
      expect(getFusionFuelRequirement(state).toNumber()).toBe(10);
      expect(getFusionFuelCost(state).toNumber()).toBeCloseTo(10 / 1.5, 4);

      // 4. Efficient L5 + Fusion Discount L1 => 8 / 1.5 = 5.3333 H / He
      state.upgrades.stardust.fusionDiscount.level = 1;
      state.upgrades.stellar.efficient.level = 5;
      expect(getFusionFuelRequirement(state).toNumber()).toBe(8);
      expect(getFusionFuelCost(state).toNumber()).toBeCloseTo(8 / 1.5, 4);
    });

    it('verifies Gravity-20 inflow authority with milestone multiplier: 220 H/s baseline', () => {
      const state = createInitialState();
      state.activeEpoch = 3;
      state.era3.gravity = new Decimal(20);

      // Gravity 20 gives +10% milestone multiplier (1.0 + 0.05 * 2)
      // Rate = 20 * 10 (baseGen) * 1.10 = 220 H/s
      const rate = getHydrogenProductionRate(state);
      expect(rate.toNumber()).toBe(220);
    });

    it('executes the exact sequential compression curve and records exact crossings for 10M, 500M, and 2.0B K', () => {
      const state = createInitialState();
      state.activeEpoch = 3;
      state.era3.stage = 'Protostar';
      state.era3.temperature = new Decimal(0);
      state.era3.compressCost = new Decimal(10);

      let cumulativeHe = new Decimal(0);
      const sequence = [];

      let crossing10M = null;
      let crossing500M = null;
      let crossing2B = null;

      for (let comp = 1; comp <= 35; comp++) {
        const cost = new Decimal(state.era3.compressCost);
        state.resources.helium.amount = cost; // Provide exact required Helium
        cumulativeHe = cumulativeHe.plus(cost);

        const res = executeCompression(state);
        expect(res.success).toBe(true);

        const temp = state.era3.temperature.toNumber();
        sequence.push({
          compressionNumber: comp,
          cost: cost.toNumber(),
          heatGain: res.heatGain.toNumber(),
          tempAfter: temp,
          cumulativeHe: cumulativeHe.toNumber()
        });

        if (temp >= 10000000 && !crossing10M) {
          crossing10M = { comp, cumulativeHe: cumulativeHe.toNumber(), tempAfter: temp };
        }
        if (temp >= 500000000 && !crossing500M) {
          crossing500M = { comp, cumulativeHe: cumulativeHe.toNumber(), tempAfter: temp };
        }
        if (temp >= 2000000000 && !crossing2B) {
          crossing2B = { comp, cumulativeHe: cumulativeHe.toNumber(), tempAfter: temp };
        }
      }

      console.log(`\n================================================================================`);
      console.log(`LANE B: EXACT DETERMINISTIC COMPRESSION SEQUENCE (Zero-Meta Baseline)`);
      console.log(`================================================================================`);
      console.log(`Comp # | Cost (He)        | Heat Gain (K)    | Temp After (K)   | Cumulative He`);
      console.log(`--------------------------------------------------------------------------------`);
      for (const s of sequence.slice(0, 25)) {
        const cNum = String(s.compressionNumber).padStart(6, ' ');
        const cost = String(s.cost).padStart(16, ' ');
        const gain = String(s.heatGain).padStart(16, ' ');
        const temp = String(s.tempAfter).padStart(16, ' ');
        const cumHe = String(s.cumulativeHe).padStart(14, ' ');
        console.log(`${cNum} | ${cost} | ${gain} | ${temp} | ${cumHe}`);
      }
      console.log(`...`);
      for (const s of sequence.slice(25)) {
        const cNum = String(s.compressionNumber).padStart(6, ' ');
        const cost = String(s.cost).padStart(16, ' ');
        const gain = String(s.heatGain).padStart(16, ' ');
        const temp = String(s.tempAfter).padStart(16, ' ');
        const cumHe = String(s.cumulativeHe).padStart(14, ' ');
        console.log(`${cNum} | ${cost} | ${gain} | ${temp} | ${cumHe}`);
      }

      console.log(`\nEXACT CROSSINGS CONFIRMED BY EXECUTION:`);
      console.log(`- 10M K (Main Sequence): Compression #${crossing10M.comp} | Cumulative He: ${crossing10M.cumulativeHe.toLocaleString()} | Temp: ${crossing10M.tempAfter.toLocaleString()} K`);
      console.log(`- 500M K (Carbon synthesis): Compression #${crossing500M.comp} | Cumulative He: ${crossing500M.cumulativeHe.toLocaleString()} | Temp: ${crossing500M.tempAfter.toLocaleString()} K`);
      console.log(`- 2.0B K (Iron synthesis): Compression #${crossing2B.comp} | Cumulative He: ${crossing2B.cumulativeHe.toLocaleString()} | Temp: ${crossing2B.tempAfter.toLocaleString()} K`);

      // Verify exact crossings
      expect(crossing10M.comp).toBe(3);
      expect(crossing500M.comp).toBe(22);
      expect(crossing2B.comp).toBe(32);
    });
  });

  // ============================================================================
  // LANE C: PREPARED-STATE PRESTIGE & SECOND-RUN CHARACTERIZATION
  // ============================================================================
  describe('Lane C: Prepared-State Prestige & Second-Run Characterization', () => {
    it('characterizes First Supernova rewards, reset/persist boundaries, and second-run acceleration on prepared state', () => {
      const state = createInitialState();
      replaceRuntimeState(state);

      // Prepared state fixture for Supernova verification
      state.activeEpoch = 3;
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2050000000); // 2.05B K
      state.era3.gravity = new Decimal(20);
      state.era3.fusionYield = new Decimal(10);
      state.era3.carbonYield = new Decimal(5);
      state.era3.ironYield = new Decimal(2);
      state.resources.hydrogen.amount = new Decimal(100000);
      state.resources.helium.amount = new Decimal(50000);
      state.resources.carbon.amount = new Decimal(10000);
      state.resources.iron.amount = new Decimal(1500);

      const snElig = getSupernovaEligibility(state);
      expect(snElig.canTrigger).toBe(true);

      const outcome = getSupernovaOutcome(state);
      console.log(`\n================================================================================`);
      console.log(`LANE C: PREPARED-STATE SUPERNOVA TRANSFORMATION PREVIEW:`);
      console.log(`================================================================================`);
      console.log(`Outcome Remnant: ${outcome.displayName} (${outcome.outcome})`);
      console.log(`Predicted Stardust: ${outcome.rewards.stardust.toFixed(0)} ✨`);
      console.log(`Predicted Pulsar Shards: ${outcome.rewards.pulsarShards.toFixed(0)} 🌀`);
      console.log(`Predicted Singularity Mass: ${outcome.rewards.singularityMass.toFixed(0)} 🌌`);

      const snRes = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
      expect(snRes.ok).toBe(true);

      console.log(`\nPOST-SUPERNOVA RESET STATE (LANE C FIXTURE):`);
      console.log(`Active Epoch: ${gameState.activeEpoch} (Stellar Dawn)`);
      console.log(`Core Temperature: ${gameState.era3.temperature.toFixed(0)} K`);
      console.log(`Stage: ${gameState.era3.stage} (Protostar)`);
      console.log(`Hydrogen: ${gameState.resources.hydrogen.amount.toFixed(0)} H`);
      console.log(`Helium: ${gameState.resources.helium.amount.toFixed(0)} He`);
      console.log(`Stardust Balance: ${gameState.currencies.stardust.amount.toFixed(0)} ✨`);
      console.log(`Pulsar Shards Balance: ${gameState.currencies.pulsarShards.amount.toFixed(0)} 🌀`);

      // Buy legacy upgrades with granted rewards
      if (gameState.currencies.stardust.amount.gte(1)) {
        engine.dispatch({ type: 'BUY_UPGRADE_STELLAR', payload: { category: 'stardust', upgradeId: 'fusionDiscount' } });
        engine.dispatch({ type: 'BUY_UPGRADE_STELLAR', payload: { category: 'stardust', upgradeId: 'thermalInsulation' } });
      }
      if (gameState.currencies.pulsarShards.amount.gte(1)) {
        engine.dispatch({ type: 'BUY_UPGRADE_STELLAR', payload: { category: 'pulsar', upgradeId: 'autoCompress' } });
      }

      console.log(`\nPURCHASED LEGACY UPGRADES (LANE C):`);
      console.log(`Fusion Discount Level: ${gameState.upgrades.stardust.fusionDiscount.level} (Fuel cost: 10 -> ${getFusionFuelCost(gameState).toFixed(0)} H / He)`);
      console.log(`Thermal Insulation Level: ${gameState.upgrades.stardust.thermalInsulation.level} (Heat multiplier: +${20 * gameState.upgrades.stardust.thermalInsulation.level}%)`);
      console.log(`Auto-Compressor Level: ${gameState.upgrades.pulsar.autoCompress.level} (${gameState.upgrades.pulsar.autoCompress.level} auto-compression/sec)`);

      const dt = 0.1;
      for (let s = 0; s < 300; s += dt) {
        advanceGameTick(dt, null, { mode: 'live' });
        if (gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost)) {
          engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'gravity' } });
        }
        const fuserCost = gameState.era3.fusionYield.eq(0) ? gameState.era3.fuserCostHydrogen : gameState.era3.fuserCostHelium;
        const fuserCur = gameState.era3.fusionYield.eq(0) ? gameState.resources.hydrogen.amount : gameState.resources.helium.amount;
        if (fuserCur.gte(fuserCost)) {
          engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'fuser' } });
        }
        if (gameState.resources.helium.amount.gte(gameState.era3.compressCost) && gameState.upgrades.pulsar.autoCompress.level === 0) {
          engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'compress' } });
        }
      }

      console.log(`\nSECOND RUN AT t=300s (LANE C BOUNDED FIXTURE):`);
      console.log(`Core Temperature: ${gameState.era3.temperature.toFixed(0)} K`);
      console.log(`Stage: ${gameState.era3.stage}`);
      console.log(`Hydrogen Inflow: ${getHydrogenProductionRate(gameState).toFixed(0)} H/s`);
      console.log(`Helium: ${gameState.resources.helium.amount.toFixed(0)} He`);
      console.log(`Compressions Completed: ${getCompressionsCompleted(gameState)}`);

      expect(gameState.era3.temperature.toNumber()).toBeGreaterThan(10000000);
    });
  });
});
