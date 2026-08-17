import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { engine } from '../src/engine/instance.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';
import { createInitialState } from '../src/state/createInitialState.js';
import {
  getInflationTransformationPreview,
  getRecombinationTransformationPreview,
  getSupernovaTransformationPreview,
  getGalacticIgnitionTransformationPreview,
  getTransitionPresentation
} from '../src/engine/transitionPresentation.js';
import { RECOMBINATION_STARTING_HYDROGEN } from '../src/eras/plasma/constants.js';
import { getPresetEraIIISupernovaReady } from '../src/dev/playtestPresets.js';
import { CodexEngine } from '../src/ui/codex.js';

describe('P5.2B: Transition Presentation Semantics & Onboarding Contract', () => {
  beforeEach(() => {
    replaceRuntimeState(createInitialState());
  });

  describe('Cosmic Inflation (Era I -> Era II)', () => {
    it('generates a pure transition preview stating forward era progression without false reset claims', () => {
      const state = createInitialState();
      state.resources.quantumFluctuations.amount = new Decimal(120000);
      state.resources.energyDensity.amount = new Decimal(60000);
      state.coherence = new Decimal(100);

      const preview = getInflationTransformationPreview(state);
      expect(preview.type).toBe('inflation');
      expect(preview.kind).toBe('forward-era');
      expect(preview.repeatable).toBe(false);
      expect(preview.advancesEra).toBe(true);
      expect(preview.targetEra).toBe(2);
      expect(preview.isEligible).toBe(true);

      // Verify explicit no-reset communication
      expect(preview.resets).toHaveLength(1);
      expect(preview.resets[0].label).toBe('None');
      expect(preview.summary).toContain('Primordial Plasma');

      // Verify persistence & gains
      expect(preview.persists.some(p => p.label === 'Quantum Upgrades')).toBe(true);
      expect(preview.gains.some(g => g.label === 'Era II Access')).toBe(true);
      expect(preview.next).toContain('Protons');
    });

    it('preserves TRIGGER_INFLATION command state mutation invariants', () => {
      const state = createInitialState();
      state.resources.quantumFluctuations.amount = new Decimal(150000);
      state.resources.energyDensity.amount = new Decimal(50000);
      state.coherence = new Decimal(100);
      replaceRuntimeState(state);

      const result = engine.dispatch({ type: 'TRIGGER_INFLATION' });
      expect(result.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(2);
      expect(gameState.plasmaTemperature.toNumber()).toBe(10000000);
      expect(gameState.resources.quantumFluctuations.amount.toNumber()).toBe(150000); // Resources are not wiped
      expect(gameState.inflatonMultiplier.toNumber()).toBeCloseTo(1.05, 4);
    });
  });

  describe('Cosmic Recombination (Era II -> Era III)', () => {
    it('generates a pure transition preview communicating Stellar Dawn and shared constant 250 H seed', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.plasmaTemperature = new Decimal(2500); // <= 3,000 K
      state.resources.protons.amount = new Decimal(10000);

      const preview = getRecombinationTransformationPreview(state);
      expect(preview.type).toBe('recombination');
      expect(preview.kind).toBe('forward-era');
      expect(preview.repeatable).toBe(false);
      expect(preview.advancesEra).toBe(true);
      expect(preview.targetEra).toBe(3);
      expect(preview.isEligible).toBe(true);

      // Verify shared authority constant
      expect(preview.startingCondition.amount).toBe(RECOMBINATION_STARTING_HYDROGEN);
      expect(preview.startingCondition.amount).toBe(250);
      expect(preview.startingCondition.label).toContain('250 Hydrogen');

      // Verify no-reset & persistence (no false Proton conversion or residue conversion claim)
      expect(preview.resets[0].label).toBe('None');
      expect(preview.persists.some(p => p.label === 'Plasma Discoveries')).toBe(true);
      expect(preview.persists.some(p => p.label.includes('Residue'))).toBe(false);
      expect(preview.next).toContain('Gravity');
    });

    it('preserves TRIGGER_RECOMBINATION command boundary with exactly 250 H starting Hydrogen', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.plasmaTemperature = new Decimal(2800);
      state.resources.protons.amount = new Decimal(50000);
      replaceRuntimeState(state);

      const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
      expect(result.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(3);
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(RECOMBINATION_STARTING_HYDROGEN);
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
    });

    it('unlocks the Recombination codex entry after reaching Era III via Cooling route', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.plasmaTemperature = new Decimal(2500); // Cooling route satisfied
      state.resources.protons.amount = new Decimal(0); // 0 protons (would fail protons >= 800k)
      replaceRuntimeState(state);

      // Trigger recombination
      const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
      expect(result.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(3);

      // Reconcile and verify codex unlocks
      CodexEngine.update(gameState);
      expect(gameState.codex.unlockedEntryIds).toContain('recombination');
      expect(gameState.codex.unlockedEntryIds).toContain('stellar-formation');
    });
  });

  describe('Supernova Collapse (Repeatable Era-III Transformation)', () => {
    it('generates first Supernova preview with verified RESET, PERSISTS, GAIN, and NEXT semantics', () => {
      const state = getPresetEraIIISupernovaReady();
      // Ensure first supernova (stats.supernovas == 0)
      state.stats.supernovas = new Decimal(0);
      state.upgrades.stellar = {
        efficient: { level: 2 },
        massive: { level: 0 },
        compact: { level: 0 }
      };

      const preview = getSupernovaTransformationPreview(state);
      expect(preview.type).toBe('supernova');
      expect(preview.kind).toBe('prestige-reset');
      expect(preview.repeatable).toBe(true);
      expect(preview.advancesEra).toBe(false);
      expect(preview.targetEra).toBe(3);
      expect(preview.isFirstSupernova).toBe(true);
      expect(preview.eyebrow).toBe('First Supernova Transformation Preview');

      // Outcome & causality
      expect(preview.outcome.displayName).toBe('White Dwarf');
      expect(preview.outcome.archetype).toBe('efficient');
      expect(preview.outcome.rewards.stardust.toNumber()).toBeGreaterThan(0);

      // Reset group
      const resetItems = preview.sections.resets.items;
      expect(resetItems.some(item => item.label.includes('Local Resources'))).toBe(true);
      expect(resetItems.some(item => item.label.includes('Local Construction'))).toBe(true);
      expect(resetItems.some(item => item.desc.includes('Stellar Configuration'))).toBe(true);

      // Persists group: includes verified permanent Legacy Upgrades
      const persistItems = preview.sections.persists.items;
      expect(persistItems.some(item => item.label.includes('Meta Currencies'))).toBe(true);
      expect(persistItems.some(item => item.label.includes('Legacy Upgrades'))).toBe(true);
      expect(persistItems.some(item => item.desc.includes('Stardust Forge'))).toBe(true);
      expect(persistItems.some(item => item.label.includes('Artifacts'))).toBe(true);
      expect(persistItems.some(item => item.label.includes('Achievements'))).toBe(true);
      expect(persistItems.some(item => item.label.includes('Cards'))).toBe(true);

      // Modifiers: White Dwarf has secondRunProductionMult = 1.0 and unconsumed stability mult, so modifierDescriptions is empty
      expect(preview.outcome.modifierDescriptions).toEqual([]);

      // Test Massive archetype (Black Hole) which has active secondRunProductionMult = 1.5
      const massiveState = getPresetEraIIISupernovaReady();
      massiveState.upgrades.stellar = { efficient: { level: 0 }, massive: { level: 3 }, compact: { level: 0 } };
      const massivePreview = getSupernovaTransformationPreview(massiveState);
      expect(massivePreview.outcome.modifierDescriptions.some(m => m.includes('Production Speed: +50%'))).toBe(true);
      expect(massivePreview.outcome.modifierDescriptions.some(m => m.includes('Core Stability'))).toBe(false);

      // Next distinction
      expect(preview.sections.next.distinction).toContain('Supernova does NOT advance to Era IV');
      expect(preview.sections.next.distinction).toContain('Galactic Ignition');
    });

    it('generates repeat Supernova preview when stats.supernovas > 0 while preserving discovery of reset semantics', () => {
      const state = getPresetEraIIISupernovaReady();
      state.stats.supernovas = new Decimal(3);
      state.upgrades.stellar = {
        efficient: { level: 0 },
        massive: { level: 5 },
        compact: { level: 0 }
      };

      const preview = getSupernovaTransformationPreview(state);
      expect(preview.isFirstSupernova).toBe(false);
      expect(preview.eyebrow).toBe('Repeatable Stellar Transformation');
      expect(preview.outcome.displayName).toBe('Black Hole');
      expect(preview.outcome.archetype).toBe('massive');
      expect(preview.outcome.rewards.singularityMass.toNumber()).toBeGreaterThan(0);
      expect(preview.sections.resets.items.length).toBeGreaterThan(0);
      expect(preview.sections.persists.items.length).toBeGreaterThan(0);
    });

    it('characterizes exact Supernova persistence contract: preserves legacy upgrades, resets run-local construction and resources', () => {
      const state = getPresetEraIIISupernovaReady();
      state.currencies.stardust.amount = new Decimal(50);
      state.currencies.pulsarShards.amount = new Decimal(10);
      state.currencies.singularityMass.amount = new Decimal(5);

      // Representative upgrades from each persistent family with explicit level and cost state
      state.upgrades.stardust = { radiantIgnition: { level: 3, cost: new Decimal(100) } };
      state.upgrades.pulsar = { autoCompress: { level: 1, cost: new Decimal(1) } };
      state.upgrades.singularity = { eventHorizon: { level: 2, cost: new Decimal(50) } };

      // Run-local upgrades that MUST reset
      state.upgrades.stellar = { efficient: { level: 4, cost: new Decimal(500) } };
      state.upgrades.quantum = { lawGravity: { level: 5 } };

      state.artifacts.equipped = ['test-artifact', null, null];
      state.cards = { unlocked: ['card-1'] };
      state.completedMissions = ['mission-1'];
      state.codex = { unlockedEntryIds: ['void', 'recombination'] };

      replaceRuntimeState(state);

      const result = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
      expect(result.ok).toBe(true);

      // 1. VERIFIED PERSISTED: Currencies, Stats, Meta, Artifacts, Achievements, Cards, Missions, Codex
      expect(gameState.activeEpoch).toBe(3);
      expect(gameState.currencies.stardust.amount.toNumber()).toBeGreaterThan(50); // Previous + reward
      expect(gameState.currencies.pulsarShards.amount.toNumber()).toBeGreaterThanOrEqual(10);
      expect(gameState.currencies.singularityMass.amount.toNumber()).toBeGreaterThanOrEqual(5);
      expect(gameState.stats.supernovas.toNumber()).toBe(1);
      expect(gameState.achievements.firstSupernova.unlocked).toBe(true);
      expect(gameState.artifacts.equipped[0]).toBe('test-artifact');
      expect(gameState.cards.unlocked).toContain('card-1');
      expect(gameState.completedMissions).toContain('mission-1');
      expect(gameState.codex.unlockedEntryIds).toContain('recombination');
      expect(gameState.meta.stellarRunsCompleted).toBe(1);

      // 2. VERIFIED PERSISTED: Legacy Upgrades (Level and Cost state preserved)
      // Stardust representative
      expect(gameState.upgrades.stardust.radiantIgnition.level).toBe(3);
      expect(gameState.upgrades.stardust.radiantIgnition.cost.toNumber()).toBe(100);

      // Pulsar representative (AutoCompress mastery protected)
      expect(gameState.upgrades.pulsar.autoCompress.level).toBe(1);
      expect(gameState.upgrades.pulsar.autoCompress.cost.toNumber()).toBe(1);

      // Singularity representative
      expect(gameState.upgrades.singularity.eventHorizon.level).toBe(2);
      expect(gameState.upgrades.singularity.eventHorizon.cost.toNumber()).toBe(50);

      // 3. VERIFIED RESET: Run-Local Stellar Upgrades and Construction
      expect(gameState.upgrades.stellar.efficient?.level || 0).toBe(0);
      expect(gameState.upgrades.quantum.lawGravity?.level || 0).toBe(0);
      expect(gameState.era3.gravity.toNumber()).toBe(1);
      expect(gameState.era3.fusionYield.toNumber()).toBe(0);
      expect(gameState.era3.temperature.toNumber()).toBe(0);
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(0);
      expect(gameState.resources.iron.amount.toNumber()).toBe(0);
    });
  });

  describe('Galactic Ignition (Era III -> Era IV)', () => {
    it('generates a pure transition preview marking permanent forward advancement distinct from Supernova', () => {
      const state = createInitialState();
      state.activeEpoch = 3;
      state.era3.temperature = new Decimal(2000000000); // 2.00B K
      state.resources.iron.amount = new Decimal(1000);

      const preview = getGalacticIgnitionTransformationPreview(state);
      expect(preview.type).toBe('galactic-ignition');
      expect(preview.kind).toBe('forward-era');
      expect(preview.repeatable).toBe(false);
      expect(preview.advancesEra).toBe(true);
      expect(preview.targetEra).toBe(4);
      expect(preview.isEligible).toBe(true);
      expect(preview.distinction).toContain('Permanent Era advancement');
      expect(preview.distinction).toContain('repeatable Supernova remains available in Legacy');
    });

    it('preserves TRIGGER_GALACTIC_IGNITION command behavior', () => {
      const state = createInitialState();
      state.activeEpoch = 3;
      state.era3.temperature = new Decimal(2000000000);
      state.resources.iron.amount = new Decimal(1000);
      replaceRuntimeState(state);

      const result = engine.dispatch({ type: 'TRIGGER_GALACTIC_IGNITION' });
      expect(result.ok).toBe(true);
      expect(gameState.activeEpoch).toBe(4);
    });
  });

  describe('Central dispatcher getTransitionPresentation', () => {
    it('dispatches to appropriate transition models and returns null for unknown type', () => {
      const state = createInitialState();
      expect(getTransitionPresentation(state, 'inflation').type).toBe('inflation');
      expect(getTransitionPresentation(state, 'recombination').type).toBe('recombination');
      expect(getTransitionPresentation(state, 'supernova').type).toBe('supernova');
      expect(getTransitionPresentation(state, 'galactic-ignition').type).toBe('galactic-ignition');
      expect(getTransitionPresentation(state, 'unknown')).toBe(null);
    });
  });
});
