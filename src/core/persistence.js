import { gameState, replaceRuntimeState, ensureStateShape, getInitialGameState } from './state.js';
import { SAVE_VERSION, MIGRATIONS } from '../state/migrations.js';
import { serializeState, deserializeState } from '../state/serialization.js';

let isPlaytestMode = false;
let playtestSpeedMultiplier = 1;
const CORRUPT_SAVE_PREFIX = 'starForgeCorruptSave_';
const MAX_CORRUPT_SAVES = 3;

function setPersistenceStatus(message, type = 'error') {
  if (typeof window !== 'undefined' && window.Viewport?.setSystemStatus) {
    window.Viewport.setSystemStatus(message, type);
  }
}

function syncDocumentState() {
  if (typeof document === 'undefined' || !document.body) return;
  document.body.setAttribute('data-epoch', gameState.activeEpoch);
  document.body.setAttribute('data-tab', gameState.activeTab);
}

function installFreshRuntimeState() {
  replaceRuntimeState(getInitialGameState());
  syncDocumentState();
}

function pruneCorruptSaves() {
  try {
    const quarantineKeys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(CORRUPT_SAVE_PREFIX)) quarantineKeys.push(key);
    }
    quarantineKeys
      .sort((left, right) => right.localeCompare(left))
      .slice(MAX_CORRUPT_SAVES)
      .forEach(key => localStorage.removeItem(key));
  } catch {
    // Recovery must remain non-fatal even when the storage backend is unavailable.
  }
}

function quarantineActiveSave(rawData, activeKey) {
  let quarantineKey = null;
  if (rawData !== null) {
    try {
      const timestamp = Date.now();
      let suffix = 0;
      do {
        quarantineKey = `${CORRUPT_SAVE_PREFIX}${timestamp}${suffix ? `_${suffix}` : ''}`;
        suffix += 1;
      } while (localStorage.getItem(quarantineKey) !== null);
      localStorage.setItem(quarantineKey, rawData);
      pruneCorruptSaves();
    } catch {
      quarantineKey = null;
    }
  }
  try {
    localStorage.removeItem(activeKey);
  } catch {
    // A denied storage backend must not prevent a fresh in-memory boot.
  }
  return quarantineKey;
}

export function setPlaytestMode(enabled) {
  isPlaytestMode = enabled;
}

export function getPlaytestMode() {
  return isPlaytestMode;
}

export function setPlaytestSpeedMultiplier(speed) {
  playtestSpeedMultiplier = speed;
}

export function getPlaytestSpeedMultiplier() {
  return playtestSpeedMultiplier;
}

export function getActiveSaveKey() {
  return isPlaytestMode ? 'starForgePlaytestSave_v17' : 'starForgeSave_v17';
}

export function saveGame() {
  try {
    const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
    localStorage.setItem(getActiveSaveKey(), JSON.stringify(saveState));
    return { success: true };
  } catch {
    const message = 'Save failed: browser storage is unavailable or full. Progress remains active in this session.';
    setPersistenceStatus(message, 'error');
    return { success: false, message };
  }
}

