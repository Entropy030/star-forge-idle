/* global Decimal */
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../../config/registry.js';

export function getStellarSpeedMultiplier(state) {
  const massiveLvl = state?.upgrades?.stellar?.massive?.level || 0;
  let speedMult = new Decimal(1.0).plus(massiveLvl * 0.10);

  if (state?.meta?.stellarLegacyModifiers?.secondRunProductionMult) {
    speedMult = speedMult.times(state.meta.stellarLegacyModifiers.secondRunProductionMult);
  }

  if (state?.achievements?.firstSupernova?.unlocked) {
    const achMult = COSMIC_REGISTRY.achievements.firstSupernova.multiplier || 1.10;
    speedMult = speedMult.times(achMult);
  }

  return speedMult;
}

export function getAlphaMultiplier(state) {
  const alphaLvl = state?.cosmicConstants?.alpha || 0;
  return new Decimal(1.0).plus(0.30 * alphaLvl);
}

export function getAutoSynthesizeMultiplier(state) {
  const synthLvl = state?.upgrades?.pulsar?.autoSynthesize?.level || 0;
  return new Decimal(1.0).plus(1.00 * synthLvl);
}

export function getFusionSurgeMultiplier(state) {
  if (state?.buffs?.fusionSurge?.remainingSec && new Decimal(state.buffs.fusionSurge.remainingSec).gt(0)) {
    return new Decimal(2);
  }
  return new Decimal(1);
}

export function getGravityMilestoneMultiplier(gravityLevel) {
  const milestones = Math.floor(Math.max(0, gravityLevel) / 10);
  return new Decimal(1.0 + 0.05 * milestones);
}

export function getHydrogenProductionRate(state) {
  const gravity = state?.era3?.gravity || new Decimal(0);
  if (gravity.lte(0)) return new Decimal(0);

  const baseGen = new Decimal(COSMIC_REGISTRY.resources.hydrogen.baseGen || 10);
  const gravLvl = gravity.toNumber();
  const milestoneMult = getGravityMilestoneMultiplier(gravLvl);
  const speedMult = getStellarSpeedMultiplier(state);

  const structuralRate = gravity.times(baseGen).times(milestoneMult).times(speedMult);

  const darkGravityLvl = state?.upgrades?.singularity?.darkGravity?.level || 0;
  const darkGravityExponent = new Decimal(1.0).plus(0.05 * darkGravityLvl);

  const cardState = state?.cards?.quantum_stabilizer;
  const qStabilizerLvl = cardState?.level || 0;
  const cardDef = COSMIC_REGISTRY.celestialCards?.quantum_stabilizer;
  const effectPerLvl = cardDef?.effectPerLevel ?? 0.10;
  const qStabilizerMult = new Decimal(1.0).plus(effectPerLvl * qStabilizerLvl);

  const gLvl = state?.cosmicConstants?.G || 0;
  const gMult = new Decimal(1.0).plus(0.20 * gLvl);

  return structuralRate.pow(darkGravityExponent).times(qStabilizerMult).times(gMult);
}

export function getContainmentCapacity(state) {
  const inflow = getHydrogenProductionRate(state);
  return inflow.times(10);
}

export function getFusionFuelRequirement(state) {
  const discountLvl = state?.upgrades?.stardust?.fusionDiscount?.level || 0;
  const raw = Math.max(1, 10 - 2 * discountLvl);
  return new Decimal(raw);
}

export function getFusionFuelCost(state) {
  const raw = getFusionFuelRequirement(state);
  const efficientLvl = state?.upgrades?.stellar?.efficient?.level || 0;
  const fuelEfficiency = new Decimal(1.0).plus(efficientLvl * 0.10);
  return raw.div(fuelEfficiency);
}

export function getFusionCapacity(state) {
  if (!state?.era3?.fusersEnabled || !state?.era3?.fusionYield || state.era3.fusionYield.lte(0)) {
    return new Decimal(0);
  }
  return state.era3.fusionYield
    .times(getStellarSpeedMultiplier(state))
    .times(getAlphaMultiplier(state))
    .times(getTemperatureMultiplier(state))
    .times(getFusionSurgeMultiplier(state));
}

