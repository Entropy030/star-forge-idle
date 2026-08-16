import { computePlasmaStep } from './evaluator.js';

export function simulatePlasmaEra(state, dt) {
  let anyChanged = false;
  state.cosmicAge = (state.cosmicAge || new Decimal(0)).plus(dt);

  const step = computePlasmaStep(state, dt);

  // Apply deltas safely, ensuring resources exist
  for (const [resKey, amount] of Object.entries(step.deltas)) {
    if (amount.neq ? amount.neq(0) : amount !== 0) {
      if (!state.resources[resKey]) {
        state.resources[resKey] = { amount: new Decimal(0) };
      }
      state.resources[resKey].amount = state.resources[resKey].amount.plus(amount);
      anyChanged = true;
    }
  }

  // Apply cooling
  if (step.cooling.gt(0)) {
    state.plasmaTemperature = Decimal.max(300, state.plasmaTemperature.minus(step.cooling));
    anyChanged = true;
  }

  return { changed: anyChanged };
}
