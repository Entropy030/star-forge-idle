import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';
import { stellarCommandHandlers } from '../src/eras/stellar/commands.js';
import { createInitialState } from '../src/state/createInitialState.js';
import Decimal from '../break_infinity.js';

describe('Era 3 Commands', () => {
  let engine;

  beforeEach(() => {
    let initialState = createInitialState();
    initialState.activeEpoch = 3;
    initialState.era3 = { 
      temperature: new Decimal(0), 
      tempMultiplier: new Decimal(1),
      gravity: new Decimal(1),
      gravityCost: new Decimal(10),
      fusionYield: new Decimal(0),
      fuserCostHydrogen: new Decimal(50),
      stage: 'Protostar'
    };
    initialState.stats.maxTemp = new Decimal(0);
    initialState.resources.hydrogen.amount = new Decimal(100);
    
    engine = createGameEngine({
      initialState,
      commandHandlers: { ...stellarCommandHandlers }
    });
  });

  it('handles CLICK_CORE_ERA3', () => {
    const result = engine.dispatch({ type: 'CLICK_CORE_ERA3' });
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.era3.temperature.toNumber()).toBe(10000);
    expect(state.stats.maxTemp.toNumber()).toBe(10000);
  });

  it('handles BUY_CORE_NODE', () => {
    const result = engine.dispatch({ 
      type: 'BUY_CORE_NODE', 
      payload: { key: 'gravity', loops: 1 } 
    });
    
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.era3.gravity.toNumber()).toBe(2);
    expect(state.resources.hydrogen.amount.toNumber()).toBe(90); // 100 - 10 = 90
  });

  it('handles TRIGGER_SUPERNOVA prerequisites', () => {
    const result = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('INSUFFICIENT_IRON');
  });
});
