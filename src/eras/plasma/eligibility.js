import { COSMIC_REGISTRY } from '../../config/registry.js';

export function getPlasmaUpgradeEligibility(state, upgradeId) {
  const getLevel = id => state.upgrades?.plasma?.[id]?.level || 0;
  const requirement = (id, label, current, target) => ({
    id,
    label,
    current,
    target,
    met: current >= target
  });

  let requirements = [];
  switch (upgradeId) {
    case 'gluonBinding':
      requirements = [requirement('quark-level', 'Quark Condenser level', getLevel('quarkCondenser'), 3)];
      break;
    case 'leptonHarvest':
      requirements = [requirement('gluon-level', 'Gluon Matrix Synthesis level', getLevel('gluonBinding'), 2)];
      break;
    case 'plasmaAutomation':
      requirements = [requirement('lepton-level', 'Lepton Collector level', getLevel('leptonHarvest'), 1)];
      break;
    case 'baryoRadiator':
      requirements = [requirement('synthesizer-level', 'Proton Synthesizer level', getLevel('plasmaAutomation'), 1)];
      break;
    default:
      break;
  }

  return {
    unlocked: requirements.every(item => item.met),
    requirements
  };
}

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
