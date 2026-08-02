import { describe, it, expect } from 'vitest';
import '../src/main.js'; // Loading main should not crash

describe('Smoke Test', () => {
  it('App loads without crashing and initializes state', async () => {
    // dynamically import state
    const { gameState } = await import('../src/core/state.js');
    expect(gameState).toBeDefined();
    expect(gameState.activeEpoch).toBe(1);
  });
});
