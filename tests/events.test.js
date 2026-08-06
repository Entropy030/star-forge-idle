import { describe, it, expect, vi } from 'vitest';
import { spawnFlare } from '../src/core/stellar.js';
import { gameState, getInitialGameState } from '../src/core/state.js';
import Decimal from 'break_infinity.js';

describe('Event-driven Architecture', () => {
  it('spawnFlare dispatches solarFlareSpawned event', () => {
    Object.assign(gameState, getInitialGameState());
    gameState.activeEpoch = 3;
    
    let eventFired = false;
    const listener = () => { eventFired = true; };
    window.addEventListener('solarFlareSpawned', listener);
    
    spawnFlare();
    
    expect(eventFired).toBe(true);
    window.removeEventListener('solarFlareSpawned', listener);
  });
});
