import { COSMIC_REGISTRY, ICONS, ARTIFACT_DEFINITIONS, t, i18n } from './config/registry.js';
import { gameState, setGameState, isDirty, setIsDirty, saveGame, exportSave, importSave, wipeSave, ensureStateShape, getInitialGameState, deserializeState, loadGame, serializeState } from './core/state.js';
import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, deduct, getStardustYield, getPulsarShardYield, getSingularityMassYield, getCardMultiplier, getBaryonAsymmetryMultiplier } from './core/economy.js';
import { ArtifactManager, Viewport, format, ActManager, initAudio, playSupernovaSound, showIntroScreenCinematic, startEraTransition } from './ui/viewport.js';
import { Templates } from './ui/templates.js';
import { Timeline, gameTick } from './core/timeline.js';
import { startAutoPlaytest, stopAutoPlaytest, runHeadlessSim, playtestHarness, getTelemetryHistory } from './core/playtestBot.js';
import { CanvasCore } from './ui/canvasCore.js';

// Re-export or attach globals needed by inline HTML (like onclick)
window.ArtifactManager = ArtifactManager;
window.triggerBigBounce = triggerBigBounce;

// ==========================================================================
// [SEC-01] THIRD-PARTY INTEGRATIONS & SHIMS
// ==========================================================================
if (typeof Decimal === 'undefined' && typeof break_infinity !== 'undefined') {
  window.Decimal = break_infinity.Decimal || break_infinity.default || break_infinity;
}

if (typeof Decimal !== 'undefined') {
  Decimal.affordGeometricSeries = function(resources, cost, ratio, currentLvl) {
    let r = new Decimal(resources);
    let c = new Decimal(cost);
    let k = new Decimal(ratio);
    if (c.lte(0) || r.lt(c)) return new Decimal(0);
    if (k.minus(1).abs().lt(1e-9)) return r.div(c).floor();
    let num = r.times(k.minus(1)).div(c).plus(1);
    if (num.lte(0)) return new Decimal(0);
    let logNum = num.log10();
    let logK = k.log10();
    if (isNaN(logNum) || isNaN(logK) || logK === 0) return r.div(c).floor();
    return logNum.div(logK).floor();
  };

  Decimal.sumGeometricSeries = function(numItems, cost, ratio, currentLvl) {
    let n = new Decimal(numItems);
    let c = new Decimal(cost);
    let k = new Decimal(ratio);
    if (n.lte(0)) return new Decimal(0);
    if (k.minus(1).abs().lt(1e-9)) return n.times(c);
    return c.times(k.pow(n).minus(1)).div(k.minus(1));
  };

  Decimal.prototype.affordGeometricSeries = function(cost, ratio, currentLvl) {
    return Decimal.affordGeometricSeries(this, cost, ratio, currentLvl);
  };
  Decimal.prototype.sumGeometricSeries = function(cost, ratio, currentLvl) {
    return Decimal.sumGeometricSeries(this, cost, ratio, currentLvl);
  };
}

// ==========================================================================
// [SEC-04] CORE DATA ACCESSORS & MUTATORS
// ==========================================================================
// getAmount and deduct are now in economy.js

// ==========================================================================
// [SEC-09] GLOBAL METRICS & PROGRESSION TRACKERS
// ==========================================================================
function updateStatsData() {
  if (gameState.era3.temperature.gt(gameState.stats.maxTemp)) {
    gameState.stats.maxTemp = gameState.era3.temperature;
  }
}

function checkAchievements() {
  if (gameState.resources.iron.amount.gte(1) && !gameState.achievements.firstIron.unlocked) {
    gameState.achievements.firstIron.unlocked = true;
    Viewport.showToast("Achievement Unlocked: Heavy Metal! (Neon Core Skin active)");
  }
  if (gameState.stats.supernovas.gte(1) && !gameState.achievements.firstSupernova.unlocked) {
    gameState.achievements.firstSupernova.unlocked = true;
    Viewport.showToast("Achievement Unlocked: Stellar Collapse!");
  }
}

function checkMissionProgress() {
  if (!COSMIC_REGISTRY.systemRanks) return;
  let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
  if (!currentRankDef) return;

  let allCompleted = true;
  for (let mission of currentRankDef.missions) {
    if (gameState.completedMissions.includes(mission.id)) continue;
    if (mission.check()) {
      gameState.completedMissions.push(mission.id);
    } else {
      allCompleted = false;
    }
  }

  if (allCompleted) {
    let nextRank = gameState.systemRank + 1;
    if (COSMIC_REGISTRY.systemRanks[nextRank]) {
      gameState.systemRank = nextRank;
    }
  }
}

// ==========================================================================
// [SEC-10] DEVELOPER SANDBOX CONTROL PROTOCOLS
// ==========================================================================
function checkDevMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('dev') === 'true') {
    const devMatrix = document.getElementById('dev-matrix');
    if (devMatrix) devMatrix.classList.remove('dev-matrix-hidden');

    const warpTag = document.getElementById('warp-tag');
    if (warpTag) warpTag.style.display = 'inline';

    const devToggle = document.getElementById('dev-toggle-container');
    if (devToggle) devToggle.classList.remove('dev-toggle-hidden');
  }
}

function toggleDevMatrix() {
  const matrix = document.getElementById('dev-matrix');
  const tag = document.getElementById('warp-tag');
  if (!matrix) return;

  if (matrix.classList.contains('dev-matrix-hidden')) {
    matrix.classList.remove('dev-matrix-hidden');
    if (tag) tag.style.display = 'inline';
    Viewport.showToast("Developer Matrix Enabled.");
  } else {
    matrix.classList.add('dev-matrix-hidden');
    if (tag) tag.style.display = 'none';
    Viewport.showToast("Developer Matrix Disabled.");
  }
}

