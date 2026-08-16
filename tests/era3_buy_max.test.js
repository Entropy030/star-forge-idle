import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { stellarCommandHandlers } from '../src/eras/stellar/commands.js';
import { createGameEngine } from '../src/engine/createEngine.js';
import { setEngineDispatcher } from '../src/engine/dispatch.js';
import { Economy } from '../src/core/economy.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';

describe('Era III Buy Max & Purchasing Multipliers (P5.1)', () => {
  let state;
  let engine;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 3;
    state.era3.gravity = new Decimal(0);
    state.era3.gravityCost = new Decimal(10);
    state.resources.hydrogen.amount = new Decimal(0);

    replaceRuntimeState(state);

    engine = createGameEngine({
      initialState: state,
      commandHandlers: { ...stellarCommandHandlers }
    });
    setEngineDispatcher((cmd) => engine.dispatch(cmd));
  });

  describe('BUY_CORE_NODE authoritative command', () => {
    it('buys exactly 1 level when funds cover only 1 level (cost 10, funds 15)', () => {
      state.resources.hydrogen.amount = new Decimal(15);
      const res = stellarCommandHandlers.BUY_CORE_NODE(state, {
        type: 'BUY_CORE_NODE',
        payload: { key: 'gravity', loops: 10 }
      });

      expect(res.ok).toBe(true);
      expect(state.era3.gravity.toNumber()).toBe(1);
      // Cost was 10, next cost is 15 (10 * 1.5). 15 - 10 = 5 H remaining (cannot afford 15).
      expect(state.resources.hydrogen.amount.toNumber()).toBe(5);
    });

    it('buys multiple levels in a single command when funds permit (funds 100, loops 10)', () => {
      // Level 0 -> cost 10
      // Level 1 -> cost 15
      // Level 2 -> cost 22 (15 * 1.5 = 22.5 -> 22)
      // Level 3 -> cost 33 (22 * 1.5 = 33)
      // Sum 10 + 15 + 22 + 33 = 80 <= 100
      // Level 4 -> cost 49 (33 * 1.5 = 49.5 -> 49). 80 + 49 = 129 > 100.
      state.resources.hydrogen.amount = new Decimal(100);
      const res = stellarCommandHandlers.BUY_CORE_NODE(state, {
        type: 'BUY_CORE_NODE',
        payload: { key: 'gravity', loops: 10 }
      });

      expect(res.ok).toBe(true);
      expect(state.era3.gravity.toNumber()).toBe(4);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(100 - 80); // 20 H left
    });

    it('stops cleanly without negative resources when resources exhaust', () => {
      state.resources.hydrogen.amount = new Decimal(25);
      // Level 0 (10) + Level 1 (15) = 25. Exactly exhausts.
      const res = stellarCommandHandlers.BUY_CORE_NODE(state, {
        type: 'BUY_CORE_NODE',
        payload: { key: 'gravity', loops: 100 }
      });

      expect(res.ok).toBe(true);
      expect(state.era3.gravity.toNumber()).toBe(2);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(0);
      expect(state.resources.hydrogen.amount.gte(0)).toBe(true);
    });

    it('returns CANNOT_AFFORD error and does not mutate state when funds are 0', () => {
      state.resources.hydrogen.amount = new Decimal(0);
      const res = stellarCommandHandlers.BUY_CORE_NODE(state, {
        type: 'BUY_CORE_NODE',
        payload: { key: 'gravity', loops: 10 }
      });

      expect(res.ok).toBe(false);
      expect(res.error.code).toBe('CANNOT_AFFORD');
      expect(state.era3.gravity.toNumber()).toBe(0);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(0);
    });
  });

  describe('Economy.buy integration with Forge buy modes', () => {
    it('executes Buy 1 mode accurately', () => {
      gameState.buyMode = 1;
      state.resources.hydrogen.amount = new Decimal(100);

      const res = Economy.buy('core', 'gravity');
      expect(res.ok).toBe(true);
      expect(state.era3.gravity.toNumber()).toBe(1);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(90);
    });

    it('executes Buy 10 mode buying up to 10 sequential levels', () => {
      gameState.buyMode = 10;
      state.resources.hydrogen.amount = new Decimal(100);

      const res = Economy.buy('core', 'gravity');
      expect(res.ok).toBe(true);
      expect(state.era3.gravity.toNumber()).toBe(4);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(20);
    });

    it('executes Buy Max mode purchasing as many levels as affordable (>1 level)', () => {
      gameState.buyMode = 'max';
      state.resources.hydrogen.amount = new Decimal(1000);

      const res = Economy.buy('core', 'gravity');
      expect(res.ok).toBe(true);
      expect(state.era3.gravity.toNumber()).toBeGreaterThan(5);
      expect(state.resources.hydrogen.amount.gte(0)).toBe(true);
      // Verify next level is genuinely unaffordable
      expect(state.resources.hydrogen.amount.lt(state.era3.gravityCost)).toBe(true);
    });
  });
});
