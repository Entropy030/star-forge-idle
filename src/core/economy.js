// [SEC-06] MATHEMATICAL MATH RULES & PRODUCTION FORMULAS

// Haptics is on window
const Haptics = window.Haptics;
// ==========================================================================
import { gameState, isDirty, setIsDirty } from './state.js';
import { saveGame } from './persistence.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { dispatchEngineCommand } from '../engine/dispatch.js';
import { getQuantumUpgradeEligibility } from '../eras/quantum/eligibility.js';
export function updateStatsData() {
  if (gameState.era3 && gameState.era3.temperature.gt(gameState.stats.maxTemp)) {
    gameState.stats.maxTemp = gameState.era3.temperature;
  }
}

export function recalcTempMultiplier() {
  if (!gameState.era3 || !gameState.era3.temperature) return;
  let baseDiv = gameState.era3.temperature.div(1000000).plus(1);
  let logPrimitive = Math.log10(baseDiv.toNumber());
  gameState.era3.tempMultiplier = new Decimal(1.0 + logPrimitive);
}

export function getMilestoneMultiplier(level) {
  let milestones = Math.floor((level || 0) / 10);
  return 1.0 + (milestones * 0.05);
}

export function getFundamentalLawSynergy(state) {
  let qUpgrades = state?.upgrades?.quantum || {};
  let validKeys = ['gravityForce', 'weakForce', 'electromagneticForce', 'vacuumResonance', 'strongForce'];
  
  let levels = [];
  for (let key of validKeys) {
    if (getQuantumUpgradeEligibility(state, key).unlocked) {
      levels.push(qUpgrades[key]?.level || 0);
    }
  }

  let currentTier = 0;
  if (levels.length > 0) {
    currentTier = Math.floor(Math.min(...levels) / 5);
  }

  if (!state.stats) state.stats = {};
  if (typeof state.stats.highestHarmony !== 'number') {
    state.stats.highestHarmony = 0;
  }
  
  if (currentTier > state.stats.highestHarmony) {
    state.stats.highestHarmony = currentTier;
  }
  
  return 1.0 + (state.stats.highestHarmony * 0.05);
}

export function getQuantumFluctuationRate(state = gameState) {
  let rate = new Decimal(0);
  for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let upgradeState = state.upgrades.quantum[key];
    if (upgradeState && upgradeState.level > 0 && def.gen) {
      let mult = getMilestoneMultiplier(upgradeState.level);
      rate = rate.plus(def.gen.times(upgradeState.level).times(mult));
    }
  }
  let artifactMult = 1.0;
  if (state.artifacts && state.artifacts.modifiers) {
    const mods = state.artifacts.modifiers;
    artifactMult *= (mods.productionMult || 1.0);
    if (state.era1 && state.era1.currentAct === 3) {
      artifactMult *= (mods.act3Multiplier || 1.0);
    }
    if (mods.activeClickBoostSec && mods.activeClickBoostSec > 0) {
      artifactMult *= (1.0 + (mods.clickPassiveBoost || 0.0));
    }
  }

  let synergyMult = getFundamentalLawSynergy(state);
  return rate.times(state.inflatonMultiplier || 1).times(artifactMult).times(synergyMult);
}

export function getEnergyDensityRate(state = gameState) {
  let rate = new Decimal(0);
  for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let upgradeState = state.upgrades.quantum[key];
    if (upgradeState && upgradeState.level > 0 && def.densityGen) {
      let mult = getMilestoneMultiplier(upgradeState.level);
      rate = rate.plus(def.densityGen.times(upgradeState.level).times(mult));
    }
  }

  let synergyMult = getFundamentalLawSynergy(state);
  return rate.times(synergyMult);
}

