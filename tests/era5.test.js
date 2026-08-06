import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';
import { galacticCommandHandlers } from '../src/eras/galactic/commands.js';
import { createInitialState } from '../src/state/createInitialState.js';
import Decimal from 'break_infinity.js';

describe('Era 5 Commands', () => {
  let engine;

  beforeEach(() => {
    let initialState = createInitialState();
    initialState.activeEpoch = 5;
    initialState.currencies.stardust.amount = new Decimal(100);
    initialState.upgrades.era5 = {
      hawkingCollector: { level: 1, cost: new Decimal(10) }
    };
    
    engine = createGameEngine({
      initialState,
      commandHandlers: { ...galacticCommandHandlers }
    });
  });

  it('handles BUY_UPGRADE_ERA5', () => {
    const result = engine.dispatch({
      type: 'BUY_UPGRADE_ERA5',
      payload: { category: 'era5', upgradeId: 'hawkingCollector', loops: 1 }
    });
    
    expect(result.ok).toBe(true);
    
    const state = engine.getStateUnsafe();
    expect(state.upgrades.era5.hawkingCollector.level).toBe(2);
    expect(state.currencies.stardust.amount.toNumber()).toBe(90);
  });
});
