/* global sessionStorage */
import { setPlaytestMode, setPlaytestSpeedMultiplier, getPlaytestSpeedMultiplier, exportSave, importSave, loadGame } from '../core/persistence.js';
import { gameState } from '../core/state.js';
import { serializeState, deserializeState } from '../state/serialization.js';
import { replaceRuntimeState } from '../core/state.js';
import { Viewport } from '../ui/viewport.js';
import { ArtifactManager } from '../ui/viewport.js'; // or similar, depending on how it's exported
import * as presets from './playtestPresets.js';

let isPlaytestActive = false;
let isDirectPlaytestBoot = false;

export function hasPlaytestBootIntent(search = window.location.search) {
  return new URLSearchParams(search).get('playtest') === '1';
}

export function preparePlaytestBoot(search = window.location.search) {
  if (!hasPlaytestBootIntent(search)) return false;
  isDirectPlaytestBoot = true;
  isPlaytestActive = true;
  setPlaytestMode(true);
  return true;
}

export function checkPlaytestMode() {
  if (hasPlaytestBootIntent()) {
    if (isDirectPlaytestBoot) renderPlaytestUI();
    else enablePlaytestMode();
  }

  window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'F2') {
      if (isPlaytestActive) {
        disablePlaytestMode();
      } else {
        enablePlaytestMode();
      }
    }
  });
}

export function enablePlaytestMode() {
  if (isPlaytestActive) return true;

  try {
    // The normal session must be recoverable before save ownership changes.
    const serializedBackup = serializeState(gameState);
    sessionStorage.setItem('starForgeRealSaveBackup', JSON.stringify(serializedBackup));
  } catch {
    Viewport.setSystemStatus('Playtest mode could not start because session backup storage is unavailable.', 'error');
    return false;
  }

  isPlaytestActive = true;
  setPlaytestMode(true);
  
  renderPlaytestUI();
  const statusEl = document.getElementById('playtest-inline-status');
  if (statusEl) {
    statusEl.textContent = "PLAYTEST MODE ENABLED";
    statusEl.style.color = '#00ecc6';
  }
  return true;
}

export function disablePlaytestMode() {
  if (!isPlaytestActive) return true;

  if (isDirectPlaytestBoot) {
    isDirectPlaytestBoot = false;
    isPlaytestActive = false;
    setPlaytestMode(false);
    setPlaytestSpeedMultiplier(1);
    loadGame({ offlineAllowed: false });
    const ui = document.getElementById('playtest-mode-ui');
    if (ui) ui.remove();
    Viewport.update();
    Viewport.syncAnchor(true);
    Viewport.setSystemStatus("Playtest Mode Disabled. Normal Save Loaded.", "warning");
    return true;
  }

  try {
    const backup = sessionStorage.getItem('starForgeRealSaveBackup');
    if (!backup) throw new Error('Missing normal-session backup');
    const parsedBackup = JSON.parse(backup);
    const loadedState = deserializeState(parsedBackup);
    replaceRuntimeState(loadedState);
  } catch {
    Viewport.setPlaytestStatus('Normal save restore failed. Playtest mode remains active.', 'error');
    Viewport.setSystemStatus('Normal save restore failed. Playtest mode remains active.', 'error');
    return false;
  }

  isPlaytestActive = false;
  setPlaytestMode(false);
  setPlaytestSpeedMultiplier(1);
  try { sessionStorage.removeItem('starForgeRealSaveBackup'); } catch { /* no-op */ }
  
  const ui = document.getElementById('playtest-mode-ui');
  if (ui) ui.remove();
  
  Viewport.update();
  Viewport.syncAnchor(true);
  Viewport.setSystemStatus("Playtest Mode Disabled. Save Restored.", "warning");
  return true;
}

