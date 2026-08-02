import { gameState, setGameState, getInitialGameState, ensureStateShape } from './state.js';
import { getStardustYield, getPulsarShardYield, getSingularityMassYield, getGalacticMergeYield } from './economy.js';

import { COSMIC_REGISTRY } from '../config/registry.js';

export function triggerSupernova() {
  if (gameState.activeEpoch !== 3) return { success: false, reason: "Wrong epoch" };
  if (!gameState.resources.iron || gameState.resources.iron.amount.lt(1000)) return { success: false, reason: "Not enough iron" };

  const yieldAmt = getStardustYield();
  gameState.currencies.stardust.amount = gameState.currencies.stardust.amount.plus(yieldAmt);
  gameState.stats.totalStardust = gameState.stats.totalStardust.plus(yieldAmt);
  gameState.stats.supernovas = gameState.stats.supernovas.plus(1);
  if (!gameState.achievements.firstSupernova.unlocked) {
    gameState.achievements.firstSupernova.unlocked = true;
  }
  
  const autoStabilizer = gameState.prestige.autoStabilizer;
  const oldCards = JSON.parse(JSON.stringify(gameState.cards));
  const oldBits = gameState.currencies.bits.amount;
  const oldStardust = gameState.currencies.stardust.amount;
  const oldPulsar = gameState.currencies.pulsarShards.amount;
  const oldSingularity = gameState.currencies.singularityMass.amount;
  const totalSN = gameState.stats.supernovas;
  const maxT = gameState.stats.maxTemp;
  const totalDust = gameState.stats.totalStardust;
  const oldStats = JSON.parse(JSON.stringify(gameState.stats));
  const oldAch = JSON.parse(JSON.stringify(gameState.achievements));
  const oldArtifacts = JSON.parse(JSON.stringify(gameState.artifacts));
  const oldSettings = JSON.parse(JSON.stringify(gameState.settings));
  const oldMissions = JSON.parse(JSON.stringify(gameState.completedMissions));

  let fresh = getInitialGameState();
  fresh.activeEpoch = 3;
  fresh.activeTab = 'core';
  
  if (autoStabilizer) {
    fresh.era1 = JSON.parse(JSON.stringify(gameState.era1));
    fresh.era2 = JSON.parse(JSON.stringify(gameState.era2));
  }
  
  fresh.currencies.stardust.amount = oldStardust;
  fresh.currencies.pulsarShards.amount = oldPulsar;
  fresh.currencies.singularityMass.amount = oldSingularity;
  fresh.currencies.bits.amount = oldBits;
  fresh.stats = oldStats;
  fresh.stats.supernovas = totalSN;
  fresh.stats.maxTemp = maxT;
  fresh.stats.totalStardust = totalDust;
  fresh.achievements = oldAch;
  fresh.artifacts = oldArtifacts;
  fresh.settings = oldSettings;
  fresh.completedMissions = oldMissions;
  fresh.cards = oldCards;
  fresh.prestige.autoStabilizer = autoStabilizer;

  setGameState(fresh);
  ensureStateShape();
  
  let transitionToEra4 = false;
  if (gameState.stats.supernovas.gte(1)) {
    if (totalSN.gte(1) && !gameState.era4.act2Notified) {
      transitionToEra4 = true;
    }
  }

  return { 
    success: true, 
    events: [
      { type: "SUPERNOVA_TRIGGERED", yieldAmt: yieldAmt.toString() },
      { type: "STATE_RESET" },
      ...(transitionToEra4 ? [{ type: "ERA_TRANSITION", targetEra: 4 }] : [])
    ]
  };
}

export function triggerBigBounce() {
  if (gameState.activeEpoch !== 4) return { success: false };
  if (gameState.era4.planetaryNodes.lt(5)) return { success: false };
  
  const yieldAmt = getPulsarShardYield();
  const bitsYield = getSingularityMassYield();
  gameState.currencies.pulsarShards.amount = gameState.currencies.pulsarShards.amount.plus(yieldAmt);
  gameState.currencies.bits.amount = gameState.currencies.bits.amount.plus(bitsYield);
  
  const oldBits = gameState.currencies.bits.amount;
  const oldStardust = gameState.currencies.stardust.amount;
  const oldPulsar = gameState.currencies.pulsarShards.amount;
  const oldSingularity = gameState.currencies.singularityMass.amount;
  const oldStats = JSON.parse(JSON.stringify(gameState.stats));
  const oldAch = JSON.parse(JSON.stringify(gameState.achievements));
  const oldArtifacts = JSON.parse(JSON.stringify(gameState.artifacts));
  const oldSettings = JSON.parse(JSON.stringify(gameState.settings));
  const oldMissions = JSON.parse(JSON.stringify(gameState.completedMissions));
  const oldCards = JSON.parse(JSON.stringify(gameState.cards));
  
  let fresh = getInitialGameState();
  fresh.activeEpoch = 4;
  fresh.currencies.stardust.amount = oldStardust;
  fresh.currencies.pulsarShards.amount = oldPulsar;
  fresh.currencies.singularityMass.amount = oldSingularity;
  fresh.currencies.bits.amount = oldBits;
  fresh.stats = oldStats;
  fresh.achievements = oldAch;
  fresh.artifacts = oldArtifacts;
  fresh.settings = oldSettings;
  fresh.completedMissions = oldMissions;
  fresh.cards = oldCards;
  
  setGameState(fresh);
  ensureStateShape();
  
  return {
    success: true,
    events: [
      { type: "BIG_BOUNCE_TRIGGERED", pulsarYield: yieldAmt.toString(), bitsYield: bitsYield.toString() },
      { type: "STATE_RESET" }
    ]
  };
}

export function triggerGalacticMerge() {
  if (gameState.activeEpoch !== 5) return { success: false };
  const cost = new Decimal(1e12); // placeholder
  if (gameState.resources.planetaryDebris.amount.lt(cost)) return { success: false };
  
  const yieldAmt = getGalacticMergeYield();
  gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.sub(cost);
  gameState.currencies.singularityMass.amount = gameState.currencies.singularityMass.amount.plus(yieldAmt);
  
  return {
    success: true,
    events: [
      { type: "GALACTIC_MERGE_TRIGGERED", yieldAmt: yieldAmt.toString() }
    ]
  };
}

export function stabilizeArmsAction() {
  return { success: true, events: [{ type: "ARMS_STABILIZED" }] };
}

export function accretePlanetConfigurationAction() {
  return { success: true, events: [{ type: "PLANETS_ACCRETED" }] };
}

export function buyCelestialCardAction(key) {
  let def = COSMIC_REGISTRY.celestialCards[key];
  let state = gameState.cards[key];
  if (!def || !state) return { success: false };
  
  const currencyAmount = gameState.currencies[def.currency]?.amount || new Decimal(0);
  if (currencyAmount.lt(state.cost)) return { success: false };

  gameState.currencies[def.currency].amount = currencyAmount.sub(state.cost);
  state.level += 1;
  state.cost = state.cost.times(def.costScaling).round();
  
  return { success: true, events: [{ type: "CARD_BOUGHT", key }] };
}
