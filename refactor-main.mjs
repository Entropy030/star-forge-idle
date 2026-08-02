import fs from 'fs';

let content = fs.readFileSync('src/main.js', 'utf-8');

// 1. Add imports
content = content.replace(
  "import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, ensureStateShape, getInitialGameState, deserializeState, loadGame, serializeState } from './core/state.js';",
  "import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, ensureStateShape, getInitialGameState, deserializeState, loadGame, serializeState, getInitialEra3State } from './core/state.js';"
);

content = content.replace(
  "import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier } from './core/economy.js';",
  "import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier, getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate } from './core/economy.js';"
);

content = content.replace(
  "import { CanvasCore } from './ui/canvasCore.js';",
  "import { CanvasCore } from './ui/canvasCore.js';\nimport { updateStatsData, recalcTempMultiplier, spawnFlare, expireFlare, collectFlare, rollNextSpawnDelay } from './core/stellar.js';"
);

// 2. Add global export for inline HTML
content = content.replace(
  "window.triggerBigBounce = triggerBigBounce;",
  "window.triggerBigBounce = triggerBigBounce;\nwindow.collectFlare = collectFlare;"
);

// 3. Remove updateStatsData
content = content.replace(
  /function updateStatsData\(\) \{\s*if \(gameState\.era3\.temperature\.gt\(gameState\.stats\.maxTemp\)\) \{\s*gameState\.stats\.maxTemp = gameState\.era3\.temperature;\s*\}\s*\}/,
  "// updateStatsData moved to stellar.js"
);

// 4. Remove recalcTempMultiplier
content = content.replace(
  /function recalcTempMultiplier\(\) \{\s*if \(\!gameState\.era3 \|\| \!gameState\.era3\.temperature\) return;\s*let baseDiv = gameState\.era3\.temperature\.div\(1000000\)\.plus\(1\);\s*let logPrimitive = Math\.log10\(baseDiv\.toNumber\(\)\);\s*gameState\.era3\.tempMultiplier = new Decimal\(1\.0 \+ logPrimitive\);\s*\}/,
  "// recalcTempMultiplier moved"
);

// 5. Remove spawnFlare
content = content.replace(
  /function spawnFlare\(\) \{\s*if \(gameState\.flares\.active\) return;\s*gameState\.flares\.active = \{\s*expiresInSec: new Decimal\(COSMIC_REGISTRY\.solarEvents\.flare\.spawn\.activeWindowSec \|\| 12\)\s*\};\s*if \(\!flareSimSuppressed\) \{\s*Viewport\.showToast\("☀️ SOLAR PROMINENCE DETECTED: Core-Turbulenz aktiv!", "warning"\);\s*\}\s*\}/,
  "// spawnFlare moved"
);

// 6. Remove expireFlare
content = content.replace(
  /function expireFlare\(\) \{[\s\S]*?gameState\.flares\.nextSpawnInSec = rollNextSpawnDelay\(\);\s*\}/,
  "// expireFlare moved"
);

// 7. Remove collectFlare
content = content.replace(
  /function collectFlare\(\) \{[\s\S]*?gameState\.flares\.nextSpawnInSec = rollNextSpawnDelay\(\);\s*\}/,
  "// collectFlare moved"
);

// 8. Remove rollNextSpawnDelay
content = content.replace(
  /function rollNextSpawnDelay\(\) \{[\s\S]*?Math\.random\(\) \* \(\(config\.maxDelaySec - config\.minDelaySec\) \* reduction\)\);\s*\}/,
  "// rollNextSpawnDelay moved"
);

// 9. Remove rollFlareType
content = content.replace(
  /function rollFlareType\(\) \{[\s\S]*?return validRewards\[validRewards\.length - 1\]\.key;\s*\}/,
  "// rollFlareType moved"
);

// 10. Export specific functions
content = content.replace("function triggerGalacticMerge() {", "export function triggerGalacticMerge() {");
content = content.replace("function stabilizeArms() {", "export function stabilizeArms() {");
content = content.replace("function accretePlanetConfiguration() {", "export function accretePlanetConfiguration() {");
content = content.replace("function buyCelestialCard(key) {", "export function buyCelestialCard(key) {");

fs.writeFileSync('src/main.js', content);
console.log("Refactored main.js successfully");