export function getPlasmaPassiveRates() {
  let qRate = new Decimal(0);
  let gRate = new Decimal(0);
  let lRate = new Decimal(0);
  let cRate = new Decimal(0);

  let qc = gameState.upgrades.plasma.quarkCondenser;
  if (qc && qc.level > 0) qRate = COSMIC_REGISTRY.upgrades.plasma.quarkCondenser.gen.times(qc.level);

  let gb = gameState.upgrades.plasma.gluonBinding;
  if (gb && gb.level > 0) gRate = COSMIC_REGISTRY.upgrades.plasma.gluonBinding.gen.times(gb.level);

  let lh = gameState.upgrades.plasma.leptonHarvest;
  if (lh && lh.level > 0) lRate = COSMIC_REGISTRY.upgrades.plasma.leptonHarvest.gen.times(lh.level);

  let br = gameState.upgrades.plasma.baryoRadiator;
  if (br && br.level > 0) cRate = COSMIC_REGISTRY.upgrades.plasma.baryoRadiator.cooling.times(br.level);

  return { quarks: qRate, gluons: gRate, leptons: lRate, cooling: cRate };
}

export function getProtonFusionCap() {
  let cap = new Decimal(2);
  let lh = gameState.upgrades.plasma.leptonHarvest;
  if (lh && lh.level > 0) cap = cap.plus(lh.level * 5);
  return cap;
}

export function getBaryonAsymmetryMultiplier() {
  let q = gameState.resources.quarks.amount;
  let g = gameState.resources.gluons.amount;
  if (q.eq(0) || g.eq(0)) return new Decimal(1);
  let diff = q.minus(g).abs().max(1);
  let logPrimitiveResult = diff.log10();
  return new Decimal(1).plus(new Decimal(logPrimitiveResult).times(0.05));
}

export function getCardMultiplier(target, state = gameState) {
  let mult = new Decimal(1);
  for (let key in state.cards) {
    let def = COSMIC_REGISTRY.celestialCards[key];
    let cardState = state.cards[key];
    if (def && def.effectTarget === target && cardState.level > 0) {
      mult = mult.plus(new Decimal(cardState.level).times(def.effectPerLevel));
    }
  }
  return mult;
}

export function getStardustYield() {
  const temp = gameState.era3.temperature || new Decimal(0);
  if (temp.lt(COSMIC_REGISTRY.constants.supernovaTempThreshold)) return new Decimal(0);
  
  // Base yield at 100M K: ~1
  let baseYield = temp.div(100000000);
  
  // Steep exponential scaling past 100M K: (temp / 100M K) ^ 1.6
  let exponentScaler = baseYield.pow(1.6);
  
  let hbarMod = 1.0 + (0.20 * (gameState.cosmicConstants?.hbar || 0));
  
  return exponentScaler.times(hbarMod).floor().max(1);
}

export function getPulsarShardYield() {
  const carbonTotal = gameState.era3.lifetimeCarbonThisRun.gt(0) ? gameState.era3.lifetimeCarbonThisRun : gameState.resources.carbon.amount;
  const temp = gameState.era3.temperature || new Decimal(0);
  
  if (carbonTotal.lte(0)) return new Decimal(0);
  
  // Base yield from total carbon produced this run
  let basePulsar = carbonTotal.div(100);
  
  // Steep scaling multiplier for reaching 500M K (Carbon) and 2B K (Iron)
  let tempMultiplier = new Decimal(1);
  if (temp.gte(2000000000)) {
    tempMultiplier = new Decimal(8); // 100+ total yield potential at 2B K
  } else if (temp.gte(500000000)) {
    tempMultiplier = new Decimal(3); // 15+ total yield potential at 500M K
  }
  
  return basePulsar.times(tempMultiplier).floor().max(1);
}

export function getSingularityMassYield() {
  return gameState.resources.iron.amount.div(25).floor().plus(1);
}

export function getAmount(key) {
  if (gameState.resources[key]) return gameState.resources[key].amount;
  if (gameState.currencies[key]) return gameState.currencies[key].amount;
  return new Decimal(0);
}

