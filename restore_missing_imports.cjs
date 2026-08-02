const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

main = main.replace(
  "import { spawnFlare, expireFlare, collectFlare, rollNextSpawnDelay } from './core/stellar.js';",
  "import { spawnFlare, expireFlare, collectFlare, rollNextSpawnDelay } from './core/stellar.js';\nlet flareSimSuppressed = false;"
);

main = main.replace(
  "import { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './core/actions.js';",
  "import { triggerSupernova, triggerBigBounce, triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './core/actions.js';\nwindow.triggerBigBounce = triggerBigBounce;"
);

main = main.replace(
  "import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier, getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, updateStatsData, recalcTempMultiplier } from './core/economy.js';",
  "import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier, getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate, recalcTempMultiplier } from './core/economy.js';"
);

fs.writeFileSync('src/main.js', main);
console.log('Fixed final missing imports');
