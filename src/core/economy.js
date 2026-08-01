// [SEC-06] MATHEMATICAL MATH RULES & PRODUCTION FORMULAS
// ==========================================================================
function getMilestoneMultiplier(level) {
  let milestones = Math.floor((level || 0) / 10);
  return 1.0 + (milestones * 0.05);
}

export function getQuantumFluctuationRate() {
  let rate = new Decimal(0);
  for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (state && state.level > 0 && def.gen) {
      let mult = getMilestoneMultiplier(state.level);
      rate = rate.plus(def.gen.times(state.level).times(mult));
    }
  }
  let artifactMult = 1.0;
  if (gameState.artifacts && gameState.artifacts.modifiers) {
    const mods = gameState.artifacts.modifiers;
    artifactMult *= (mods.productionMult || 1.0);
    if (gameState.era1 && gameState.era1.currentAct === 3) {
      artifactMult *= (mods.act3Multiplier || 1.0);
    }
    if (mods.activeClickBoostSec && mods.activeClickBoostSec > 0) {
      artifactMult *= (1.0 + (mods.clickPassiveBoost || 0.0));
    }
  }

  return rate.times(gameState.inflatonMultiplier || 1).times(artifactMult);
}



function getEnergyDensityRate() {
  let rate = new Decimal(0);
  for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (state && state.level > 0 && def.densityGen) {
      let mult = getMilestoneMultiplier(state.level);
      rate = rate.plus(def.densityGen.times(state.level).times(mult));
    }
  }
  return rate;
}

function getPlasmaPassiveRates() {
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

function getBaryonAsymmetryMultiplier() {
  let q = gameState.resources.quarks.amount;
  let g = gameState.resources.gluons.amount;
  if (q.eq(0) || g.eq(0)) return new Decimal(1);
  let diff = q.minus(g).abs().max(1);
  let logPrimitiveResult = diff.log10();
  return new Decimal(1).plus(new Decimal(logPrimitiveResult).times(0.05));
}

function getCardMultiplier(target) {
  let mult = new Decimal(1);
  for (let key in gameState.cards) {
    let def = COSMIC_REGISTRY.celestialCards[key];
    let cardState = gameState.cards[key];
    if (def && def.effectTarget === target && cardState.level > 0) {
      mult = mult.plus(new Decimal(cardState.level).times(def.effectPerLevel));
    }
  }
  return mult;
}

function getStardustYield() {
  const temp = gameState.era3.temperature || new Decimal(0);
  if (temp.lt(COSMIC_REGISTRY.constants.supernovaTempThreshold)) return new Decimal(0);
  
  // Base yield at 100M K: ~1
  let baseYield = temp.div(100000000);
  
  // Steep exponential scaling past 100M K: (temp / 100M K) ^ 1.6
  let exponentScaler = baseYield.pow(1.6);
  
  let hbarMod = 1.0 + (0.20 * (gameState.cosmicConstants?.hbar || 0));
  
  return exponentScaler.times(hbarMod).floor().max(1);
}

function getPulsarShardYield() {
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

function getSingularityMassYield() {
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

function getFusionCost() {
  return new Decimal(COSMIC_REGISTRY.resources.helium.fusionCost - ((gameState.upgrades.stardust.fusionDiscount?.level ?? 0) * 2));
}

export function getCompressionScaling() {
  let alpha = gameState.cosmicConstants?.alpha || 0;
  return 1.75 + (0.03 * alpha);
}

function getCompressionsCompleted() {
  let logPrimitive = gameState.era3.compressCost.div(10).log10();
  let exponent = logPrimitive / Math.log10(getCompressionScaling());
  return Math.max(0, Math.round(exponent));
}

function getCompressionHeatYield() {
  let gMod = 1.0 + (0.20 * (gameState.cosmicConstants?.G || 0));
  let compressLevel = getCompressionsCompleted();
  let milestoneMult = getMilestoneMultiplier(compressLevel);
  let shopMultiplier = new Decimal(1.0 + ((gameState.upgrades.stardust.thermalInsulation?.level ?? 0) * 0.20));
  let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
  let runGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(compressLevel);
  let baseHeat = new Decimal(COSMIC_REGISTRY.constants.baseCompressionHeat).times(milestoneMult).times(shopMultiplier).times(ironMultiplier).times(runGrowth);
  let exponent = new Decimal(1).plus(new Decimal(0.05).times(gameState.upgrades.singularity.stellarIgnition.level));
  let finalHeat = new Decimal(baseHeat).times(milestoneMult).times(shopMultiplier).times(1).pow(exponent).times(getCardMultiplier("compressionHeat")).times(gMod).round();
  return finalHeat;
}

function getGravityCostMultiplier() {
  return 1.5 - ((gameState.upgrades.stardust.gravityDiscount?.level ?? 0) * 0.03);
}

function getCarbonGravityMultiplier() {
  return gameState.resources.carbon.amount.times(0.02).plus(1);
}

function getGalacticDebrisRate() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  let baseDebris = gameState.era4.planetaryNodes.times(3).plus(gameState.era4.stellarMassPassiveCount.times(0.5));
  let upgradeLevel = gameState.upgrades.galaxy?.elementalInjection?.level || 0;
  let multiplier = new Decimal(2).pow(upgradeLevel);
  let stabilityFactor = gameState.era4.stability.div(100);
  return baseDebris.times(multiplier).times(stabilityFactor).round();
}

function getGalacticDarkMatterRate() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  let baseDM = gameState.era4.planetaryNodes.times(1.5);
  let stardustMult = gameState.currencies.stardust.amount.times(0.1).plus(1);
  return baseDM.times(stardustMult).round();
}

function getGalacticMergeYield() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  return gameState.resources.darkMatter.amount.div(2500).floor().plus(1);
}