function devQuantumWarp() {
  if (gameState.activeEpoch === 1) {
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(50000);
    gameState.resources.energyDensity.amount = gameState.resources.energyDensity.amount.plus(25000);
  } else if (gameState.activeEpoch === 2) {
    gameState.resources.quarks.amount = gameState.resources.quarks.amount.plus(25000);
    gameState.resources.gluons.amount = gameState.resources.gluons.amount.plus(20000);
    gameState.resources.leptons.amount = gameState.resources.leptons.amount.plus(15000);
    gameState.resources.protons.amount = gameState.resources.protons.amount.plus(10000);
  } else if (gameState.activeEpoch === 3) {
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(10000);
    gameState.resources.helium.amount = gameState.resources.helium.amount.plus(500);
    if (gameState.era3.stage === "Main Sequence Star") {
      gameState.resources.carbon.amount = gameState.resources.carbon.amount.plus(50);
      if (gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        gameState.resources.iron.amount = gameState.resources.iron.amount.plus(10);
      }
    }
  } else if (gameState.activeEpoch === 4) {
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(250000);
    gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.plus(10000);
    gameState.resources.darkMatter.amount = gameState.resources.darkMatter.amount.plus(5000);
  }
}

function devForceFlare() { spawnFlare(); }

function devHeatCore() {
  gameState.era3.temperature = gameState.era3.temperature.plus(25000000);
  recalcTempMultiplier();
  if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
    gameState.era3.stage = "Main Sequence Star";
  }
  updateStatsData();
}

function devSetEpoch(epochNum, callback) {
  if (COSMIC_REGISTRY.universeChronology.epochs[epochNum]) {
    gameState.activeEpoch = epochNum;
    document.body.setAttribute('data-epoch', epochNum);
    if (callback) callback();
    Viewport.showToast(`Timeline Shifted to ${COSMIC_REGISTRY.universeChronology.epochs[epochNum].name}`);
  }
}

// ==========================================================================
// [SEC-11] PRESTIGE & MACRO-TIMELINE SHIFT MILESTONES
// ==========================================================================
function triggerInflation() {
  if (gameState.resources.quantumFluctuations.amount.lt(COSMIC_REGISTRY.constants.inflationThreshold)) {
    Viewport.showToast(`Requires ${format(COSMIC_REGISTRY.constants.inflationThreshold)} Quantum Fluctuations!`);
    return;
  }

  let leftover = gameState.resources.quantumFluctuations.amount.minus(COSMIC_REGISTRY.constants.inflationThreshold);
  let bonusFactor = new Decimal(1).plus(leftover.div(100000).times(0.1));
  gameState.inflatonMultiplier = (gameState.inflatonMultiplier || new Decimal(1)).times(bonusFactor);

  startEraTransition(2, "The infinite expansion cools the temperature of space-time. The violent quantum foam condenses, binding energy variables into the first physical matter: Quarks and Gluons. We enter the Primordial Soup.", () => {
    gameState.activeEpoch = 2;
    document.body.setAttribute('data-epoch', 2);
    gameState.plasmaTemperature = new Decimal(10000000);
    gameState.cosmicAge = new Decimal(0);

    const flashElement = document.createElement('div');
    flashElement.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 99999; pointer-events: none; animation: flashEffect 1.2s forwards;";
    document.body.appendChild(flashElement);
    setTimeout(() => flashElement.remove(), 1250);

    Viewport.switchTab('core');
    saveGame();
  });
}

// ==========================================================================
// [SEC-12] PRESTIGE RECOMBINATION SHIFT & CORE REIGNITE MAP
// ==========================================================================
function triggerRecombination() {
  if (!gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) && !gameState.plasmaTemperature.lte(3000)) {
    Viewport.showToast(`Requires ${format(COSMIC_REGISTRY.constants.recombinationProtonThreshold)} Protons or cooling below 3,000 K!`);
    return;
  }

  startEraTransition(3, "The soup cools below critical recombination thresholds. Free electrons bind to protons, neutralizing the plasma. The universe becomes transparent. Under gravity, the first gas clouds collapse, igniting stellar fusion. We enter the Stellar Dawn.", () => {
    gameState.activeEpoch = 3;
    document.body.setAttribute('data-epoch', 3);

    let electronBonus = gameState.resources.electrons.amount;
    let startingHydrogen = gameState.resources.protons.amount.times(1.5).plus(electronBonus).max(250);
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(startingHydrogen);

    if (gameState.resources.antimatterResidue) {
      let residueGained = gameState.resources.protons.amount.div(1000).clampMin(1).round();
      gameState.resources.antimatterResidue.amount = gameState.resources.antimatterResidue.amount.plus(residueGained);
    }

    const flashElement = document.createElement('div');
    flashElement.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 99999; pointer-events: none; animation: flashEffect 1.5s forwards;";
    document.body.appendChild(flashElement);
    setTimeout(() => flashElement.remove(), 1550);

    Viewport.switchTab('core');
    saveGame();
  });
}

