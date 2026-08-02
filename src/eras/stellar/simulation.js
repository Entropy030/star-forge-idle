/* global Decimal */
import { getMilestoneMultiplier } from '../../core/economy.js';
import { COSMIC_REGISTRY } from '../../config/registry.js';

export function simulateStellarEra(state, dt) {
  let anyChanged = false;
  state.cosmicAge = (state.cosmicAge || new Decimal(0)).plus(dt);

  let efficientLvl = state.upgrades.stellar?.efficient?.level || 0;
  let massiveLvl = state.upgrades.stellar?.massive?.level || 0;
  let compactLvl = state.upgrades.stellar?.compact?.level || 0;

  // 1. Calculate build metrics
  let stability = new Decimal(100).plus(efficientLvl * 10).minus(massiveLvl * 10);
  let fuelEfficiency = new Decimal(1.0).plus(efficientLvl * 0.1);
  let speedMult = new Decimal(1.0).plus(massiveLvl * 0.1);
  
  // Completed stellar phases (based on temperature and stage)
  let phases = 1;
  if (state.era3.stage === "Main Sequence Star") phases = 2;
  if (state.era3.stage === "Red Giant" || state.era3.temperature.gte(500000000)) phases = 3;
  if (state.era3.stage === "Supernova" || state.era3.temperature.gte(1000000000)) phases = 4;

  // 2. Coherence = Stability * Fuel Efficiency * Completed Phases
  // Diminishing returns (e.g. square root or logarithmic caps)
  let rawCoherence = stability.times(fuelEfficiency).times(phases);
  // Soft cap or diminishing returns on rawCoherence
  let actualCoherence = rawCoherence.pow(0.85); // Diminishing returns
  
  if (!state.coherence.eq(actualCoherence)) {
    // Actually, coherence might be an accumulating resource or a static value?
    // In P1, coherence was passively increasing/decreasing based on temp.
    // "Replace time-based Coherence with Stability × Fuel Efficiency × completed stellar phases"
    // implies it's now a derived stat for Era 3, or it smoothly approaches it.
    // Let's set it as the target.
    let diff = actualCoherence.minus(state.coherence);
    state.coherence = state.coherence.plus(diff.times(dt).times(0.1)); // Approaches target over time
    anyChanged = true;
  }

  // 3. Stellar mechanics (from timeline.js)
  // Hydrogen Generation (Gravity node effect)
  let hydrogenRate = state.era3.gravity.times(10).times(speedMult);
  if (hydrogenRate.gt(0)) {
    state.resources.hydrogen.amount = state.resources.hydrogen.amount.plus(hydrogenRate.times(dt));
    anyChanged = true;
  }

  // Auto-Fusion (Hydrogen -> Helium)
  if (state.era3.fusersEnabled && state.era3.fusionYield.gt(0)) {
    let costPerYield = new Decimal(10).div(fuelEfficiency); // Efficient lowers cost
    let maxPossibleFusions = state.resources.hydrogen.amount.div(costPerYield).floor();
    let targetFusions = Decimal.min(maxPossibleFusions, state.era3.fusionYield.times(speedMult).times(dt));

    if (targetFusions.gt(0)) {
      state.resources.hydrogen.amount = state.resources.hydrogen.amount.minus(targetFusions.times(costPerYield));
      let heliumYield = targetFusions;
      state.resources.helium.amount = state.resources.helium.amount.plus(heliumYield);
      anyChanged = true;
    }
  }

  // Carbon and Iron Synthesis
  if (state.era3.stage === "Main Sequence Star") {
    if (state.era3.carbonYield.gt(0)) {
      let carbonCost = new Decimal(50).div(fuelEfficiency);
      let maxCarbon = state.resources.helium.amount.div(carbonCost).floor();
      let targetCarbon = Decimal.min(maxCarbon, state.era3.carbonYield.times(speedMult).times(dt));
      
      if (targetCarbon.gt(0)) {
        state.resources.helium.amount = state.resources.helium.amount.minus(targetCarbon.times(carbonCost));
        state.resources.carbon.amount = state.resources.carbon.amount.plus(targetCarbon);
        anyChanged = true;
      }
    }

    if (state.era3.ironYield.gt(0) && state.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
      let ironCost = new Decimal(250).div(fuelEfficiency);
      let maxIron = state.resources.carbon.amount.div(ironCost).floor();
      // Massive increases Iron yield significantly
      let massiveIronBonus = new Decimal(1.0).plus(massiveLvl * 0.5);
      let targetIron = Decimal.min(maxIron, state.era3.ironYield.times(speedMult).times(massiveIronBonus).times(dt));
      
      if (targetIron.gt(0)) {
        state.resources.carbon.amount = state.resources.carbon.amount.minus(targetIron.times(ironCost));
        state.resources.iron.amount = state.resources.iron.amount.plus(targetIron);
        anyChanged = true;
      }
    }
  }

  // 4. Compact Rewards
  if (compactLvl > 0) {
    let shardChance = new Decimal(compactLvl).times(0.01).times(dt);
    if (shardChance.gt(Math.random())) {
      state.currencies.pulsarShards.amount = state.currencies.pulsarShards.amount.plus(1);
      anyChanged = true;
    }
  }

  // 5. AutoBuyer (Gravity)
  if (state.autoBuyer && state.autoBuyer.hydrogen && state.autoBuyer.hydrogen.active) {
    if (state.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
      if (state.resources.hydrogen.amount.gte(state.era3.gravityCost)) {
        // Just directly buy one level instead of calling the action layer for simulation logic
        state.resources.hydrogen.amount = state.resources.hydrogen.amount.minus(state.era3.gravityCost);
        state.era3.gravity = state.era3.gravity.plus(1);
        let discount = state.upgrades.stardust?.gravityDiscount?.level || 0;
        let scaling = 1.5 - (discount * 0.03);
        state.era3.gravityCost = state.era3.gravityCost.times(scaling).floor();
        anyChanged = true;
      }
    }
  }

  // 6. AutoCompress
  let autoCompressLvl = state.upgrades.pulsar?.autoCompress?.level || 0;
  if (autoCompressLvl > 0) {
    // Actually we can just do one compression per tick if affordable, proportional to level
    let affordable = state.resources.helium.amount.gte(state.era3.compressCost);
    if (affordable && Math.random() < autoCompressLvl * dt) {
      state.resources.helium.amount = state.resources.helium.amount.minus(state.era3.compressCost);
      state.era3.temperature = state.era3.temperature.plus(100); // Simplified heat yield for now, should use getCompressionHeatYield but it relies on imports
      let alpha = state.cosmicConstants?.alpha || 0;
      let compScaling = 1.75 + (0.03 * alpha);
      state.era3.compressCost = state.era3.compressCost.times(compScaling).floor();
      if (state.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && state.era3.stage === "Protostar") {
        state.era3.stage = "Main Sequence Star";
      }
      anyChanged = true;
    }
  }

  // 7. Flares
  if (state.flares && state.flares.active) {
    state.flares.active.expiresInSec = state.flares.active.expiresInSec.minus(dt);
    if (state.flares.active.expiresInSec.lte(0)) {
      // expireFlare logic
      state.flares.active = null;
    }
  } else if (state.flares) {
    state.flares.nextSpawnInSec = state.flares.nextSpawnInSec.minus(dt);
    if (state.flares.nextSpawnInSec.lte(0)) {
      // spawnFlare logic
      state.flares.active = { expiresInSec: new Decimal(10), multiplier: new Decimal(2) };
      state.flares.nextSpawnInSec = new Decimal(60);
    }
  }

  return { changed: anyChanged };
}
