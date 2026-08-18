/* global Decimal */
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCompressionHeatYield } from '../../core/economy.js';
import {
  applyTemperatureGain,
  executeCompression,
  getCarbonCapacity,
  getCarbonFuelCost,
  getFusionCapacity,
  getFusionFuelCost,
  getHydrogenProductionRate,
  getIronCapacity,
  getIronFuelCost,
  rollNextFlareSpawnDelay
} from './authority.js';

export function simulateStellarEra(state, dt, context = {}) {
  let anyChanged = false;
  state.cosmicAge = (state.cosmicAge || new Decimal(0)).plus(dt);

  // 1. Tick down transient buffs
  if (state.buffs?.fusionSurge?.remainingSec) {
    const rem = new Decimal(state.buffs.fusionSurge.remainingSec);
    if (rem.gt(0)) {
      state.buffs.fusionSurge.remainingSec = Decimal.max(0, rem.minus(dt));
    }
  }

  // 2. Hydrogen Generation (authoritative shared formula)
  const hydrogenRate = getHydrogenProductionRate(state);
  if (hydrogenRate.gt(0)) {
    state.resources.hydrogen.amount = state.resources.hydrogen.amount.plus(hydrogenRate.times(dt));
    anyChanged = true;
  }

  // 3. Auto-Fusion (Hydrogen -> Helium)
  if (state.era3?.fusersEnabled && state.era3?.fusionYield?.gt(0)) {
    const costPerYield = getFusionFuelCost(state);
    const maxPossibleFusions = state.resources.hydrogen.amount.div(costPerYield).floor();
    const nominalCapacity = getFusionCapacity(state);
    const targetFusions = Decimal.min(maxPossibleFusions, nominalCapacity.times(dt));

    if (targetFusions.gt(0)) {
      state.resources.hydrogen.amount = state.resources.hydrogen.amount.minus(targetFusions.times(costPerYield));
      state.resources.helium.amount = state.resources.helium.amount.plus(targetFusions);
      anyChanged = true;
    }
  }

  // 4. Carbon and Iron Synthesis
  if (state.era3?.stage === "Main Sequence Star") {
    if (state.era3?.carbonYield?.gt(0)) {
      const carbonCost = getCarbonFuelCost(state);
      const maxCarbon = state.resources.helium.amount.div(carbonCost).floor();
      const nominalCarbonCap = getCarbonCapacity(state);
      const targetCarbon = Decimal.min(maxCarbon, nominalCarbonCap.times(dt));

      if (targetCarbon.gt(0)) {
        state.resources.helium.amount = state.resources.helium.amount.minus(targetCarbon.times(carbonCost));
        state.resources.carbon.amount = state.resources.carbon.amount.plus(targetCarbon);
        anyChanged = true;
      }
    }

    if (state.era3?.ironYield?.gt(0) && state.era3?.temperature?.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
      const ironCost = getIronFuelCost(state);
      const maxIron = state.resources.carbon.amount.div(ironCost).floor();
      const nominalIronCap = getIronCapacity(state);
      const targetIron = Decimal.min(maxIron, nominalIronCap.times(dt));

      if (targetIron.gt(0)) {
        state.resources.carbon.amount = state.resources.carbon.amount.minus(targetIron.times(ironCost));
        state.resources.iron.amount = state.resources.iron.amount.plus(targetIron);
        anyChanged = true;
      }
    }
  }

  // 5. Compact Rewards (Live-only)
  const compactLvl = state.upgrades?.stellar?.compact?.level || 0;
  if (context.allowRandomEvents !== false && compactLvl > 0) {
    const shardChance = new Decimal(compactLvl).times(0.01).times(dt);
    if (shardChance.gt(Math.random())) {
      state.currencies.pulsarShards.amount = state.currencies.pulsarShards.amount.plus(1);
      anyChanged = true;
    }
  }

  // 6. AutoBuyer (Gravity) (Live-only)
  if (context.allowAutomation !== false && state.autoBuyer?.hydrogen?.active) {
    if (state.era3?.temperature?.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
      if (state.resources.hydrogen.amount.gte(state.era3.gravityCost)) {
        state.resources.hydrogen.amount = state.resources.hydrogen.amount.minus(state.era3.gravityCost);
        state.era3.gravity = state.era3.gravity.plus(1);
        const discount = state.upgrades?.stardust?.gravityDiscount?.level || 0;
        const scaling = 1.5 - (discount * 0.03);
        state.era3.gravityCost = state.era3.gravityCost.times(scaling).floor();
        anyChanged = true;
      }
    }
  }

  // 7. AutoCompress (Live-only deterministic accumulator)
  const autoCompressLvl = state.upgrades?.pulsar?.autoCompress?.level || 0;
  if (context.allowAutomation !== false && autoCompressLvl > 0) {
    if (!state.era3.autoCompressProgress) state.era3.autoCompressProgress = new Decimal(0);
    state.era3.autoCompressProgress = state.era3.autoCompressProgress.plus(new Decimal(autoCompressLvl).times(dt));
    const attempts = state.era3.autoCompressProgress.floor().toNumber();
    state.era3.autoCompressProgress = state.era3.autoCompressProgress.minus(attempts);
    for (let i = 0; i < attempts; i++) {
      const compResult = executeCompression(state);
      if (!compResult.success) break;
      anyChanged = true;
    }
  }

  // 8. Flares (Live-only)
  if (context.allowRandomEvents !== false && state.flares) {
    if (state.flares.active) {
      state.flares.active.expiresInSec = state.flares.active.expiresInSec.minus(dt);
      if (state.flares.active.expiresInSec.lte(0)) {
        const heatSurge = getCompressionHeatYield(state).times(COSMIC_REGISTRY.solarEvents.flare.miss.tempPctOfCompression || 0.25);
        applyTemperatureGain(state, heatSurge);
        state.flares.active = null;
        state.flares.nextSpawnInSec = rollNextFlareSpawnDelay(state);
        anyChanged = true;
      }
    } else {
      if (!state.flares.nextSpawnInSec || state.flares.nextSpawnInSec.lte(0)) {
        state.flares.nextSpawnInSec = rollNextFlareSpawnDelay(state);
      }
      state.flares.nextSpawnInSec = state.flares.nextSpawnInSec.minus(dt);
      if (state.flares.nextSpawnInSec.lte(0)) {
        const activeWindow = COSMIC_REGISTRY.solarEvents.flare.spawn.activeWindowSec || 12;
        state.flares.active = { expiresInSec: new Decimal(activeWindow) };
        anyChanged = true;
      }
    }
  }

  return { changed: anyChanged };
}
