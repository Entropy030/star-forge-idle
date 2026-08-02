const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

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
  "import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition, triggerBigBounce, triggerSupernova, triggerGalacticMerge, stabilizeArms, accretePlanetConfiguration } from './ui/viewport.js';",
  "import { ArtifactManager, Viewport, format, ActManager, initAudio, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';\nimport { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './core/actions.js';"
);

main = main.replace(
  "import { startAutoPlaytest, stopAutoPlaytest, runHeadlessSim, playtestHarness, getTelemetryHistory } from './core/playtestBot.js';",
  ""
);

main = main.replace(
  "import { spawnFlare, expireFlare, collectFlare, rollNextSpawnDelay } from './core/stellar.js';",
  "import { spawnFlare, collectFlare } from './core/stellar.js';"
);

main = main.replace(
  /function checkAchievements\(\) {/g,
  "// function checkAchievements() {"
);

main = main.replace(
  /function checkMissionProgress\(\) {/g,
  "// function checkMissionProgress() {"
);

main = main.replace(
  /function togglePlasmaFuser\(\) {/g,
  "// function togglePlasmaFuser() {"
);

main = main.replace(
  /const currentLvl = def\.baseCost;\/\/typeof def\.baseCost === 'function' \? def\.baseCost\(currentLvl\)/g,
  "const baseCost = def.baseCost;"
);
main = main.replace(
  /const cost = typeof def\.baseCost === 'function' \? def\.baseCost\(currentLvl\) : new Decimal\(def\.baseCost\)\.times\(Decimal\.pow\(def\.costMult \|\| 2, currentLvl\)\);/g,
  "// cost placeholder"
);

fs.writeFileSync('src/main.js', main);
console.log('Cleaned main.js');
