// Core selectors that are environment-agnostic.
// Era-specific selectors will reside in their respective modules and may be imported here.

export function getResourceAmount(state, resourceId) {
  return state.resources[resourceId]?.amount || 0; // The actual structure might be a Decimal instance
}

export function getCurrencyAmount(state, currencyId) {
  return state.currencies[currencyId]?.amount || 0;
}

export function getCurrentPhase(state) {
  if (!state) return '';

  if (state.activeEpoch === 1) {
    const phases = {
      1: 'Quantum Observation',
      2: 'Force Formation',
      3: 'Inflation Threshold'
    };
    return phases[state.era1?.currentAct] || phases[1];
  }

  if (state.activeEpoch === 2) {
    const phases = {
      1: 'Quark-Gluon Plasma',
      2: 'Particle Synthesis',
      3: 'Recombination Threshold'
    };
    return phases[state.era2?.currentAct] || phases[1];
  }

  if (state.activeEpoch === 3) return state.era3?.stage || 'Stellar Dawn';
  if (state.activeEpoch === 4) return 'Galactic Accretion';
  if (state.activeEpoch === 5) return state.era5?.isHeatDeath ? 'Heat Death' : 'Event Horizon';

  return '';
}

export function getTransitionPresentation(state) {
  if (!state) {
    return { inflation: false, recombination: false, supernova: false };
  }

  return {
    inflation: state.activeEpoch === 1 && (state.era1?.currentAct || 1) >= 2,
    recombination: state.activeEpoch === 2 && (
      (state.era2?.currentAct || 1) >= 3 ||
      (state.upgrades?.plasma?.plasmaAutomation?.level || 0) > 0 ||
      (state.upgrades?.plasma?.baryoRadiator?.level || 0) > 0
    ),
    supernova: state.activeEpoch === 3 && state.era3?.stage === 'Main Sequence Star'
  };
}
