import { gameState, setGameState, saveGame, getInitialGameState, ensureStateShape } from './state.js';
import { Economy, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getGalacticMergeYield, getCompressionHeatYield } from './economy.js';
import { Viewport, format, initAudio, playSupernovaSound, startEraTransition } from '../ui/viewport.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { Timeline } from './timeline.js';

export function triggerSupernova() {
  initAudio();
  if (gameState.activeEpoch !== 3) return;
  if (!gameState.resources.iron || gameState.resources.iron.amount.lt(1000)) return;

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
  playSupernovaSound();
  
  if (window.Haptics) window.Haptics.heavy();
  
  Viewport.showToast(`SUPERNOVA! Yielded ${format(yieldAmt)} Stardust.`, "success");
  saveGame();
  
  Viewport.switchTab('core');
  Timeline.reset();
  
  if (gameState.stats.supernovas.gte(1)) {
    if (totalSN.gte(1) && !gameState.era4.act2Notified) {
      startEraTransition(4, { title: "Era IV: Stellar Evolution", desc: "A new era of star formation begins." });
    } else {
      Viewport.update();
    }
  } else {
    Viewport.update();
  }
}

export function triggerBigBounce() {
  initAudio();
  if (gameState.activeEpoch !== 4) return;
  if (gameState.era4.planetaryNodes.lt(5)) return;
  
  const yieldAmt = getPulsarShardYield();
  const bitsYield = getSingularityMassYield();
  gameState.currencies.pulsarShards.amount = gameState.currencies.pulsarShards.amount.plus(yieldAmt);
  gameState.currencies.bits.amount = gameState.currencies.bits.amount.plus(bitsYield);
  
  if (window.Haptics) window.Haptics.heavy();
  Viewport.showToast(`BIG BOUNCE! Yielded ${format(yieldAmt)} Pulsar Shards and ${format(bitsYield)} bits.`, "success");
  
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
  saveGame();
  Viewport.switchTab('core');
  Timeline.reset();
  Viewport.update();
}

export function triggerGalacticMerge() {
  initAudio();
  if (gameState.activeEpoch !== 5) return;
  const cost = new Decimal(1e12); // placeholder
  if (gameState.resources.planetaryDebris.amount.lt(cost)) return;
  
  const yieldAmt = getGalacticMergeYield();
  gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.sub(cost);
  gameState.currencies.singularityMass.amount = gameState.currencies.singularityMass.amount.plus(yieldAmt);
  
  if (window.Haptics) window.Haptics.heavy();
  Viewport.showToast(`GALACTIC MERGE! Yielded ${format(yieldAmt)} Singularity Mass.`, "success");
  saveGame();
  Viewport.update();
}

export function stabilizeArms() {
  initAudio();
  Viewport.showToast(`Spiral Arms Stabilized!`, "success");
}

export function accretePlanetConfiguration() {
  initAudio();
  Viewport.showToast(`Planetary Configuration Accreted!`, "success");
}

export function buyCelestialCard(key) {
  initAudio();
  let def = COSMIC_REGISTRY.celestialCards[key];
  let state = gameState.cards[key];
  if (!def || !state) return;
  
  const currencyAmount = gameState.currencies[def.currency]?.amount || new Decimal(0);
  if (currencyAmount.lt(state.cost)) return;

  gameState.currencies[def.currency].amount = currencyAmount.sub(state.cost);
  state.level += 1;
  state.cost = state.cost.times(def.costScaling).round();
  
  Viewport.renderSystemTab();
  saveGame();
}
