const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

// 1. Update the UI viewport import to split out actions.js
const uiViewportImport = "import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition, triggerBigBounce, triggerSupernova, triggerGalacticMerge, stabilizeArms, accretePlanetConfiguration } from './ui/viewport.js';";
const uiViewportReplacement = "import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';\nimport { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './core/actions.js';";

if (main.includes(uiViewportImport)) {
  main = main.replace(uiViewportImport, uiViewportReplacement);
}

// 2. Remove AI harness section
const harnessStart = main.indexOf('// AI PLAYTEST HARNESS');
if (harnessStart !== -1) {
  const endBlock = main.indexOf('window.addEventListener("resize"', harnessStart);
  if (endBlock !== -1) {
    const bootstrapBlock = `if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
  `;
    main = main.substring(0, harnessStart) + bootstrapBlock + main.substring(endBlock);
  }
}

// 3. Remove unused AI imports
const aiImports = "import { startAutoPlaytest, stopAutoPlaytest, runHeadlessSim, playtestHarness, getTelemetryHistory } from './core/playtestBot.js';\n";
main = main.replace(aiImports, "");

// Write back
fs.writeFileSync('src/main.js', main);
console.log("Safely updated main.js");