export function deduct(key, amount) {
  let amt = new Decimal(amount);
  if (gameState.resources[key]) {
    gameState.resources[key].amount = gameState.resources[key].amount.minus(amt);
  } else if (gameState.currencies[key]) {
    gameState.currencies[key].amount = gameState.currencies[key].amount.minus(amt);
  }
}

export function getHydrogenGenRate() {
  let gMod = 1.0 + (0.20 * (gameState.cosmicConstants?.G || 0));
  let achBaseMult = gameState.achievements.firstSupernova.unlocked ? COSMIC_REGISTRY.achievements.firstSupernova.multiplier : 1.0;
  let stardustMult = gameState.currencies.stardust.amount.times(0.5).plus(1);
  let carbonBoost = getCarbonGravityMultiplier();
  let gravityLevel = gameState.era3.gravity ? gameState.era3.gravity.toNumber() : 1;
  let milestoneMult = getMilestoneMultiplier(gravityLevel);
  let baseGen = gameState.era3.gravity.times(milestoneMult).times(carbonBoost).times(gameState.era3.tempMultiplier).times(stardustMult).times(achBaseMult).times(COSMIC_REGISTRY.resources.hydrogen.baseGen);
  let exponent = new Decimal(1).plus(new Decimal(0.05).times(gameState.upgrades.singularity.darkGravity.level));
  return baseGen.pow(exponent).times(getCardMultiplier("hydrogenGen")).times(gMod).round();
}

export function getFusionCost() {
  return new Decimal(COSMIC_REGISTRY.resources.helium.fusionCost - ((gameState.upgrades.stardust.fusionDiscount?.level ?? 0) * 2));
}

export function getCompressionScaling(state = gameState) {
  let alpha = state.cosmicConstants?.alpha || 0;
  return 1.75 + (0.03 * alpha);
}

export function getCompressionsCompleted(state = gameState) {
  let logPrimitive = state.era3.compressCost.div(10).log10();
  let exponent = logPrimitive / Math.log10(getCompressionScaling(state));
  return Math.max(0, Math.round(exponent));
}

export function getCompressionHeatYield(state = gameState) {
  let gMod = 1.0 + (0.20 * (state.cosmicConstants?.G || 0));
  let compressLevel = getCompressionsCompleted(state);
  let milestoneMult = getMilestoneMultiplier(compressLevel);
  let shopMultiplier = new Decimal(1.0 + ((state.upgrades.stardust.thermalInsulation?.level ?? 0) * 0.20));
  let ironMultiplier = state.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
  let runGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(compressLevel);
  let baseHeat = new Decimal(COSMIC_REGISTRY.constants.baseCompressionHeat).times(milestoneMult).times(shopMultiplier).times(ironMultiplier).times(runGrowth);
  let exponent = new Decimal(1).plus(new Decimal(0.05).times(state.upgrades.singularity.stellarIgnition.level));
  let finalHeat = baseHeat.pow(exponent).times(getCardMultiplier("compressionHeat", state)).times(gMod).round();
  return finalHeat;
}

export function getGravityCostMultiplier() {
  return 1.5 - ((gameState.upgrades.stardust.gravityDiscount?.level ?? 0) * 0.03);
}

export function getCarbonGravityMultiplier() {
  return gameState.resources.carbon.amount.times(0.02).plus(1);
}

export function getGalacticDebrisRate() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  let baseDebris = gameState.era4.planetaryNodes.times(3).plus(gameState.era4.stellarMassPassiveCount.times(0.5));
  let upgradeLevel = gameState.upgrades.galaxy?.elementalInjection?.level || 0;
  let multiplier = new Decimal(2).pow(upgradeLevel);
  if (gameState.upgrades.galaxy?.quasarIgnition?.level >= 1) multiplier = multiplier.times(1.30);
  let stabilityFactor = gameState.era4.stability.div(100);
  return baseDebris.times(multiplier).times(stabilityFactor).round();
}

