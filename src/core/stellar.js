import { gameState } from './state.js';
import { getInitialGameState, setIsDirty } from './state.js';
import { saveGame } from './persistence.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getCompressionHeatYield, getHydrogenGenRate, recalcTempMultiplier, updateStatsData } from './economy.js';


export let autoCompressAccumulator = 0;
export let flareSimSuppressed = false;

export function setFlareSimSuppressed(val) {
  flareSimSuppressed = val;
}

export function addAutoCompressAccumulator(val) {
  autoCompressAccumulator += val;
}

export function deductAutoCompressAccumulator(val) {
  autoCompressAccumulator -= val;
}


export function rollNextSpawnDelay() {
  const config = COSMIC_REGISTRY.solarEvents.flare.spawn;
  const level = gameState.upgrades.stardust?.flareForecasting?.level ?? 0;
  const reduction = 1 - (0.08 * level);
  return new Decimal(config.minDelaySec * reduction + Math.random() * ((config.maxDelaySec - config.minDelaySec) * reduction));
}

export function rollFlareType() {
  const rewards = COSMIC_REGISTRY.solarEvents.flare.rewards;
  let validRewards = [];
  let totalWeight = 0;
  for (let key in rewards) {
    if (rewards[key].unlocked(gameState)) {
      validRewards.push({ key: key, weight: rewards[key].weight });
      totalWeight += rewards[key].weight;
    }
  }
  if (validRewards.length === 0) return null;
  let roll = Math.random() * totalWeight, cumulative = 0;
  for (let rollReward of validRewards) {
    cumulative += rollReward.weight;
    if (roll < cumulative) return rollReward.key;
  }
  return validRewards[validRewards.length - 1].key;
}

export function spawnFlare() {
  if (gameState.flares.active) return;
  gameState.flares.active = {
    expiresInSec: new Decimal(COSMIC_REGISTRY.solarEvents.flare.spawn.activeWindowSec || 12)
  };
  if (!flareSimSuppressed) {
    window.dispatchEvent(new CustomEvent('solarFlareSpawned'));
  }
}

export function expireFlare() {
  if (!gameState.flares.active) return;
  let penaltyPct = COSMIC_REGISTRY.solarEvents.flare.miss.tempPctOfCompression || 0.25;
  let heatSurge = getCompressionHeatYield().times(penaltyPct);

  gameState.era3.temperature = gameState.era3.temperature.plus(heatSurge);
  recalcTempMultiplier();
  updateStatsData();

  if (!flareSimSuppressed) {
    window.dispatchEvent(new CustomEvent('solarFlareMissed', {
      detail: { message: COSMIC_REGISTRY.solarEvents.flare.miss.toast }
    }));
  }

  gameState.flares.active = null;
  gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
}

export function collectFlare() {
  if (!gameState.flares.active) return;

  let rewardKey = rollFlareType();
  if (!rewardKey) return;
  
  let rewardDef = COSMIC_REGISTRY.solarEvents.flare.rewards[rewardKey];

  if (rewardKey === 'hydrogenSurge') {
    let currentRate = getHydrogenGenRate();
    let instantGain = currentRate.times(rewardDef.secondsOfProduction || 180);
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(instantGain);
  }
  else if (rewardKey === 'magneticSurge') {
    gameState.buffs.fusionSurge.remainingSec = new Decimal(rewardDef.buff.durationSec || 60);
  }

  gameState.stats.flaresCollected = (gameState.stats.flaresCollected || new Decimal(0)).plus(1);
  
  window.dispatchEvent(new CustomEvent('solarFlareCollected', {
    detail: { message: rewardDef.toast || "Flare stabilisiert!" }
  }));

  gameState.flares.active = null;
  gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
}


export function triggerBigBounce() {
  const savedBits = gameState.currencies.bits.amount;
  const savedConstants = JSON.parse(JSON.stringify(gameState.cosmicConstants));

  // Perform a hard reset by overwriting gameState with a clean state,
  // but keep the Bits and Cosmic Constants.
  const cleanState = getInitialGameState();
  
  // Recursively overwrite current state with clean state
  for (let key in gameState) {
    delete gameState[key];
  }
  Object.assign(gameState, cleanState);

  gameState.currencies.bits.amount = savedBits;
  gameState.cosmicConstants = savedConstants;

  window.dispatchEvent(new CustomEvent('eraTransition', { 
    detail: { 
      epoch: 1, 
      message: "The universe has reached maximum entropy. Time itself loses meaning. But from the perfect stillness, a fluctuation emerges. The remnants of information seed a new beginning. The Big Bounce initiates." 
    } 
  }));
}