function triggerSupernova() {
  if (gameState.era3.temperature.lt(COSMIC_REGISTRY.constants.supernovaTempThreshold)) return;
  playSupernovaSound();

  let gainedStardust = getStardustYield();
  let outcome = "White Dwarf";
  let titleColor = "#ffffff";
  let extraRewardText = "";
  let shiftToEra4 = false;

  if (gameState.era3.stage === "Main Sequence Star" && gameState.era3.carbonYield.gt(0)) {
    outcome = "Neutron Star";
    titleColor = "#00cec9";
    let gainedPulsar = getPulsarShardYield();
    gameState.currencies.pulsarShards.amount = gameState.currencies.pulsarShards.amount.plus(gainedPulsar);
    extraRewardText = `<br><span style="color:#00cec9">+${format(gainedPulsar)} 🌀 Neural Synapse</span>`;
  }

  if (gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) && gameState.resources.iron.amount.gte(1000)) {
    outcome = "Black Hole";
    titleColor = "#a29bfe";
    let gainedMass = getSingularityMassYield();
    gameState.currencies.singularityMass.amount = gameState.currencies.singularityMass.amount.plus(gainedMass);
    extraRewardText += `<br><span style="color:#a29bfe">+${format(gainedMass)} 🌌 Core Density</span>`;
    shiftToEra4 = true;
  }

  gameState.currencies.stardust.amount = gameState.currencies.stardust.amount.plus(gainedStardust);
  gameState.stats.supernovas = gameState.stats.supernovas.plus(1);
  gameState.stats.totalStardust = gameState.stats.totalStardust.plus(gainedStardust);

  Viewport.showTheatrical(
    outcome,
    titleColor,
    format(gameState.era3.temperature) + " K",
    gameState.era3.ironYield.gt(0) ? "H, He, C, Fe" : (gameState.era3.carbonYield.gt(0) ? "H, He, C" : "H, He"),
    `+${format(gainedStardust)} ✨ Synaptic Dust${extraRewardText}`
  );

  if (window.playtestHarness && window.playtestHarness.isRunning) {
    closeTheatrical();
  }

  gameState.resources.hydrogen.amount = new Decimal(0);
  gameState.resources.helium.amount = new Decimal(0);
  gameState.resources.carbon.amount = new Decimal(0);
  gameState.resources.iron.amount = new Decimal(0);

  gameState.era3 = getInitialEra3State();
  gameState.flares.active = null;
  gameState.buffs.fusionSurge.remainingSec = new Decimal(0);
  gameState.flares.nextSpawnInSec = rollNextSpawnDelay();

  if (shiftToEra4) {
    startEraTransition(4, "The iron core collapses in milliseconds. Gravity overwhelms all nuclear forces. A singularity forms at the heart of the dying star, bending space-time itself. From the ashes of stellar death, gravitational waves ripple outward, seeding the cosmos with heavy elements. A new epoch begins: The Galactic Matrix.", () => {
      gameState.activeEpoch = 4;
      document.body.setAttribute('data-epoch', 4);
      Viewport.switchTab('core');
      saveGame();
    });
  }
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

  startEraTransition(1, "The universe has reached maximum entropy. Time itself loses meaning. But from the perfect stillness, a fluctuation emerges. The remnants of information seed a new beginning. The Big Bounce initiates.", () => {
    document.body.setAttribute('data-epoch', 1);
    Viewport.switchTab('core');
    setIsDirty(true);
    saveGame();
  });
}

function buyCosmicTuning(key) {
  const def = COSMIC_REGISTRY.upgrades.tuning[key];
  if (!def) return;
  
  const currentLvl = gameState.cosmicConstants[key] || 0;
  const maxLevel = def.max || def.maxLevel || 5; // registry uses 'max'
  if (currentLvl >= maxLevel) return;

  const scalingFactor = def.costScaling || def.costMult || 2;
  const cost = typeof def.baseCost === 'function' ? def.baseCost(currentLvl) : new Decimal(def.baseCost).times(Decimal.pow(scalingFactor, currentLvl));
  
  if (gameState.currencies.bits.amount.gte(cost)) {
    gameState.currencies.bits.amount = gameState.currencies.bits.amount.minus(cost);
    gameState.cosmicConstants[key] = currentLvl + 1;
    saveGame();
    Viewport.log(`Cosmic Constant Adjusted: ${def.name} -> Level ${currentLvl + 1}`);
  }
}

function triggerEraVTransition() {
  if (gameState.activeEpoch !== 4) return;
  if (gameState.resources.darkMatter.amount.lt(100000) || gameState.era4.stability.gt(20)) return;

  startEraTransition(5, "The galaxy destabilizes. The last stars burn out, leaving only black holes and dark energy. The universe enters its final act: The Heat Death.", () => {
    gameState.activeEpoch = 5;
    document.body.setAttribute('data-epoch', 5);
    Viewport.switchTab('core');
    saveGame();
  });
}

function closeTheatrical() {
  const overlay = document.getElementById('theatrical-overlay');
  if (overlay) overlay.classList.remove('theatrical-active');
  setTimeout(() => {
    const tCore = document.getElementById('theatrical-core');
    const tStats = document.getElementById('theatrical-stats');
    if (tCore) {
      tCore.style.transform = "none";
      tCore.style.background = "#fff";
      tCore.style.boxShadow = "0 0 50px 20px #fff";
    }
    if (tStats) tStats.style.opacity = "0";
  }, 1000);
}

