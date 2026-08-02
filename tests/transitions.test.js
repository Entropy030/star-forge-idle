import { describe, it, expect, beforeEach } from 'vitest';
import { triggerSupernova } from '../src/core/actions.js';
import { gameState, getInitialGameState } from '../src/core/state.js';
import Decimal from '../break_infinity.js';

describe('Transitions Logic', () => {
  beforeEach(() => {
    Object.assign(gameState, getInitialGameState());
    gameState.activeEpoch = 3;
    // mock DOM for theatrical
    document.body.innerHTML = '<div></div>';
    global.window.playtestHarness = { isRunning: true };
    // Prevent format error when attempting to format strings or undefined by making sure everything is instantiated
    global.t = (key) => key;
  });

  it('triggerSupernova is exported and accessible', () => {
    expect(triggerSupernova).toBeDefined();
  });
});
