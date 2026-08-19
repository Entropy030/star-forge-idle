/* global Decimal */
import { createInitialState } from './createInitialState.js';
import { deserializeState, serializeState } from './serialization.js';

export const SAVE_VERSION = 18;

export function deepMergeMissing(target, source) {
  for (let key in source) {
    if (target[key] === undefined || target[key] === null) {
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
    let migrated = deserializeState(serializeState(legacyState));
    deepMergeMissing(migrated, createInitialState());
    migrated.version = 14;
    return migrated;
  },
  14: (legacyState) => {
    let migrated = deserializeState(serializeState(legacyState));
    deepMergeMissing(migrated, createInitialState());
    migrated.version = 15;
    return migrated;
  },
  15: (legacyState) => {
    let migrated = deserializeState(serializeState(legacyState));
    deepMergeMissing(migrated, createInitialState());
    
    // Clean codex structure
    if (!migrated.codex || typeof migrated.codex !== 'object') {
      migrated.codex = { unlockedEntryIds: [] };
    }
    
    if (!Array.isArray(migrated.codex.unlockedEntryIds)) {
      migrated.codex.unlockedEntryIds = [];
    }
    
    const cleanIds = new Set();
    for (const id of migrated.codex.unlockedEntryIds) {
      if (typeof id === 'string' && id.trim() !== '') {
        cleanIds.add(id);
      }
    }
    migrated.codex.unlockedEntryIds = Array.from(cleanIds);
    
    migrated.version = 16;
    return migrated;
  },
  16: (legacyState) => {
    let migrated = deserializeState(serializeState(legacyState));
    deepMergeMissing(migrated, createInitialState());
    
    if (!migrated.stats.maxQF) migrated.stats.maxQF = new Decimal(0);
    
    migrated.version = 17;
    return migrated;
  },
  17: (legacyState) => {
    let migrated = deserializeState(serializeState(legacyState));
    deepMergeMissing(migrated, createInitialState());

    if (migrated.era3 && migrated.era3.compressCost) {
      const alpha = migrated.cosmicConstants?.alpha || 0;
      const oldScaling = 1.75 + (0.03 * alpha);
      const newScaling = 1.35 + (0.03 * alpha);

      const logPrimitive = new Decimal(migrated.era3.compressCost).div(10).log10();
      const exponent = logPrimitive / Math.log10(oldScaling);
      const compressCount = Math.max(0, Math.round(exponent));

      let nextCost = new Decimal(10);
      for (let i = 0; i < compressCount; i++) {
        nextCost = nextCost.times(newScaling).floor();
      }
      migrated.era3.compressCost = nextCost;
    }

    migrated.version = 18;
    return migrated;
  }
};
