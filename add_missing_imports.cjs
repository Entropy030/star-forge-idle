const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

const missingImports = `
import { triggerBigBounce } from './core/actions.js';
import { spawnFlare } from './core/stellar.js';
import { recalcTempMultiplier } from './core/economy.js';
`;

main = main.replace("import { COSMIC_REGISTRY } from './config/registry.js';", "import { COSMIC_REGISTRY } from './config/registry.js';" + missingImports);

fs.writeFileSync('src/main.js', main);
console.log('Fixed undefined imports explicitly');