function triggerGalacticMerge() {
  if (gameState.resources.darkMatter.amount.lt(10000)) {
    Viewport.showToast("Requires at least 10,000 Dark Matter coordinates to anchor collision vectors.");
    return;
  }

  playSupernovaSound();
  let gainedResidue = getGalacticMergeYield();
  gameState.resources.darkEnergyResidue.amount = gameState.resources.darkEnergyResidue.amount.plus(gainedResidue);

  const flashElement = document.createElement('div');
  flashElement.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 99999; pointer-events: none; animation: flashEffect 2s forwards;";
  document.body.appendChild(flashElement);
  setTimeout(() => flashElement.remove(), 2050);

  Viewport.showToast(`🌌 GALACTIC COLLISION SECURED: Earned +${format(gainedResidue)} Dark Energy Residue! Era V (Deep Future) is currently expanding in the multiverse.`);
  Viewport.switchTab('core');
  saveGame();
}

function stabilizeArms() {
  if (gameState.activeEpoch === 4) {
    gameState.era4.stability = new Decimal(100);
    Viewport.showToast("Orbital velocity profiles synchronized. Stability anchored at 100%.");
  }
}

function accretePlanetConfiguration() {
  if (gameState.activeEpoch === 4) {
    let cost = new Decimal(1000);
    if (gameState.resources.planetaryDebris.amount.gte(cost)) {
      gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.minus(cost);
      gameState.era4.planetaryNodes = gameState.era4.planetaryNodes.plus(1);
      Viewport.showToast("Planetary Debris condensed into a stable macro planetary node.");
    } else {
      Viewport.showToast(`Accretion requires ${format(cost)} Planetary Debris.`);
    }
  }
}

// ==========================================================================
// [SEC-13] CLICK & TRANSACTION UTILITY IMPLEMENTATION (RECONSTRUCTED)
// ==========================================================================
const FLOATING_TEXT_POOL_SIZE = 30;
let floatingTextPool = [];
let floatingTextPoolIndex = 0;

function initFloatingTextPool() {
  const canvas = document.querySelector('.core-canvas');
  if (!canvas) return;
  canvas.querySelectorAll('.floating-text-particle').forEach(el => el.remove());
  floatingTextPool = [];
  for (let i = 0; i < FLOATING_TEXT_POOL_SIZE; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-text-particle';
    particle.style.display = 'none';
    canvas.appendChild(particle);
    floatingTextPool.push(particle);
  }
}

function spawnFloatingText(text, color, e, offsetX = 0) {
  const canvas = document.querySelector('.core-canvas');
  if (!canvas) return;
  if (floatingTextPool.length === 0) {
    initFloatingTextPool();
  }

  const particle = floatingTextPool[floatingTextPoolIndex];
  floatingTextPoolIndex = (floatingTextPoolIndex + 1) % FLOATING_TEXT_POOL_SIZE;
  if (!particle) return;

  const cx = canvas.clientWidth / 2;
  const cy = canvas.clientHeight / 2;

  let x, y;
  if (e && e.clientX && e.clientY) {
    const rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left + offsetX;
    y = e.clientY - rect.top;
  } else {
    x = cx + offsetX;
    y = cy;
  }

  particle.textContent = text;
  particle.style.color = color || '#fff';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.display = 'block';

  particle.classList.remove('floating-text-particle');
  requestAnimationFrame(() => {
    particle.classList.add('floating-text-particle');
  });

  clearTimeout(particle._hideTimer);
  particle._hideTimer = setTimeout(() => {
    particle.style.display = 'none';
  }, 1000);
}



function clickCore(e) {
  initAudio();
  if (typeof CanvasCore !== 'undefined') {
    CanvasCore.spawnClickBurst(e ? e.clientX : null, e ? e.clientY : null, gameState ? gameState.activeEpoch : 1);
  }

  if (gameState.activeEpoch === 1) {
    if (!gameState.era1) {
      gameState.era1 = { currentAct: 1, quantumFoam: 0, vacuumCoherence: 0.0, unfoldCount: 0 };
    }
    gameState.era1.unfoldCount = (gameState.era1.unfoldCount || 0) + 1;
    if (gameState.era1.vacuumCoherence < 1.0) {
      let cMod = 1.0 - (0.08 * (gameState.cosmicConstants?.c || 0));
      gameState.era1.vacuumCoherence = Math.min(1.0, (gameState.era1.vacuumCoherence || 0) + (0.10 * cMod));
    }
    let mult = getCardMultiplier("hydrogenGen");
    let gain = new Decimal(1).times(mult);
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(gain);
    gameState.era1.quantumFoam = gameState.resources.quantumFluctuations.amount.toNumber();
    if (!gameState.unfold) gameState.unfold = {};
    if (gameState.resources.quantumFluctuations.amount.gte(1)) gameState.unfold.hasUnlocked1QF = true;
    if (gameState.resources.quantumFluctuations.amount.gte(10)) gameState.unfold.hasUnlocked10QF = true;
    if (gameState.resources.quantumFluctuations.amount.gte(100)) gameState.unfold.hasUnlocked100QF = true;
    spawnFloatingText(`+${format(gain)} Fluctuations`, 'var(--neon-teal)', e);
  }
  else if (gameState.activeEpoch === 2) {
    let asymmetry = getBaryonAsymmetryMultiplier();
    let quarkGain = new Decimal(3).times(asymmetry);
    let gluonGain = new Decimal(2).times(asymmetry);

    gameState.resources.quarks.amount = gameState.resources.quarks.amount.plus(quarkGain);
    gameState.resources.gluons.amount = gameState.resources.gluons.amount.plus(gluonGain);

    spawnFloatingText(`+${format(quarkGain)} Quarks`, '#ff7675', e, -30);
    spawnFloatingText(`+${format(gluonGain)} Gluons`, '#ffeaa7', e, 30);
  }
  else if (gameState.activeEpoch === 3) {
    gameState.era3.temperature = gameState.era3.temperature.plus(10000);
    recalcTempMultiplier();
    updateStatsData();
    spawnFloatingText(`+10,000 K`, '#fdcb6e', e);
  }
  else if (gameState.activeEpoch === 4) {
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(50);
    spawnFloatingText(`+50 Hydrogen`, '#0984e3', e);
  }

  if (gameState.artifacts && gameState.artifacts.modifiers && gameState.artifacts.modifiers.clickPassiveBoost > 0) {
    gameState.artifacts.modifiers.activeClickBoostSec = 3.0;
  }

  ActManager.evaluate();
}


