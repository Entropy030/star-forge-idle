const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

// The required imports for main.js:
main = main.replace(
  "import { COSMIC_REGISTRY } from './config/registry.js';",
  "import { COSMIC_REGISTRY } from './config/registry.js';" // Keep it simple
);

main = main.replace(
  "import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, getInitialGameState, deserializeState, loadGame, serializeState } from './core/state.js';",
  "import { gameState, saveGame, getInitialEra3State } from './core/state.js';"
);

main = main.replace(
  "import { Economy, getHydrogenGenRate, getCardMultiplier, getBaryonAsymmetryMultiplier, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, updateStatsData, recalcTempMultiplier } from './core/economy.js';",
  "import { Economy, getHydrogenGenRate, getCardMultiplier, getBaryonAsymmetryMultiplier, getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, recalcTempMultiplier } from './core/economy.js';"
);

main = main.replace(
  "import { ArtifactManager, Viewport, format, ActManager, initAudio, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';",
  "import { Viewport, ActManager, initAudio, showIntroScreenCinematic, startEraTransition, buyCelestialCard } from './ui/viewport.js';"
);

main = main.replace(
  "import { spawnFlare, collectFlare } from './core/stellar.js';",
  "import { spawnFlare, expireFlare } from './core/stellar.js';"
);

// Add let flareSimSuppressed = false; at the top
if (!main.includes("let flareSimSuppressed = false;")) {
  main = main.replace("import { CanvasCore } from './ui/canvasCore.js';", "import { CanvasCore } from './ui/canvasCore.js';\nlet flareSimSuppressed = false;");
}

fs.writeFileSync('src/main.js', main);
console.log('Fixed missing imports');