export function isSerializedStatePayload(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

export function loadGame() {
  const activeKey = getActiveSaveKey();
  let sourceKey = activeKey;
  let rawData = null;
  try {
    rawData = localStorage.getItem(activeKey);
    
    // Fallbacks only apply to the normal save slot
    if (!isPlaytestMode && rawData === null) {
      for (const legacyKey of ['starForgeSave_v16', 'starForgeSave_v15', 'starForgeSave_v14', 'starForgeSave_v13', 'starForgeSave']) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData !== null) {
          rawData = legacyData;
          sourceKey = legacyKey;
          break;
        }
      }
    }

    if (rawData === null) {
      ensureStateShape(gameState);
      syncDocumentState();
      return { offlineSec: 0, offlineTimeStr: null };
    }

    if (rawData.trim() === '') {
      throw new Error('Empty save payload detected');
    }

    if (rawData === '[object Object]') {
      throw new Error("Corrupted literal [object Object] save detected");
    }

    let parsed = JSON.parse(rawData);
    if (!isSerializedStatePayload(parsed) || !isSerializedStatePayload(parsed.gameState)) {
      throw new Error("Parsed save data or gameState is not a valid object payload");
    }

    let stateVersion = parsed.version ?? 13;
    if (!Number.isInteger(stateVersion)) throw new Error('Invalid save version');
    if (stateVersion > SAVE_VERSION) throw new Error(`Future save version ${stateVersion} is not supported`);
    if (stateVersion < 13) stateVersion = 13;
    let loadedState = deserializeState(parsed.gameState);

    while (stateVersion < SAVE_VERSION) {
      const migrationFn = MIGRATIONS[stateVersion];
      if (!migrationFn) break;
      loadedState = migrationFn(loadedState);
      stateVersion = loadedState.version || (stateVersion + 1);
    }
    if (stateVersion !== SAVE_VERSION) throw new Error(`No complete migration path to save version ${SAVE_VERSION}`);

    replaceRuntimeState(loadedState);

    const lastSaved = parsed.lastSavedTime || Date.now();
    const elapsedSec = Math.max(0, (Date.now() - lastSaved) / 1000);
    if (elapsedSec > 5) {
      const offlineSec = Math.min(elapsedSec, 28800); // capped at 8 hours max
      const hrs = Math.floor(offlineSec / 3600);
      const mins = Math.floor((offlineSec % 3600) / 60);
      const secs = Math.floor(offlineSec % 60);
      let timeStr = "";
      if (hrs > 0) timeStr += `${hrs}h `;
      if (mins > 0 || hrs > 0) timeStr += `${mins}m `;
      timeStr += `${secs}s`;

      return { offlineSec, offlineTimeStr: timeStr };
    }
    return { offlineSec: 0, offlineTimeStr: null };
  } catch (e) {
    console.warn('Failed to load save; initializing a fresh universe:', e);
    const quarantineKey = quarantineActiveSave(rawData, sourceKey);
    const recoveryDetail = quarantineKey ? ` Quarantined as ${quarantineKey}.` : '';
    setPersistenceStatus(`Save recovery activated.${recoveryDetail} Initializing fresh universe.`, 'error');
    installFreshRuntimeState();
    return { offlineSec: 0, offlineTimeStr: null };
  }
}

export function exportSave() {
  const saveResult = saveGame();
  if (!saveResult.success) return Promise.resolve(saveResult);

  try {
    const rawData = localStorage.getItem(getActiveSaveKey());
    if (!rawData) return Promise.resolve({ success: false, message: 'No save data found.' });
    if (!navigator.clipboard?.writeText) {
      return Promise.resolve({ success: false, message: 'Clipboard access is unavailable. Use a supported secure browser context.' });
    }
    const encoded = btoa(rawData);
    return Promise.resolve(navigator.clipboard.writeText(encoded))
      .then(() => ({ success: true, message: 'Universe encrypted to clipboard!' }))
      .catch(() => ({ success: false, message: 'Clipboard write permission blocked.' }));
  } catch {
    return Promise.resolve({ success: false, message: 'Save export could not access browser storage.' });
  }
}

export function importSave(input) {
  if (!input) return { success: false, message: "No input provided." };
  try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (isSerializedStatePayload(parsed) && parsed.version === SAVE_VERSION && isSerializedStatePayload(parsed.gameState)) {
      try {
        const importedState = deserializeState(parsed.gameState);
        localStorage.setItem(getActiveSaveKey(), decoded);
        replaceRuntimeState(importedState);
        return { success: true };
      } catch (e) {
        return { success: false, message: 'State import failed. Browser storage may be unavailable or the state format is invalid.' };
      }
    } else { return { success: false, message: "Unsupported timeline formatting configuration." }; }
  } catch (e) { return { success: false, message: "Fatal transmission verification corruption." }; }
}

export function wipeSave() {
  if (confirm("Are you sure you want to reset all universe progression? This cannot be undone.")) {
    const overlay = document.getElementById('intro-screen-overlay');
    if (overlay) delete overlay.dataset.initialized;
    
    if (isPlaytestMode) {
      localStorage.removeItem('starForgePlaytestSave_v17');
    } else {
      localStorage.removeItem('starForgeSave_v17');
      localStorage.removeItem('starForgeSave_v16');
      localStorage.removeItem('starForgeSave_v15');
      localStorage.removeItem('starForgeSave_v14');
      localStorage.removeItem('starForgeSave_v13');
      localStorage.removeItem('starForgeSave');
    }
    location.reload();
  }
}
