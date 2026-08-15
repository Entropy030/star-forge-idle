import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { ensureStateShape, gameState, replaceRuntimeState } from '../src/core/state.js';
import { engine } from '../src/engine/instance.js';
import { devSetEpoch } from '../src/dev/epoch.js';

describe('canonical runtime history', () => {
  beforeEach(() => {
    replaceRuntimeState(createInitialState());
  });

  it('is present on every fresh state', () => {
    expect(createInitialState().history).toEqual([]);
    expect(gameState.history).toEqual([]);
  });

  it.each([undefined, null, {}, 'invalid'])('normalizes malformed history %p to an array', history => {
    const state = createInitialState();
    state.history = history;

    ensureStateShape(state);

    expect(state.history).toEqual([]);
  });

  it.each([
    [1, 2],
    [2, 3]
  ])('switches a fresh Era %i state to Era %i without splitting runtime or UI state', (from, to) => {
    const state = createInitialState();
    state.activeEpoch = from;
    state.cosmicAge = new Decimal('42.5');
    replaceRuntimeState(state);
    const callback = vi.fn();

    expect(() => devSetEpoch(to, callback)).not.toThrow();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(gameState.activeEpoch).toBe(to);
    expect(engine.getStateUnsafe()).toBe(gameState);
    expect(document.body.getAttribute('data-epoch')).toBe(String(to));
    expect(gameState.history).toHaveLength(1);
    expect(gameState.history[0].time.eq('42.5')).toBe(true);
    expect(gameState.history[0].msg).toMatch(/^Timeline Shifted to .+/);
    expect(gameState.history[0].msg).not.toContain('undefined');
  });
});
