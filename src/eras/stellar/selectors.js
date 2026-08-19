import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../../config/registry.js';
import {
  getCarbonCapacity,
  getCarbonFuelCost,
  getContainmentCapacity,
  getFusionCapacity,
  getFusionFuelCost,
  getHydrogenProductionRate,
  getIronCapacity,
  getIronFuelCost,
  getTemperatureMultiplier
} from './authority.js';

export function getStellarBottleneck(state) {
  const temp = state?.era3?.temperature || new Decimal(0);
  const ironAmount = state?.resources?.iron?.amount || new Decimal(0);

  // 1. Supernova Ready Gate
  if (ironAmount.gte(1000) && temp.gte(COSMIC_REGISTRY.constants.supernovaTempThreshold)) {
    return {
      id: 'SUPERNOVA_READY',
      label: 'Supernova Collapse Ready',
      summary: 'Stellar core is primed for repeatable Supernova in Legacy.'
    };
  }

  // 2. Heavy Synthesizers Available (Unlocked by Temperature but not yet purchased)
  if (temp.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) && (!state?.era3?.ironYield || state.era3.ironYield.eq(0))) {
    return {
      id: 'IRON_SYNTHESIS_AVAILABLE',
      label: 'Iron Synthesizer Available',
      summary: 'Core temperature reached 2.0B K. Iron synthesis layer unlocked in Forge.'
    };
  }
  if (temp.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp) && (!state?.era3?.carbonYield || state.era3.carbonYield.eq(0))) {
    return {
      id: 'CARBON_SYNTHESIS_AVAILABLE',
      label: 'Carbon Synthesizer Available',
      summary: 'Core temperature reached 500M K. Carbon synthesis layer unlocked in Forge.'
    };
  }

  // 3. Flow-based Inflow vs Conversion Checks
  const inflowRate = getHydrogenProductionRate(state);
  const fusionNominal = getFusionCapacity(state);
  const fusionCost = getFusionFuelCost(state);
  const fusionDemandRate = fusionNominal.times(fusionCost);
  const hStock = state?.resources?.hydrogen?.amount || new Decimal(0);
  const containmentCap = getContainmentCapacity(state);

  if (state?.era3?.fusersEnabled && fusionDemandRate.gt(inflowRate)) {
    return {
      id: 'FUEL_INFLOW_LIMITED',
      label: 'Fuel Inflow Constrained',
      summary: hStock.gt(0)
        ? 'Hydrogen inflow is below fuser demand; fuel buffer is draining.'
        : 'Hydrogen inflow is below active fusion demand.'
    };
  }

  if (state?.era3?.fusersEnabled && inflowRate.gt(fusionDemandRate) && containmentCap.gt(0) && hStock.gte(containmentCap)) {
    return {
      id: 'FUSION_CAPACITY_LIMITED',
      label: 'Conversion Throughput Constrained',
      summary: 'Hydrogen inflow exceeds fuser throughput and fuel buffer is saturated.'
    };
  }

  // 4. Heavy Layer Processing Limits using Sustainable Upstream Flow Chain
  const fusionSustainableRate = Decimal.min(
    fusionNominal,
    fusionCost.gt(0) ? inflowRate.div(fusionCost) : new Decimal(0)
  );

  const carbonNominal = getCarbonCapacity(state);
  const carbonCost = getCarbonFuelCost(state);
  const carbonDemandRate = carbonNominal.times(carbonCost);

  if (state?.era3?.carbonYield?.gt(0) && fusionSustainableRate.gt(carbonDemandRate)) {
    return {
      id: 'CARBON_PROCESSING_LIMITED',
      label: 'Carbon Processing Constrained',
      summary: 'Sustainable Helium production exceeds active Carbon synthesizer throughput.'
    };
  }

  const carbonSustainableRate = Decimal.min(
    carbonNominal,
    carbonCost.gt(0) ? fusionSustainableRate.div(carbonCost) : new Decimal(0)
  );

  const ironNominal = getIronCapacity(state);
  const ironCost = getIronFuelCost(state);
  const ironDemandRate = ironNominal.times(ironCost);

  if (state?.era3?.ironYield?.gt(0) && carbonSustainableRate.gt(ironDemandRate)) {
    return {
      id: 'IRON_PROCESSING_LIMITED',
      label: 'Iron Processing Constrained',
      summary: 'Sustainable Carbon production exceeds active Iron synthesizer throughput.'
    };
  }

  // 5. Thermal Core Densification
  const compressCost = state?.era3?.compressCost || new Decimal(10);
  const heStock = state?.resources?.helium?.amount || new Decimal(0);
  if (heStock.gte(compressCost)) {
    return {
      id: 'CORE_DENSIFICATION_READY',
      label: 'Core Compression Ready',
      summary: 'Helium reserves are sufficient for discrete core compression in Forge.'
    };
  }

  return {
    id: 'BALANCED_OPERATION',
    label: 'Sustained Operation',
    summary: 'Stellar processes operating in balanced equilibrium.'
  };
}

