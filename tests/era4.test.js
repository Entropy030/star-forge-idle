import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';
import { galacticCommandHandlers } from '../src/eras/galactic/commands.js';
import { createInitialState } from '../src/state/createInitialState.js';
import Decimal from '../break_infinity.js';

describe('Era 4 and 5 Commands', () => {
  let engine;

  beforeEach(() => {
    let initialState = createInitialState();
    initialState.activeEpoch = 4;
    initialState.resources.hydrogen.amount = new Decimal(0);
    initialState.resources.planetaryDebris.amount = new Decimal(0);
    initialState.resources.darkMatter.amount = new Decimal(50);
    initialState.era4 = { planetaryNodes: new Decimal(0) };
    
    initialState.upgrades.galaxy.elementalInjection = { level: 0, cost: new Decimal(20) };
    
    engine = createGameEngine({
      initialState,
      commandHandlers: { ...galacticCommandHandlers }
    });
  });

  it('handles CLICK_CORE_ERA4', () => {
    const result = engine.dispatch({ type: 'CLICK_CORE_ERA4' });
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.resources.hydrogen.amount.toNumber()).toBe(50);
  });

  it('handles TRIGGER_BIG_BOUNCE prerequisites', () => {
    const result = engine.dispatch({ type: 'TRIGGER_BIG_BOUNCE' });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('INSUFFICIENT_NODES');
  });
  
  it('handles TRIGGER_BIG_BOUNCE', () => {
    const stateBefore = engine.getStateUnsafe();
    stateBefore.era4.planetaryNodes = new Decimal(5);
    
    const result = engine.dispatch({ type: 'TRIGGER_BIG_BOUNCE' });
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.activeEpoch).toBe(4);
    expect(state.currencies.pulsarShards.amount.toNumber()).toBeGreaterThanOrEqual(0);
    expect(state.currencies.bits.amount.toNumber()).toBeGreaterThanOrEqual(1);
  });

  it('handles BUY_UPGRADE_GALAXY', () => {
    const result = engine.dispatch({
      type: 'BUY_UPGRADE_GALAXY',
      payload: { category: 'galaxy', upgradeId: 'elementalInjection', loops: 1 }
    });
    
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.upgrades.galaxy.elementalInjection.level).toBe(1);
    expect(state.resources.darkMatter.amount.toNumber()).toBe(30); // 50 - 20 = 30
  });

  it('handles TRIGGER_GALACTIC_MERGE', () => {
    const stateBefore = engine.getStateUnsafe();
    stateBefore.activeEpoch = 5;
    stateBefore.resources.planetaryDebris.amount = new Decimal(1e12).plus(100);
    
    const result = engine.dispatch({ type: 'TRIGGER_GALACTIC_MERGE' });
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.resources.planetaryDebris.amount.toNumber()).toBe(100);
    expect(state.currencies.singularityMass.amount.toNumber()).toBeGreaterThanOrEqual(1);
  });
});