function togglePlasmaFuser() {
  initAudio();
  if (gameState.era2) {
    gameState.era2.plasmaFusersEnabled = !gameState.era2.plasmaFusersEnabled;
    window.protonFusionAccumulator = 0;
  }
}

// ==========================================================================
// [SEC-14] SOLAR WEATHER & THERMODYNAMICS SIMULATION ENGINE (RECONSTRUCTED)
// ==========================================================================
function recalcTempMultiplier() {
  if (!gameState.era3 || !gameState.era3.temperature) return;
  let baseDiv = gameState.era3.temperature.div(1000000).plus(1);
  let logPrimitive = Math.log10(baseDiv.toNumber());
  gameState.era3.tempMultiplier = new Decimal(1.0 + logPrimitive);
}



function spawnFlare() {
  if (gameState.flares.active) return;
  gameState.flares.active = {
    expiresInSec: new Decimal(COSMIC_REGISTRY.solarEvents.flare.spawn.activeWindowSec || 12)
  };
  if (!flareSimSuppressed) {
    Viewport.showToast("☀️ SOLAR PROMINENCE DETECTED: Core-Turbulenz aktiv!");
  }
}

function expireFlare() {
  if (!gameState.flares.active) return;
  let penaltyPct = COSMIC_REGISTRY.solarEvents.flare.miss.tempPctOfCompression || 0.25;
  let heatSurge = getCompressionHeatYield().times(penaltyPct);

  gameState.era3.temperature = gameState.era3.temperature.plus(heatSurge);
  recalcTempMultiplier();
  updateStatsData();

  if (!flareSimSuppressed) {
    Viewport.showToast(COSMIC_REGISTRY.solarEvents.flare.miss.toast);
  }

  gameState.flares.active = null;
  gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
}

function collectFlare() {
  if (!gameState.flares.active) return;
  initAudio();

  let rewardKey = rollFlareType();
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
  Viewport.showToast(rewardDef.toast || "Flare stabilisiert!");

  gameState.flares.active = null;
  gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
}


// ==========================================================================
// [SEC-14.5] CARD TRANSACTIONS COMPONENT (NEW VERIFIED INJECTION)
// ==========================================================================
function buyCelestialCard(key) {
  initAudio();
  let def = COSMIC_REGISTRY.celestialCards[key];
  let state = gameState.cards[key];
  if (!def || !state) return;
  if (getAmount(def.currency).lt(state.cost)) return;

  deduct(def.currency, state.cost);
  state.level += 1;
  state.cost = state.cost.times(def.costScaling).round();
  Viewport.renderSystemTab();
  saveGame();
}

// ==========================================================================
// [SEC-17] SYSTEM INTEGRITY PARITY HARNESS TESTER (TABLE DRIVEN HARNESS)
// ==========================================================================
function runParityHarness() {
  console.log("--- STARTING STAR FORGE PARITY HARNESS DATA-DRIVEN SELF-TEST ---");
  let backupState = serializeState(gameState);
  let passedTests = 0;
  let failedTests = 0;

  try {
    const testCases = [
      {
        name: "Hydrogen Generation Rate",
        setup: (s) => {
          s.activeEpoch = 3;
          s.era3.gravity = new Decimal(5);
          s.era3.tempMultiplier = new Decimal(2);
          s.currencies.stardust.amount = new Decimal(0);
          s.achievements.firstSupernova.unlocked = false;
        },
        assert: () => {
          let actual = getHydrogenGenRate();
          return actual.eq(250);
        }
      },
      {
        name: "Compression Heat Yield Scaling",
        setup: (s) => {
          s.era3.compressCost = new Decimal(80);
          s.upgrades.stardust.thermalInsulation.level = 0;
          s.resources.iron.amount = new Decimal(0);
          s.upgrades.singularity.stellarIgnition.level = 0;
        },
        assert: () => {
          let actual = getCompressionHeatYield();
          let baseHeat = new Decimal(COSMIC_REGISTRY.constants.baseCompressionHeat);
          let expectedGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(getCompressionsCompleted());
          let expected = baseHeat.times(expectedGrowth).round();
          return actual.eq(expected);
        }
      },
      {
        name: "Baryon Asymmetry Multiplier calculation",
        setup: (s) => {
          s.resources.quarks.amount = new Decimal(1000);
          s.resources.gluons.amount = new Decimal(900);
        },
        assert: () => {
          let actual = getBaryonAsymmetryMultiplier();
          let logVal = new Decimal(100).log10();
          let expected = new Decimal(1).plus(new Decimal(logVal).times(0.05));
          return actual.eq(expected);
        }
      },
      {
        name: "Stardust Milestone Yield Calculations",
        setup: (s) => {
          s.era3.temperature = new Decimal(3000000);
        },
        assert: () => {
          let actual = getStardustYield();
          return actual.eq(3);
        }
      },
      {
        name: "Galactic Debris Generation Matrix",
        setup: (s) => {
          s.activeEpoch = 4;
          s.era4.planetaryNodes = new Decimal(5);
          s.era4.stellarMassPassiveCount = new Decimal(10);
          s.era4.stability = new Decimal(100);
          s.upgrades.galaxy.elementalInjection.level = 1;
        },
        assert: () => {
          let actual = getGalacticDebrisRate();
          return actual.eq(40);
        }
      }
    ];

    testCases.forEach(tc => {
      setGameState(getInitialGameState());
      tc.setup(gameState);
      if (tc.assert()) {
        console.log(`✅ TEST PASSED: [${tc.name}]`);
        passedTests++;
      } else {
        console.error(`❌ TEST FAILED: [${tc.name}] Calculations variation asymmetry.`);
        failedTests++;
      }
    });

    console.log(`--- HARNESS VERIFICATION MATRIX RESULTS: ${passedTests} PASSED, ${failedTests} FAILED ---`);
  } catch (err) {
    console.error("❌ CRITICAL EXCEPTION INSIDE TEST SUITE EXECUTION MODULE", err);
  } finally {
    setGameState(deserializeState(backupState));
  }
}

