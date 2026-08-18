/* global Decimal */
import { COSMIC_REGISTRY } from '../config/registry.js';
import { createInitialState, getInitialEra1State, getInitialEra2State, getInitialEra3State, getInitialEra4State, getInitialEra5State, getInitialCosmicConstants } from './createInitialState.js';

export const ensureStateShape = function(gameState) {
  const initialState = createInitialState();
  const legacyViewAliases = {
    artifacts: 'prestige',
    cosmos: 'core',
    forge: 'upgrades',
    legacy: 'prestige',
    more: 'settings',
    system: 'settings'
  };
  gameState.activeTab = legacyViewAliases[gameState.activeTab] || gameState.activeTab || 'core';
  if (!Array.isArray(gameState.history)) {
    gameState.history = [];
  }
  if (!Array.isArray(gameState.completedObjectives)) {
    gameState.completedObjectives = [];
  }
  if (!gameState.unfold) {
    gameState.unfold = { hasUnlocked1QF: false, hasUnlocked10QF: false, hasUnlocked100QF: false, introCompleted: false };
  }
  if (!gameState.discoveries) {
    gameState.discoveries = new Set();
  }
  if (typeof gameState.unfold.hasUnlocked1QF !== 'boolean') gameState.unfold.hasUnlocked1QF = false;
  if (typeof gameState.unfold.hasUnlocked10QF !== 'boolean') gameState.unfold.hasUnlocked10QF = false;
  if (typeof gameState.unfold.hasUnlocked100QF !== 'boolean') gameState.unfold.hasUnlocked100QF = false;
  if (typeof gameState.unfold.introCompleted !== 'boolean') gameState.unfold.introCompleted = false;
  if (!gameState.era1 || typeof gameState.era1 !== 'object') {
    gameState.era1 = getInitialEra1State();
  }
  
  // Migrate legacy era1.vacuumCoherence (0-1) to state.coherence (0-100)
  if (gameState.era1 && typeof gameState.era1.vacuumCoherence === 'number') {
    if (gameState.coherence === undefined || (gameState.coherence instanceof Decimal && gameState.coherence.eq(0)) || gameState.coherence === 0) {
      gameState.coherence = new Decimal(gameState.era1.vacuumCoherence * 100);
    }
    delete gameState.era1.vacuumCoherence;
  }
  
  if (typeof gameState.era1.currentAct !== 'number') gameState.era1.currentAct = 1;
  if (typeof gameState.era1.quantumFoam !== 'number') gameState.era1.quantumFoam = 0;
  if (typeof gameState.era1.unfoldCount !== 'number') gameState.era1.unfoldCount = 0;
  const validAllocations = ['PROPAGATION', 'BALANCED', 'STABILIZATION'];
  if (!validAllocations.includes(gameState.era1.vacuumAllocation)) {
    gameState.era1.vacuumAllocation = 'BALANCED';
  }
  delete gameState.era1.asymmetryBias;

  if (!gameState.era2 || typeof gameState.era2 !== 'object') {
    gameState.era2 = getInitialEra2State();
  }
  if (typeof gameState.era2.currentAct !== 'number') gameState.era2.currentAct = 1;
  if (typeof gameState.era2.starlightEnergy !== 'number') gameState.era2.starlightEnergy = 0;
  if (typeof gameState.era2.fusionStage !== 'string') gameState.era2.fusionStage = "H";
  const validPostures = ['ACCUMULATE', 'BALANCE', 'CONDENSE'];
  if (!validPostures.includes(gameState.era2.posture)) {
    gameState.era2.posture = 'BALANCE';
  }


  if (!gameState.prestige) {
    gameState.prestige = { autoStabilizer: false };
  }
  if (typeof gameState.prestige.autoStabilizer !== 'boolean') gameState.prestige.autoStabilizer = false;

  if (!gameState.artifacts || typeof gameState.artifacts !== 'object') {
    gameState.artifacts = {
      equipped: [null, null, null],
      unlocked: ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"],
      modifiers: { productionMult: 1.0, costDiscount: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0, activeClickBoostSec: 0 }
    };
  }
  if (!Array.isArray(gameState.artifacts.equipped)) gameState.artifacts.equipped = [null, null, null];
  while (gameState.artifacts.equipped.length < 3) gameState.artifacts.equipped.push(null);
  if (!Array.isArray(gameState.artifacts.unlocked)) {
    gameState.artifacts.unlocked = ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"];
  }
  if (!gameState.artifacts.modifiers) {
    gameState.artifacts.modifiers = { productionMult: 1.0, costDiscount: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0, activeClickBoostSec: 0 };
  }

  if (typeof gameState.era1Collapses !== 'number') gameState.era1Collapses = 0;
  if (gameState.era3 === undefined) gameState.era3 = getInitialEra3State();
  if (!(gameState.era3.lifetimeCarbonThisRun instanceof Decimal)) {
    gameState.era3.lifetimeCarbonThisRun = new Decimal(gameState.era3.lifetimeCarbonThisRun || 0);
  }
  if (!gameState.era4) gameState.era4 = getInitialEra4State();
  if (!(gameState.era4.planetaryNodeCost instanceof Decimal)) {
    gameState.era4.planetaryNodeCost = new Decimal(gameState.era4.planetaryNodeCost || 1000);
  }
  if (!gameState.autoBuyer) gameState.autoBuyer = { hydrogen: { active: false } };
  if (!gameState.autoBuyer.hydrogen) gameState.autoBuyer.hydrogen = { active: false };

  if (!gameState.settings || typeof gameState.settings !== 'object') {
    gameState.settings = { crtOverlay: true };
  }
  if (typeof gameState.settings.crtOverlay !== 'boolean') {
    gameState.settings.crtOverlay = true;
  }

  if (!(gameState.coherence instanceof Decimal)) gameState.coherence = new Decimal(gameState.coherence || 0);

  if (!gameState.resources) gameState.resources = {};
  for (let resKey in initialState.resources) {
    if (!gameState.resources[resKey]) {
      gameState.resources[resKey] = { amount: new Decimal(0) };
    } else if (!(gameState.resources[resKey].amount instanceof Decimal)) {
      gameState.resources[resKey].amount = new Decimal(gameState.resources[resKey].amount || 0);
    }
  }
  delete gameState.resources.annihilationEnergy;
  delete gameState.resources.survivingMatter;

  for (let curKey in initialState.currencies) {
    if (!gameState.currencies[curKey]) {
      gameState.currencies[curKey] = { amount: new Decimal(0) };
    } else if (!(gameState.currencies[curKey].amount instanceof Decimal)) {
      gameState.currencies[curKey].amount = new Decimal(gameState.currencies[curKey].amount || 0);
    }
  }
  // Ensure era5 state exists (added in later version)
  if (!gameState.era5 || typeof gameState.era5 !== 'object') {
    gameState.era5 = getInitialEra5State();
  }
  if (typeof gameState.era5.entropy !== 'number') gameState.era5.entropy = 0;
  if (typeof gameState.era5.isHeatDeath !== 'boolean') gameState.era5.isHeatDeath = false;
  if (typeof gameState.era5.hawkingCollectors !== 'number') gameState.era5.hawkingCollectors = 0;
  if (typeof gameState.era5.infoExtractors !== 'number') gameState.era5.infoExtractors = 0;

  // Ensure cosmicConstants exists (added in later version)
  if (!gameState.cosmicConstants || typeof gameState.cosmicConstants !== 'object') {
    gameState.cosmicConstants = getInitialCosmicConstants();
  }
  for (let k of ['G', 'c', 'alpha', 'hbar']) {
    if (typeof gameState.cosmicConstants[k] !== 'number') gameState.cosmicConstants[k] = 0;
  }

  // Ensure every upgrade category and key from the registry exists in state
  // (covers both brand-new categories and new keys added to existing categories)
  for (let category in COSMIC_REGISTRY.upgrades) {
    if (!gameState.upgrades[category]) gameState.upgrades[category] = {};
    for (let key in COSMIC_REGISTRY.upgrades[category]) {
      if (!gameState.upgrades[category][key]) {
        const def = COSMIC_REGISTRY.upgrades[category][key];
        gameState.upgrades[category][key] = { level: 0, cost: new Decimal(def.baseCost) };
      }
    }
  }

  
  // Fix chicken-and-egg for Hawking Collectors
  if (gameState.activeEpoch >= 5 && gameState.upgrades.era5?.hawkingCollector?.level === 0) {
    if (gameState.era5.hawkingCollectors === 0 || gameState.era5.hawkingCollectors === undefined) {
      gameState.upgrades.era5.hawkingCollector.level = 1;
    }
  }
}
