import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { createInitialState, getInitialEra2State } from '../src/state/createInitialState.js';
import { ensureStateShape } from '../src/state/schema.js';
import { PLASMA_POSTURES, DEFAULT_PLASMA_POSTURE } from '../src/eras/plasma/constants.js';

describe('Era 2 Posture State & Commands', () => {
  let engine;
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 2;
    engine = createGameEngine({
      initialState: state,
      commandHandlers: { ...plasmaCommandHandlers }
    });
  });

  describe('Canonical State & Schema Normalization', () => {
    it('initializes Era 2 state with default posture BALANCE', () => {
      const era2 = getInitialEra2State();
      expect(era2.posture).toBe(DEFAULT_PLASMA_POSTURE);
      expect(era2.posture).toBe('BALANCE');
    });

    it('initializes full state tree with posture BALANCE in era2', () => {
      const initial = createInitialState();
      expect(initial.era2.posture).toBe('BALANCE');
    });

    it('normalizes missing era2.posture to BALANCE on legacy saves', () => {
      const legacy = createInitialState();
      delete legacy.era2.posture;
      ensureStateShape(legacy);
      expect(legacy.era2.posture).toBe('BALANCE');
    });

    it('normalizes invalid era2.posture to BALANCE safely', () => {
      const corrupted = createInitialState();
      corrupted.era2.posture = 'HYPER_WARP';
      ensureStateShape(corrupted);
      expect(corrupted.era2.posture).toBe('BALANCE');
    });

    it('preserves all valid posture values during normalization', () => {
      for (const validPosture of PLASMA_POSTURES) {
        const testState = createInitialState();
        testState.era2.posture = validPosture;
        ensureStateShape(testState);
        expect(testState.era2.posture).toBe(validPosture);
      }
    });

  });

  describe('SET_PLASMA_POSTURE Command', () => {
    it('successfully changes posture to ACCUMULATE from BALANCE', () => {
      const result = engine.dispatch({
        type: 'SET_PLASMA_POSTURE',
        payload: { posture: 'ACCUMULATE' }
      });

      expect(result.ok).toBe(true);
      expect(result.changed).toBe(true);
      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        type: 'PLASMA_POSTURE_CHANGED',
        epoch: 2,
        posture: 'ACCUMULATE',
        previousPosture: 'BALANCE'
      });
      expect(engine.getStateUnsafe().era2.posture).toBe('ACCUMULATE');
    });

    it('successfully changes posture to CONDENSE from ACCUMULATE', () => {
      engine.getStateUnsafe().era2.posture = 'ACCUMULATE';

      const result = engine.dispatch({
        type: 'SET_PLASMA_POSTURE',
        payload: { posture: 'CONDENSE' }
      });

      expect(result.ok).toBe(true);
      expect(result.changed).toBe(true);
      expect(result.events[0]).toEqual({
        type: 'PLASMA_POSTURE_CHANGED',
        epoch: 2,
        posture: 'CONDENSE',
        previousPosture: 'ACCUMULATE'
      });
      expect(engine.getStateUnsafe().era2.posture).toBe('CONDENSE');
    });

    it('treats re-selecting current posture as a no-op without emitting duplicate events', () => {
      expect(engine.getStateUnsafe().era2.posture).toBe('BALANCE');

      const result = engine.dispatch({
        type: 'SET_PLASMA_POSTURE',
        payload: { posture: 'BALANCE' }
      });

      expect(result.ok).toBe(true);
      expect(result.changed).toBe(false);
      expect(result.events).toHaveLength(0);
      expect(engine.getStateUnsafe().era2.posture).toBe('BALANCE');
    });

    it('rejects command with UNHANDLED_EPOCH when called outside Era II', () => {
      const epochsOutsideEra2 = [1, 3, 4, 5];
      for (const epoch of epochsOutsideEra2) {
        state.activeEpoch = epoch;
        state.era2.posture = 'BALANCE';

        const result = engine.dispatch({
          type: 'SET_PLASMA_POSTURE',
          payload: { posture: 'ACCUMULATE' }
        });

        expect(result.ok).toBe(false);
        expect(result.changed).toBe(false);
        expect(result.error?.code).toBe('UNHANDLED_EPOCH');
        expect(state.era2.posture).toBe('BALANCE');
      }
    });

    it('rejects command with INVALID_POSTURE for unknown or malformed posture names', () => {
      const invalidInputs = ['TURBO', 'AGGRESSIVE', 'balance', '', null, undefined, 123, {}];

      for (const invalid of invalidInputs) {
        state.activeEpoch = 2;
        state.era2.posture = 'BALANCE';

        const result = engine.dispatch({
          type: 'SET_PLASMA_POSTURE',
          payload: { posture: invalid }
        });

        expect(result.ok).toBe(false);
        expect(result.changed).toBe(false);
        expect(result.error?.code).toBe('INVALID_POSTURE');
        expect(state.era2.posture).toBe('BALANCE');
      }
    });

    it('rejects command with INVALID_STATE if state.era2 is missing or corrupt', () => {
      delete state.era2;

      const result = engine.dispatch({
        type: 'SET_PLASMA_POSTURE',
        payload: { posture: 'ACCUMULATE' }
      });

      expect(result.ok).toBe(false);
      expect(result.changed).toBe(false);
      expect(result.error?.code).toBe('INVALID_STATE');
    });
  });
});