function renderPlaytestUI() {
  let ui = document.getElementById('playtest-mode-ui');
  if (!ui) {
    ui = document.createElement('div');
    ui.id = 'playtest-mode-ui';
    ui.style.position = 'fixed';
    ui.style.bottom = 'calc(var(--nav-height, 70px) + 12px)';
    ui.style.left = '10px';
    ui.style.maxWidth = 'calc(100vw - 20px)';
    ui.style.boxSizing = 'border-box';
    ui.style.backgroundColor = 'rgba(20, 0, 0, 0.9)';
    ui.style.border = '1px solid red';
    ui.style.padding = '10px';
    ui.style.zIndex = '9999';
    ui.style.color = '#fff';
    ui.style.fontFamily = 'monospace';
    ui.style.fontSize = '12px';
    document.body.appendChild(ui);
  }
  
  ui.innerHTML = `
    <div style="font-weight: bold; color: red; margin-bottom: 5px;">PLAYTEST MODE · NORMAL SAVE PROTECTED</div>
    <div style="margin-bottom: 5px;">
      Speed: 
      <button id="pt-speed-1" style="background: ${getPlaytestSpeedMultiplier() === 1 ? 'red' : '#333'}; color: white; cursor: pointer;">1x</button>
      <button id="pt-speed-5" style="background: ${getPlaytestSpeedMultiplier() === 5 ? 'red' : '#333'}; color: white; cursor: pointer;">5x</button>
      <button id="pt-speed-25" style="background: ${getPlaytestSpeedMultiplier() === 25 ? 'red' : '#333'}; color: white; cursor: pointer;">25x</button>
    </div>
    <div style="margin-bottom: 5px;">
      Presets:
      <select id="pt-presets">
        <option value="">-- Select Preset --</option>
        <option value="getPresetFreshEraI">Fresh Era I</option>
        <option value="getPresetLateEraI">Late Era I</option>
        <option value="getPresetFreshEraII">Fresh Era II</option>
        <option value="getPresetEraIIUpgradeChain">Mid Era II</option>
        <option value="getPresetEraIIRecombinationReady">Recombination Ready</option>
        <option value="getPresetFreshEraIII">Fresh Era III</option>
        <option value="getPresetMidEraIII">Mid Era III</option>
        <option value="getPresetEraIIISupernovaReady">Supernova Ready</option>
      </select>
      <button id="pt-load-preset" style="cursor: pointer;">Load</button>
    </div>
    <div style="display: flex; gap: 5px;">
      <button id="pt-export" style="cursor: pointer;">Export State</button>
      <button id="pt-restore" style="cursor: pointer;">Restore Normal Save</button>
    </div>
    <div id="playtest-inline-status" style="margin-top: 5px; min-height: 14px;"></div>
  `;

  document.getElementById('pt-speed-1').onclick = () => { setPlaytestSpeedMultiplier(1); renderPlaytestUI(); };
  document.getElementById('pt-speed-5').onclick = () => { setPlaytestSpeedMultiplier(5); renderPlaytestUI(); };
  document.getElementById('pt-speed-25').onclick = () => { setPlaytestSpeedMultiplier(25); renderPlaytestUI(); };
  
  document.getElementById('pt-load-preset').onclick = () => {
    const sel = document.getElementById('pt-presets').value;
    if (sel && presets[sel]) {
      const state = presets[sel]();
      replaceRuntimeState(state);
      if (typeof window.ArtifactManager !== 'undefined' && window.ArtifactManager.recalculateArtifactModifiers) {
        window.ArtifactManager.recalculateArtifactModifiers();
      }
      Viewport.switchTab('core');
      Viewport.update();
      Viewport.syncAnchor(true);
    }
  };
  
  document.getElementById('pt-export').onclick = () => {
    exportSave().then(res => {
      const statusEl = document.getElementById('playtest-inline-status');
      if (statusEl) {
        statusEl.textContent = res.message;
        statusEl.style.color = res.success ? '#00ecc6' : '#ff6b6b';
      }
    });
  };
  
  document.getElementById('pt-restore').onclick = () => {
    disablePlaytestMode();
  };
}
