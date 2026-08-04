// [SEC-03] ENGINE STATE ENGINE INITIALIZATION TREE
// ==========================================================================
import { COSMIC_REGISTRY } from '../config/registry.js';

import { SAVE_VERSION, MIGRATIONS } from '../state/migrations.js';

import { createInitialState as getInitialGameState } from '../state/createInitialState.js';
export { getInitialGameState };

export const createReactiveState = function(obj, onDirty) {
  if (typeof obj !== 'object' || obj === null || obj instanceof Decimal || obj.__isProxy) {
    return obj;
  }
  for (let key in obj) {
    obj[key] = createReactiveState(obj[key], onDirty);
  }
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === '__isProxy') return true;
      return target[prop];
    },
    set(target, prop, value) {
      if (target[prop] !== value) {
        target[prop] = createReactiveState(value, onDirty);
        onDirty(prop);
      }
      return true;
    }
  });
};

export let isDirty = true;
export function setIsDirty(val) {
  isDirty = val;
}
export let gameState = createReactiveState(getInitialGameState(), (prop) => {
  isDirty = true;
});
export function setGameState(newState) {
  gameState = newState;
}
export let lastTick = Date.now();
let audioCtx;
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;


function mergeDefaultsIntoLoadedState(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Decimal) {
        if (!target[key]) target[key] = new Decimal(0);
        else if (!(target[key] instanceof Decimal)) target[key] = new Decimal(target[key]);
      } else if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeDefaultsIntoLoadedState(target[key], source[key]);
      } else {
        if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
  }
}

import { ensureStateShape } from '../state/schema.js';
export { ensureStateShape };

// ==========================================================================
// [SEC-16] PERSISTENCE MIGRATION & STORAGE ENGINES
// ==========================================================================
import { serializeState, deserializeState } from '../state/serialization.js';
export { serializeState, deserializeState };



export const saveGame = function() {
  const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
  localStorage.setItem('starForgeSave_v16', JSON.stringify(saveState));
}



export const loadGame = function() {
  try {
    let rawData = localStorage.getItem('starForgeSave_v16') || 
                  localStorage.getItem('starForgeSave_v15') || 
                  localStorage.getItem('starForgeSave_v14') || 
                  localStorage.getItem('starForgeSave_v13') || 
                  localStorage.getItem('starForgeSave');
    if (!rawData) {
      ensureStateShape(gameState);
      document.body.setAttribute('data-epoch', gameState.activeEpoch);
      document.body.setAttribute('data-tab', gameState.activeTab);
      return;
    }

    let parsed = JSON.parse(rawData);
    if (!parsed || !parsed.gameState) {
      ensureStateShape(gameState);
      document.body.setAttribute('data-epoch', gameState.activeEpoch);
      document.body.setAttribute('data-tab', gameState.activeTab);
      return;
    }

    let stateVersion = parsed.version || 13;
    if (stateVersion < 13) stateVersion = 13; // default to generic migration for very old saves
    let loadedState = deserializeState(parsed.gameState);

    // Chain migrations sequentially
    while (stateVersion < SAVE_VERSION) {
      const migrationFn = MIGRATIONS[stateVersion];
      if (!migrationFn) break;
      loadedState = migrationFn(loadedState);
      stateVersion = loadedState.version || (stateVersion + 1);
    }

    gameState = createReactiveState(loadedState, (prop) => {
      isDirty = true;
    });
    ensureStateShape(gameState);
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);

    // Calculate offline progress
    const lastSaved = parsed.lastSavedTime || Date.now();
    const elapsedSec = Math.max(0, (Date.now() - lastSaved) / 1000);
    if (elapsedSec > 5) {
      const offlineSec = Math.min(elapsedSec, 43200); // capped at 12 hours max
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
    ensureStateShape(gameState);
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
  }
}


export const exportSave = function() {
  saveGame();
  let rawData = localStorage.getItem('starForgeSave_v16');
  if (rawData) {
    let encoded = btoa(rawData);
    return navigator.clipboard.writeText(encoded)
      .then(() => ({ success: true, message: "Universe encrypted to clipboard!" }))
      .catch(() => ({ success: false, message: "Clipboard write permission blocked." }));
  }
  return Promise.resolve({ success: false, message: "No save data found." });
}

export const importSave = function(input) {
  if (!input) return { success: false, message: "No input provided." };
  try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (parsed && parsed.version === SAVE_VERSION) {
      let temp = gameState;
      try {
        gameState = createReactiveState(deserializeState(parsed.gameState), (prop) => {
          isDirty = true;
        });
        ensureStateShape(gameState);
        localStorage.setItem('starForgeSave_v16', decoded);
        return { success: true };
      } finally {
        gameState = temp;
      }
    } else { return { success: false, message: "Unsupported timeline formatting configuration." }; }
  } catch (e) { return { success: false, message: "Fatal transmission verification corruption." }; }
}

export function wipeSave() {
  if (confirm("Are you sure you want to reset all universe progression? This cannot be undone.")) {
    const overlay = document.getElementById('intro-screen-overlay');
    if (overlay) delete overlay.dataset.initialized;
    localStorage.removeItem('starForgeSave_v16');
    localStorage.removeItem('starForgeSave_v15');
    localStorage.removeItem('starForgeSave_v14');
    location.reload();
  }
}

// ==========================================================================
