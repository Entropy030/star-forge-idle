import os
import re

def insert_imports(filepath, new_imports):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # insert at the top, after the first line (which is usually an import)
    lines = content.split('\n')
    lines.insert(1, new_imports)
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

# 1. playtestBot.js
insert_imports('src/core/playtestBot.js', '''import { getQuantumAmplitude, getQuantumFluctuationRate } from './economy.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration } from './actions.js';
import { gameTick } from './timeline.js';
import { format } from '../ui/viewport.js';''')

# 2. state.js
# cyclic dependency: timeline imports state, state imports timeline.
# let's just make sure it's valid for now.

# 3. timeline.js
insert_imports('src/core/timeline.js', '''import { updateStatsData, recalcTempMultiplier, spawnFlare, expireFlare } from './stellar.js';
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;''')

# 4. main.js
insert_imports('src/main.js', '''import { getInitialEra3State } from './state.js';
import { getGalacticMergeYield, getCompressionHeatYield, getCompressionsCompleted, getGalacticDebrisRate } from './economy.js';
import { triggerGalacticMerge, stabilizeArmsAction as stabilizeArms, accretePlanetConfigurationAction as accretePlanetConfiguration, triggerBigBounce } from './actions.js';
import { expireFlare } from './stellar.js';
let flareSimSuppressed = false;''')

# 5. viewport.js
insert_imports('src/ui/viewport.js', '''import { getInitialEra2State } from '../core/state.js';
import { getPlasmaPassiveRates, getBaryonAsymmetryMultiplier, getProtonFusionCap, getCarbonGravityMultiplier, getGalacticDebrisRate, getGalacticDarkMatterRate, getGalacticMergeYield, getCompressionsCompleted } from '../core/economy.js';
import { buyCelestialCardAction as buyCelestialCard } from '../core/actions.js';''')

# 6. economy.js
insert_imports('src/core/economy.js', '''import { Viewport, format, playSupernovaSound, initAudio } from '../ui/viewport.js';
// Haptics is on window
const Haptics = window.Haptics;
import { saveGame } from './state.js';''')

# 7. stellar.js
insert_imports('src/core/stellar.js', '''import { getInitialGameState, setIsDirty, saveGame } from './state.js';
import { startEraTransition, Viewport } from '../ui/viewport.js';''')

print("All imports inserted")
