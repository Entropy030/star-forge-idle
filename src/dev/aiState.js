import { COSMIC_REGISTRY } from '../config/registry.js';
import { getVacuumCoherence } from '../eras/quantum/coherence.js';
import { getInflationEligibility } from '../eras/quantum/inflation.js';
import { getQuantumUpgradeEligibility } from '../eras/quantum/eligibility.js';
import { getPlasmaUpgradeEligibility, getRecombinationEligibility } from '../eras/plasma/eligibility.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility } from '../eras/stellar/selectors.js';

function getUpgradeSnapshot(state, category) {
  const definitions = COSMIC_REGISTRY.upgrades[category] || {};
  return Object.keys(definitions).map(key => {
    const definition = definitions[key];
    const upgrade = state.upgrades[category][key];
    let unlocked = true;
    if (category === 'quantum') unlocked = getQuantumUpgradeEligibility(state, key).unlocked;
    if (category === 'plasma') unlocked = getPlasmaUpgradeEligibility(state, key).unlocked;
    return {
      category,
      key,
      name: definition.name,
      level: upgrade.level,
      cost: upgrade.cost.toString(),
      unlocked
    };
  });
}

export function buildAIState(state) {
  const epoch = state.activeEpoch;
  const snapshot = {
    meta: {
      activeEpoch: epoch,
      epochName: COSMIC_REGISTRY.universeChronology.epochs[epoch]?.name,
      activeTab: state.activeTab
    },
    resources: {},
    upgrades: [],
    specialActions: {}
  };

  if (epoch === 1) {
    snapshot.meta.vacuumCoherence = getVacuumCoherence(state).toString();
    snapshot.resources = {
      quantumFluctuations: state.resources.quantumFluctuations.amount.toString(),
      energyDensity: state.resources.energyDensity.amount.toString()
    };
    snapshot.upgrades = getUpgradeSnapshot(state, 'quantum');
    snapshot.specialActions.canInflation = getInflationEligibility(state).isEligible;
  } else if (epoch === 2) {
    snapshot.resources = {
      quarks: state.resources.quarks.amount.toString(),
      gluons: state.resources.gluons.amount.toString(),
      leptons: state.resources.leptons.amount.toString(),
      protons: state.resources.protons.amount.toString(),
      electrons: state.resources.electrons.amount.toString(),
      plasmaTemperature: `${state.plasmaTemperature.toString()} K`
    };
    snapshot.upgrades = getUpgradeSnapshot(state, 'plasma');
    snapshot.specialActions.canRecombination = getRecombinationEligibility(state).isEligible;
  } else if (epoch === 3) {
    snapshot.resources = {
      hydrogen: state.resources.hydrogen.amount.toString(),
      helium: state.resources.helium.amount.toString(),
      carbon: state.resources.carbon.amount.toString(),
      iron: state.resources.iron.amount.toString(),
      stardust: state.currencies.stardust.amount.toString(),
      temperature: `${state.era3.temperature.toString()} K`,
      stage: state.era3.stage
    };
    snapshot.upgrades = getUpgradeSnapshot(state, 'stellar');
    snapshot.specialActions.canSupernova = getSupernovaEligibility(state).canTrigger;
    snapshot.specialActions.canGalacticIgnition = getGalacticIgnitionEligibility(state).isEligible;
    snapshot.specialActions.hasActiveFlare = Boolean(state.flares.active);
  } else if (epoch === 4 && state.era4) {
    snapshot.resources = {
      planetaryDebris: state.resources.planetaryDebris.amount.toString(),
      darkMatter: state.resources.darkMatter.amount.toString(),
      darkEnergyResidue: state.resources.darkEnergyResidue.amount.toString(),
      stability: `${state.era4.stability.toString()}%`,
      planetaryNodes: state.era4.planetaryNodes.toString()
    };
    snapshot.upgrades = getUpgradeSnapshot(state, 'galaxy');
  }

  snapshot.upgrades.push(...getUpgradeSnapshot(state, 'stardust'));
  return snapshot;
}