export function getStellarMachineSnapshot(state) {
  const inflowRate = getHydrogenProductionRate(state);
  const containmentCapacity = getContainmentCapacity(state);
  const hydrogenStock = state?.resources?.hydrogen?.amount || new Decimal(0);
  const containmentFill = containmentCapacity.gt(0)
    ? Decimal.min(1.0, hydrogenStock.div(containmentCapacity)).toNumber()
    : 0;

  const fusionNominalCapacity = getFusionCapacity(state);
  const fusionFuelCost = getFusionFuelCost(state);
  const fusionFuelDemandRate = fusionNominalCapacity.times(fusionFuelCost);
  const fusionSustainableRate = Decimal.min(
    fusionNominalCapacity,
    fusionFuelCost.gt(0) ? inflowRate.div(fusionFuelCost) : new Decimal(0)
  );

  const carbonNominalCapacity = getCarbonCapacity(state);
  const carbonFuelCost = getCarbonFuelCost(state);
  const carbonFuelDemandRate = carbonNominalCapacity.times(carbonFuelCost);
  const carbonSustainableRate = Decimal.min(
    carbonNominalCapacity,
    carbonFuelCost.gt(0) ? fusionSustainableRate.div(carbonFuelCost) : new Decimal(0)
  );

  const ironNominalCapacity = getIronCapacity(state);
  const ironFuelCost = getIronFuelCost(state);
  const ironFuelDemandRate = ironNominalCapacity.times(ironFuelCost);
  const ironSustainableRate = Decimal.min(
    ironNominalCapacity,
    ironFuelCost.gt(0) ? carbonSustainableRate.div(ironFuelCost) : new Decimal(0)
  );

  const thermalReactionMultiplier = getTemperatureMultiplier(state);
  const bottleneck = getStellarBottleneck(state);

  let hydrogenBufferTrend = 'STEADY';
  if (inflowRate.gt(fusionFuelDemandRate)) {
    hydrogenBufferTrend = hydrogenStock.gte(containmentCapacity) ? 'SATURATED' : 'FILLING';
  } else if (fusionFuelDemandRate.gt(inflowRate)) {
    hydrogenBufferTrend = hydrogenStock.gt(0) ? 'DRAINING' : 'DEPLETED';
  }

  return {
    inflowRate,
    containmentCapacity,
    hydrogenStock,
    containmentFill,
    hydrogenBufferTrend,
    fusionNominalCapacity,
    fusionFuelCost,
    fusionFuelDemandRate,
    fusionSustainableRate,
    carbonNominalCapacity,
    carbonFuelCost,
    carbonFuelDemandRate,
    carbonSustainableRate,
    ironNominalCapacity,
    ironFuelCost,
    ironFuelDemandRate,
    ironSustainableRate,
    thermalReactionMultiplier,
    bottleneck
  };
}

export function getStellarRates(state) {
  let rates = {
    hydrogenProduction: getHydrogenProductionRate(state),
    hydrogenConsumption: new Decimal(0),
    heliumProduction: new Decimal(0),
    heliumConsumption: new Decimal(0),
    carbonProduction: new Decimal(0),
    carbonConsumption: new Decimal(0),
    ironProduction: new Decimal(0),
    pulsarShardsProduction: new Decimal(0)
  };

  // Nominal Helium rates
  if (state?.era3?.fusersEnabled && state?.era3?.fusionYield?.gt(0)) {
    let costPerYield = getFusionFuelCost(state);
    let nominalCap = getFusionCapacity(state);
    rates.hydrogenConsumption = nominalCap.times(costPerYield);
    rates.heliumProduction = nominalCap;
  }

  // Nominal Carbon and Iron rates
  if (state?.era3?.stage === "Main Sequence Star") {
    if (state?.era3?.carbonYield?.gt(0)) {
      let carbonCost = getCarbonFuelCost(state);
      let nominalCarbonCap = getCarbonCapacity(state);
      rates.heliumConsumption = nominalCarbonCap.times(carbonCost);
      rates.carbonProduction = nominalCarbonCap;
    }

    if (state?.era3?.ironYield?.gt(0) && state?.era3?.temperature?.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
      let ironCost = getIronFuelCost(state);
      let nominalIronCap = getIronCapacity(state);
      rates.carbonConsumption = nominalIronCap.times(ironCost);
      rates.ironProduction = nominalIronCap;
    }
  }

  // Pulsar Shards
  const compactLvl = state?.upgrades?.stellar?.compact?.level || 0;
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

export function getGalacticIgnitionEligibility(state) {
  const temperatureThreshold = COSMIC_REGISTRY.resources.iron.unlockTemp;
  const ironThreshold = new Decimal(1000);
  const correctEpoch = state.activeEpoch === 3;
  const temperature = state.era3?.temperature || new Decimal(0);
  const iron = state.resources?.iron?.amount || new Decimal(0);
  const requirements = [
    {
      id: 'core-temperature',
      label: 'Core Temperature',
      current: temperature,
      target: temperatureThreshold,
      unit: 'K',
      met: temperature.gte(temperatureThreshold)
    },
    {
      id: 'accumulated-iron',
      label: 'Accumulated Iron',
      current: iron,
      target: ironThreshold,
      unit: 'Fe',
      met: iron.gte(ironThreshold)
    }
  ];
  const isEligible = correctEpoch && requirements.every(requirement => requirement.met);

  return {
    isEligible,
    errorCode: correctEpoch ? (isEligible ? null : 'PREREQUISITES_NOT_MET') : 'WRONG_EPOCH',
    correctEpoch,
    temperature,
    temperatureThreshold,
    iron,
    ironThreshold,
    requirements
  };
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

  let secondRunProductionMult = 1.0;
  let secondRunStabilityMult = 1.0;

  const hbarLvl = state?.cosmicConstants?.hbar || 0;
  const hbarMult = new Decimal(1.0).plus(0.20 * hbarLvl);
  let baseStardust = new Decimal(10).plus((state?.era3?.ironYield || new Decimal(0)).times(2)).times(hbarMult);

  if (archetype === 'efficient') {
    outcome = 'white-dwarf';
    displayName = 'White Dwarf';
    reasons.push('High stability and fuel efficiency resulted in a gentle collapse.');
    stardust = baseStardust.times(1.5).floor();
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
      secondRunProductionMult,
      secondRunStabilityMult
    },
    reasons
  };
}
