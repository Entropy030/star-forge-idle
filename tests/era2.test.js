import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { createInitialState } from '../src/state/createInitialState.js';
import Decimal from '../break_infinity.js';

describe('Era 2 Commands', () => {
  let engine;

  beforeEach(() => {
    let initialState = createInitialState();
    initialState.activeEpoch = 2;
    initialState.era2 = { plasmaFusersEnabled: false };
    initialState.resources.quarks.amount = new Decimal(100);
    initialState.resources.gluons.amount = new Decimal(50);
    initialState.upgrades.plasma.quarkCondenser = { level: 0, cost: new Decimal(20) };
    
    engine = createGameEngine({
      initialState,
      commandHandlers: { ...plasmaCommandHandlers }
    });
  });

  it('handles CLICK_CORE_ERA2', () => {
    const result = engine.dispatch({ type: 'CLICK_CORE_ERA2' });
    expect(result.ok).toBe(true);
    expect(result.events[0].type).toBe('CORE_CLICKED');
    
    const state = engine.getStateUnsafe();
    // Quark amount starts at 100, gain is at least 3
    expect(state.resources.quarks.amount.toNumber()).toBeGreaterThan(100);
  });

  it('handles TOGGLE_FUSER', () => {
    const state = engine.getStateUnsafe();
    expect(state.era2.plasmaFusersEnabled).toBe(false);
    
    const result = engine.dispatch({ type: 'TOGGLE_FUSER' });
    expect(result.ok).toBe(true);
    expect(engine.getStateUnsafe().era2.plasmaFusersEnabled).toBe(true);
    
    engine.dispatch({ type: 'TOGGLE_FUSER' });
    expect(engine.getStateUnsafe().era2.plasmaFusersEnabled).toBe(false);
  });

  it('handles BUY_UPGRADE_PLASMA', () => {
    const result = engine.dispatch({
      type: 'BUY_UPGRADE_PLASMA',
      payload: { category: 'plasma', upgradeId: 'quarkCondenser', loops: 1 }
    });
    
    if (!result.ok) console.error(result.error);
    expect(result.ok).toBe(true);
    expect(result.events[0].type).toBe('UPGRADE_PURCHASED');
    
    const state = engine.getStateUnsafe();
    expect(state.upgrades.plasma.quarkCondenser.level).toBe(1);
    expect(state.resources.quarks.amount.toNumber()).toBe(80); // 100 - 20 = 80
  });
});
