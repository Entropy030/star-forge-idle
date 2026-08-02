const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

const newImports = `import { COSMIC_REGISTRY } from './config/registry.js';
import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, ensureStateShape, getInitialGameState, getInitialEra3State, deserializeState, loadGame, serializeState } from './core/state.js';
import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier, getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, updateStatsData, recalcTempMultiplier } from './core/economy.js';
import { ArtifactManager, Viewport, format, ActManager, initAudio, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';
import { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration, buyCelestialCardAction as buyCelestialCard } from './core/actions.js';
import { Templates } from './ui/templates.js';
import { Timeline, gameTick } from './core/timeline.js';
import { CanvasCore } from './ui/canvasCore.js';
import { spawnFlare, expireFlare, collectFlare, rollNextSpawnDelay } from './core/stellar.js';

let flareSimSuppressed = false;
`;

const endOfImports = main.indexOf('// Re-export or attach globals');
if (endOfImports !== -1) {
  main = newImports + "\n" + main.substring(endOfImports);
}

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

const harnessStart = main.indexOf('// AI PLAYTEST HARNESS');
if (harnessStart !== -1) {
  main = main.substring(0, harnessStart);
  main += `// AI removed
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
  window.addEventListener("resize", () => Viewport.syncAnchor(true));
  requestAnimationFrame(renderLoop);
}
`;
}

// Clean up unused variables inside inline functions
main = main.replace(
  /const currentLvl = def\.baseCost;\/\/typeof def\.baseCost === 'function' \? def\.baseCost\(currentLvl\)/g,
  "const baseCost = def.baseCost;"
);

main = main.replace(
  /const cost = typeof def\.baseCost === 'function' \? def\.baseCost\(currentLvl\) : new Decimal\(def\.baseCost\)\.times\(Decimal\.pow\(def\.costMult \|\| 2, currentLvl\)\);/g,
  "// cost placeholder"
);

fs.writeFileSync('src/main.js', main);
console.log('Fixed imports successfully.');