export function getGalacticDarkMatterRate() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  let baseDM = gameState.era4.planetaryNodes.times(1.5);
  let stardustMult = gameState.currencies.stardust.amount.times(0.1).plus(1);
  if (gameState.upgrades.galaxy?.quasarIgnition?.level >= 1) stardustMult = stardustMult.times(1.30);
  return baseDM.times(stardustMult).round();
}

export function getGalacticMergeYield(state = gameState) {
  if (state.activeEpoch !== 5 && state.activeEpoch !== 4) return new Decimal(0);
  let baseYield = state.resources.darkMatter.amount.div(2500).floor().plus(1);
  const clusterLvl = state.upgrades.galaxy?.clusterLinks?.level || 0;
  if (clusterLvl > 0) {
    baseYield = baseYield.times(1.0 + 0.15 * clusterLvl).floor();
  }
  return baseYield;
}

// ==========================================================================
// [SEC-05] ERA V & PRESTIGE LOGIC
// ==========================================================================
export function processEraV(dt) {
  if (gameState.activeEpoch !== 5) return;
  if (gameState.era5.isHeatDeath) return;

  // NEW: Passive Hawking Radiation generation from Hawking Collector upgrades
  let collectorLvl = gameState.upgrades.era5?.hawkingCollector?.level || 0;
  if (collectorLvl > 0) {
    let genPerLevel = COSMIC_REGISTRY.upgrades.era5.hawkingCollector.gen || new Decimal(1);
    let hrGain = genPerLevel.times(collectorLvl).times(dt);
    gameState.resources.hawkingRadiation.amount = gameState.resources.hawkingRadiation.amount.plus(hrGain);
  }

  let cMod = 1.0 + (0.12 * (gameState.cosmicConstants?.c || 0));
  let entropyRate = new Decimal(0.5).times(cMod); // 0.5% per second base
  
  let dampenerLvl = gameState.upgrades.era5?.entropyDampener?.level || 0;
  if (dampenerLvl > 0) {
    entropyRate = entropyRate.times(1.0 - (dampenerLvl * 0.05));
  }
  gameState.era5.entropy += entropyRate.toNumber() * dt;
  if (gameState.era5.entropy >= 100) {
    gameState.era5.entropy = 100;
    gameState.era5.isHeatDeath = true;
    return; // Heat death achieved
  }

  // Passive Bits Generation
  let hr = gameState.resources.hawkingRadiation.amount;
  let infoExtractors = gameState.upgrades.era5?.infoExtractor?.level || 0;
  if (infoExtractors > 0 && hr.gte(10)) {
    let toConvert = Math.min(hr.toNumber(), infoExtractors * 10 * dt);
    deduct('hawkingRadiation', toConvert);
    const coherenceBonus = 1.0 + (gameState.coherence.toNumber() / 100) * 0.5; // up to +50% at 100% Coherence
    const compressorLvl = gameState.upgrades.era5?.bitCompressor?.level || 0;
    const compressorMult = Math.pow(1.1, compressorLvl);
    gameState.currencies.bits.amount = gameState.currencies.bits.amount.plus((toConvert / 10) * coherenceBonus * compressorMult);
  }
}

