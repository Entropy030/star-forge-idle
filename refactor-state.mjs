import fs from 'fs';

let content = fs.readFileSync('src/core/state.js', 'utf8');

// We want to replace the local implementations with imports from src/state
const replacements = [
  { match: /export function getInitialEra2State\(\) \{[\s\S]*?return state;\n\}/m, replace: "export { createInitialState as getInitialGameState } from '../state/createInitialState.js';" },
  { match: /export const ensureStateShape = function\(\) \{[\s\S]*?hawkingCollector\.level = 1;\n    \}\n  \}\n\}/m, replace: "export { ensureStateShape } from '../state/schema.js';" },
  { match: /export const serializeState = function\(obj\) \{[\s\S]*?return obj;\n\}/m, replace: "export { serializeState } from '../state/serialization.js';" },
  { match: /export const deserializeState = function\(obj\) \{[\s\S]*?return obj;\n\}/m, replace: "export { deserializeState } from '../state/serialization.js';" },
  { match: /function deepMergeMissing\(target, source\) \{[\s\S]*?\}\n  \}\n\}/m, replace: "" },
  { match: /const MIGRATIONS = \{[\s\S]*?return migrated;\n  \}\n\};/m, replace: "" },
  { match: /const SAVE_VERSION = 15;/m, replace: "import { SAVE_VERSION, MIGRATIONS } from '../state/migrations.js';" }
];

for (let r of replacements) {
  content = content.replace(r.match, r.replace);
}

fs.writeFileSync('src/core/state.js', content);
console.log("Refactored state.js successfully");
