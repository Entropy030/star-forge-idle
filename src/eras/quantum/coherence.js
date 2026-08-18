import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getQuantumUpgradeEligibility } from './eligibility.js';

const BASE_PASSIVE_STABILIZATION_RATE = new Decimal(0.1);
const BASE_OBSERVATION_GAIN = new Decimal(0.5);

export const VACUUM_ALLOCATION_MODES = Object.freeze(['PROPAGATION', 'BALANCED', 'STABILIZATION']);

// Save v17 retains the historical top-level key, but its only authoritative
// meaning is Era I Vacuum Coherence. Later eras must use their native metrics.
export function getVacuumCoherence(state) {
  return state?.coherence instanceof Decimal ? state.coherence : new Decimal(state?.coherence || 0);
}

export function setVacuumCoherence(state, value) {
  state.coherence = value instanceof Decimal ? value : new Decimal(value || 0);
  return state.coherence;
}

export function getVacuumAllocation(state) {
  const mode = state?.era1?.vacuumAllocation;
  return VACUUM_ALLOCATION_MODES.includes(mode) ? mode : (COSMIC_REGISTRY.eraIAllocation?.defaultMode || 'BALANCED');
}

export function getVacuumAllocationProfile(state) {
  const mode = getVacuumAllocation(state);
  const modeDef = COSMIC_REGISTRY.eraIAllocation?.modes?.[mode] || {
    throughputMultiplier: 1.0,
    passiveCoherenceMultiplier: 1.0
  };
  return {
    mode,
    throughputMultiplier: modeDef.throughputMultiplier,
    passiveCoherenceMultiplier: modeDef.passiveCoherenceMultiplier
  };
}

export function getVacuumFieldQuality(state) {
  const rawCoherence = getVacuumCoherence(state).toNumber();
  const clampedCoherence = Math.max(0, Math.min(100, rawCoherence));
  const feedbackStrength = COSMIC_REGISTRY.eraIAllocation?.qualityFeedbackStrength ?? 1.0;
  return 1.0 + (clampedCoherence / 100) * feedbackStrength;
}

export function isVacuumCoherenceRelevant(state) {
  const vacuumResonance = state?.upgrades?.quantum?.vacuumResonance?.level || 0;
  return vacuumResonance > 0 || getQuantumUpgradeEligibility(state, 'vacuumResonance').unlocked;
}

export function isVacuumFieldAllocationUnlocked(state) {
  return isVacuumCoherenceRelevant(state);
}

export function getVacuumCoherenceRates(state) {
  const lightSpeedModifier = state?.cosmicConstants?.c || 0;
  const profile = getVacuumAllocationProfile(state);
  return {
    passiveRate: BASE_PASSIVE_STABILIZATION_RATE.times(profile.passiveCoherenceMultiplier),
    observationGain: BASE_OBSERVATION_GAIN.times(1 - (0.08 * lightSpeedModifier))
  };
}

export function isInflationPreparationRelevant(state) {
  const strongForce = state?.upgrades?.quantum?.strongForce?.level || 0;
  return strongForce > 0 || getQuantumUpgradeEligibility(state, 'strongForce').unlocked;
}
