import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import '../src/engine/instance.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import { gameState, getInitialGameState, replaceRuntimeState } from '../src/core/state.js';
import { ensureStateShape } from '../src/state/schema.js';
import {
  getVacuumAllocation,
  getVacuumAllocationProfile,
  getVacuumCoherence,
  getVacuumCoherenceRates,
  getVacuumFieldQuality,
  isVacuumFieldAllocationUnlocked,
  setVacuumCoherence,
  VACUUM_ALLOCATION_MODES
} from '../src/eras/quantum/coherence.js';
import { getEnergyDensityRate, getQuantumFluctuationRate } from '../src/core/economy.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { dispatchEngineCommand } from '../src/engine/dispatch.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { OFFLINE_TICK_CONTEXT } from '../src/core/tickContext.js';
import { reconcileCodexUnlocks } from '../src/core/codexProgression.js';
import { getCurrentObjective } from '../src/core/objectives.js';

function makeUnlockedEra1State() {
  const state = getInitialGameState();
  state.activeEpoch = 1;
  state.resources.quantumFluctuations.amount = new Decimal(5000);
  state.resources.energyDensity.amount = new Decimal(25000);
  state.stats.maxQF = new Decimal(5000);
  state.completedObjectives = ['obj_qf_intro', 'obj_upgrade_gravity', 'obj_density_intro'];
  state.upgrades.quantum.gravityForce.level = 5;
  state.upgrades.quantum.weakForce.level = 5;
  state.upgrades.quantum.electromagneticForce.level = 5;
  state.upgrades.quantum.vacuumResonance.level = 1;
  return state;
}

describe('Era I Vacuum Field Allocation — Domain, State & Schema', () => {
  it('initializes fresh state with BALANCED allocation and retains save v17', () => {
    const state = getInitialGameState();
    expect(state.era1.vacuumAllocation).toBe('BALANCED');
    expect(getVacuumAllocation(state)).toBe('BALANCED');
  });

  it('normalizes missing, null, or invalid vacuumAllocation to BALANCED in schema', () => {
    const state = getInitialGameState();
    
    delete state.era1.vacuumAllocation;
    ensureStateShape(state);
    expect(state.era1.vacuumAllocation).toBe('BALANCED');

    state.era1.vacuumAllocation = 'INVALID_MODE';
    ensureStateShape(state);
    expect(state.era1.vacuumAllocation).toBe('BALANCED');

    state.era1.vacuumAllocation = 'ACCUMULATE'; // Era II posture must not leak
    ensureStateShape(state);
    expect(state.era1.vacuumAllocation).toBe('BALANCED');
  });

  it('preserves valid vacuumAllocation modes during schema normalization', () => {
    for (const mode of VACUUM_ALLOCATION_MODES) {
      const state = getInitialGameState();
      state.era1.vacuumAllocation = mode;
      ensureStateShape(state);
      expect(state.era1.vacuumAllocation).toBe(mode);
      expect(getVacuumAllocation(state)).toBe(mode);
    }
  });
});

describe('Era I Vacuum Field Allocation — Unlock Semantics & Presentation', () => {
  beforeEach(() => {
    replaceRuntimeState(getInitialGameState());
  });

  it('is locked in fresh Era I before Vacuum Resonance is available', () => {
    const state = getInitialGameState();
    expect(isVacuumFieldAllocationUnlocked(state)).toBe(false);

    const presentation = getCosmosPresentation(state);
    expect(presentation.allocation).toBeNull();
  });

  it('unlocks once Vacuum Resonance becomes eligible or purchased', () => {
    const state = makeUnlockedEra1State();
    expect(isVacuumFieldAllocationUnlocked(state)).toBe(true);

    const presentation = getCosmosPresentation(state);
    expect(presentation.allocation).not.toBeNull();
    expect(presentation.allocation.active).toBe('BALANCED');
    expect(presentation.allocation.throughputMultiplier).toBe(1.0);
    expect(presentation.allocation.options).toHaveLength(3);
    expect(presentation.allocation.options.map(o => o.id)).toEqual(['PROPAGATION', 'BALANCED', 'STABILIZATION']);
  });
});

