import fs from 'fs';

let registryStr = fs.readFileSync('src/config/registry.js', 'utf8');
registryStr = registryStr.replace("import { gameState } from '../core/state.js';\n", "");
registryStr = registryStr.replace("unlocked: () => gameState.era3.fusionYield.gt(0)", "unlocked: (state) => state.era3.fusionYield.gt(0)");
fs.writeFileSync('src/config/registry.js', registryStr);

let stellarStr = fs.readFileSync('src/core/stellar.js', 'utf8');
stellarStr = stellarStr.replace("if (rewards[key].unlocked()) {", "if (rewards[key].unlocked(gameState)) {");
fs.writeFileSync('src/core/stellar.js', stellarStr);

// Also remove loadGame() from the top level of main.js to fix the second error
// We can wrap it in an init function or just listen to DOMContentLoaded
let mainStr = fs.readFileSync('src/main.js', 'utf8');
// find the bottom initialization part
mainStr = mainStr.replace("loadGame();\ncheckDevMode();", "window.addEventListener('DOMContentLoaded', () => {\n  loadGame();\n  checkDevMode();\n});");
fs.writeFileSync('src/main.js', mainStr);