// ==========================================================================
// [SEC-18] WEATHER ARCHITECTURE (SOLAR PROMINENCES EVENTS)
// ==========================================================================
function rollNextSpawnDelay() {
  const config = COSMIC_REGISTRY.solarEvents.flare.spawn;
  const level = gameState.upgrades.stardust.flareForecasting?.level ?? 0;
  const reduction = 1 - (0.08 * level);
  return new Decimal(config.minDelaySec * reduction + Math.random() * ((config.maxDelaySec - config.minDelaySec) * reduction));
}

function rollFlareType() {
  const rewards = COSMIC_REGISTRY.solarEvents.flare.rewards;
  let validRewards = [];
  let totalWeight = 0;
  for (let key in rewards) {
    if (rewards[key].unlocked()) {
      validRewards.push({ key: key, weight: rewards[key].weight });
      totalWeight += rewards[key].weight;
    }
  }
  if (validRewards.length === 0) return null;
  let roll = Math.random() * totalWeight, cumulative = 0;
  for (let rollReward of validRewards) {
    cumulative += rollReward.weight;
    if (roll <= cumulative) return rollReward.key;
  }
  return validRewards[validRewards.length - 1].key;
}

// ==========================================================================
// [SEC-19] RUNTIME TIMERS & CORE BOOTSTRAP INITIALIZATION
// ==========================================================================
let simulationAccumulator = 0;
let lastTick = Date.now();

function renderLoop() {
  let now = Date.now();
  let dt = Math.max(0, (now - lastTick) / 1000);
  let cMod = 1.0 + (0.12 * (gameState.cosmicConstants?.c || 0));
  dt *= cMod;

  if (dt > 1.5) dt = 1.5;
  lastTick = now;

  simulationAccumulator += dt;
  if (simulationAccumulator >= 0.10) {
    gameTick(simulationAccumulator);
    simulationAccumulator = 0;

    if (isDirty) {
      try {
        Viewport.update();
      } catch (err) {
        console.error("Viewport.update() failed:", err);
      } finally {
        setIsDirty(false);
      }
    }
  }

  requestAnimationFrame(renderLoop);
}

setInterval(function () { saveGame(); }, 5000);

loadGame();
checkDevMode();
if (new URLSearchParams(window.location.search).get('dev') === 'true') {
  runParityHarness();
}
if (gameState.activeEpoch === 1 && (!gameState.unfold || !gameState.unfold.introCompleted)) {
  showIntroScreenCinematic();
}
Viewport.switchTab(gameState.activeTab);

window.addEventListener('resize', () => Viewport.syncAnchor(true));

requestAnimationFrame(renderLoop);

