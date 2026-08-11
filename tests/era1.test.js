import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';
import { quantumCommandHandlers } from '../src/eras/quantum/commands.js';
import { createInitialState } from '../src/state/createInitialState.js';
import Decimal from 'break_infinity.js';

describe('Era 1 Commands', () => {
  let engine;

  beforeEach(() => {
    let initialState = createInitialState();
    initialState.activeEpoch = 1;
    initialState.resources.quantumFluctuations.amount = new Decimal(100);
    initialState.upgrades.quantum.gravityForce = { level: 0, cost: new Decimal(10) };
    
    engine = createGameEngine({
      initialState,
      commandHandlers: { ...quantumCommandHandlers }
    });
  });

  it('handles CLICK_CORE', () => {
    const result = engine.dispatch({ type: 'CLICK_CORE' });
    expect(result.ok).toBe(true);
    expect(result.events[0].type).toBe('CORE_CLICKED');
    
    const state = engine.getStateUnsafe();
    expect(state.era1.unfoldCount).toBe(1);
    expect(state.resources.quantumFluctuations.amount.gt(100)).toBe(true);
  });

  it('handles BUY_UPGRADE', () => {
    const result = engine.dispatch({
      type: 'BUY_UPGRADE',
      payload: { category: 'quantum', upgradeId: 'gravityForce', loops: 2 }
    });
    
    if (!result.ok) console.error(result.error);
    expect(result.ok).toBe(true);
    expect(result.events[0].type).toBe('UPGRADE_PURCHASED');
    expect(result.events[0].boughtCount).toBe(2);
    
    const state = engine.getStateUnsafe();
    expect(state.upgrades.quantum.gravityForce.level).toBe(2);
    // Cost scaling check: 10 + (10*1.35=14) = 24 deducted
    expect(state.resources.quantumFluctuations.amount.toNumber()).toBe(76);
  });
  
  it('prevents BUY_UPGRADE when insufficient funds', () => {
    // We only have 100 QF. Buying gravityForce 10 times costs > 100.
    const result = engine.dispatch({
      type: 'BUY_UPGRADE',
      payload: { category: 'quantum', upgradeId: 'gravityForce', loops: 10 }
    });
    
    // It should buy exactly as many as it can afford, returning OK
    expect(result.ok).toBe(true);
    const state = engine.getStateUnsafe();
    // 10 + 14 + 19 + 25 = 68. 5th costs 34. Total funds 100. So we can buy 4.
    expect(state.upgrades.quantum.gravityForce.level).toBe(4);
    expect(result.events[0].boughtCount).toBe(4);
    expect(state.resources.quantumFluctuations.amount.toNumber()).toBe(31);
  });
});

describe('Cosmic Inflation Authority', () => {
  let engine;
  beforeEach(() => {
    let initialState = createInitialState();
    initialState.activeEpoch = 1;
    initialState.resources.quantumFluctuations.amount = new Decimal(150000);
    initialState.resources.energyDensity = { amount: new Decimal(60000) };
    initialState.coherence = new Decimal(100);
    
    engine = createGameEngine({
      initialState,
      commandHandlers: { ...quantumCommandHandlers }
    });
  });

  it('fails if missing Coherence', () => {
    engine.getStateUnsafe().coherence = new Decimal(99);
    const result = engine.dispatch({ type: 'TRIGGER_INFLATION' });
    expect(result.ok).toBe(false);
  });

  it('fails if missing QF', () => {
    engine.getStateUnsafe().resources.quantumFluctuations.amount = new Decimal(90000);
    const result = engine.dispatch({ type: 'TRIGGER_INFLATION' });
    expect(result.ok).toBe(false);
  });

  it('fails if missing ED', () => {
    engine.getStateUnsafe().resources.energyDensity.amount = new Decimal(40000);
    const result = engine.dispatch({ type: 'TRIGGER_INFLATION' });
    expect(result.ok).toBe(false);
  });

  it('succeeds when all conditions are met', () => {
    const result = engine.dispatch({ type: 'TRIGGER_INFLATION' });
    expect(result.ok).toBe(true);
    expect(engine.getStateUnsafe().activeEpoch).toBe(2);
  });
});
