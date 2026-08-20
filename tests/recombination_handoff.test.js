import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { engine } from '../src/engine/instance.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { getPresetEraIIRecombinationReady } from '../src/dev/playtestPresets.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';

describe('P4 Phase 4: Recombination Handoff A (Constant 250 H Starting Hydrogen)', () => {
  beforeEach(() => {
    replaceRuntimeState(createInitialState());
  });

  it('Case A: minimum ready state via cooling route yields exactly 250 H', () => {
    const state = createInitialState();
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(2800); // <= 3,000 K
    state.resources.protons.amount = new Decimal(50);
    state.resources.electrons.amount = new Decimal(50);
    state.resources.hydrogen.amount = new Decimal(0);
    replaceRuntimeState(state);

    const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
    expect(result.ok).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
    expect(gameState.resources.hydrogen.amount.toString()).toBe('250');
  });

  it('Case B: minimum ready state via proton route yields exactly 250 H', () => {
    const state = createInitialState();
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(8000000); // hot plasma
    state.resources.protons.amount = new Decimal(25000); // >= 25k threshold
    state.resources.electrons.amount = new Decimal(25000);
    state.resources.hydrogen.amount = new Decimal(0);
    replaceRuntimeState(state);

    const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
    expect(result.ok).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
    expect(gameState.resources.hydrogen.amount.toString()).toBe('250');
  });

  it('Case C: high-matter ready state with large proton/electron totals yields exactly 250 H', () => {
    const state = createInitialState();
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(1000);
    state.resources.protons.amount = new Decimal(50000000); // 50M protons
    state.resources.electrons.amount = new Decimal(50000000); // 50M electrons
    state.resources.hydrogen.amount = new Decimal(0);
    replaceRuntimeState(state);

    const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
    expect(result.ok).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
    expect(gameState.resources.hydrogen.amount.toString()).toBe('250');
  });

  it('Case D: ready state with pre-existing Era-II hydrogen residue yields exactly 250 H (no additive stacking)', () => {
    const state = createInitialState();
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(2500);
    state.resources.protons.amount = new Decimal(10000);
    state.resources.electrons.amount = new Decimal(10000);
    state.resources.hydrogen.amount = new Decimal(8888); // Pre-existing residue
    replaceRuntimeState(state);

    const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
    expect(result.ok).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
    expect(gameState.resources.hydrogen.amount.toString()).toBe('250');
  });

  it('Case E: waiting post-readiness for multiple ticks yields invariant 250 H', () => {
    const state = getPresetEraIIRecombinationReady();
    replaceRuntimeState(state);

    // Advance 300 ticks (30 seconds) in ready state
    for (let i = 0; i < 300; i++) {
      advanceGameTick(100);
    }

    const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
    expect(result.ok).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
    expect(gameState.resources.hydrogen.amount.toString()).toBe('250');
  });

  it('Case F: invariant across all active operating postures', () => {
    for (const posture of ['ACCUMULATE', 'BALANCE', 'CONDENSE']) {
      const state = getPresetEraIIRecombinationReady();
      state.era2.posture = posture;
      replaceRuntimeState(state);

      const result = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
      expect(result.ok).toBe(true);
      expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);
      expect(gameState.resources.hydrogen.amount.toString()).toBe('250');
    }
  });

  it('verifies early Era-III purchasing sanity from 250 H baseline', () => {
    const state = getPresetEraIIRecombinationReady();
    replaceRuntimeState(state);

    const transitionResult = engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
    expect(transitionResult.ok).toBe(true);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(250);

    // In Era III, first fuser cost is 100 H
    expect(gameState.era3.fuserCostHydrogen.toNumber()).toBe(100);
    expect(gameState.resources.hydrogen.amount.gte(gameState.era3.fuserCostHydrogen)).toBe(true);

    // Purchase first fuser node
    const buyResult = engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'fuser' } });
    expect(buyResult.ok).toBe(true);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(150); // 250 - 100
    expect(gameState.era3.fusionYield.toNumber()).toBe(1);
  });
});
