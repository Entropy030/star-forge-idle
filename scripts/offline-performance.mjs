import Decimal from 'break_infinity.js';

globalThis.Decimal = Decimal;
globalThis.window = {};

const { replaceRuntimeState } = await import('../src/core/state.js');
const { advanceOfflineProgress } = await import('../src/core/offline.js');
const presets = await import('../src/dev/playtestPresets.js');

const supportedPresets = [
  ['Fresh Era I', presets.getPresetFreshEraI],
  ['Late Era I', presets.getPresetLateEraI],
  ['Fresh Era II', presets.getPresetFreshEraII],
  ['Mid Era II', presets.getPresetEraIIUpgradeChain],
  ['Recombination Ready', presets.getPresetEraIIRecombinationReady],
  ['Fresh Era III', presets.getPresetFreshEraIII],
  ['Mid Era III', presets.getPresetMidEraIII],
  ['Supernova Ready', presets.getPresetEraIIISupernovaReady]
];

const scenarios = [
  ['Late Era I · 1 minute', presets.getPresetLateEraI, 60],
  ['Mid Era II · 1 hour', presets.getPresetEraIIUpgradeChain, 3600],
  ['Mid Era III · 8 hours', presets.getPresetMidEraIII, 28800],
  ['Second-run/Late Era III · 8 hours', () => {
    const state = presets.getPresetMidEraIII();
    state.stats.supernovas = new Decimal(1);
    state.meta = {
      stellarLegacyModifiers: {
        secondRunProductionMult: 1.5,
        secondRunStabilityMult: 1.2
      }
    };
    return state;
  }, 28800],
  ...supportedPresets.map(([name, factory]) => [`${name} · 8-hour cap`, factory, 28800])
];

const results = [];
for (const [name, factory, creditedElapsedSeconds] of scenarios) {
  replaceRuntimeState(factory());
  const result = await advanceOfflineProgress({ creditedElapsedSeconds });
  results.push({
    scenario: name,
    creditedElapsedSeconds,
    logicalTicksProcessed: result.logicalTicksProcessed,
    durationMs: Number(result.durationMs.toFixed(2)),
    maxBatchDurationMs: Number(result.maxBatchDurationMs.toFixed(2)),
    batchCount: result.batchCount
  });
}

console.table(results);

const sustainedLongTask = results.some(result => result.maxBatchDurationMs >= 50);
if (sustainedLongTask) {
  console.warn('Offline profiling warning: at least one batch reached 50 ms.');
}
