// [SEC-03] ENGINE STATE ENGINE INITIALIZATION TREE
// ==========================================================================
import { COSMIC_REGISTRY } from '../config/registry.js';

import { SAVE_VERSION, MIGRATIONS } from '../state/migrations.js';

import { createInitialState as getInitialGameState } from '../state/createInitialState.js';
export { getInitialGameState };

export const createReactiveState = function(obj, onDirty) {
  if (typeof obj !== 'object' || obj === null || obj instanceof Decimal || obj.__isProxy) {
    return obj;
  }
  for (let key in obj) {
    obj[key] = createReactiveState(obj[key], onDirty);
  }
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === '__isProxy') return true;
      let val = target[prop];
      if (typeof val === 'function') {
        return function(...args) {
          const result = val.apply(target, args);
          // Trigger dirty on Set mutations
          if (target instanceof Set && (prop === 'add' || prop === 'delete' || prop === 'clear')) {
            onDirty(prop);
          }
          return result;
        };
      }
      return val;
    },
    set(target, prop, value) {
      if (target[prop] !== value) {
        target[prop] = createReactiveState(value, onDirty);
        onDirty(prop);
      }
      return true;
    }
  });
};

export let isDirty = true;
export function setIsDirty(val) {
  isDirty = val;
}
export let gameState = createReactiveState(getInitialGameState(), (prop) => {
  isDirty = true;
});
export function setGameState(newState) {
  gameState = newState;
}
export let lastTick = Date.now();
let audioCtx;
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;


function mergeDefaultsIntoLoadedState(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Decimal) {
        if (!target[key]) target[key] = new Decimal(0);
        else if (!(target[key] instanceof Decimal)) target[key] = new Decimal(target[key]);
      } else if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeDefaultsIntoLoadedState(target[key], source[key]);
      } else {
        if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
  }
}

import { ensureStateShape } from '../state/schema.js';
export { ensureStateShape };

// ==========================================================================
// [SEC-16] PERSISTENCE MIGRATION & STORAGE ENGINES
// ==========================================================================
import { serializeState, deserializeState } from '../state/serialization.js';
export { serializeState, deserializeState };



export function replaceRuntimeState(nextState) {
  if (
    nextState === null ||
    typeof nextState !== 'object' ||
    Array.isArray(nextState)
  ) {
    throw new TypeError(
      `Invalid runtime state: expected object, received ${typeof nextState}`
    );
  }

  gameState = createReactiveState(nextState, (prop) => {
    isDirty = true;
  });
  ensureStateShape(gameState);
  
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
  }
  isDirty = true;
}

// ==========================================================================

