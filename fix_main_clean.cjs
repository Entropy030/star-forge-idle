const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

// 1. Fix Imports at the top
main = main.replace(
  "import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition, triggerBigBounce, triggerSupernova, triggerGalacticMerge, stabilizeArms, accretePlanetConfiguration } from './ui/viewport.js';",
  "import { ArtifactManager, Viewport, format, ActManager, initAudio, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';\nimport { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './core/actions.js';"
);

main = main.replace(
  "import { playSupernovaSound } from './ui/viewport.js';", 
  ""
);

main = main.replace(
  "import { COSMIC_REGISTRY, ICONS, ARTIFACT_DEFINITIONS, t, i18n } from './config/registry.js';",
  "import { COSMIC_REGISTRY } from './config/registry.js';"
);

main = main.replace(
  "import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, ensureStateShape, getInitialGameState, deserializeState, loadGame, serializeState } from './core/state.js';",
  "import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, getInitialGameState, deserializeState, loadGame, serializeState } from './core/state.js';"
);

main = main.replace(
  "import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier, getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, updateStatsData, recalcTempMultiplier } from './core/economy.js';",
  "import { Economy, getHydrogenGenRate, getCardMultiplier, getBaryonAsymmetryMultiplier, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, updateStatsData, recalcTempMultiplier } from './core/economy.js';"
);

main = main.replace(
  "import { startAutoPlaytest, stopAutoPlaytest, runHeadlessSim, playtestHarness, getTelemetryHistory } from './core/playtestBot.js';",
  ""
);

main = main.replace(
  "import { spawnFlare, expireFlare, collectFlare, rollNextSpawnDelay } from './core/stellar.js';",
  "import { spawnFlare, collectFlare } from './core/stellar.js';"
);

// 2. Remove dead functions checkAchievements, checkMissionProgress, togglePlasmaFuser safely
const removeBlock = (startStr, endStr) => {
  const startIdx = main.indexOf(startStr);
  if (startIdx === -1) return;
  const endIdx = main.indexOf(endStr, startIdx);
  if (endIdx !== -1) {
    main = main.substring(0, startIdx) + main.substring(endIdx + endStr.length);
  }
};

removeBlock("function checkAchievements() {", "}\n\nfunction checkMissionProgress() {");
removeBlock("function checkMissionProgress() {", "}\n\n// ==========================================================================");
removeBlock("function togglePlasmaFuser() {", "}\n\nfunction clickCore(e) {");

// 3. Remove AI Harness completely
const harnessStart = main.indexOf('// AI PLAYTEST HARNESS');
if (harnessStart !== -1) {
  main = main.substring(0, harnessStart);
}

// 4. Clean unused variables inside inline functions
main = main.replace(
  /const currentLvl = def\.baseCost;\/\/typeof def\.baseCost === 'function' \? def\.baseCost\(currentLvl\)/g,
  "const baseCost = def.baseCost;"
);

main = main.replace(
  /const cost = typeof def\.baseCost === 'function' \? def\.baseCost\(currentLvl\) : new Decimal\(def\.baseCost\)\.times\(Decimal\.pow\(def\.costMult \|\| 2, currentLvl\)\);/g,
  "// cost placeholder"
);

fs.writeFileSync('src/main.js', main);
console.log('Fixed imports and removed harness safely');
