/* global Decimal */
import { createInitialState } from './createInitialState.js';
import { deserializeState, serializeState } from './serialization.js';

export const SAVE_VERSION = 15;

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
  }
};