export function getCarbonFuelCost(state) {
  const efficientLvl = state?.upgrades?.stellar?.efficient?.level || 0;
  const fuelEfficiency = new Decimal(1.0).plus(efficientLvl * 0.10);
  return new Decimal(50).div(fuelEfficiency);
}

export function getCarbonCapacity(state) {
  if (
    state?.era3?.stage !== "Main Sequence Star" ||
    !state?.era3?.carbonYield ||
    state.era3.carbonYield.lte(0) ||
    !state?.era3?.temperature ||
    state.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)
  ) {
    return new Decimal(0);
  }
  return state.era3.carbonYield
    .times(getStellarSpeedMultiplier(state))
    .times(getAlphaMultiplier(state))
    .times(getAutoSynthesizeMultiplier(state))
    .times(getTemperatureMultiplier(state));
}

export function getIronFuelCost(state) {
  const efficientLvl = state?.upgrades?.stellar?.efficient?.level || 0;
  const fuelEfficiency = new Decimal(1.0).plus(efficientLvl * 0.10);
  return new Decimal(250).div(fuelEfficiency);
}

export function getIronCapacity(state) {
  if (
    state?.era3?.stage !== "Main Sequence Star" ||
    !state?.era3?.ironYield ||
    state.era3.ironYield.lte(0) ||
    !state?.era3?.temperature ||
    state.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)
  ) {
    return new Decimal(0);
  }
  const massiveLvl = state?.upgrades?.stellar?.massive?.level || 0;
  const massiveIronBonus = new Decimal(1.0).plus(massiveLvl * 0.50);
  return state.era3.ironYield
    .times(getStellarSpeedMultiplier(state))
    .times(massiveIronBonus)
    .times(getAlphaMultiplier(state))
    .times(getAutoSynthesizeMultiplier(state))
    .times(getTemperatureMultiplier(state));
}

export function getTemperatureMultiplier(state) {
  const temp = state?.era3?.temperature || new Decimal(0);
  const baseDiv = temp.div(1000000).plus(1);
  const logVal = Math.log10(Math.max(1, baseDiv.toNumber()));
  return new Decimal(1.0 + logVal);
}

export function getThermalReactionMultiplier(state) {
  return getTemperatureMultiplier(state);
}

