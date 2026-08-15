import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timeline } from '../src/core/timeline.js';
import { gameState, getInitialGameState } from '../src/core/state.js';

describe('Timeline Logic', () => {
  beforeEach(() => {
    Object.assign(gameState, getInitialGameState());
    gameState.activeEpoch = 1;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Timeline object exists', () => {
    expect(Timeline).toBeDefined();
  });
});
