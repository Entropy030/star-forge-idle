import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadGame, saveGame, setPlaytestMode } from '../src/core/persistence.js';
import { gameState, replaceRuntimeState, getInitialGameState } from '../src/core/state.js';
import { serializeState } from '../src/state/serialization.js';
import { enablePlaytestMode, disablePlaytestMode } from '../src/dev/playtestMode.js';
import Decimal from 'break_infinity.js';

describe('Persistence Corruption Prevention', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setPlaytestMode(false);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setPlaytestMode(false);
    replaceRuntimeState(getInitialGameState());
  });

  it('1. A state object round-trips through sessionStorage without becoming [object Object]', () => {
    const backup = serializeState(gameState);
    sessionStorage.setItem('test_backup', JSON.stringify(backup));
    const retrieved = sessionStorage.getItem('test_backup');
    expect(retrieved).not.toBe('[object Object]');
    const parsed = JSON.parse(retrieved);
    expect(parsed.activeEpoch).toBe(1);
  });

  it('2. Playtest enable -> mutate state -> restore normal save returns the original normal state', () => {
    replaceRuntimeState(getInitialGameState());
    gameState.resources.hydrogen.amount = new Decimal(500);
    
    enablePlaytestMode();
    // mutate state
    gameState.resources.hydrogen.amount = new Decimal(999);
    
    disablePlaytestMode();
    // should be back to 500
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(500);
  });

  it('3. A direct ?playtest=1 session does not corrupt the normal save', () => {
    replaceRuntimeState(getInitialGameState());
    saveGame();
    const normalSave = localStorage.getItem('starForgeSave_v17');
    
    enablePlaytestMode();
    gameState.activeEpoch = 5;
    saveGame(); // saves to playtest key
    
    const newNormalSave = localStorage.getItem('starForgeSave_v17');
    expect(newNormalSave).toBe(normalSave);
  });

  it('4 & 5. A normal save whose gameState is "[object Object]" does not crash boot, is quarantined and fresh state is initialized', () => {
    localStorage.setItem('starForgeSave_v17', '[object Object]');
    expect(() => loadGame()).not.toThrow();
    
    // Check quarantine
    const keys = Object.keys(localStorage);
    const quarantineKey = keys.find(k => k.startsWith('starForgeCorruptSave_'));
    expect(quarantineKey).toBeDefined();
    expect(localStorage.getItem(quarantineKey)).toBe('[object Object]');
    expect(localStorage.getItem('starForgeSave_v17')).toBeNull(); // active save key removed
  });

  it('6 & 7. Runtime state replacement rejects strings, numbers, null, and arrays', () => {
    expect(() => replaceRuntimeState(null)).toThrow(TypeError);
    expect(() => replaceRuntimeState("[object Object]")).toThrow(TypeError);
    expect(() => replaceRuntimeState(42)).toThrow(TypeError);
    expect(() => replaceRuntimeState([])).toThrow(TypeError);
  });

  it('9. A valid existing save still loads normally', () => {
    replaceRuntimeState(getInitialGameState());
    gameState.activeEpoch = 3;
    saveGame();
    
    replaceRuntimeState(getInitialGameState());
    expect(gameState.activeEpoch).toBe(1);
    
    loadGame();
    expect(gameState.activeEpoch).toBe(3);
  });
});
