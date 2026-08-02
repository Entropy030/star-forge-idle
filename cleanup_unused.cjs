const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [target, replacement] of replacements) {
    content = content.replace(target, replacement);
  }
  fs.writeFileSync(path, content);
}

replaceFile('src/core/botActions.js', [
  ["import Decimal from '../break_infinity.js';\n", ""]
]);

replaceFile('src/core/playtestBot.js', [
  ["import { Timeline, gameTick } from './timeline.js';", "import { gameTick } from './timeline.js';"],
  ["let storage = window.localStorage;", "window.localStorage;"],
  ["document.addEventListener('keydown', (e) => {", "document.addEventListener('keydown', () => {"]
]);

replaceFile('src/core/state.js', [
  ["let audioCtx;", ""],
  ["let autoCompressAccumulator = 0;", ""],
  ["let flareSimSuppressed = false;", ""],
  ["window.addEventListener('error', function (e) {", "window.addEventListener('error', function () {"]
]);

replaceFile('src/core/timeline.js', [
  ["getAmount, getCompressionScaling", "getCompressionScaling"],
  ["let totalQuantumLevels = 0;", ""]
]);

replaceFile('src/ui/canvasCore.js', [
  ["let activeParticles = 0;", ""]
]);

replaceFile('src/ui/viewport.js', [
  ["t, i18n", "t"],
  ["exportSave, importSave, wipeSave, getInitialEra2State, setGameState, getInitialGameState, ensureStateShape", "getInitialEra2State"],
  ["window.addEventListener('click', (e) => {", "window.addEventListener('click', () => {"]
]);

console.log("Cleanup script completed.");