export function resolveStellarFlowStep(state, dt) {
  const dtDec = new Decimal(dt || 0);
  if (dtDec.lte(0)) {
    const h0 = state?.resources?.hydrogen?.amount ? new Decimal(state.resources.hydrogen.amount) : new Decimal(0);
    const he0 = state?.resources?.helium?.amount ? new Decimal(state.resources.helium.amount) : new Decimal(0);
    const c0 = state?.resources?.carbon?.amount ? new Decimal(state.resources.carbon.amount) : new Decimal(0);
    const fe0 = state?.resources?.iron?.amount ? new Decimal(state.resources.iron.amount) : new Decimal(0);
    return {
      deltas: {
        hydrogen: new Decimal(0),
        helium: new Decimal(0),
        carbon: new Decimal(0),
        iron: new Decimal(0)
      },
      nextAmounts: {
        hydrogen: h0,
        helium: he0,
        carbon: c0,
        iron: fe0
      },
      flows: {
        realizedFusion: new Decimal(0),
        realizedCarbon: new Decimal(0),
        realizedIron: new Decimal(0)
      }
    };
  }

  const inflowRate = getHydrogenProductionRate(state);
  const incomingH = inflowRate.times(dtDec);
  const containmentCap = getContainmentCapacity(state);

  let currentH = state?.resources?.hydrogen?.amount ? new Decimal(state.resources.hydrogen.amount) : new Decimal(0);
  let currentHe = state?.resources?.helium?.amount ? new Decimal(state.resources.helium.amount) : new Decimal(0);
  let currentC = state?.resources?.carbon?.amount ? new Decimal(state.resources.carbon.amount) : new Decimal(0);
  let currentFe = state?.resources?.iron?.amount ? new Decimal(state.resources.iron.amount) : new Decimal(0);

  let realizedFusion = new Decimal(0);
  let realizedCarbon = new Decimal(0);
  let realizedIron = new Decimal(0);

  // 1. Hydrogen -> Helium Fusion
  if (state?.era3?.fusersEnabled && state?.era3?.fusionYield?.gt(0)) {
    const costPerYield = getFusionFuelCost(state);
    const nominalFusionCap = getFusionCapacity(state).times(dtDec);
    const totalHAvailable = incomingH.plus(currentH);
    const maxPossibleFusion = costPerYield.gt(0) ? totalHAvailable.div(costPerYield) : new Decimal(0);
    realizedFusion = Decimal.min(nominalFusionCap, maxPossibleFusion);

    const totalHConsumed = realizedFusion.times(costPerYield);
    if (incomingH.gte(totalHConsumed)) {
      const residualInflow = incomingH.minus(totalHConsumed);
      const spaceInBuffer = Decimal.max(0, containmentCap.minus(currentH));
      currentH = currentH.plus(Decimal.min(residualInflow, spaceInBuffer));
    } else {
      const drawnFromBuffer = totalHConsumed.minus(incomingH);
      currentH = Decimal.max(0, currentH.minus(drawnFromBuffer));
    }
    currentHe = currentHe.plus(realizedFusion);
  } else {
    const spaceInBuffer = Decimal.max(0, containmentCap.minus(currentH));
    currentH = currentH.plus(Decimal.min(incomingH, spaceInBuffer));
  }

  // 2. Helium -> Carbon Synthesis (Main Sequence Star & >= 500M K)
  if (
    state?.era3?.stage === "Main Sequence Star" &&
    state?.era3?.carbonYield?.gt(0) &&
    state?.era3?.temperature?.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp)
  ) {
    const carbonCost = getCarbonFuelCost(state);
    const nominalCarbonCap = getCarbonCapacity(state).times(dtDec);
    const maxPossibleCarbon = carbonCost.gt(0) ? currentHe.div(carbonCost) : new Decimal(0);
    realizedCarbon = Decimal.min(nominalCarbonCap, maxPossibleCarbon);

    if (realizedCarbon.gt(0)) {
      currentHe = Decimal.max(0, currentHe.minus(realizedCarbon.times(carbonCost)));
      currentC = currentC.plus(realizedCarbon);
    }
  }

  // 3. Carbon -> Iron Synthesis (Main Sequence Star & >= 2.0B K)
  if (
    state?.era3?.stage === "Main Sequence Star" &&
    state?.era3?.ironYield?.gt(0) &&
    state?.era3?.temperature?.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)
  ) {
    const ironCost = getIronFuelCost(state);
    const nominalIronCap = getIronCapacity(state).times(dtDec);
    const maxPossibleIron = ironCost.gt(0) ? currentC.div(ironCost) : new Decimal(0);
    realizedIron = Decimal.min(nominalIronCap, maxPossibleIron);

    if (realizedIron.gt(0)) {
      currentC = Decimal.max(0, currentC.minus(realizedIron.times(ironCost)));
      currentFe = currentFe.plus(realizedIron);
    }
  }

  const prevH = state?.resources?.hydrogen?.amount ? new Decimal(state.resources.hydrogen.amount) : new Decimal(0);
  const prevHe = state?.resources?.helium?.amount ? new Decimal(state.resources.helium.amount) : new Decimal(0);
  const prevC = state?.resources?.carbon?.amount ? new Decimal(state.resources.carbon.amount) : new Decimal(0);
  const prevFe = state?.resources?.iron?.amount ? new Decimal(state.resources.iron.amount) : new Decimal(0);

  return {
    deltas: {
      hydrogen: currentH.minus(prevH),
      helium: currentHe.minus(prevHe),
      carbon: currentC.minus(prevC),
      iron: currentFe.minus(prevFe)
    },
    nextAmounts: {
      hydrogen: currentH,
      helium: currentHe,
      carbon: currentC,
      iron: currentFe
    },
    flows: {
      realizedFusion,
      realizedCarbon,
      realizedIron
    }
  };
}

