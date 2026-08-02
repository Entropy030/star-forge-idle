const fs = require('fs');

function fixFile(path, fixes) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [target, replacement] of fixes) {
    content = content.replace(target, replacement);
  }
  fs.writeFileSync(path, content);
}

// 1. playtestBot.js
fixFile('src/core/playtestBot.js', [
  ['let storage = window.localStorage;', 'window.localStorage;'],
  ['(e) =>', '() =>'] // For the keydown listener
]);

// 2. state.js
fixFile('src/core/state.js', [
  [', prop,', ','], // For Object.defineProperty inside save migration
  ['(prop) =>', '() =>'],
  ['function (e)', 'function ()']
]);

// 3. timeline.js
fixFile('src/core/timeline.js', [
  ['let totalQuantumLevels = 0;', '']
]);

// 4. canvasCore.js
fixFile('src/ui/canvasCore.js', [
  ['let activeParticles = 0;', '']
]);

// 5. viewport.js
fixFile('src/ui/viewport.js', [
  ['(e) =>', '() =>'],
  ['let activeCurrencyField;', '']
]);

// 6. main.js - export HTML handlers to window to satisfy ESLint
let main = fs.readFileSync('src/main.js', 'utf8');

// Strip unused imports
main = main.replace(', ICONS, ARTIFACT_DEFINITIONS, t, i18n', '');
main = main.replace(', setGameState, isDirty, setIsDirty, exportSave, importSave, wipeSave, ensureStateShape, getInitialGameState, deserializeState, loadGame, serializeState', '');
main = main.replace(', getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield', '');
main = main.replace('playSupernovaSound, showIntroScreenCinematic, ', '');
main = main.replace("import { Templates } from './ui/templates.js';\n", '');
main = main.replace("import { Timeline, gameTick } from './core/timeline.js';\n", '');

// Add window exports for inline HTML functions
const windowExports = `
window.clickCore = clickCore;
window.toggleDevMatrix = toggleDevMatrix;
window.devQuantumWarp = devQuantumWarp;
window.devForceFlare = devForceFlare;
window.devHeatCore = devHeatCore;
window.devSetEpoch = devSetEpoch;
window.triggerInflation = triggerInflation;
window.triggerRecombination = triggerRecombination;
`;
main += windowExports;

// Clean up unused 'currentLvl' in the geometric functions (from break_infinity shim)
main = main.replace(/function\(resources, cost, ratio, currentLvl\)/g, 'function(resources, cost, ratio)');
main = main.replace(/function\(numItems, cost, ratio, currentLvl\)/g, 'function(numItems, cost, ratio)');
main = main.replace(/function\(cost, ratio, currentLvl\)/g, 'function(cost, ratio)');

fs.writeFileSync('src/main.js', main);
console.log('Fixed warnings');
