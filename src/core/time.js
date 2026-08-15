export function getGameplayTimeMultiplier(state) {
  return 1 + (0.12 * (state.cosmicConstants?.c || 0));
}

export function getLiveSimulationMultiplier(state, playtestSpeedMultiplier = 1) {
  return getGameplayTimeMultiplier(state) * playtestSpeedMultiplier;
}
