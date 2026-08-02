import fs from 'fs';

let content = fs.readFileSync('src/core/state.js', 'utf-8');

// 1. Remove hawkingRadiation from currencies
content = content.replace(
  /hawkingRadiation:\s*\{\s*amount:\s*new Decimal\(0\)\s*\},?\n?\s*/,
  ""
);

// 2. Add hawkingRadiation to resources
content = content.replace(
  "antimatterResidue: { amount: new Decimal(0) }",
  "antimatterResidue: { amount: new Decimal(0) },\n      hawkingRadiation: { amount: new Decimal(0) }"
);

// 3. Inject mergeDefaultsIntoLoadedState
const mergeFunc = `
function mergeDefaultsIntoLoadedState(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Decimal) {
        if (!target[key]) target[key] = new Decimal(0);
        else if (!(target[key] instanceof Decimal)) target[key] = new Decimal(target[key]);
      } else if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeDefaultsIntoLoadedState(target[key], source[key]);
      } else {
        if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
  }
}
`;

// Insert the mergeFunc before ensureStateShape
content = content.replace("export const ensureStateShape = function() {", mergeFunc + "\nexport const ensureStateShape = function() {");

// 4. Update ensureStateShape to use the merge
content = content.replace(
  "const initialState = getInitialGameState();",
  "const initialState = getInitialGameState();\n  mergeDefaultsIntoLoadedState(gameState, initialState);"
);

// 5. Replace achievements check in main.js
let mainContent = fs.readFileSync('src/main.js', 'utf-8');
mainContent = mainContent.replace(
  "if (!gameState.achievements.firstBlackHole && gameState.stats.firstBlackHoleTriggered)",
  "if (!gameState.achievements.firstBlackHole.unlocked && gameState.stats.firstBlackHoleTriggered)"
);
mainContent = mainContent.replace(
  "gameState.achievements.firstBlackHole = true;",
  "gameState.achievements.firstBlackHole.unlocked = true;"
);
fs.writeFileSync('src/main.js', mainContent);

fs.writeFileSync('src/core/state.js', content);
console.log("Refactored state.js and main.js successfully");
