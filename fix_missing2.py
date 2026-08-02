import os

def insert_imports(filepath, new_imports):
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    lines.insert(1, new_imports)
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

insert_imports('src/main.js', '''import { triggerSupernova } from './ui/viewport.js';
import { updateStatsData, recalcTempMultiplier, spawnFlare, collectFlare } from './core/stellar.js';''')

print('Imports added')