describe('Era I Vacuum Field Allocation — SET_VACUUM_ALLOCATION Command Contract', () => {
  beforeEach(() => {
    replaceRuntimeState(makeUnlockedEra1State());
  });

  it('rejects command when in wrong epoch', () => {
    gameState.activeEpoch = 2;
    const result = dispatchEngineCommand({
      type: 'SET_VACUUM_ALLOCATION',
      payload: { allocation: 'PROPAGATION' }
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('WRONG_EPOCH');
  });

  it('rejects command when allocation is locked', () => {
    replaceRuntimeState(getInitialGameState()); // fresh state, locked
    const result = dispatchEngineCommand({
      type: 'SET_VACUUM_ALLOCATION',
      payload: { allocation: 'PROPAGATION' }
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('LOCKED');
  });

  it('rejects command with invalid mode', () => {
    const result = dispatchEngineCommand({
      type: 'SET_VACUUM_ALLOCATION',
      payload: { allocation: 'HYPER_DRIVE' }
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('INVALID_MODE');
  });

  it('is idempotent and emits no events when selecting current mode', () => {
    expect(gameState.era1.vacuumAllocation).toBe('BALANCED');
    const result = dispatchEngineCommand({
      type: 'SET_VACUUM_ALLOCATION',
      payload: { allocation: 'BALANCED' }
    });
    expect(result.ok).toBe(true);
    expect(result.changed).toBe(false);
    expect(result.events).toEqual([]);
  });

  it('successfully transitions allocation mode without modifying currencies or granting free bonuses', () => {
    const qfBefore = gameState.resources.quantumFluctuations.amount.toString();
    const edBefore = gameState.resources.energyDensity.amount.toString();
    const cohBefore = gameState.coherence.toString();

    const result = dispatchEngineCommand({
      type: 'SET_VACUUM_ALLOCATION',
      payload: { allocation: 'PROPAGATION' }
    });

    expect(result.ok).toBe(true);
    expect(result.changed).toBe(true);
    expect(gameState.era1.vacuumAllocation).toBe('PROPAGATION');
    expect(result.events).toEqual([
      {
        type: 'VACUUM_ALLOCATION_CHANGED',
        allocation: 'PROPAGATION',
        previousAllocation: 'BALANCED'
      }
    ]);

    // Zero side-effect mutation on resources
    expect(gameState.resources.quantumFluctuations.amount.toString()).toBe(qfBefore);
    expect(gameState.resources.energyDensity.amount.toString()).toBe(edBefore);
    expect(gameState.coherence.toString()).toBe(cohBefore);
  });
});

describe('Era I Vacuum Field Allocation — Rate Coupling & Quality Feedback', () => {
  beforeEach(() => {
    replaceRuntimeState(makeUnlockedEra1State());
  });

  it('computes Field Quality strictly from Coherence (1.0x at 0%, 1.5x at 50%, 2.0x at 100%)', () => {
    setVacuumCoherence(gameState, new Decimal(0));
    expect(getVacuumFieldQuality(gameState)).toBeCloseTo(1.0);

    setVacuumCoherence(gameState, new Decimal(50));
    expect(getVacuumFieldQuality(gameState)).toBeCloseTo(1.5);

    setVacuumCoherence(gameState, new Decimal(100));
    expect(getVacuumFieldQuality(gameState)).toBeCloseTo(2.0);

    // Clamped against over/underflow
    setVacuumCoherence(gameState, new Decimal(-10));
    expect(getVacuumFieldQuality(gameState)).toBeCloseTo(1.0);

    setVacuumCoherence(gameState, new Decimal(150));
    expect(getVacuumFieldQuality(gameState)).toBeCloseTo(2.0);
  });

  it('multiplies Fundamental Law throughput by allocationMultiplier and fieldQuality', () => {
    setVacuumCoherence(gameState, new Decimal(0)); // quality = 1.0
    gameState.era1.vacuumAllocation = 'BALANCED';
    const baseBalancedRate = getQuantumFluctuationRate(gameState);

    // PROPAGATION: 1.5x throughput
    gameState.era1.vacuumAllocation = 'PROPAGATION';
    const propRate = getQuantumFluctuationRate(gameState);
    expect(propRate.div(baseBalancedRate).toNumber()).toBeCloseTo(1.5);

    // STABILIZATION: 0.5x throughput
    gameState.era1.vacuumAllocation = 'STABILIZATION';
    const stabRate = getQuantumFluctuationRate(gameState);
    expect(stabRate.div(baseBalancedRate).toNumber()).toBeCloseTo(0.5);

    // With 100% Coherence (quality = 2.0x):
    setVacuumCoherence(gameState, new Decimal(100));
    gameState.era1.vacuumAllocation = 'BALANCED';
    const maxQualityBalancedRate = getQuantumFluctuationRate(gameState);
    expect(maxQualityBalancedRate.div(baseBalancedRate).toNumber()).toBeCloseTo(2.0);

    gameState.era1.vacuumAllocation = 'PROPAGATION';
    const maxQualityPropRate = getQuantumFluctuationRate(gameState);
    expect(maxQualityPropRate.div(baseBalancedRate).toNumber()).toBeCloseTo(3.0); // 1.5 * 2.0
  });

  it('modulates passive Coherence rate while keeping observation gain untouched', () => {
    gameState.era1.vacuumAllocation = 'BALANCED';
    const balRates = getVacuumCoherenceRates(gameState);
    expect(balRates.passiveRate.toNumber()).toBeCloseTo(0.10);
    expect(balRates.observationGain.toNumber()).toBeCloseTo(0.50);

    gameState.era1.vacuumAllocation = 'PROPAGATION';
    const propRates = getVacuumCoherenceRates(gameState);
    expect(propRates.passiveRate.toNumber()).toBeCloseTo(0.05); // 0.5x
    expect(propRates.observationGain.toNumber()).toBeCloseTo(0.50); // Unchanged

    gameState.era1.vacuumAllocation = 'STABILIZATION';
    const stabRates = getVacuumCoherenceRates(gameState);
    expect(stabRates.passiveRate.toNumber()).toBeCloseTo(0.25); // 2.5x
    expect(stabRates.observationGain.toNumber()).toBeCloseTo(0.50); // Unchanged
  });

  it('does not scale core click QF gain with allocation throughput', () => {
    gameState.era1.vacuumAllocation = 'PROPAGATION';
    const qfBefore = gameState.resources.quantumFluctuations.amount;
    dispatchEngineCommand({ type: 'CLICK_CORE' });
    const gainProp = gameState.resources.quantumFluctuations.amount.minus(qfBefore);

    gameState.era1.vacuumAllocation = 'STABILIZATION';
    const qfBeforeStab = gameState.resources.quantumFluctuations.amount;
    dispatchEngineCommand({ type: 'CLICK_CORE' });
    const gainStab = gameState.resources.quantumFluctuations.amount.minus(qfBeforeStab);

    expect(gainProp.eq(gainStab)).toBe(true);
    expect(gainProp.toNumber()).toBe(1);
  });
});

describe('Era I Vacuum Field Allocation — Narrative, Codex & Objectives', () => {
  beforeEach(() => {
    replaceRuntimeState(makeUnlockedEra1State());
  });

  it('emits vacuum_allocation_unlocked narrative milestone with factual availability wording when available during tick', () => {
    expect(gameState.discoveries.has('vacuum_allocation_unlocked')).toBe(false);
    advanceGameTick(1, undefined, OFFLINE_TICK_CONTEXT);
    expect(gameState.discoveries.has('vacuum_allocation_unlocked')).toBe(true);
    const entry = gameState.history.find(e => e.id === 'vacuum_allocation_unlocked');
    expect(entry).toBeDefined();
    expect(entry.msg).toBe('Vacuum Resonance available. Field Allocation is now accessible: propagate Fundamental Laws, balance the field, or accelerate stabilization.');
  });

  it('strictly couples Codex availability to authoritative isVacuumFieldAllocationUnlocked helper', () => {
    const lockedState = getInitialGameState();
    lockedState.codex = { unlockedEntryIds: [] };
    expect(isVacuumFieldAllocationUnlocked(lockedState)).toBe(false);
    expect(reconcileCodexUnlocks(lockedState)).not.toContain('vacuum-field-allocation');
    expect(lockedState.codex.unlockedEntryIds).not.toContain('vacuum-field-allocation');

    if (!gameState.codex) gameState.codex = { unlockedEntryIds: [] };
    expect(isVacuumFieldAllocationUnlocked(gameState)).toBe(true);
    const unlocked = reconcileCodexUnlocks(gameState);
    expect(unlocked).toContain('vacuum-field-allocation');
    expect(gameState.codex.unlockedEntryIds).toContain('vacuum-field-allocation');
  });

  it('contextualizes the final inflation objective explanation when unlocked without blocking', () => {
    const obj = getCurrentObjective(gameState);
    expect(obj.id).toBe('obj_era1_complete');
    expect(obj.explanation).toContain('Vacuum Field Allocation');
  });
});

describe('Era I Vacuum Field Allocation — Rapid Toggle Characterization', () => {
  beforeEach(() => {
    replaceRuntimeState(makeUnlockedEra1State());
  });

  it('produces no surplus resource generation or exploitation under rapid continuous mode switching', () => {
    const qfStart = gameState.resources.quantumFluctuations.amount;
    const modes = ['PROPAGATION', 'STABILIZATION', 'BALANCED', 'PROPAGATION', 'STABILIZATION'];

    for (let i = 0; i < 50; i++) {
      const targetMode = modes[i % modes.length];
      dispatchEngineCommand({
        type: 'SET_VACUUM_ALLOCATION',
        payload: { allocation: targetMode }
      });
    }

    // No ticks elapsed, so resources must be exactly unchanged
    expect(gameState.resources.quantumFluctuations.amount.eq(qfStart)).toBe(true);
  });
});
