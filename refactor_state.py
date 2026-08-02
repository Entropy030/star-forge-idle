import re

with open('src/core/state.js', 'r') as f:
    content = f.read()

# Migrations
start_idx = content.find('function deepMergeMissing')
end_idx = content.find('export const loadGame = function()')
migrations_code = content[start_idx:end_idx]

out_migrations = """import Decimal from '../../break_infinity.js';
import { createInitialState } from './createInitialState.js';
import { deserializeState, serializeState } from './serialization.js';

export const SAVE_VERSION = 15;

""" + migrations_code.replace("getInitialGameState", "createInitialState")

with open('src/state/migrations.js', 'w') as f:
    f.write(out_migrations)

print("Migrations extracted")
