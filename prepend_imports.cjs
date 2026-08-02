const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

const missingImports = `
import { triggerBigBounce } from './core/actions.js';
import { spawnFlare } from './core/stellar.js';
import { recalcTempMultiplier } from './core/economy.js';
`;

main = missingImports + main;

fs.writeFileSync('src/main.js', main);
console.log('Prepended missing imports.');
