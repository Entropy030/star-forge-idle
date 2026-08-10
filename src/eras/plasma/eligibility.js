import { COSMIC_REGISTRY } from '../../config/registry.js';

export function getRecombinationEligibility(state) {
  const protonThreshold = COSMIC_REGISTRY.constants.recombinationProtonThreshold;
  const correctEpoch = state.activeEpoch === 2;
  const protonReady = state.resources.protons.amount.gte(protonThreshold);
  const temperatureReady = state.plasmaTemperature.lte(3000);
  const isEligible = correctEpoch && (protonReady || temperatureReady);

  return {
    isEligible,
    errorCode: correctEpoch ? (isEligible ? null : 'PREREQUISITES_NOT_MET') : 'WRONG_EPOCH',
    correctEpoch,
    protonReady,
    temperatureReady,
    protons: state.resources.protons.amount,
    protonThreshold,
    temperature: state.plasmaTemperature,
    temperatureThreshold: 3000
  };
}
