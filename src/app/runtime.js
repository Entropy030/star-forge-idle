import { loadGame, saveGame } from '../core/state.js'; // Will be replaced by state/serialization later
import { startLoop } from './loop.js';

export function processOfflineProgress(engine, elapsedSeconds) {
  if (elapsedSeconds <= 0) return { offlineSec: 0, offlineTimeStr: null };

  const MAX_OFFLINE_SECONDS = 30 * 24 * 60 * 60; // 30 days cap
  const MAX_ITERATIONS = 200;

  const offlineSec = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS);
  
  if (offlineSec > 5) {
    let remaining = offlineSec;
    let iterations = 0;
    const stepSize = Math.max(10, Math.ceil(offlineSec / MAX_ITERATIONS));

    while (remaining > 0 && iterations < MAX_ITERATIONS) {
      const step = Math.min(remaining, stepSize);
      engine.tick(step);
      remaining -= step;
      iterations++;
    }

    // Format output
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
}

/**
 * Initializes the application runtime, binding the engine to browser environments.
 */
export function initRuntime(engine) {
  // Load State
  // For now, loadGame handles local storage and populates gameState.
  // Soon, loadGame will return a normalized state and we will call engine.loadState().
  const offlineData = loadGame(); // Legacy compat for now

  // In the future:
  // const serializedState = localStorage.getItem('starForgeSave_v15');
  // const state = deserializeAndMigrate(serializedState);
  // engine.loadState(state);
  // const offlineData = processOfflineProgress(engine, elapsedSeconds);

  // Auto-Save Loop (App concerns)
  setInterval(() => {
    saveGame(); // Will use engine.getStateUnsafe() later
  }, 5000);

  // Bind Event Dispatchers for Legacy UI
  // When the engine fires domain events, we can trigger legacy events or handle them directly.
  engine.subscribeEvents((evt) => {
    if (evt.type === 'SOLAR_FLARE_SPAWNED') {
      // Create a CustomEvent for the legacy Viewport until it is fully refactored
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('solarFlareSpawned'));
      }
    } else if (evt.type === 'SOLAR_FLARE_MISSED' || evt.type === 'SOLAR_FLARE_COLLECTED') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(evt.type === 'SOLAR_FLARE_MISSED' ? 'solarFlareMissed' : 'solarFlareCollected', {
          detail: { message: evt.message }
        }));
      }
    }
  });

  // Start the Render & Tick Loop
  startLoop(engine);

  return offlineData;
}
