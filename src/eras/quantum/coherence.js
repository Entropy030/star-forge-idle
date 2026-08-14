import Decimal from 'break_infinity.js';
import { getQuantumUpgradeEligibility } from './eligibility.js';

const BASE_PASSIVE_STABILIZATION_RATE = new Decimal(0.1);
const BASE_OBSERVATION_GAIN = new Decimal(0.5);

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