// ==========================================================================
// [SEC-04] CORE RESOURCE & ECONOMY LOGIC
// ==========================================================================
export const Economy = {
  buy(category, key) {
    if (window.initAudio) window.initAudio();
    const loops = getBuyLoopCount();

    if (category === 'core') {
      const result = dispatchEngineCommand({ type: 'BUY_CORE_NODE', payload: { key, loops } });
      this.refreshUI();
      return result;
    }

    if (category === 'quantum') {
      const result = dispatchEngineCommand({ type: 'BUY_UPGRADE', payload: { category, upgradeId: key, loops } });
      this.refreshUI();
      return result;
    }

    if (category === 'plasma') {
      const result = dispatchEngineCommand({ type: 'BUY_UPGRADE_PLASMA', payload: { category, upgradeId: key, loops } });
      this.refreshUI();
      return result;
    }

    if (category === 'galaxy') {
      const result = dispatchEngineCommand({ type: 'BUY_UPGRADE_GALAXY', payload: { category, upgradeId: key, loops } });
      this.refreshUI();
      return result;
    }

    if (category === 'era5') {
      const result = dispatchEngineCommand({ type: 'BUY_UPGRADE_ERA5', payload: { category, upgradeId: key, loops } });
      this.refreshUI();
      return result;
    }

    const registry = COSMIC_REGISTRY.upgrades[category];
    const stateGroup = gameState.upgrades[category];
    if (!registry || !stateGroup) return;

    const def = registry[key];
    const state = stateGroup[key];
    if (!def || !state) return;

    const currencyKey = this.resolveCurrencyKey(category, key, def);
    if (!currencyKey) return;

    const discount = gameState.artifacts?.modifiers?.costDiscount || 0.0;
    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && state.level >= def.max) break;
      const effectiveCost = discount > 0 ? state.cost.times(1.0 - discount).floor() : state.cost;
      if (getAmount(currencyKey).lt(effectiveCost)) {
        if (i === 0) return { success: false, cost: effectiveCost, currency: currencyKey };
        break;
      }

      deduct(currencyKey, effectiveCost);
      state.level += 1;

      if (def.costScaling) {
        state.cost = state.cost.times(def.costScaling).round();
      } else {
        state.cost = state.cost.times(2).round();
      }
    }

    this.refreshUI();
    return { success: true };
  },

  resolveCurrencyKey(category, key, def) {
    if (category === 'quantum') return 'quantumFluctuations';
    if (category === 'galaxy') return 'darkMatter';
    if (category === 'plasma') {
      if (key === 'quarkCondenser' || key === 'plasmaAutomation') return 'quarks';
      if (key === 'gluonBinding' || key === 'leptonHarvest') return 'gluons';
      return 'protons';
    }
    return def.currency;
  },

  buyCoreNodes(key, loops) {
    const loopBuy = (currencyKey, getCost, onBuy) => {
      if (getAmount(currencyKey).lt(getCost())) {
        return { success: false, cost: getCost(), currency: currencyKey };
      }
      for (let i = 0; i < loops; i++) {
        if (getAmount(currencyKey).gte(getCost())) {
          deduct(currencyKey, getCost());
          onBuy();
        } else { break; }
      }
      return { success: true };
    };

    if (key === 'gravity') {
      return loopBuy('hydrogen', () => gameState.era3.gravityCost, () => {
        gameState.era3.gravity = gameState.era3.gravity.plus(1);
        gameState.era3.gravityCost = gameState.era3.gravityCost.times(getGravityCostMultiplier()).floor();
      });
    } else if (key === 'fuser') {
      return loopBuy(gameState.era3.fusionYield.eq(0) ? 'hydrogen' : 'helium',
        () => gameState.era3.fusionYield.eq(0) ? gameState.era3.fuserCostHydrogen : gameState.era3.fuserCostHelium,
        () => {
          if (gameState.era3.fusionYield.eq(0)) {
            gameState.era3.fusionYield = new Decimal(1);
          } else {
            gameState.era3.fusionYield = gameState.era3.fusionYield.plus(1);
            gameState.era3.fuserCostHelium = gameState.era3.fuserCostHelium.times(2.5).round();
          }
        });
    } else if (key === 'compress') {
      return loopBuy('helium', () => gameState.era3.compressCost, () => {
        gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield());
        gameState.era3.compressCost = gameState.era3.compressCost.times(getCompressionScaling()).floor();
        recalcTempMultiplier();
        if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
          gameState.era3.stage = "Main Sequence Star";
        }
        updateStatsData();
      });
    } else if (key === 'carbon') {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
        return { success: false, cost: COSMIC_REGISTRY.resources.carbon.unlockTemp, currency: 'K (Main Sequence)' };
      }
      return loopBuy(gameState.era3.carbonYield.eq(0) ? 'helium' : 'carbon',
        () => gameState.era3.carbonYield.eq(0) ? gameState.era3.carbonCostHelium : gameState.era3.carbonCostCarbon,
        () => {
          if (!gameState.flags.carbonUnlocked) {
            gameState.flags.carbonUnlocked = true;
            gameState.era3.carbonYield = new Decimal(1);
            gameState.history.push({ time: gameState.totalGameTime, msg: "Nucleosynthesis Unlocked: Generating Carbon!", type: 'milestone' });
          } else {
            gameState.era3.carbonYield = gameState.era3.carbonYield.plus(1);
            gameState.era3.carbonCostCarbon = gameState.era3.carbonCostCarbon.times(2.5).round();
          }
        });
    } else if (key === 'iron') {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        return { success: false, cost: COSMIC_REGISTRY.resources.iron.unlockTemp, currency: 'K (Main Sequence)' };
      }
      return loopBuy(gameState.era3.ironYield.eq(0) ? 'carbon' : 'iron',
        () => gameState.era3.ironYield.eq(0) ? gameState.era3.ironCostCarbon : gameState.era3.ironCostIron,
        () => {
          if (!gameState.flags.ironUnlocked) {
            gameState.flags.ironUnlocked = true;
            gameState.era3.ironYield = new Decimal(1);
            gameState.history.push({ time: gameState.totalGameTime, msg: "Heavy Nucleosynthesis: Synthesizing Iron!", type: 'milestone' });
          } else {
            gameState.era3.ironYield = gameState.era3.ironYield.plus(1);
            gameState.era3.ironCostIron = gameState.era3.ironCostIron.times(2.5).round();
          }
        });
    }
    return { success: false, message: "Unknown upgrade" };
  },

  refreshUI() {
    if (gameState.activeTab === 'prestige') {
      window.Viewport.renderShop('stardust');
      window.Viewport.renderShop('pulsar');
      window.Viewport.renderShop('singularity');
    }
  }
};

