import { describe, it, expect, beforeEach } from 'vitest';
import { triggerSupernova } from '../src/core/actions.js';
import { gameState, getInitialGameState } from '../src/core/state.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import Decimal from 'break_infinity.js';

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

  it('records the current event reward after the stellar state reset', () => {
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    gameState.era3.ironYield = new Decimal(1);
    gameState.resources.iron.amount = new Decimal(1000);

    const result = triggerSupernova();

    expect(result.ok).toBe(true);
    expect(gameState.history).toHaveLength(1);
    expect(gameState.history[0].msg).toMatch(/^Supernova Yield: \d+(?:\.\d+)? Stardust$/);
    expect(gameState.history[0].msg).not.toContain('undefined');
  });
});
