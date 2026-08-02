import { gameState, setGameState, getInitialGameState, ensureStateShape } from './state.js';
import { engine } from '../engine/instance.js';
import { getStardustYield, getPulsarShardYield, getSingularityMassYield, getGalacticMergeYield } from './economy.js';

import { COSMIC_REGISTRY } from '../config/registry.js';

export function triggerSupernova() {
  const result = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
  if (result.ok) {
    const snEvent = result.events.find(ev => ev.type === 'SUPERNOVA_TRIGGERED');
    if (snEvent && typeof window !== 'undefined' && window.Viewport) {
       window.Viewport.showToast(`Supernova Yield: ${snEvent.yieldAmt} Stardust`, "success");
    }
  }
  return result;
}

export function triggerBigBounce() {
  const result = engine.dispatch({ type: 'TRIGGER_BIG_BOUNCE' });
  if (result.ok) {
    const snEvent = result.events.find(ev => ev.type === 'BIG_BOUNCE_TRIGGERED');
    if (snEvent && typeof window !== 'undefined' && window.Viewport) {
       window.Viewport.showToast(`Big Bounce! Yield: ${snEvent.pulsarYield} Pulsar Shards, ${snEvent.bitsYield} Bits`, "success");
    }
  }
  return result;
}

export function triggerGalacticMerge() {
  const result = engine.dispatch({ type: 'TRIGGER_GALACTIC_MERGE' });
  if (result.ok) {
    const snEvent = result.events.find(ev => ev.type === 'GALACTIC_MERGE_TRIGGERED');
    if (snEvent && typeof window !== 'undefined' && window.Viewport) {
       window.Viewport.showToast(`Merge complete! Yield: ${snEvent.yieldAmt} Singularity Mass`, "success");
    }
  }
  return result;
}

export function stabilizeArmsAction() {
  return { success: true, events: [{ type: "ARMS_STABILIZED" }] };
}

export function accretePlanetConfigurationAction() {
  return { success: true, events: [{ type: "PLANETS_ACCRETED" }] };
}

export function buyCelestialCardAction(key) {
  let def = COSMIC_REGISTRY.celestialCards[key];
  let state = gameState.cards[key];
  if (!def || !state) return { success: false };
  
  const currencyAmount = gameState.currencies[def.currency]?.amount || new Decimal(0);
  if (currencyAmount.lt(state.cost)) return { success: false };

  gameState.currencies[def.currency].amount = currencyAmount.sub(state.cost);
  state.level += 1;
  state.cost = state.cost.times(def.costScaling).round();
  
  return { success: true, events: [{ type: "CARD_BOUGHT", key }] };
}