// ==========================================================================

export function getBuyLoopCount() {
  if (gameState.buyMode === 'max') {
    return 10000;
  }
  return parseInt(gameState.buyMode, 10) || 1;
}

export function getBuyMultiplierCount(category, key, def, state, currencyKey) {
  let mode = gameState.buyMode;
  if (mode === 1) return 1;

  let maxBuyable = def.max !== undefined ? def.max - state.level : Infinity;
  if (maxBuyable <= 0) return 0;

  if (typeof mode === 'number') {
    return Math.min(mode, maxBuyable);
  }

  let balance = getAmount(currencyKey);
  let cost = new Decimal(state.cost);
  let scaling = new Decimal(def.costScaling || 2);

  let count = 0;
  let tempCost = new Decimal(0);
  let currentCost = new Decimal(cost);
  while (balance.gte(tempCost.plus(currentCost)) && count < maxBuyable && count < 1000) {
    tempCost = tempCost.plus(currentCost);
    currentCost = currentCost.times(scaling).round();
    count++;
  }
  return Math.max(1, count);
}

export function getCumulativeCost(stateCost, costScaling, count) {
  if (count <= 1) return new Decimal(stateCost);
  let scaling = new Decimal(costScaling || 2);
  let sum = new Decimal(0);
  let current = new Decimal(stateCost);
  for (let i = 0; i < count; i++) {
    sum = sum.plus(current);
    current = current.times(scaling).round();
  }
  return sum;
}

export function getFusionSurgeMultiplier() {
  if (gameState.buffs && gameState.buffs.fusionSurge && gameState.buffs.fusionSurge.remainingSec.gt(0)) {
    return 2;
  }
  return 1;
}
