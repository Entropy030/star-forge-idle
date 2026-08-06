import { gameState, replaceRuntimeState, ensureStateShape } from './state.js';
import { SAVE_VERSION, MIGRATIONS } from '../state/migrations.js';
import { serializeState, deserializeState } from '../state/serialization.js';

let isPlaytestMode = false;
let playtestSpeedMultiplier = 1;

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
  const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
  localStorage.setItem(getActiveSaveKey(), JSON.stringify(saveState));
}

export function isSerializedStatePayload(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

export function loadGame() {
  try {
    let rawData = localStorage.getItem(getActiveSaveKey());
    
    // Fallbacks only apply to the normal save slot
    if (!isPlaytestMode && !rawData) {
      rawData = localStorage.getItem('starForgeSave_v16') || 
                localStorage.getItem('starForgeSave_v15') || 
                localStorage.getItem('starForgeSave_v14') || 
                localStorage.getItem('starForgeSave_v13') || 
                localStorage.getItem('starForgeSave');
    }

    if (!rawData) {
      ensureStateShape(gameState);
      document.body.setAttribute('data-epoch', gameState.activeEpoch);
      document.body.setAttribute('data-tab', gameState.activeTab);
      return { offlineSec: 0, offlineTimeStr: null };
    }

    if (rawData === "[object Object]") {
      throw new Error("Corrupted literal [object Object] save detected");
    }

    let parsed = JSON.parse(rawData);
    if (!isSerializedStatePayload(parsed) || !isSerializedStatePayload(parsed.gameState)) {
      throw new Error("Parsed save data or gameState is not a valid object payload");
    }

    let stateVersion = parsed.version || 13;
    if (stateVersion < 13) stateVersion = 13;
    let loadedState = deserializeState(parsed.gameState);

    while (stateVersion < SAVE_VERSION) {
      const migrationFn = MIGRATIONS[stateVersion];
      if (!migrationFn) break;
      loadedState = migrationFn(loadedState);
      stateVersion = loadedState.version || (stateVersion + 1);
    }

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
    console.error("Failed to load save:", e);
    const rawData = localStorage.getItem(getActiveSaveKey());
    if (rawData) {
      const ts = Date.now();
      localStorage.setItem(`starForgeCorruptSave_${ts}`, rawData);
      localStorage.removeItem(getActiveSaveKey());
      if (typeof window !== 'undefined' && window.Viewport && window.Viewport.setSystemStatus) {
        window.Viewport.setSystemStatus(`Corrupted save quarantined (starForgeCorruptSave_${ts}). Initializing fresh universe.`, 'error');
      }
    }

    ensureStateShape(gameState);
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
    return { offlineSec: 0, offlineTimeStr: null };
  }
}

export function exportSave() {
  saveGame();
  let rawData = localStorage.getItem(getActiveSaveKey());
  if (rawData) {
    let encoded = btoa(rawData);
    return navigator.clipboard.writeText(encoded)
      .then(() => ({ success: true, message: "Universe encrypted to clipboard!" }))
      .catch(() => ({ success: false, message: "Clipboard write permission blocked." }));
  }
  return Promise.resolve({ success: false, message: "No save data found." });
}

export function importSave(input) {
  if (!input) return { success: false, message: "No input provided." };
  try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (parsed && parsed.version === SAVE_VERSION) {
      try {
        const importedState = deserializeState(parsed.gameState);
        replaceRuntimeState(importedState);
        localStorage.setItem(getActiveSaveKey(), decoded);
        return { success: true };
      } catch (e) {
        return { success: false, message: "State format error during import." };
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
