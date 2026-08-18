import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import {
  executeCompression,
  getCarbonCapacity,
  getContainmentCapacity,
  getFusionCapacity,
  getHydrogenProductionRate,
  getIronCapacity,
  getThermalReactionMultiplier,
  resolveStellarFlowStep
} from '../src/eras/stellar/authority.js';
import { simulateStellarEra } from '../src/eras/stellar/simulation.js';
import {
  getStellarBottleneck,
  getStellarMachineSnapshot
} from '../src/eras/stellar/selectors.js';

describe('P5.3B1: Hydrostatic Stellar Engine Model B1 Implementation', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 3;
    state.era3.stage = 'Protostar';
    state.era3.temperature = new Decimal(0);
    state.era3.gravity = new Decimal(1);
    state.era3.fusersEnabled = false;
    state.era3.fusionYield = new Decimal(0);
    state.era3.carbonYield = new Decimal(0);
    state.era3.ironYield = new Decimal(0);
    state.resources.hydrogen.amount = new Decimal(0);
    state.resources.helium.amount = new Decimal(0);
    state.resources.carbon.amount = new Decimal(0);
    state.resources.iron.amount = new Decimal(0);
  });

  describe('1. Containment Authority & Fuel Flow Semantics', () => {
    it('calculates 10-second containment capacity across Gravity levels', () => {
      // Gravity 1: 10 H/s -> 100 H capacity
      state.era3.gravity = new Decimal(1);
      expect(getHydrogenProductionRate(state).toNumber()).toBe(10);
      expect(getContainmentCapacity(state).toNumber()).toBe(100);

      // Gravity 10: 10 * 10 * 1.05 = 105 H/s -> 1050 H capacity
      state.era3.gravity = new Decimal(10);
      expect(getHydrogenProductionRate(state).toNumber()).toBeCloseTo(105, 5);
      expect(getContainmentCapacity(state).toNumber()).toBeCloseTo(1050, 5);

      // Gravity 50: 50 * 10 * 1.25 = 625 H/s -> 6250 H capacity
      state.era3.gravity = new Decimal(50);
      expect(getHydrogenProductionRate(state).toNumber()).toBeCloseTo(625, 5);
      expect(getContainmentCapacity(state).toNumber()).toBeCloseTo(6250, 5);
    });

    it('never deletes or clamps pre-existing stock above capacity', () => {
      state.era3.gravity = new Decimal(1); // Cap = 100 H
      state.resources.hydrogen.amount = new Decimal(500); // 5x capacity

      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.nextAmounts.hydrogen.toNumber()).toBe(500);
      expect(step.deltas.hydrogen.toNumber()).toBe(0);
    });

    it('achieves full fusion output and leaves buffer unchanged when full buffer and inflow == demand', () => {
      state.era3.gravity = new Decimal(2); // Inflow = 20 H/s, Cap = 200 H
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2); // Nominal fusion = 2 He/s, Demand = 20 H/s (cost 10)
      state.resources.hydrogen.amount = new Decimal(200); // Full buffer

      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.flows.realizedFusion.toNumber()).toBeCloseTo(2.0, 5);
      expect(step.nextAmounts.hydrogen.toNumber()).toBe(200); // Unchanged!
      expect(step.deltas.helium.toNumber()).toBeCloseTo(2.0, 5);
    });

    it('drains stored buffer when inflow < demand and realizes full fusion while stock lasts', () => {
      state.era3.gravity = new Decimal(1); // Inflow = 10 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2); // Demand = 20 H/s
      state.resources.hydrogen.amount = new Decimal(50); // Buffer has 50 H

      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.flows.realizedFusion.toNumber()).toBeCloseTo(2.0, 5);
      expect(step.nextAmounts.hydrogen.toNumber()).toBe(40); // 50 - 10 = 40
      expect(step.deltas.helium.toNumber()).toBeCloseTo(2.0, 5);
    });

    it('fills buffer up to containment capacity when inflow > demand and caps excess residual inflow', () => {
      state.era3.gravity = new Decimal(3); // Inflow = 30 H/s, Cap = 300 H
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Demand = 10 H/s
      state.resources.hydrogen.amount = new Decimal(295); // 5 H space left in buffer

      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.flows.realizedFusion.toNumber()).toBeCloseTo(1.0, 5);
      expect(step.nextAmounts.hydrogen.toNumber()).toBe(300);
      expect(step.deltas.helium.toNumber()).toBeCloseTo(1.0, 5);
    });
  });

  describe('2. Thermal Reaction Capability Multiplier M(T)', () => {
    it('evaluates exact logarithmic capability values at representative thermal gates', () => {
      state.era3.temperature = new Decimal(0);
      expect(getThermalReactionMultiplier(state).toNumber()).toBe(1.0);

      state.era3.temperature = new Decimal(10000000); // 10M K
      expect(getThermalReactionMultiplier(state).toNumber()).toBeCloseTo(1 + Math.log10(11), 4); // ~2.0414x

      state.era3.temperature = new Decimal(100000000); // 100M K
      expect(getThermalReactionMultiplier(state).toNumber()).toBeCloseTo(1 + Math.log10(101), 4); // ~3.0043x

      state.era3.temperature = new Decimal(500000000); // 500M K
      expect(getThermalReactionMultiplier(state).toNumber()).toBeCloseTo(1 + Math.log10(501), 4); // ~3.6998x

      state.era3.temperature = new Decimal(2000000000); // 2.0B K
      expect(getThermalReactionMultiplier(state).toNumber()).toBeCloseTo(1 + Math.log10(2001), 4); // ~4.3012x
    });

    it('scales active reaction capacities (H->He, C, Fe) without modifying Inflow or Compression heat', () => {
      state.era3.gravity = new Decimal(1);
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1);
      state.era3.stage = 'Main Sequence Star';
      state.era3.carbonYield = new Decimal(1);
      state.era3.ironYield = new Decimal(1);

      // At 0 K (capability = 1.0x)
      state.era3.temperature = new Decimal(0);
      expect(getHydrogenProductionRate(state).toNumber()).toBe(10);
      expect(getFusionCapacity(state).toNumber()).toBeCloseTo(1.0, 4);

      // At 2.0B K (capability = ~4.3012x)
      state.era3.temperature = new Decimal(2000000000);
      expect(getHydrogenProductionRate(state).toNumber()).toBe(10); // INFLOW UNCHANGED
      expect(getFusionCapacity(state).toNumber()).toBeCloseTo(1.0 * (1 + Math.log10(2001)), 4);
      expect(getCarbonCapacity(state).toNumber()).toBeCloseTo(1.0 * (1 + Math.log10(2001)), 4);
      expect(getIronCapacity(state).toNumber()).toBeCloseTo(1.0 * (1 + Math.log10(2001)), 4);
    });
  });

  describe('3. Protostar Bootstrap & Thermal Gate Integrity', () => {
    it('allows H->He fusion in Protostar stage (< 10M K) as soon as Fusers are unlocked', () => {
      state.era3.stage = 'Protostar';
      state.era3.temperature = new Decimal(0);
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1);
      state.resources.hydrogen.amount = new Decimal(100);

      expect(getFusionCapacity(state).toNumber()).toBe(1.0);
      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.flows.realizedFusion.toNumber()).toBe(1.0);
      expect(step.nextAmounts.helium.toNumber()).toBe(1.0);
    });

    it('enables the full Protostar compression bootstrap to ignite Main Sequence', () => {
      state.era3.stage = 'Protostar';
      state.era3.temperature = new Decimal(0);
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1);
      state.resources.hydrogen.amount = new Decimal(1000);

      // Advance 60 seconds of fusion -> creates 60 Helium
      simulateStellarEra(state, 60);
      expect(state.resources.helium.amount.toNumber()).toBeGreaterThanOrEqual(56);

      // Execute 3 Compressions (Level 1: 10 He, Level 2: 17 He, Level 3: 29 He -> Total: 56 He)
      const res1 = executeCompression(state);
      expect(res1.success).toBe(true);
      const res2 = executeCompression(state);
      expect(res2.success).toBe(true);
      const res3 = executeCompression(state);
      expect(res3.success).toBe(true);

      // Core Temperature crosses 10M K -> Promotes to Main Sequence Star
      expect(state.era3.temperature.toNumber()).toBeGreaterThanOrEqual(10000000);
      expect(state.era3.stage).toBe('Main Sequence Star');
    });

    it('strictly forbids Carbon synthesis below 500M K even if carbonYield > 0', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(499000000); // 499M K < 500M K
      state.era3.carbonYield = new Decimal(5);
      state.resources.helium.amount = new Decimal(1000);

      expect(getCarbonCapacity(state).toNumber()).toBe(0);
      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.flows.realizedCarbon.toNumber()).toBe(0);
      expect(step.deltas.carbon.toNumber()).toBeCloseTo(0, 5);
    });

    it('strictly forbids Iron synthesis below 2.0B K even if ironYield > 0', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(1999000000); // 1.999B K < 2.0B K
      state.era3.ironYield = new Decimal(5);
      state.resources.carbon.amount = new Decimal(1000);

      expect(getIronCapacity(state).toNumber()).toBe(0);
      const step = resolveStellarFlowStep(state, 1.0);
      expect(step.flows.realizedIron.toNumber()).toBe(0);
      expect(step.deltas.iron.toNumber()).toBeCloseTo(0, 5);
    });
  });

  describe('4. Continuous Decimal Flow & Conservation / Partition Invariance', () => {
    it('supports continuous fractional output from fractional fuel availability without floor truncation', () => {
      state.era3.gravity = new Decimal(0); // Zero inflow
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Nominal = 1 He/s, cost = 10 H
      state.resources.hydrogen.amount = new Decimal(5); // Half cost of 1 fusion

      const step = resolveStellarFlowStep(state, 1.0);
      // 5 H / 10 = 0.5 He output
      expect(step.flows.realizedFusion.toNumber()).toBeCloseTo(0.5, 5);
      expect(step.nextAmounts.hydrogen.toNumber()).toBe(0);
      expect(step.nextAmounts.helium.toNumber()).toBeCloseTo(0.5, 5);
    });

    it('maintains exact conservation: input fuel consumed == output yield * cost', () => {
      state.era3.gravity = new Decimal(1); // Inflow = 10 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2); // Nominal = 2 He/s, cost = 10 H
      state.resources.hydrogen.amount = new Decimal(25);

      const step = resolveStellarFlowStep(state, 1.0);
      const hConsumed = state.resources.hydrogen.amount.plus(10).minus(step.nextAmounts.hydrogen);
      const heProduced = step.flows.realizedFusion;
      expect(hConsumed.toNumber()).toBeCloseTo(heProduced.times(10).toNumber(), 5);
    });

    it('proves partition invariance: 1 x 1.0s step == 10 x 0.1s steps', () => {
      const stateA = createInitialState();
      stateA.activeEpoch = 3;
      stateA.era3.stage = 'Main Sequence Star';
      stateA.era3.temperature = new Decimal(600000000); // 600M K
      stateA.era3.gravity = new Decimal(5); // Inflow = 50 H/s
      stateA.era3.fusersEnabled = true;
      stateA.era3.fusionYield = new Decimal(3);
      stateA.era3.carbonYield = new Decimal(1);
      stateA.resources.hydrogen.amount = new Decimal(100);
      stateA.resources.helium.amount = new Decimal(200);
      stateA.resources.carbon.amount = new Decimal(50);
      stateA.resources.iron.amount = new Decimal(0);

      const stateB = createInitialState();
      stateB.activeEpoch = 3;
      stateB.era3.stage = 'Main Sequence Star';
      stateB.era3.temperature = new Decimal(600000000);
      stateB.era3.gravity = new Decimal(5);
      stateB.era3.fusersEnabled = true;
      stateB.era3.fusionYield = new Decimal(3);
      stateB.era3.carbonYield = new Decimal(1);
      stateB.resources.hydrogen.amount = new Decimal(100);
      stateB.resources.helium.amount = new Decimal(200);
      stateB.resources.carbon.amount = new Decimal(50);
      stateB.resources.iron.amount = new Decimal(0);

      simulateStellarEra(stateA, 1.0);

      for (let i = 0; i < 10; i++) {
        simulateStellarEra(stateB, 0.1);
      }

      expect(stateA.resources.hydrogen.amount.toNumber()).toBeCloseTo(stateB.resources.hydrogen.amount.toNumber(), 3);
      expect(stateA.resources.helium.amount.toNumber()).toBeCloseTo(stateB.resources.helium.amount.toNumber(), 3);
      expect(stateA.resources.carbon.amount.toNumber()).toBeCloseTo(stateB.resources.carbon.amount.toNumber(), 3);
    });
  });

  describe('5. Machine Snapshot & Bottleneck Classification', () => {
    it('generates a dimensionally correct time-independent machine snapshot', () => {
      state.era3.gravity = new Decimal(2); // Inflow = 20 H/s, Cap = 200 H
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Nominal = 1 He/s, Demand = 10 H/s
      state.resources.hydrogen.amount = new Decimal(100);

      const snapshot = getStellarMachineSnapshot(state);
      expect(snapshot.inflowRate.toNumber()).toBe(20);
      expect(snapshot.containmentCapacity.toNumber()).toBe(200);
      expect(snapshot.containmentFill).toBeCloseTo(0.5, 4);
      expect(snapshot.fusionNominalCapacity.toNumber()).toBe(1.0);
      expect(snapshot.fusionFuelCost.toNumber()).toBe(10);
      expect(snapshot.fusionFuelDemandRate.toNumber()).toBe(10);
      expect(snapshot.fusionSustainableRate.toNumber()).toBe(1.0);
      expect(snapshot.hydrogenBufferTrend).toBe('FILLING');
    });

    it('classifies FUEL_INFLOW_LIMITED when demand exceeds inflow', () => {
      state.era3.gravity = new Decimal(1); // Inflow = 10 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(3); // Demand = 30 H/s
      state.resources.hydrogen.amount = new Decimal(50); // Buffer draining

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('FUEL_INFLOW_LIMITED');
      expect(bottleneck.summary).toContain('fuel buffer is currently draining');
    });

    it('classifies FUSION_CAPACITY_LIMITED when inflow exceeds demand and buffer is saturated', () => {
      state.era3.gravity = new Decimal(5); // Inflow = 50 H/s, Cap = 500 H
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Demand = 10 H/s
      state.resources.hydrogen.amount = new Decimal(500); // Saturated buffer

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('FUSION_CAPACITY_LIMITED');
    });

    it('classifies CARBON_SYNTHESIS_AVAILABLE at 500M K before purchase', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(500000000);
      state.era3.carbonYield = new Decimal(0);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('CARBON_SYNTHESIS_AVAILABLE');
    });

    it('classifies IRON_SYNTHESIS_AVAILABLE at 2.0B K before purchase', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2000000000);
      state.era3.ironYield = new Decimal(0);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('IRON_SYNTHESIS_AVAILABLE');
    });

    it('classifies SUPERNOVA_READY when 1,000 Iron and 100M K are met', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2000000000);
      state.resources.iron.amount = new Decimal(1000);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('SUPERNOVA_READY');
    });
  });

  describe('6. Low-Attention & Unattended Flow Verification', () => {
    it('proves unattended 2-minute and 5-minute intervals continuously convert fuel without hard stalls', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(12000000);
      state.era3.gravity = new Decimal(2); // 20 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2); // 2 He/s * 2.04x = ~4.08 He/s
      state.resources.hydrogen.amount = new Decimal(100);

      // Simulate 300 seconds (5 minutes) unattended
      simulateStellarEra(state, 300);

      expect(state.resources.helium.amount.toNumber()).toBeGreaterThan(500);
      expect(state.resources.hydrogen.amount.toNumber()).toBeGreaterThanOrEqual(0);
    });

    it('proves unbalanced investment (Gravity-heavy) does not permanently brick', () => {
      state.era3.gravity = new Decimal(50); // Massive inflow 625 H/s, Cap 6250 H
      state.era3.fusersEnabled = false; // Zero fusers initially

      // Simulate 120s
      simulateStellarEra(state, 120);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(6250); // Saturated at cap

      // Player unlocks fuser later
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(10);
      simulateStellarEra(state, 10);

      expect(state.resources.helium.amount.toNumber()).toBeGreaterThan(0);
    });
  });
});
