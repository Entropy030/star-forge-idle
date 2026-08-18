/* global Decimal */
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCompressionHeatYield } from '../../core/economy.js';
import {
  applyTemperatureGain,
  executeCompression,
  resolveStellarFlowStep,
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

  // 2. Continuous Stellar Reaction Flow (Hydrogen Inflow, Buffer Accretion, Fusion, Carbon & Iron Synthesis)
  const flowResult = resolveStellarFlowStep(state, dt);
  if (
    !flowResult.deltas.hydrogen.eq(0) ||
    !flowResult.deltas.helium.eq(0) ||
    !flowResult.deltas.carbon.eq(0) ||
    !flowResult.deltas.iron.eq(0)
  ) {
    state.resources.hydrogen.amount = flowResult.nextAmounts.hydrogen;
    state.resources.helium.amount = flowResult.nextAmounts.helium;
    state.resources.carbon.amount = flowResult.nextAmounts.carbon;
    state.resources.iron.amount = flowResult.nextAmounts.iron;
    anyChanged = true;
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