// ==========================================================================
// [SEC-05] ERA V & PRESTIGE LOGIC
// ==========================================================================
export function processEraV(dt) {
  if (gameState.activeEpoch !== 5) return;
  if (gameState.era5.isHeatDeath) return;

  let cMod = 1.0 + (0.12 * (gameState.cosmicConstants?.c || 0));
  let entropyRate = new Decimal(0.5).times(cMod); // 0.5% per second base
  
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
    gameState.currencies.bits.amount = gameState.currencies.bits.amount.plus(toConvert / 10);
  }
}

// ==========================================================================
// [SEC-04] CORE RESOURCE & ECONOMY LOGIC
// ==========================================================================
export const Economy = {
  buy(category, key) {
    initAudio();
    const loops = getBuyLoopCount();

    if (category === 'core') {
      this.buyCoreNodes(key, loops);
      this.refreshUI();
      return;
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
      if (getAmount(currencyKey).lt(effectiveCost)) break;

      deduct(currencyKey, effectiveCost);
      state.level += 1;

      if (def.costScaling) {
        state.cost = state.cost.times(def.costScaling).round();
      } else {
        state.cost = state.cost.times(2).round();
      }
    }

    this.refreshUI();
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
      if (getAmount(currencyKey).lt(getCost())) return;
      for (let i = 0; i < loops; i++) {
        if (getAmount(currencyKey).gte(getCost())) {
          deduct(currencyKey, getCost());
          onBuy();
        } else { break; }
      }
    };

    if (key === 'gravity') {
      loopBuy('hydrogen', () => gameState.era3.gravityCost, () => {
        gameState.era3.gravity = gameState.era3.gravity.plus(1);
        gameState.era3.gravityCost = gameState.era3.gravityCost.times(getGravityCostMultiplier()).floor();
      });
    } else if (key === 'fuser') {
      loopBuy(gameState.era3.fusionYield.eq(0) ? 'hydrogen' : 'helium',
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
      loopBuy('helium', () => gameState.era3.compressCost, () => {
        gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield());
        gameState.era3.compressCost = gameState.era3.compressCost.times(getCompressionScaling()).floor();
        recalcTempMultiplier();
        if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
          gameState.era3.stage = "Main Sequence Star";
        }
        updateStatsData();
      });
    } else if (key === 'carbon') {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) return;
      loopBuy(gameState.era3.carbonYield.eq(0) ? 'helium' : 'carbon',
        () => gameState.era3.carbonYield.eq(0) ? gameState.era3.carbonCostHelium : gameState.era3.carbonCostCarbon,
        () => {
          if (gameState.era3.carbonYield.eq(0)) {
            gameState.era3.carbonYield = new Decimal(1);
            Viewport.showToast("Nucleosynthesis Unlocked: Generating Carbon!");
          } else {
            gameState.era3.carbonYield = gameState.era3.carbonYield.plus(1);
            gameState.era3.carbonCostCarbon = gameState.era3.carbonCostCarbon.times(2.5).round();
          }
        });
    } else if (key === 'iron') {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) return;
      loopBuy(gameState.era3.ironYield.eq(0) ? 'carbon' : 'iron',
        () => gameState.era3.ironYield.eq(0) ? gameState.era3.ironCostCarbon : gameState.era3.ironCostIron,
        () => {
          if (gameState.era3.ironYield.eq(0)) {
            gameState.era3.ironYield = new Decimal(1);
            Viewport.showToast("Heavy Nucleosynthesis: Synthesizing Iron!");
          } else {
            gameState.era3.ironYield = gameState.era3.ironYield.plus(1);
            gameState.era3.ironCostIron = gameState.era3.ironCostIron.times(2.5).round();
          }
        });
    }
  },

  refreshUI() {
    if (gameState.activeTab === 'prestige') {
      Viewport.renderShop('stardust');
      Viewport.renderShop('pulsar');
      Viewport.renderShop('singularity');
    }
  }
};

// ==========================================================================