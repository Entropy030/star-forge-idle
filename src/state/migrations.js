/* global Decimal */
import { createInitialState } from './createInitialState.js';
import { deserializeState, serializeState } from './serialization.js';

export const SAVE_VERSION = 16;

export function deepMergeMissing(target, source) {
  for (let key in source) {
    if (target[key] === undefined) {
      if (source[key] instanceof Decimal) target[key] = new Decimal(source[key]);
      else if (source[key] !== null && typeof source[key] === 'object') target[key] = deserializeState(serializeState(source[key]));
      else target[key] = source[key];
    } else if (source[key] !== null && typeof source[key] === 'object' && !(source[key] instanceof Decimal)) {
      deepMergeMissing(target[key], source[key]);
    }
  }
}

export const MIGRATIONS = {
  13: (legacyState) => {
    let migrated = createInitialState();
    deepMergeMissing(migrated, legacyState);
    migrated.version = 14;
    return migrated;
  },
  14: (legacyState) => {
    let migrated = createInitialState();
    deepMergeMissing(migrated, legacyState);
    migrated.version = 15;
    return migrated;
  },
  15: (legacyState) => {
    let migrated = createInitialState();
    deepMergeMissing(migrated, legacyState);
    
    // Clean codex structure
    if (!migrated.codex || typeof migrated.codex !== 'object') {
      migrated.codex = { unlockedEntryIds: [] };
    }
    
    if (!Array.isArray(migrated.codex.unlockedEntryIds)) {
      migrated.codex.unlockedEntryIds = [];
    }
    
    // Sanitize entries: only non-empty strings, deduplicated
    const cleanIds = new Set();
    for (const id of migrated.codex.unlockedEntryIds) {
      if (typeof id === 'string' && id.trim() !== '') {
        cleanIds.add(id);
      }
    }
    migrated.codex.unlockedEntryIds = Array.from(cleanIds);
    
    migrated.version = 16;
    return migrated;
  }
};
