import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getActiveSaveKey, importSave, loadGame, saveGame, setPlaytestMode } from '../src/core/persistence.js';
import { gameState, replaceRuntimeState, getInitialGameState } from '../src/core/state.js';
import { serializeState } from '../src/state/serialization.js';
import { enablePlaytestMode, disablePlaytestMode } from '../src/dev/playtestMode.js';
import Decimal from 'break_infinity.js';

describe('Persistence corruption recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setPlaytestMode(false);
  });

  afterEach(() => {
    disablePlaytestMode();
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

  it('rejects empty and future-version saves, quarantines them, and installs a known fresh state', () => {
    for (const payload of [
      '',
      JSON.stringify({ version: 999, gameState: serializeState(getInitialGameState()) }),
    ]) {
      replaceRuntimeState(getInitialGameState());
      gameState.activeEpoch = 3;
      localStorage.setItem('starForgeSave_v17', payload);

      expect(() => loadGame()).not.toThrow();
      expect(gameState.activeEpoch).toBe(1);
      expect(localStorage.getItem('starForgeSave_v17')).toBeNull();
    }
  });

  it('retains at most three corrupt-save quarantine entries', () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      localStorage.setItem('starForgeSave_v17', `{invalid-${attempt}`);
      loadGame();
    }

    const quarantineKeys = Object.keys(localStorage).filter(key => key.startsWith('starForgeCorruptSave_'));
    expect(quarantineKeys).toHaveLength(3);
  });

  it('storage quota failure during import preserves the active runtime state', () => {
    const imported = getInitialGameState();
    imported.activeEpoch = 3;
    const encoded = btoa(JSON.stringify({ version: 17, gameState: serializeState(imported) }));
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };

    try {
      const result = importSave(encoded);
      expect(result.success).toBe(false);
      expect(gameState.activeEpoch).toBe(1);
    } finally {
      Storage.prototype.setItem = originalSetItem;
    }
  });

  it('failed playtest restore keeps playtest save ownership until the backup is valid', () => {
    enablePlaytestMode();
    sessionStorage.setItem('starForgeRealSaveBackup', '{invalid');

    expect(disablePlaytestMode()).toBe(false);
    expect(getActiveSaveKey()).toBe('starForgePlaytestSave_v17');

    sessionStorage.setItem('starForgeRealSaveBackup', JSON.stringify(serializeState(getInitialGameState())));
    expect(disablePlaytestMode()).toBe(true);
    expect(getActiveSaveKey()).toBe('starForgeSave_v17');
  });
});
