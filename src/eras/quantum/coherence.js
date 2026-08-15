import Decimal from 'break_infinity.js';
import { getQuantumUpgradeEligibility } from './eligibility.js';

const BASE_PASSIVE_STABILIZATION_RATE = new Decimal(0.1);
const BASE_OBSERVATION_GAIN = new Decimal(0.5);

// Save v17 retains the historical top-level key, but its only authoritative
// meaning is Era I Vacuum Coherence. Later eras must use their native metrics.
export function getVacuumCoherence(state) {
  return state.coherence instanceof Decimal ? state.coherence : new Decimal(state.coherence || 0);
}

export function setVacuumCoherence(state, value) {
  state.coherence = value instanceof Decimal ? value : new Decimal(value || 0);
  return state.coherence;
}

export function getVacuumCoherenceRates(state) {
  const lightSpeedModifier = state.cosmicConstants?.c || 0;
  return {
    passiveRate: BASE_PASSIVE_STABILIZATION_RATE,
    observationGain: BASE_OBSERVATION_GAIN.times(1 - (0.08 * lightSpeedModifier))
  };
}

export function isVacuumCoherenceRelevant(state) {
  const vacuumResonance = state.upgrades?.quantum?.vacuumResonance?.level || 0;
  return vacuumResonance > 0 || getQuantumUpgradeEligibility(state, 'vacuumResonance').unlocked;
}

export function isInflationPreparationRelevant(state) {
  const strongForce = state.upgrades?.quantum?.strongForce?.level || 0;
  return strongForce > 0 || getQuantumUpgradeEligibility(state, 'strongForce').unlocked;
}
