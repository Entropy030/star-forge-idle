/* global Decimal */
/* eslint-disable import/no-cycle */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCompressionHeatYield } from '../../core/economy.js';

export function getStellarRates(state) {
  let rates = {
    hydrogenProduction: new Decimal(0),
    hydrogenConsumption: new Decimal(0),
    heliumProduction: new Decimal(0),
    heliumConsumption: new Decimal(0),
    carbonProduction: new Decimal(0),
    carbonConsumption: new Decimal(0),
    ironProduction: new Decimal(0),
    pulsarShardsProduction: new Decimal(0)
  };

  let efficientLvl = state.upgrades.stellar?.efficient?.level || 0;
  let massiveLvl = state.upgrades.stellar?.massive?.level || 0;
  let compactLvl = state.upgrades.stellar?.compact?.level || 0;

  let fuelEfficiency = new Decimal(1.0).plus(efficientLvl * 0.1);
  let speedMult = new Decimal(1.0).plus(massiveLvl * 0.1);

  if (state.meta && state.meta.stellarLegacyModifiers) {
    speedMult = speedMult.times(state.meta.stellarLegacyModifiers.secondRunProductionMult || 1.0);
  }

  // Hydrogen
  rates.hydrogenProduction = state.era3.gravity.times(10).times(speedMult);

  // Helium
  if (state.era3.fusersEnabled && state.era3.fusionYield.gt(0)) {
    let costPerYield = new Decimal(10).div(fuelEfficiency);
    let targetFusions = state.era3.fusionYield.times(speedMult);
    rates.hydrogenConsumption = targetFusions.times(costPerYield);
    rates.heliumProduction = targetFusions;
  }

  // Carbon and Iron
  if (state.era3.stage === "Main Sequence Star") {
    if (state.era3.carbonYield.gt(0)) {
      let carbonCost = new Decimal(50).div(fuelEfficiency);
      let targetCarbon = state.era3.carbonYield.times(speedMult);
      rates.heliumConsumption = targetCarbon.times(carbonCost);
      rates.carbonProduction = targetCarbon;
    }

    if (state.era3.ironYield.gt(0) && state.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
      let ironCost = new Decimal(250).div(fuelEfficiency);
      let massiveIronBonus = new Decimal(1.0).plus(massiveLvl * 0.5);
      let targetIron = state.era3.ironYield.times(speedMult).times(massiveIronBonus);
      rates.carbonConsumption = targetIron.times(ironCost);
      rates.ironProduction = targetIron;
    }
  }

  // Pulsar Shards
  if (compactLvl > 0) {
    rates.pulsarShardsProduction = new Decimal(compactLvl).times(0.01);
  }

  return rates;
}
export function getSupernovaEligibility(state) {
  let canTrigger = false;
  let errorCode = null;

  let checks = {
    correctEpoch: false,
    stellarStateComplete: false,
    temperatureReached: false,
    ironFusionUnlocked: false,
    ironReached: false
  };

  if (state.activeEpoch === 3) checks.correctEpoch = true;
  if (state.era3 && state.era3.stage === 'Main Sequence Star') checks.stellarStateComplete = true;
  if (state.era3 && state.era3.temperature && state.era3.temperature.gte(COSMIC_REGISTRY.constants.supernovaTempThreshold)) checks.temperatureReached = true;
  if (state.era3 && state.era3.ironYield && state.era3.ironYield.gt(0)) checks.ironFusionUnlocked = true;
  if (state.resources && state.resources.iron && state.resources.iron.amount.gte(1000)) checks.ironReached = true;

  if (!checks.correctEpoch) errorCode = 'WRONG_EPOCH';
  else if (!checks.stellarStateComplete) errorCode = 'INCOMPLETE_STELLAR_STATE';
  else if (!checks.temperatureReached) errorCode = 'INSUFFICIENT_TEMPERATURE';
  else if (!checks.ironFusionUnlocked) errorCode = 'IRON_FUSION_LOCKED';
  else if (!checks.ironReached) errorCode = 'INSUFFICIENT_IRON';
  else canTrigger = true;

  return { canTrigger, errorCode, checks };
}

export function getSupernovaOutcome(state) {
  const efficientLvl = state.upgrades.stellar?.efficient?.level || 0;
  const massiveLvl = state.upgrades.stellar?.massive?.level || 0;
  const compactLvl = state.upgrades.stellar?.compact?.level || 0;

  let archetype = 'balanced';
  let maxLvl = Math.max(efficientLvl, massiveLvl, compactLvl);
  
  if (maxLvl === 0) {
    archetype = 'balanced';
  } else if (efficientLvl === maxLvl && efficientLvl > massiveLvl && efficientLvl > compactLvl) {
    archetype = 'efficient';
  } else if (massiveLvl === maxLvl && massiveLvl > efficientLvl && massiveLvl > compactLvl) {
    archetype = 'massive';
  } else if (compactLvl === maxLvl && compactLvl > efficientLvl && compactLvl > massiveLvl) {
    archetype = 'compact';
  }

  let outcome = 'neutron-star';
  let displayName = 'Neutron Star';
  let reasons = [];

  let stardust = new Decimal(0);
  let pulsarShards = new Decimal(0);
  let singularityMass = new Decimal(0);

  let coherenceBonus = 0;
  let secondRunProductionMult = 1.0;
  let secondRunStabilityMult = 1.0;

  let baseStardust = new Decimal(10).plus(state.era3.ironYield.times(2));

  if (archetype === 'efficient') {
    outcome = 'white-dwarf';
    displayName = 'White Dwarf';
    reasons.push('High stability and fuel efficiency resulted in a gentle collapse.');
    stardust = baseStardust.times(1.5).floor();
    coherenceBonus = 15;
    secondRunStabilityMult = 1.2;
  } else if (archetype === 'massive') {
    outcome = 'black-hole';
    displayName = 'Black Hole';
    reasons.push('High iron production and instability triggered a total gravitational collapse.');
    stardust = baseStardust.times(3.0).floor();
    singularityMass = new Decimal(1).plus(new Decimal(massiveLvl).times(0.5)).floor();
    secondRunProductionMult = 1.5;
    secondRunStabilityMult = 0.7;
  } else if (archetype === 'compact') {
    outcome = 'neutron-star';
    displayName = 'Pulsar';
    reasons.push('Controlled collapse and high density forged a rapidly spinning Pulsar.');
    stardust = baseStardust.times(1.2).floor();
    pulsarShards = new Decimal(5).plus(compactLvl * 2);
    secondRunProductionMult = 1.1;
    secondRunStabilityMult = 1.1;
  } else {
    outcome = 'neutron-star';
    displayName = 'Neutron Star';
    reasons.push('Balanced stellar evolution resulted in a standard neutron star remnant.');
    stardust = baseStardust.floor();
    pulsarShards = new Decimal(1);
    secondRunProductionMult = 1.05;
    secondRunStabilityMult = 1.05;
  }

  return {
    archetype,
    outcome,
    displayName,
    rewards: {
      stardust,
      pulsarShards,
      singularityMass
    },
    modifiers: {
      coherenceBonus,
      secondRunProductionMult,
      secondRunStabilityMult
    },
    reasons
  };
}
