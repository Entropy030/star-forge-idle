const fs = require('fs');

function replaceFile(path, target, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
}

replaceFile('src/main.js', 'updateStatsData, recalcTempMultiplier', 'recalcTempMultiplier');

replaceFile('src/core/playtestBot.js', 'let storage = window.localStorage;', 'window.localStorage;');
replaceFile('src/core/playtestBot.js', 'document.addEventListener("keydown", (e) => {', 'document.addEventListener("keydown", () => {');

replaceFile('src/core/state.js', 'let audioCtx;', '');
replaceFile('src/core/state.js', 'let autoCompressAccumulator = 0;', '');
replaceFile('src/core/state.js', 'let flareSimSuppressed = false;', '');
replaceFile('src/core/state.js', 'window.addEventListener("error", function (e) {', 'window.addEventListener("error", function () {');

replaceFile('src/core/timeline.js', 'let totalQuantumLevels = 0;', '');

replaceFile('src/ui/canvasCore.js', 'let activeParticles = 0;', '');

replaceFile('src/ui/viewport.js', 'window.addEventListener("click", (e) => {', 'window.addEventListener("click", () => {');
replaceFile('src/ui/viewport.js', 'let activeCurrencyField;', '');

console.log('Cleaned all unused vars.');