export function applyTemperatureGain(state, amount) {
  const gain = new Decimal(amount || 0);
  if (gain.lte(0)) return;

  if (!state.era3) state.era3 = {};
  state.era3.temperature = (state.era3.temperature || new Decimal(0)).plus(gain);
  state.era3.tempMultiplier = getTemperatureMultiplier(state);

  if (!state.stats) state.stats = {};
  if (!state.stats.maxTemp || state.era3.temperature.gt(state.stats.maxTemp)) {
    state.stats.maxTemp = state.era3.temperature;
  }

  if (state.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && state.era3.stage === "Protostar") {
    state.era3.stage = "Main Sequence Star";
  }
}

export function getCompressionScaling(state) {
  const alpha = state?.cosmicConstants?.alpha || 0;
  return 1.75 + (0.03 * alpha);
}

export function getCompressionsCompleted(state) {
  if (!state?.era3?.compressCost) return 0;
  const logPrimitive = state.era3.compressCost.div(10).log10();
  const exponent = logPrimitive / Math.log10(getCompressionScaling(state));
  return Math.max(0, Math.round(exponent));
}

export function getCompressionHeatYield(state) {
  const gMod = 1.0 + (0.20 * (state?.cosmicConstants?.G || 0));
  const compressLevel = getCompressionsCompleted(state);
  const milestoneMult = Math.floor(compressLevel / 10) * 0.05 + 1.0;
  const shopMultiplier = new Decimal(1.0 + ((state?.upgrades?.stardust?.thermalInsulation?.level ?? 0) * 0.20));
  const ironMultiplier = (state?.resources?.iron?.amount || new Decimal(0)).times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
  const runGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(compressLevel);
  const baseHeat = new Decimal(COSMIC_REGISTRY.constants.baseCompressionHeat).times(milestoneMult).times(shopMultiplier).times(ironMultiplier).times(runGrowth);
  const exponent = new Decimal(1).plus(new Decimal(0.05).times(state?.upgrades?.singularity?.stellarIgnition?.level || 0));

  let cardMult = new Decimal(1);
  if (state?.cards) {
    for (let key in state.cards) {
      const def = COSMIC_REGISTRY.celestialCards?.[key];
      const cardState = state.cards[key];
      if (def && def.effectTarget === "compressionHeat" && cardState?.level > 0) {
        cardMult = cardMult.plus(new Decimal(cardState.level).times(def.effectPerLevel));
      }
    }
  }

  return baseHeat.pow(exponent).times(cardMult).times(gMod).round();
}

export function executeCompression(state) {
  if (!state?.resources?.helium?.amount || !state?.era3?.compressCost) return { success: false };
  if (state.resources.helium.amount.lt(state.era3.compressCost)) return { success: false };

  state.resources.helium.amount = state.resources.helium.amount.minus(state.era3.compressCost);
  const heatGain = getCompressionHeatYield(state);
  applyTemperatureGain(state, heatGain);

  const scaling = getCompressionScaling(state);
  state.era3.compressCost = state.era3.compressCost.times(scaling).floor();

  return { success: true, heatGain };
}

export function rollNextFlareSpawnDelay(state) {
  const config = COSMIC_REGISTRY.solarEvents.flare.spawn;
  const lvl = state?.upgrades?.stardust?.flareForecasting?.level || 0;
  const reduction = Math.max(0.1, 1 - 0.08 * lvl);
  const range = config.maxDelaySec - config.minDelaySec;
  const delay = (config.minDelaySec + Math.random() * range) * reduction;
  return new Decimal(delay);
}
