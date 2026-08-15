import { COSMIC_REGISTRY } from '../config/registry.js';
import { gameState } from '../core/state.js';
import { appendHistoryEntry } from '../state/history.js';

export function devSetEpoch(epochNum, callback) {
  const epoch = COSMIC_REGISTRY.universeChronology.epochs[epochNum];
  if (!epoch) return false;

  gameState.activeEpoch = epochNum;
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-epoch', String(epochNum));
  }
  if (callback) callback();
  appendHistoryEntry(gameState, {
    msg: `Timeline Shifted to ${epoch.name}`
  });
  return true;
}
