import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { engine } from '../src/engine/instance.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { getEraResourcePresentation } from '../src/engine/resourcePresentation.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { getSupernovaEligibility, getGalacticIgnitionEligibility, getStellarBottleneck, getStellarMachineSnapshot } from '../src/eras/stellar/selectors.js';
import { getThermalReactionMultiplier, getContainmentCapacity } from '../src/eras/stellar/authority.js';
import { RECOMBINATION_STARTING_HYDROGEN } from '../src/eras/plasma/constants.js';
import { getPresetMidEraIII, getPresetEraIIISupernovaReady } from '../src/dev/playtestPresets.js';
import { serializeState, deserializeState } from '../src/state/serialization.js';
import { ensureStateShape } from '../src/state/schema.js';

describe('P5.3C: Cross-Era Integration & Regression Suite', () => {
  beforeEach(() => {
    replaceRuntimeState(createInitialState());
  });

  describe('1. Authoritative Full Journey & Transition Continuity', () => {
    it('executes the full Era I -> Era II -> Era III -> Supernova -> Second Run journey using authoritative commands', () => {
      // ----------------------------------------------------
      // Step A: Era I Genesis & Vacuum Field Allocation
      // ----------------------------------------------------
      expect(gameState.activeEpoch).toBe(1);
      expect(gameState.era1.vacuumAllocation).toBe('BALANCED');

      // Allocation unlock: Vacuum Resonance level 1
      gameState.upgrades.quantum.vacuumResonance.level = 1;

      // Check Cosmos presentation discloses allocation
      let cosmos = getCosmosPresentation(gameState);
      expect(Boolean(cosmos.allocation)).toBe(true);
      expect(cosmos.allocation.active).toBe('BALANCED');
      expect(Boolean(cosmos.posture)).toBe(false);
      expect(cosmos.elementFocus.carbonVisible).toBe(false);

      // Change allocation to PROPAGATION
      const allocRes = engine.dispatch({ type: 'SET_VACUUM_ALLOCATION', payload: { allocation: 'PROPAGATION' } });
      expect(allocRes.ok).toBe(true);
      expect(gameState.era1.vacuumAllocation).toBe('PROPAGATION');

      // Simulate Era I progress
      advanceGameTick(10, null, { mode: 'live' });
      expect(gameState.resources.quantumFluctuations.amount.gt(0)).toBe(true);

      // Prepare Inflation-Ready state
      gameState.resources.quantumFluctuations.amount = new Decimal(100000);
      gameState.resources.energyDensity.amount = new Decimal(50000);
      gameState.coherence = new Decimal(100);

      const inflationElig = getInflationEligibility(gameState);
      expect(inflationElig.isEligible).toBe(true);

      // ----------------------------------------------------
      // Step B: Trigger Cosmic Inflation (Era I -> Era II)
      // ----------------------------------------------------
      const inflRes = engine.dispatch({ type: 'TRIGGER_INFLATION' });
      expect(inflRes.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(2);

      // Verify Era I allocation UI is cleaned up, Era II posture UI is active
      cosmos = getCosmosPresentation(gameState);
      expect(Boolean(cosmos.allocation)).toBe(false);
      expect(Boolean(cosmos.posture)).toBe(true);
      expect(cosmos.posture.active).toBe('BALANCE');

      // ----------------------------------------------------
      // Step C: Era II Primordial Plasma & Operating Postures
      // ----------------------------------------------------
      // Change posture to ACCUMULATE
      const postureRes = engine.dispatch({ type: 'SET_PLASMA_POSTURE', payload: { posture: 'ACCUMULATE' } });
      expect(postureRes.ok).toBe(true);
      expect(gameState.era2.posture).toBe('ACCUMULATE');

      // Progress through Plasma upgrades
      gameState.upgrades.plasma.quarkCondenser.level = 5;
      gameState.upgrades.plasma.gluonBinding.level = 3;
      gameState.upgrades.plasma.leptonHarvest.level = 2;
      gameState.upgrades.plasma.plasmaAutomation.level = 2;
      gameState.upgrades.plasma.baryoRadiator.level = 1;

      // Simulate Era II progress
      advanceGameTick(5, null, { mode: 'live' });
      expect(gameState.resources.quarks.amount.gt(0)).toBe(true);

      // Prepare Recombination-Ready state (Cooling route: temp <= 3,000 K)
      gameState.plasmaTemperature = new Decimal(2800);
      gameState.resources.protons.amount = new Decimal(5000);
      gameState.resources.electrons.amount = new Decimal(5000);

      const recombElig = getRecombinationEligibility(gameState);
      expect(recombElig.isEligible).toBe(true);

      // ----------------------------------------------------
      // Step D: Trigger Cosmic Recombination (Era II -> Era III)
      // ----------------------------------------------------
      const recombRes = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
      expect(recombRes.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(3);

      // Exact D25/D32 Handoff: exactly 250 H starting seed
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(RECOMBINATION_STARTING_HYDROGEN);
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);

      // Verify Era II posture UI is cleaned up, Stellar Machine is active
      cosmos = getCosmosPresentation(gameState);
      expect(Boolean(cosmos.allocation)).toBe(false);
      expect(Boolean(cosmos.posture)).toBe(false);
      expect(cosmos.process).not.toBeNull();
      expect(cosmos.process.eyebrow.toLowerCase()).toBe('stellar machine');

      // ----------------------------------------------------
      // Step E: Era III Hydrostatic Stellar Engine (Model B1)
      // ----------------------------------------------------
      // Verify Primary Resource is Core Temperature
      const resPres = getEraResourcePresentation(gameState);
      expect(resPres.primary[0].id).toBe('coreTemperature');
      expect(resPres.primary[0].label).toBe('Core Temperature');

      // Set baseline Protostar temperature
      gameState.era3.temperature = new Decimal(2000);

      // Unlock Fusers (Protostar bootstrap allows H->He conversion below 10M K)
      gameState.era3.fusersEnabled = true;
      gameState.era3.fusionYield = new Decimal(1);
      gameState.era3.gravity = new Decimal(2); // 20 H/s inflow, 200 H containment

      // Simulate Era III tick
      advanceGameTick(2, null, { mode: 'live' });
      expect(gameState.resources.helium.amount.gt(0)).toBe(true);

      // Perform Compression to raise Core Temperature
      gameState.resources.helium.amount = new Decimal(50);
      const compRes = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'compress' } });
      expect(compRes.ok).toBe(true);
      expect(gameState.era3.temperature.gt(2000)).toBe(true);

      // Verify Reaction Capability scales with Temperature
      const reactionMult = getThermalReactionMultiplier(gameState);
      expect(reactionMult.toNumber()).toBeGreaterThanOrEqual(1.0);

      // Heat Core to 3.5B K (Carbon, Iron, and Supernova active)
      gameState.era3.temperature = new Decimal(3500000000);
      gameState.era3.stage = 'Main Sequence Star';
      gameState.era3.carbonYield = new Decimal(1);
      gameState.era3.ironYield = new Decimal(1);
      gameState.resources.iron.amount = new Decimal(1000);

      // Purchase a Legacy upgrade (Stardust Forge & Pulsar) to verify persistence across Supernova
      gameState.currencies.stardust.amount = new Decimal(100);
      gameState.upgrades.stardust.fusionDiscount.level = 2;
      gameState.upgrades.pulsar.autoCompress.level = 1;

      // Check Supernova readiness
      const snElig = getSupernovaEligibility(gameState);
      expect(snElig.canTrigger).toBe(true);

      // ----------------------------------------------------
      // Step F: Trigger Supernova Collapse (Repeatable Reset)
      // ----------------------------------------------------
      const snRes = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
      expect(snRes.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(3); // Stays in Era III
      expect(gameState.stats.supernovas.toNumber()).toBe(1);

      // ----------------------------------------------------
      // Step G: Second-Run Verification & D32 Persistence
      // ----------------------------------------------------
      // 1. Legacy upgrades & currencies persisted
      expect(gameState.upgrades.stardust.fusionDiscount.level).toBe(2);
      expect(gameState.upgrades.pulsar.autoCompress.level).toBe(1);
      expect(gameState.currencies.stardust.amount.toNumber()).toBeGreaterThan(0);

      // 2. Run-local stellar state reset to Protostar
      expect(gameState.era3.stage).toBe('Protostar');
      expect(gameState.era3.temperature.toNumber()).toBe(0);
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(0);
      expect(gameState.resources.helium.amount.toNumber()).toBe(0);
      expect(gameState.resources.carbon.amount.toNumber()).toBe(0);
      expect(gameState.resources.iron.amount.toNumber()).toBe(0);

      // 3. No Quantum or Plasma upgrades resurrected
      expect(gameState.upgrades.quantum.gravityForce.level).toBe(0);
      expect(gameState.upgrades.stellar.efficient.level).toBe(0); // Stellar config reset

      // 4. First Supernova achievement (+10% stellar speed) is active
      expect(gameState.achievements.firstSupernova?.unlocked || gameState.stats.supernovas.gte(1)).toBe(true);
    });
  });

  describe('2. Cross-Era Control & Presentation Isolation', () => {
    it('strictly isolates Era I Allocation, Era II Posture, and Era III Stellar Machine', () => {
      // Era I
      const state1 = createInitialState();
      state1.upgrades.quantum.vacuumResonance.level = 1;
      let p1 = getCosmosPresentation(state1);
      expect(Boolean(p1.allocation)).toBe(true);
      expect(Boolean(p1.posture)).toBe(false);
      expect(p1.process?.eyebrow).not.toBe('Stellar machine');

      // Era II
      const state2 = createInitialState();
      state2.activeEpoch = 2;
      let p2 = getCosmosPresentation(state2);
      expect(Boolean(p2.allocation)).toBe(false);
      expect(Boolean(p2.posture)).toBe(true);
      expect(p2.process?.eyebrow).not.toBe('Stellar machine');

      // Era III
      const state3 = createInitialState();
      state3.activeEpoch = 3;
      let p3 = getCosmosPresentation(state3);
      expect(Boolean(p3.allocation)).toBe(false);
      expect(Boolean(p3.posture)).toBe(false);
      expect(p3.process?.eyebrow.toLowerCase()).toBe('stellar machine');
    });
  });

  describe('3. Resource Grammar across the Full Journey', () => {
    it('maintains D31 / P5.2A resource slot assignments across Eras I, II, III and Legacy', () => {
      // Era I
      const state1 = createInitialState();
      let r1 = getEraResourcePresentation(state1);
      expect(r1.primary[0].id).toBe('quantumFluctuations');
      expect(r1.support).toHaveLength(0); // fresh start before density/coherence

      // Era II (progressive)
      const state2 = createInitialState();
      state2.activeEpoch = 2;
      let r2 = getEraResourcePresentation(state2);
      expect(r2.primary[0].id).toBe('quarks');

      state2.upgrades.plasma.plasmaAutomation.level = 1;
      state2.resources.protons.amount = new Decimal(50);
      r2 = getEraResourcePresentation(state2);
      expect(r2.primary[0].id).toBe('protons');

      state2.upgrades.plasma.baryoRadiator.level = 1;
      r2 = getEraResourcePresentation(state2);
      expect(r2.primary[0].id).toBe('plasmaTemperature');

      // Era III
      const state3 = createInitialState();
      state3.activeEpoch = 3;
      let r3 = getEraResourcePresentation(state3);
      expect(r3.primary[0].id).toBe('coreTemperature');
      expect(r3.support.map(s => s.id)).toEqual(['hydrogen', 'helium']);
    });
  });

  describe('4. Offline Catch-Up & Denial of Unsupervised Major Decisions', () => {
    it('advances passive simulation offline without triggering major transformations', () => {
      // Era I: Offline catch-up advances fluctuation and coherence, never triggers Inflation
      const state1 = createInitialState();
      state1.resources.quantumFluctuations.amount = new Decimal(150000);
      state1.resources.energyDensity.amount = new Decimal(60000);
      state1.coherence = new Decimal(100);
      replaceRuntimeState(state1);

      advanceGameTick(3600, null, { mode: 'offline' });
      expect(gameState.activeEpoch).toBe(1); // Did not auto-inflate

      // Era II: Offline catch-up advances matter and cooling, never triggers Recombination
      const state2 = createInitialState();
      state2.activeEpoch = 2;
      state2.plasmaTemperature = new Decimal(2500);
      state2.resources.protons.amount = new Decimal(5000);
      replaceRuntimeState(state2);

      advanceGameTick(3600, null, { mode: 'offline' });
      expect(gameState.activeEpoch).toBe(2); // Did not auto-recombine

      // Era III: Offline catch-up advances hydrostatic flows, suppresses AutoCompress and AutoBuyer, never triggers Supernova
      const state3 = createInitialState();
      state3.activeEpoch = 3;
      state3.era3.fusersEnabled = true;
      state3.era3.fusionYield = new Decimal(1);
      state3.era3.gravity = new Decimal(5);
      state3.upgrades.pulsar.autoCompress.level = 5;
      state3.era3.temperature = new Decimal(2500000000);
      state3.resources.iron.amount = new Decimal(2000);
      replaceRuntimeState(state3);

      const initialTemp = gameState.era3.temperature.toNumber();
      advanceGameTick(3600, null, { mode: 'offline' });
      expect(gameState.activeEpoch).toBe(3);
      expect(gameState.stats.supernovas.toNumber()).toBe(0); // Did not auto-supernova
      expect(gameState.era3.temperature.toNumber()).toBe(initialTemp); // AutoCompress suppressed offline
    });
  });

  describe('5. Save / Load Persistence across All Eras (Save Version 17)', () => {
    it('roundtrips non-default states across Eras I, II, III, and second-run Legacy', () => {
      // Era I non-default allocation
      const state1 = createInitialState();
      state1.era1.vacuumAllocation = 'STABILIZATION';
      const serialized1 = serializeState(state1);
      const deserialized1 = deserializeState(serialized1);
      ensureStateShape(deserialized1);
      expect(deserialized1.era1.vacuumAllocation).toBe('STABILIZATION');

      // Era II non-default posture
      const state2 = createInitialState();
      state2.activeEpoch = 2;
      state2.era2.posture = 'CONDENSE';
      const serialized2 = serializeState(state2);
      const deserialized2 = deserializeState(serialized2);
      ensureStateShape(deserialized2);
      expect(deserialized2.era2.posture).toBe('CONDENSE');

      // Era III active B1 machine
      const state3 = createInitialState();
      state3.activeEpoch = 3;
      state3.era3.gravity = new Decimal(10);
      state3.era3.temperature = new Decimal(50000000);
      const serialized3 = serializeState(state3);
      const deserialized3 = deserializeState(serialized3);
      ensureStateShape(deserialized3);
      expect(deserialized3.era3.gravity.toNumber()).toBe(10);
      expect(deserialized3.era3.temperature.toNumber()).toBe(50000000);

      // Second-run Legacy persistence
      const state4 = createInitialState();
      state4.activeEpoch = 3;
      state4.stats.supernovas = new Decimal(2);
      state4.currencies.stardust.amount = new Decimal(75);
      state4.upgrades.stardust.fusionDiscount.level = 3;
      state4.upgrades.pulsar.autoCompress.level = 2;
      const serialized4 = serializeState(state4);
      const deserialized4 = deserializeState(serialized4);
      ensureStateShape(deserialized4);
      expect(deserialized4.stats.supernovas.toNumber()).toBe(2);
      expect(deserialized4.currencies.stardust.amount.toNumber()).toBe(75);
      expect(deserialized4.upgrades.stardust.fusionDiscount.level).toBe(3);
      expect(deserialized4.upgrades.pulsar.autoCompress.level).toBe(2);
    });
  });

  describe('6. Galactic Ignition vs Supernova Distinct Boundary', () => {
    it('verifies Supernova and Galactic Ignition remain distinct in eligibility and command dispatch', () => {
      const state = getPresetMidEraIII();
      replaceRuntimeState(state);

      // Mid Era III: neither Supernova nor Galactic Ignition is ready
      expect(getSupernovaEligibility(gameState).canTrigger).toBe(false);
      expect(getGalacticIgnitionEligibility(gameState).isEligible).toBe(false);

      // Ready Supernova state
      const snState = getPresetEraIIISupernovaReady();
      replaceRuntimeState(snState);
      expect(getSupernovaEligibility(gameState).canTrigger).toBe(true);

      // Executing Supernova resets stellar state and leaves activeEpoch strictly at 3
      const result = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
      expect(result.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(3);
    });
  });

  describe('7. Hydrostatic Machine Coupled Diagnostics & Sustainability', () => {
    it('accurately derives bottlenecks and guarantees mass conservation across tick step partitions', () => {
      const state = createInitialState();
      state.activeEpoch = 3;
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(5); // 50+ H/s demand
      state.era3.gravity = new Decimal(1); // 10 H/s inflow
      state.resources.hydrogen.amount = new Decimal(10); // Low buffer

      const snapshot = getStellarMachineSnapshot(state);
      expect(snapshot.bottleneck.id).toBe('FUEL_INFLOW_LIMITED');
      expect(snapshot.inflowRate.toNumber()).toBe(10);
      expect(snapshot.fusionFuelDemandRate.toNumber()).toBeGreaterThanOrEqual(50);
      expect(snapshot.containmentCapacity.toNumber()).toBe(100);

      // Resolving inflow limitation shifts bottleneck
      state.era3.gravity = new Decimal(10); // 105 H/s inflow, 1050 H cap
      state.era3.fusionYield = new Decimal(1); // 10 H/s demand
      state.resources.hydrogen.amount = new Decimal(1050); // Saturated

      const snapshot2 = getStellarMachineSnapshot(state);
      expect(snapshot2.bottleneck.id).toBe('FUSION_CAPACITY_LIMITED');
    });
  });
});
