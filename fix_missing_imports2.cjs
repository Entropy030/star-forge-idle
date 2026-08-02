const fs = require('fs');

function addImports(file, imports) {
  let content = fs.readFileSync(file, 'utf8');
  content = imports + '\\n' + content;
  fs.writeFileSync(file, content);
}

// playtestBot.js
addImports('src/core/playtestBot.js', `
import { getQuantumAmplitude, getQuantumFluctuationRate } from './economy.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './actions.js';
import { gameTick } from './timeline.js';
import { format } from '../ui/viewport.js';
`);

// timeline.js
addImports('src/core/timeline.js', `
import { updateStatsData, recalcTempMultiplier, spawnFlare, expireFlare } from './stellar.js';
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;
`);

// main.js
addImports('src/main.js', `
import { getInitialEra3State } from './state.js';
import { getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate } from './economy.js';
import { triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration, triggerBigBounce } from './actions.js';
import { expireFlare } from './stellar.js';
let flareSimSuppressed = false;
`);

// viewport.js
addImports('src/ui/viewport.js', `
import { getInitialEra2State } from '../core/state.js';
import { getPlasmaPassiveRates, getBaryonAsymmetryMultiplier, getProtonFusionCap, getCarbonGravityMultiplier, getGalacticDebrisRate, getGalacticDarkMatterRate, getGalacticMergeYield, getCompressionsCompleted } from '../core/economy.js';
import { buyCelestialCardAction as buyCelestialCard } from '../core/actions.js';
`);

console.log('Fixed missing imports in all files.');
