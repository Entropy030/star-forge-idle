const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

const lines = main.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('// AI PLAYTEST HARNESS')) {
    skip = true;
  }
  
  if (line.includes('if (typeof window !== "undefined" && typeof document !== "undefined") {') && skip) {
    skip = false;
  }

  if (line.startsWith('function triggerSupernova() {')) skip = true;
  if (line.startsWith('export function triggerBigBounce() {')) skip = true;
  if (line.startsWith('function buyCosmicTuning(key) {')) skip = true;
  if (line.startsWith('function triggerEraVTransition() {')) skip = true;
  if (line.startsWith('function closeTheatrical() {')) skip = true;
  if (line.startsWith('function triggerGalacticMerge() {')) skip = true;
  if (line.startsWith('function stabilizeArms() {')) skip = true;
  if (line.startsWith('function accretePlanetConfiguration() {')) skip = true;

  if (line.includes('// [SEC-13] CLICK & TRANSACTION UTILITY IMPLEMENTATION')) {
    skip = false;
  }
  
  if (line.startsWith('function checkAchievements() {')) skip = true;
  if (line.startsWith('function checkMissionProgress() {')) skip = true;
  if (line.includes('// [SEC-10] DEVELOPER SANDBOX CONTROL PROTOCOLS')) {
    skip = false;
  }
  
  if (line.startsWith('function togglePlasmaFuser() {')) skip = true;
  if (line.startsWith('function clickCore(e) {')) {
    skip = false;
  }

  if (!skip) {
    newLines.push(line);
  }
}

let newContent = newLines.join('\n');

// Update UI viewport import
const uiViewportImport = "import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition, triggerBigBounce, triggerSupernova, triggerGalacticMerge, stabilizeArms, accretePlanetConfiguration } from './ui/viewport.js';";
const uiViewportReplacement = "import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';\nimport { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './core/actions.js';";
newContent = newContent.replace(uiViewportImport, uiViewportReplacement);

// Remove unused UI imports
newContent = newContent.replace(
  "import { startAutoPlaytest, stopAutoPlaytest, runHeadlessSim, playtestHarness, getTelemetryHistory } from './core/playtestBot.js';",
  ""
);

newContent = newContent.replace("window.triggerBigBounce = triggerBigBounce;\n", "");
newContent = newContent.replace("import { playSupernovaSound } from './ui/viewport.js';", "");

fs.writeFileSync('src/main.js', newContent);
console.log('Fixed main.js via precise line skipping');
