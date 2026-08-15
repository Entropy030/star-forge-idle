import { gameState } from './state.js';
import { advanceGameTick } from './runtimeTick.js';
import { OFFLINE_TICK_CONTEXT } from './tickContext.js';
import { getGameplayTimeMultiplier } from './time.js';
import { reconcileCodexUnlocks } from './codexProgression.js';
import { captureOfflineSnapshot } from './offlineSummary.js';

export const OFFLINE_CHUNK_SECONDS = 1;
export const OFFLINE_BATCH_SIZE = 250;
const consumedLoadMetadata = new WeakSet();

function nowMilliseconds() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function yieldToEventLoop() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export async function advanceOfflineProgress(options = {}) {
  const creditedElapsedSeconds = Math.max(0, Number(options.creditedElapsedSeconds) || 0);
  const gameplayMultiplier = getGameplayTimeMultiplier(gameState);
  let remainingSimulationSeconds = creditedElapsedSeconds * gameplayMultiplier;
  const totalSimulationSeconds = remainingSimulationSeconds;
  const batchSize = Math.max(1, Math.floor(options.batchSize || OFFLINE_BATCH_SIZE));
  const yieldControl = options.yieldControl || yieldToEventLoop;
  const effects = [];
  let logicalTicksProcessed = 0;
  let batchCount = 0;
  let maxBatchDurationMs = 0;
  const startedAt = nowMilliseconds();

  while (remainingSimulationSeconds > 0) {
    const batchStartedAt = nowMilliseconds();
    let batchTicks = 0;
    while (remainingSimulationSeconds > 0 && batchTicks < batchSize) {
      const dt = Math.min(OFFLINE_CHUNK_SECONDS, remainingSimulationSeconds);
      const result = advanceGameTick(dt, undefined, OFFLINE_TICK_CONTEXT);
      effects.push(...result.effects);
      remainingSimulationSeconds -= dt;
      logicalTicksProcessed += 1;
      batchTicks += 1;
    }
    batchCount += 1;
    maxBatchDurationMs = Math.max(maxBatchDurationMs, nowMilliseconds() - batchStartedAt);
    if (remainingSimulationSeconds > 0) await yieldControl();
  }

  const codexUnlocks = reconcileCodexUnlocks(gameState);
  effects.push(...codexUnlocks.map(entryId => ({ type: 'CODEX_UNLOCKED', entryId })));

  return {
    creditedElapsedSeconds,
    gameplayMultiplier,
    simulatedSeconds: totalSimulationSeconds,
    logicalTicksProcessed,
    batchCount,
    maxBatchDurationMs,
    durationMs: nowMilliseconds() - startedAt,
    effects,
    codexUnlocks
  };
}

export async function runOfflineCatchUp(loadMetadata, options = {}) {
  if (!loadMetadata || typeof loadMetadata !== 'object') {
    return { applied: false, reason: 'NO_LOAD_METADATA', checkpoint: null };
  }
  if (consumedLoadMetadata.has(loadMetadata)) {
    return { applied: false, reason: 'ALREADY_CONSUMED', checkpoint: null };
  }
  consumedLoadMetadata.add(loadMetadata);

  if (!loadMetadata.loaded || loadMetadata.creditedElapsedSeconds <= 0) {
    return { applied: false, reason: 'NO_CREDITED_TIME', checkpoint: null };
  }

  const beforeSnapshot = captureOfflineSnapshot(gameState);
  const progression = await advanceOfflineProgress({
    creditedElapsedSeconds: loadMetadata.creditedElapsedSeconds,
    batchSize: options.batchSize,
    yieldControl: options.yieldControl
  });
  const afterSnapshot = captureOfflineSnapshot(gameState);
  const checkpoint = options.checkpoint ? options.checkpoint() : null;

  return {
    applied: true,
    reason: null,
    progression,
    beforeSnapshot,
    afterSnapshot,
    checkpoint
  };
}