// ==========================================================================
// [SEC-20] IRON-CLAD DECOUPLED RUNTIME EVENT BINDING INITIALIZER
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('hydrating');
  initFloatingTextPool();
  ArtifactManager.recalculateArtifactModifiers();
  Viewport.syncAnchor(true);

  if (typeof CanvasCore !== 'undefined') {
    CanvasCore.init();
  }

  const crtActive = gameState.settings ? (gameState.settings.crtOverlay !== false) : true;
  document.body.classList.toggle('crt-enabled', crtActive);
  const crtBtn = document.getElementById('btn-toggle-crt');
  if (crtBtn) crtBtn.textContent = `Toggle CRT Retro Overlay: ${crtActive ? 'ON' : 'OFF'}`;

  document.querySelectorAll('.tab-menu .tab-btn, .side-rail .rail-btn').forEach(btn => {
    const tabId = btn.id.replace('nav-', '');
    btn.addEventListener('click', () => Viewport.switchTab(tabId));
  });

  const coreCanvas = document.querySelector('.core-canvas');
  if (coreCanvas) {
    // Use pointerdown (not 'click') so mobile gets immediate response with no 300ms delay.
    coreCanvas.addEventListener('pointerdown', (e) => {
      // Tactile scale-pulse feedback (CSS animation class, no layout reflow)
      coreCanvas.classList.remove('core-tap-active');
      requestAnimationFrame(() => {
        coreCanvas.classList.add('core-tap-active');
      });
      clickCore(e);
    });
  }

  const starCoreEl = document.getElementById('star-core') || coreCanvas;
  if (starCoreEl) {
    starCoreEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (coreCanvas) {
          coreCanvas.classList.remove('core-tap-active');
          requestAnimationFrame(() => {
            coreCanvas.classList.add('core-tap-active');
          });
        }
        clickCore(e);
      }
    });
  }

  const bindClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  bindClick('btn-toggle-crt', () => {
    if (!gameState.settings) gameState.settings = { crtOverlay: true };
    gameState.settings.crtOverlay = !gameState.settings.crtOverlay;
    const active = gameState.settings.crtOverlay;
    document.body.classList.toggle('crt-enabled', active);
    const btn = document.getElementById('btn-toggle-crt');
    if (btn) btn.textContent = `Toggle CRT Retro Overlay: ${active ? 'ON' : 'OFF'}`;
    Viewport.log(`CRT Retro Overlay set to ${active ? 'ON' : 'OFF'}`);
  });

  bindClick('btn-ai-state', window.getAIState);
  bindClick('btn-bot-start', () => {
    if (window.playtestHarness && window.playtestHarness.isRunning) {
      window.stopAutoPlaytest();
      document.getElementById('btn-bot-start').textContent = "🤖 Start Bot (10x)";
    } else if (window.startAutoPlaytest) {
      window.startAutoPlaytest({ speed: 10, logIntervalSec: 5 });
      document.getElementById('btn-bot-start').textContent = "⏹️ Stop Bot";
    }
  });
  bindClick('btn-bot-sim', () => {
    if (window.runHeadlessSim) {
      window.runHeadlessSim({ durationInGameSeconds: 3600 });
    }
  });

  bindClick('btn-inflation', triggerInflation);
  bindClick('btn-recombination', triggerRecombination);
  bindClick('btn-supernova', triggerSupernova);
  bindClick('btn-galactic-merge', triggerGalacticMerge);
  bindClick('btn-trigger-hypernova', triggerSupernova);
  bindClick('btn-stabilize-arms', stabilizeArms);
  bindClick('btn-accrete-planet', accretePlanetConfiguration);
  bindClick('btn-embrace-entropy', triggerEraVTransition);
  bindClick('btn-open-tuning', () => {
    let overlay = document.getElementById('tuning-modal');
    if (!overlay) {
      document.body.insertAdjacentHTML('beforeend', Templates.tuningModal);
      overlay = document.getElementById('tuning-modal');
      document.getElementById('close-tuning-modal').addEventListener('click', () => {
        overlay.style.display = 'none';
      });
      // Attach click handlers to the container so we can buy tuning upgrades
      document.getElementById('tuning-upgrades-list').addEventListener('click', (e) => {
        if (e.target.closest('.upgrade-btn')) {
          const btn = e.target.closest('.upgrade-btn');
          const key = btn.dataset.key;
          if (key) {
            buyCosmicTuning(key);
            Viewport.renderTuningModal();
          }
        }
      });
    }
    overlay.style.display = 'flex';
    Viewport.renderTuningModal();
  });
  bindClick('flare-button', collectFlare);
  bindClick('btn-autobuy-hydrogen', () => {
    if (!gameState.autoBuyer) gameState.autoBuyer = { hydrogen: { active: false } };
    if (!gameState.autoBuyer.hydrogen) gameState.autoBuyer.hydrogen = { active: false };
    gameState.autoBuyer.hydrogen.active = !gameState.autoBuyer.hydrogen.active;
  });


  const btnReignite = document.querySelector('.btn-reignite');
  if (btnReignite) btnReignite.addEventListener('click', closeTheatrical);

  bindClick('btn-export', exportSave);
  bindClick('btn-import', importSave);
  bindClick('btn-wipe', wipeSave);

  ['gravity', 'fuser', 'compress', 'carbon', 'iron'].forEach(key => {
    bindClick(`btn-${key}`, () => Economy.buy('core', key));
  });

  bindClick('dev-boost', devQuantumWarp);
  bindClick('dev-heat', devHeatCore);
  bindClick('dev-flare', devForceFlare);

  document.querySelectorAll('#dev-matrix button[data-set-epoch]').forEach(btn => {
    const epoch = parseInt(btn.getAttribute('data-set-epoch'), 10);
    btn.addEventListener('click', () => devSetEpoch(epoch));
  });

  const devToggleBtn = document.querySelector('.btn-dev-toggle');
  if (devToggleBtn) devToggleBtn.addEventListener('click', toggleDevMatrix);
});

// ==========================================================================
// AI PLAYTEST HARNESS
// ==========================================================================

