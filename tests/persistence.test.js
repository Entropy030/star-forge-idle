import { describe, it, expect } from 'vitest';
import { gameState, getInitialGameState, ensureStateShape } from '../src/core/state.js';

describe('Persistence Logic', () => {
  it('mergeDefaultsIntoLoadedState handles decimals properly', () => {
    // Modify initial state and check ensureStateShape
    const savedState = getInitialGameState();
    // Simulate a serialized/deserialized state where amounts might not be Decimal yet
    savedState.resources.hydrogen.amount = 500;
    
    // Simulate loading this state
    Object.assign(gameState, savedState);
    ensureStateShape();

    // After ensureStateShape, it should be wrapped in Decimal
    expect(gameState.resources.hydrogen.amount).toBeInstanceOf(global.Decimal);
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(500);
  });
});
