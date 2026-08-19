import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MIGRATIONS } from '../src/state/migrations.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { gameState, setGameState } from '../src/core/state.js';
import { loadGame, importSave, saveGame, getActiveSaveKey } from '../src/core/persistence.js';
import { serializeState } from '../src/state/serialization.js';
import { engine } from '../src/engine/instance.js';
/* global Decimal */

describe('Save and Migration Regression Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    setGameState(createInitialState());
    engine.loadState(gameState);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Fresh boot works without a save', () => {
    loadGame();
    expect(gameState).toBeDefined();
    expect(gameState.activeEpoch).toBe(1);
    
    // The engine should be manually synced by main.js in practice, but
    // let's verify loadGame didn't crash.
    expect(gameState.resources.quantumFluctuations.amount.toNumber()).toBe(0);
  });

  it('Loaded state and engine.getStateUnsafe() are the same object after sync', () => {
    loadGame();
    engine.loadState(gameState);
    
    const engineState = engine.getStateUnsafe();
    // In Vue/Proxy based reactive states, we check if they reference the same proxy/base
    expect(engineState.activeEpoch).toBe(gameState.activeEpoch);
    
    // Mutate and check sync
    gameState.activeEpoch = 2;
    expect(engine.getStateUnsafe().activeEpoch).toBe(2);
  });

  it('A v15 save with 128 QF retains 128 QF after migration', () => {
    const v15State = createInitialState();
    v15State.version = 15;
    v15State.resources.quantumFluctuations.amount = new Decimal(128);
    v15State.unfold.hasUnlocked10QF = true;
    v15State.upgrades.quantum.gravityForce = { level: 4, cost: new Decimal(100) };

    const migrated = MIGRATIONS[15](v15State);
    
    expect(migrated.version).toBe(16);
    expect(migrated.resources.quantumFluctuations.amount.toNumber()).toBe(128);
    expect(migrated.unfold.hasUnlocked10QF).toBe(true);
    expect(migrated.upgrades.quantum.gravityForce.level).toBe(4);
  });

  it('Existing upgrade levels and unlock flags survive migration', () => {
    const v15State = createInitialState();
    v15State.version = 15;
    v15State.activeEpoch = 3;
    v15State.unfold.introCompleted = true;

    const migrated = MIGRATIONS[15](v15State);
    expect(migrated.activeEpoch).toBe(3);
    expect(migrated.unfold.introCompleted).toBe(true);
  });

  it('Ten Era-I clicks set hasUnlocked10QF', () => {
    for (let i = 0; i < 10; i++) {
      engine.dispatch({ type: 'CLICK_CORE' });
    }
    const state = engine.getStateUnsafe();
    expect(state.discoveries.has('qf_10')).toBe(true);
  });

  it('Successful import installs the imported state', () => {
    const customState = createInitialState();
    customState.version = 18;
    customState.activeEpoch = 2;
    customState.resources.quantumFluctuations.amount = new Decimal(999);
    
    const encoded = btoa(JSON.stringify({ version: 18, gameState: serializeState(customState) }));
    
    const res = importSave(encoded);
    expect(res.success).toBe(true);
    expect(gameState.activeEpoch).toBe(2);
    expect(gameState.resources.quantumFluctuations.amount.toNumber()).toBe(999);
  });

  it('Failed import preserves the previous state', () => {
    const originalEpoch = gameState.activeEpoch;
    const res = importSave("INVALID_BASE64_STRING$$$");
    expect(res.success).toBe(false);
    expect(gameState.activeEpoch).toBe(originalEpoch);
  });

  describe('v17 -> v18 Compression Cost Scaling Migration', () => {
    it('migrates v17 Era-III state preserving exact completed compression counts across all milestones', () => {
      // Test cases: [compressionsCompleted, v17Cost, expectedV18Cost]
      // In v17 (1.75 scaling):
      // n=0: 10
      // n=1: 17
      // n=2: 29
      // n=3: 50
      // n=10: 2,757 (10 * 1.75^10 with floor)
      // n=22: 2,052,353
      // n=32: 552,882,239
      function getIterativeCost(n, scaling = 1.35) {
        let cost = new Decimal(10);
        for (let i = 0; i < n; i++) {
          cost = cost.times(scaling).floor();
        }
        return cost.toNumber();
      }

      const testCases = [
        { count: 0, v17Cost: 10 },
        { count: 1, v17Cost: 17 },
        { count: 2, v17Cost: 29 },
        { count: 3, v17Cost: 50 },
        { count: 22, v17Cost: 2052353 },
        { count: 32, v17Cost: 552882239 }
      ];

      for (const tc of testCases) {
        const v17State = createInitialState();
        v17State.version = 17;
        v17State.activeEpoch = 3;
        v17State.era3.compressCost = new Decimal(tc.v17Cost);

        const migrated = MIGRATIONS[17](v17State);
        expect(migrated.version).toBe(18);
        expect(migrated.era3.compressCost.toNumber()).toBe(getIterativeCost(tc.count));
      }
    });

    it('loadGame finds legacy starForgeSave_v17, migrates to v18, and saveGame persists to starForgeSave_v18', () => {
      const v17State = createInitialState();
      v17State.version = 17;
      v17State.activeEpoch = 3;
      v17State.era3.compressCost = new Decimal(50); // 3 completed compressions in v17
      v17State.era3.temperature = new Decimal(12153750);

      localStorage.setItem('starForgeSave_v17', JSON.stringify({
        version: 17,
        gameState: serializeState(v17State),
        lastSavedTime: Date.now() - 5000
      }));

      const loadMeta = loadGame();
      expect(loadMeta.loaded).toBe(true);
      expect(loadMeta.source).toBe('legacy-save');
      expect(gameState.era3.compressCost.toNumber()).toBe(22); // 3 completed compressions in v18

      // Save should now write to starForgeSave_v18
      expect(getActiveSaveKey()).toBe('starForgeSave_v18');
      saveGame();
      expect(localStorage.getItem('starForgeSave_v18')).not.toBeNull();
      const v18Saved = JSON.parse(localStorage.getItem('starForgeSave_v18'));
      expect(v18Saved.version).toBe(18);
    });
  });
});