export const getAIState = function (copyToClipboard = true) {
  const epoch = gameState.activeEpoch;

  const state = {
    meta: {
      activeEpoch: epoch,
      epochName: COSMIC_REGISTRY.universeChronology.epochs[epoch]?.name,
      activeTab: gameState.activeTab,
      coherence: gameState.coherence.toString()
    },
    resources: {},
    availableUpgrades: [],
    specialActions: {}
  };

  if (epoch === 1) {
    state.resources = {
      quantumFluctuations: gameState.resources.quantumFluctuations.amount.toString(),
      energyDensity: gameState.resources.energyDensity.amount.toString()
    };
    state.specialActions.canInflation = gameState.resources.quantumFluctuations.amount.gte(COSMIC_REGISTRY.constants.inflationThreshold);
  } else if (epoch === 2) {
    state.resources = {
      quarks: gameState.resources.quarks.amount.toString(),
      gluons: gameState.resources.gluons.amount.toString(),
      leptons: gameState.resources.leptons.amount.toString(),
      protons: gameState.resources.protons.amount.toString(),
      electrons: gameState.resources.electrons.amount.toString(),
      plasmaTemperature: gameState.plasmaTemperature.toString() + " K"
    };
    state.specialActions.canRecombination = gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || gameState.plasmaTemperature.lte(3000);
  } else if (epoch === 3) {
    state.resources = {
      hydrogen: gameState.resources.hydrogen.amount.toString(),
      helium: gameState.resources.helium.amount.toString(),
      carbon: gameState.resources.carbon.amount.toString(),
      iron: gameState.resources.iron.amount.toString(),
      stardust: gameState.currencies.stardust.amount.toString(),
      temperature: gameState.era3.temperature.toString() + " K",
      stage: gameState.era3.stage
    };
    state.yieldsActive = {
      hydrogen: true,
      helium: true,
      carbon: gameState.era3.stage === "Main Sequence Star" && gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp),
      iron: gameState.era3.stage === "Main Sequence Star" && gameState.era3.carbonYield.gt(0)
    };
    state.specialActions.canSupernova = gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    state.specialActions.hasActiveFlare = !!gameState.flares.active;
  } else if (epoch === 4 && gameState.era4) {
    state.resources = {
      planetaryDebris: gameState.resources.planetaryDebris.amount.toString(),
      darkMatter: gameState.resources.darkMatter.amount.toString(),
      darkEnergyResidue: gameState.resources.darkEnergyResidue.amount.toString(),
      stability: gameState.era4.stability.toString() + "%",
      planetaryNodes: gameState.era4.planetaryNodes.toString()
    };
    state.specialActions.canGalacticMerge = gameState.resources.darkMatter.amount.gte(10000);
  }

  const categoryMap = { 1: 'quantum', 2: 'plasma', 4: 'galaxy' };
  const currentCategory = categoryMap[epoch];

  if (currentCategory && COSMIC_REGISTRY.upgrades[currentCategory]) {
    for (let key in COSMIC_REGISTRY.upgrades[currentCategory]) {
      const def = COSMIC_REGISTRY.upgrades[currentCategory][key];
      const upgradeState = gameState.upgrades[currentCategory][key];
      const currencyKey = Economy.resolveCurrencyKey(currentCategory, key, def);
      const balance = getAmount(currencyKey);

      state.availableUpgrades.push({
        category: currentCategory,
        key: key,
        name: def.name,
        level: upgradeState.level,
        cost: upgradeState.cost.toString(),
        canAfford: balance.gte(upgradeState.cost) && (def.max === undefined || upgradeState.level < def.max)
      });
    }
  }

  // Include Stardust / Prestige Upgrades if Stardust > 0 or in Era 3+
  if (COSMIC_REGISTRY.upgrades.stardust) {
    for (let key in COSMIC_REGISTRY.upgrades.stardust) {
      const def = COSMIC_REGISTRY.upgrades.stardust[key];
      const upgradeState = gameState.upgrades.stardust[key];
      if (def && upgradeState) {
        const balance = gameState.currencies.stardust.amount;
        state.availableUpgrades.push({
          category: 'stardust',
          key: key,
          name: def.name,
          level: upgradeState.level,
          cost: upgradeState.cost.toString(),
          canAfford: balance.gte(upgradeState.cost) && (def.max === undefined || upgradeState.level < def.max)
        });
      }
    }
  }

  if (epoch === 3) {
    state.availableUpgrades.push(
      { category: 'core', key: 'gravity', name: 'Gravity', cost: gameState.era3.gravityCost.toString(), canAfford: gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost) },
      { category: 'core', key: 'compress', name: 'Compress Core', cost: gameState.era3.compressCost.toString(), canAfford: gameState.resources.helium.amount.gte(gameState.era3.compressCost) }
    );
  }

  const output = JSON.stringify(state, null, 2);
  console.log("🤖 AI State:", output);

  if (copyToClipboard) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output)
        .then(() => alert("📋 AI State kopiert!"))
        .catch(() => prompt("Kopieren fehlgeschlagen. Bitte manuell kopieren (Strg+C):", output));
    } else {
      prompt("Bitte AI State kopieren (Strg+C):", output);
    }
  }

  return state;
};

export const runAIAction = function (cmd) {
  if (!cmd || !cmd.action) return "Invalid Command";

  switch (cmd.action) {
    case "click":
      const count = cmd.count || 1;
      for (let i = 0; i < count; i++) clickCore();
      console.log(`🤖 Action: Clicked core ${count}x`);
      break;

    case "clickCore":
      clickCore();
      console.log("🤖 Action: clickCore (single)");
      break;

    case "buy":
      Economy.buy(cmd.category, cmd.key);
      console.log(`🤖 Action: Bought ${cmd.category} -> ${cmd.key}`);
      break;



    case "collectFlare":
      collectFlare();
      console.log("🤖 Action: Collected Solar Flare");
      break;

    case "triggerInflation":
      triggerInflation();
      console.log("🤖 Action: Triggered Inflation");
      break;

    case "triggerRecombination":
      triggerRecombination();
      console.log("🤖 Action: Triggered Recombination");
      break;

    case "triggerSupernova":
      triggerSupernova();
      console.log("🤖 Action: Triggered Supernova");
      break;

    case "switchTab":
      Viewport.switchTab(cmd.tab);
      console.log(`🤖 Action: Switched tab to ${cmd.tab}`);
      break;

    default:
      console.warn("🤖 Action unknown:", cmd.action);
  }
};window.Viewport = Viewport;
window.initAudio = initAudio;
