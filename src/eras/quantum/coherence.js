import Decimal from 'break_infinity.js';

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
  const quantumFluctuations = state.resources?.quantumFluctuations?.amount || new Decimal(0);
  return (state.era1?.currentAct || 1) >= 2 || state.discoveries?.has?.('qf_100') || quantumFluctuations.gte(100);
}
