import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import {
  executeCompression,
  getCarbonCapacity,
  getCarbonFuelCost,
  getContainmentCapacity,
  getFusionCapacity,
  getFusionFuelCost,
  getHydrogenProductionRate,
  getIronCapacity,
  getIronFuelCost,
  getThermalReactionMultiplier,
  resolveStellarFlowStep
} from '../src/eras/stellar/authority.js';
import { simulateStellarEra } from '../src/eras/stellar/simulation.js';
import {
  getStellarBottleneck,
  getStellarMachineSnapshot
} from '../src/eras/stellar/selectors.js';
import {
  formatHudFlowRate,
  formatHudValue,
  formatThermalCapability
} from '../src/ui/resourceFormatters.js';

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

  describe('4. Continuous Decimal Flow & Conservation / Partition Invariance Matrix', () => {
    it('supports continuous fractional output from fractional fuel availability without floor truncation', () => {
      state.era3.gravity = new Decimal(0); // Zero inflow
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Nominal = 1 He/s, cost = 10 H
      state.resources.hydrogen.amount = new Decimal(5); // Half cost of 1 fusion

      const step = resolveStellarFlowStep(state, 1.0);
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

    it('proves partition invariance across Regime A: Fuel-Limited / Buffer-Draining (1x1.0s vs 10x0.1s)', () => {
      const stateA = createInitialState();
      stateA.activeEpoch = 3;
      stateA.era3.gravity = new Decimal(1); // 10 H/s
      stateA.era3.fusersEnabled = true;
      stateA.era3.fusionYield = new Decimal(3); // Demand 30 H/s
      stateA.resources.hydrogen.amount = new Decimal(100);

      const stateB = createInitialState();
      stateB.activeEpoch = 3;
      stateB.era3.gravity = new Decimal(1);
      stateB.era3.fusersEnabled = true;
      stateB.era3.fusionYield = new Decimal(3);
      stateB.resources.hydrogen.amount = new Decimal(100);

      simulateStellarEra(stateA, 1.0);
      for (let i = 0; i < 10; i++) simulateStellarEra(stateB, 0.1);

      expect(stateA.resources.hydrogen.amount.toNumber()).toBeCloseTo(stateB.resources.hydrogen.amount.toNumber(), 4);
      expect(stateA.resources.helium.amount.toNumber()).toBeCloseTo(stateB.resources.helium.amount.toNumber(), 4);
    });

    it('proves partition invariance across Regime B: Capacity-Limited / Buffer-Filling (1x1.0s vs 10x0.1s)', () => {
      const stateA = createInitialState();
      stateA.activeEpoch = 3;
      stateA.era3.gravity = new Decimal(5); // Inflow 50 H/s, Cap 500 H
      stateA.era3.fusersEnabled = true;
      stateA.era3.fusionYield = new Decimal(1); // Demand 10 H/s
      stateA.resources.hydrogen.amount = new Decimal(480); // Fills to 500 cap

      const stateB = createInitialState();
      stateB.activeEpoch = 3;
      stateB.era3.gravity = new Decimal(5);
      stateB.era3.fusersEnabled = true;
      stateB.era3.fusionYield = new Decimal(1);
      stateB.resources.hydrogen.amount = new Decimal(480);

      simulateStellarEra(stateA, 1.0);
      for (let i = 0; i < 10; i++) simulateStellarEra(stateB, 0.1);

      expect(stateA.resources.hydrogen.amount.toNumber()).toBeCloseTo(stateB.resources.hydrogen.amount.toNumber(), 4);
      expect(stateA.resources.helium.amount.toNumber()).toBeCloseTo(stateB.resources.helium.amount.toNumber(), 4);
    });

    it('proves partition invariance across Regime C: Carbon Active (1x1.0s vs 10x0.1s)', () => {
      const stateA = createInitialState();
      stateA.activeEpoch = 3;
      stateA.era3.stage = 'Main Sequence Star';
      stateA.era3.temperature = new Decimal(600000000); // 600M K
      stateA.era3.gravity = new Decimal(5);
      stateA.era3.fusersEnabled = true;
      stateA.era3.fusionYield = new Decimal(4);
      stateA.era3.carbonYield = new Decimal(2);
      stateA.resources.hydrogen.amount = new Decimal(200);
      stateA.resources.helium.amount = new Decimal(300);
      stateA.resources.carbon.amount = new Decimal(50);

      const stateB = createInitialState();
      stateB.activeEpoch = 3;
      stateB.era3.stage = 'Main Sequence Star';
      stateB.era3.temperature = new Decimal(600000000);
      stateB.era3.gravity = new Decimal(5);
      stateB.era3.fusersEnabled = true;
      stateB.era3.fusionYield = new Decimal(4);
      stateB.era3.carbonYield = new Decimal(2);
      stateB.resources.hydrogen.amount = new Decimal(200);
      stateB.resources.helium.amount = new Decimal(300);
      stateB.resources.carbon.amount = new Decimal(50);

      simulateStellarEra(stateA, 1.0);
      for (let i = 0; i < 10; i++) simulateStellarEra(stateB, 0.1);

      expect(stateA.resources.hydrogen.amount.toNumber()).toBeCloseTo(stateB.resources.hydrogen.amount.toNumber(), 3);
      expect(stateA.resources.helium.amount.toNumber()).toBeCloseTo(stateB.resources.helium.amount.toNumber(), 3);
      expect(stateA.resources.carbon.amount.toNumber()).toBeCloseTo(stateB.resources.carbon.amount.toNumber(), 3);
    });

    it('proves partition invariance across Regime D: Iron Active (1x1.0s vs 10x0.1s)', () => {
      const stateA = createInitialState();
      stateA.activeEpoch = 3;
      stateA.era3.stage = 'Main Sequence Star';
      stateA.era3.temperature = new Decimal(2500000000); // 2.5B K
      stateA.era3.gravity = new Decimal(5);
      stateA.era3.fusersEnabled = true;
      stateA.era3.fusionYield = new Decimal(4);
      stateA.era3.carbonYield = new Decimal(2);
      stateA.era3.ironYield = new Decimal(1);
      stateA.resources.hydrogen.amount = new Decimal(200);
      stateA.resources.helium.amount = new Decimal(300);
      stateA.resources.carbon.amount = new Decimal(100);
      stateA.resources.iron.amount = new Decimal(20);

      const stateB = createInitialState();
      stateB.activeEpoch = 3;
      stateB.era3.stage = 'Main Sequence Star';
      stateB.era3.temperature = new Decimal(2500000000);
      stateB.era3.gravity = new Decimal(5);
      stateB.era3.fusersEnabled = true;
      stateB.era3.fusionYield = new Decimal(4);
      stateB.era3.carbonYield = new Decimal(2);
      stateB.era3.ironYield = new Decimal(1);
      stateB.resources.hydrogen.amount = new Decimal(200);
      stateB.resources.helium.amount = new Decimal(300);
      stateB.resources.carbon.amount = new Decimal(100);
      stateB.resources.iron.amount = new Decimal(20);

      simulateStellarEra(stateA, 1.0);
      for (let i = 0; i < 10; i++) simulateStellarEra(stateB, 0.1);

      expect(stateA.resources.hydrogen.amount.toNumber()).toBeCloseTo(stateB.resources.hydrogen.amount.toNumber(), 3);
      expect(stateA.resources.helium.amount.toNumber()).toBeCloseTo(stateB.resources.helium.amount.toNumber(), 3);
      expect(stateA.resources.carbon.amount.toNumber()).toBeCloseTo(stateB.resources.carbon.amount.toNumber(), 3);
      expect(stateA.resources.iron.amount.toNumber()).toBeCloseTo(stateB.resources.iron.amount.toNumber(), 3);
    });
  });

  describe('5. Complete Bottleneck Test Matrix & Sustainable Flow Verification', () => {
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

    it('classifies FUEL_INFLOW_LIMITED when demand exceeds inflow (visible while buffer is draining)', () => {
      state.era3.gravity = new Decimal(1); // Inflow = 10 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(3); // Demand = 30 H/s
      state.resources.hydrogen.amount = new Decimal(50); // Buffer draining

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('FUEL_INFLOW_LIMITED');
      expect(bottleneck.summary).toContain('fuel buffer is draining');
    });

    it('classifies FUSION_CAPACITY_LIMITED when inflow exceeds demand and buffer is saturated', () => {
      state.era3.gravity = new Decimal(5); // Inflow = 50 H/s, Cap = 500 H
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Demand = 10 H/s
      state.resources.hydrogen.amount = new Decimal(500); // Saturated buffer

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('FUSION_CAPACITY_LIMITED');
    });

    it('classifies CORE_DENSIFICATION_READY when Helium reserves can afford compression', () => {
      state.era3.stage = 'Protostar';
      state.era3.temperature = new Decimal(2000);
      state.era3.gravity = new Decimal(5); // Inflow 50 H/s > Demand 20 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2);
      state.resources.hydrogen.amount = new Decimal(100);
      state.resources.helium.amount = new Decimal(25); // >= compressCost (10)

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('CORE_DENSIFICATION_READY');
      expect(bottleneck.label).toBe('Core Compression Ready');
    });

    it('classifies CARBON_SYNTHESIS_AVAILABLE at 500M K before purchase', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(500000000);
      state.era3.carbonYield = new Decimal(0);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('CARBON_SYNTHESIS_AVAILABLE');
    });

    it('classifies CARBON_PROCESSING_LIMITED when sustainable upstream Helium exceeds Carbon throughput', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(600000000); // 600M K (M(T) ~ 3.78x)
      state.era3.gravity = new Decimal(200); // Inflow 4000 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(60); // Fusion demand 2267 H/s <= inflow 4000 H/s -> sustainable He ~ 226.7 He/s
      state.era3.carbonYield = new Decimal(1); // Carbon nominal cap ~ 3.78 C/s -> Demand ~ 188.9 He/s < 226.7 He/s

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('CARBON_PROCESSING_LIMITED');
    });

    it('classifies IRON_SYNTHESIS_AVAILABLE at 2.0B K before purchase', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2000000000);
      state.era3.ironYield = new Decimal(0);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('IRON_SYNTHESIS_AVAILABLE');
    });

    it('classifies IRON_PROCESSING_LIMITED when sustainable upstream Carbon exceeds Iron throughput', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2500000000); // 2.5B K (M(T) ~ 4.40x)
      state.era3.gravity = new Decimal(20000); // Inflow > demand
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(20000); // High sustainable fusion
      state.era3.carbonYield = new Decimal(500); // Sustainable carbon ~ 1759 C/s
      state.era3.ironYield = new Decimal(1); // Iron throughput ~ 4.4 Fe/s (demand 1099.5 C/s < 1759 C/s)

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('IRON_PROCESSING_LIMITED');
    });

    it('classifies SUPERNOVA_READY when 1,000 Iron and 100M K are met', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2000000000);
      state.resources.iron.amount = new Decimal(1000);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('SUPERNOVA_READY');
    });

    it('classifies BALANCED_OPERATION in sustainable balanced equilibrium', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(15000000);
      state.era3.gravity = new Decimal(3); // Inflow 30 H/s > 20.4 H/s, but buffer not yet saturated (100 < 300)
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(1); // Nominal fusion cap ~ 2.04 He/s -> demand ~ 20.4 H/s
      state.resources.hydrogen.amount = new Decimal(100);
      state.resources.helium.amount = new Decimal(0);

      const bottleneck = getStellarBottleneck(state);
      expect(bottleneck.id).toBe('BALANCED_OPERATION');
    });

    it('adversarial check: high upstream nominal capacity with low sustainable rate does NOT falsely report downstream bottleneck', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(600000000);
      state.era3.gravity = new Decimal(1); // Inflow = 10 H/s (LOW sustainable rate = 1 He/s)
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(100); // Nominal fusion cap is HUGE (100+ He/s)
      state.era3.carbonYield = new Decimal(2); // Carbon nominal demand is 20 He/s
      state.resources.hydrogen.amount = new Decimal(0);

      const bottleneck = getStellarBottleneck(state);
      // True bottleneck is FUEL_INFLOW_LIMITED (demand 1000 H/s >> inflow 10 H/s), NOT CARBON_PROCESSING_LIMITED
      expect(bottleneck.id).toBe('FUEL_INFLOW_LIMITED');
      expect(bottleneck.id).not.toBe('CARBON_PROCESSING_LIMITED');
    });
  });

  describe('6. Low-Attention & Unattended Progression Sweeps', () => {
    it('proves balanced representative configuration advances cleanly over 120 seconds', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(15000000);
      state.era3.gravity = new Decimal(3); // Inflow 30 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2);
      state.resources.hydrogen.amount = new Decimal(100);

      simulateStellarEra(state, 120);

      expect(state.resources.helium.amount.toNumber()).toBeGreaterThan(200);
      expect(state.resources.hydrogen.amount.toNumber()).toBeGreaterThanOrEqual(0);
    });

    it('proves balanced representative configuration advances cleanly over 300 seconds (5 minutes)', () => {
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(15000000);
      state.era3.gravity = new Decimal(3); // Inflow 30 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2);
      state.resources.hydrogen.amount = new Decimal(100);

      simulateStellarEra(state, 300);

      expect(state.resources.helium.amount.toNumber()).toBeGreaterThan(500);
      expect(state.resources.hydrogen.amount.toNumber()).toBeGreaterThanOrEqual(0);
    });

    it('proves gravity-heavy imbalance does not brick over 120s/300s and recovers with subsequent fuser investment', () => {
      state.era3.gravity = new Decimal(50); // Massive inflow 625 H/s, Cap 6250 H
      state.era3.fusersEnabled = false; // Zero fusers

      // 120s unattended
      simulateStellarEra(state, 120);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(6250); // Saturated at cap, zero loss

      // Further 180s unattended (300s total)
      simulateStellarEra(state, 180);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(6250);

      // Player recovers by investing in Fusers
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(10);
      simulateStellarEra(state, 30);

      expect(state.resources.helium.amount.toNumber()).toBeGreaterThan(100);
      expect(state.resources.hydrogen.amount.toNumber()).toBeGreaterThan(0);
    });

    it('proves fuser-heavy imbalance does not brick over 120s/300s and recovers with subsequent gravity investment', () => {
      state.era3.gravity = new Decimal(1); // Low inflow 10 H/s
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(50); // Massive fusers (Demand 500 H/s)
      state.resources.hydrogen.amount = new Decimal(10);

      // 120s unattended: drains buffer, converts incoming 10 H/s into 1 He/s without stalling or going negative
      simulateStellarEra(state, 120);
      expect(state.resources.helium.amount.toNumber()).toBeGreaterThanOrEqual(120);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(0);

      // Further 180s unattended (300s total)
      simulateStellarEra(state, 180);
      expect(state.resources.helium.amount.toNumber()).toBeGreaterThanOrEqual(300);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(0);

      // Player recovers by investing in Gravity
      state.era3.gravity = new Decimal(50);
      simulateStellarEra(state, 30);

      expect(state.resources.helium.amount.toNumber()).toBeGreaterThan(500);
    });
  });

  describe('7. Reaction Capability & Rate Formatting Display Truth', () => {
    it('formats thermal reaction capability consistently (1.00×, 2.71×, 4.54×) with no truncation or duplicated suffixes', () => {
      expect(formatThermalCapability(1.0)).toBe('1.00×');
      expect(formatThermalCapability(2.707)).toBe('2.71×');
      expect(formatThermalCapability(4.5432)).toBe('4.54×');

      expect(formatHudValue(1.0, '×')).toBe('1.00×');
      expect(formatHudValue(2.707, 'x')).toBe('2.71×');
      expect(formatHudValue(4.5432, '×')).toBe('4.54×');
    });

    it('formats flow rates with precision to distinguish close Inflow vs Demand rates (e.g. 10 /s vs 10.01 /s)', () => {
      // Inflow = 10.00
      expect(formatHudFlowRate(10.0)).toBe('10 /s');
      // Demand = 10.0087 -> 10.01 /s
      expect(formatHudFlowRate(10.0087)).toBe('10.01 /s');

      // formatHudValue with /s
      expect(formatHudValue(10, '/s')).toBe('10 /s');
      expect(formatHudValue(10.0087, '/s')).toBe('10.01 /s');
      expect(formatHudValue(105, '/s')).toBe('105 /s');
      expect(formatHudValue(135, '/s')).toBe('135 /s');
    });
  });
});
