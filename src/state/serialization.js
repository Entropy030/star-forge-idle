/* global Decimal */
/* global localStorage, SAVE_VERSION, gameState */
/* eslint-disable no-restricted-globals */

export const serializeState = function(obj) {
  if (obj instanceof Decimal) return { __type: 'Decimal', value: obj.toString() };
  if (obj instanceof Set) return { __type: 'Set', value: Array.from(obj) };
  if (Array.isArray(obj)) return obj.map(serializeState);
  if (obj !== null && typeof obj === 'object') {
    let res = {};
    for (let key in obj) res[key] = serializeState(obj[key]);
    return res;
  }
  return obj;
}

export const deserializeState = function(obj) {
  if (obj !== null && typeof obj === 'object') {
    if (obj.__type === 'Decimal') return new Decimal(obj.value);
    if (obj.__type === 'Set') return new Set(obj.value);
    if (Array.isArray(obj)) return obj.map(deserializeState);
    let res = {};
    for (let key in obj) res[key] = deserializeState(obj[key]);
    return res;
  }
  return obj;
}

function deepMergeMissing(target, source) {
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

export const saveGame = function() {
  const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
  localStorage.setItem('starForgeSave_v16', JSON.stringify(saveState));
}

