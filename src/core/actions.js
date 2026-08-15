import { engine } from '../engine/instance.js';

export function triggerSupernova() {
  return engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
}

export function triggerGalacticIgnition() {
  return engine.dispatch({ type: 'TRIGGER_GALACTIC_IGNITION' });
}

export function triggerBigBounce() {
  return engine.dispatch({ type: 'TRIGGER_BIG_BOUNCE' });
}

export function triggerGalacticMerge() {
  return engine.dispatch({ type: 'TRIGGER_GALACTIC_MERGE' });
}

export function stabilizeArmsAction() {
  return { success: true, events: [{ type: "ARMS_STABILIZED" }] };
}

export function accretePlanetConfigurationAction() {
  return { success: true, events: [{ type: "PLANETS_ACCRETED" }] };
}

export function buyCelestialCardAction(key) {
  return engine.dispatch({ type: 'BUY_CELESTIAL_CARD', payload: { key } });
}
