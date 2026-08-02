// Core selectors that are environment-agnostic.
// Era-specific selectors will reside in their respective modules and may be imported here.

export function getResourceAmount(state, resourceId) {
  return state.resources[resourceId]?.amount || 0; // The actual structure might be a Decimal instance
}

export function getCurrencyAmount(state, currencyId) {
  return state.currencies[currencyId]?.amount || 0;
}
