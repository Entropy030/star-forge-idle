import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MIGRATIONS } from '../src/state/migrations.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { gameState, setGameState } from '../src/core/state.js';
import { loadGame, importSave } from '../src/core/persistence.js';
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
    expect(state.unfold.hasUnlocked10QF).toBe(true);
  });

  it('Successful import installs the imported state', () => {
    const customState = createInitialState();
    customState.version = 17;
    customState.activeEpoch = 2;
    customState.resources.quantumFluctuations.amount = new Decimal(999);
    
    const encoded = btoa(JSON.stringify({ version: 17, gameState: serializeState(customState) }));
    
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
});
