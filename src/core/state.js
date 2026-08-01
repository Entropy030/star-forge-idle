// [SEC-03] ENGINE STATE ENGINE INITIALIZATION TREE
// ==========================================================================
import { COSMIC_REGISTRY } from '../config/registry.js';
import { Viewport } from '../ui/viewport.js';
import { Timeline } from './timeline.js';

const SAVE_VERSION = 15;

function getInitialEra2State() {
  return {
    currentAct: 1,
    starlightEnergy: 0,
    fusionStage: "H",
    plasmaFusersEnabled: false
  };
}

function getInitialEra3State() {
  return {
    gravity: new Decimal(1),
    gravityCost: new Decimal(10),
    fusionYield: new Decimal(0),
    fuserCostHelium: new Decimal(5),
    fuserCostHydrogen: new Decimal(100),
    fusersEnabled: true,
    temperature: new Decimal(0),
    compressCost: new Decimal(10),
    tempMultiplier: new Decimal(1.0),
    stage: "Protostar",
    lifetimeCarbonThisRun: new Decimal(0),
    carbonYield: new Decimal(0),
    carbonCostHelium: new Decimal(500),
    carbonCostCarbon: new Decimal(5),
    ironYield: new Decimal(0),
    ironCostCarbon: new Decimal(250),
    ironCostIron: new Decimal(5)
  };
}

function getInitialEra4State() {
  return {
    stability: new Decimal(100),
    orbitalDecayRate: new Decimal(0.8),
    planetaryNodes: new Decimal(0),
    stellarMassPassiveCount: new Decimal(0),
    act2Notified: false,
    act3Notified: false
  };
}

function getInitialEra5State() {
  return {
    entropy: 0.0,
    isHeatDeath: false,
    hawkingCollectors: 0,
    infoExtractors: 0
  };
}

function getInitialCosmicConstants() {
  return {
    G: 0,
    c: 0,
    alpha: 0,
    hbar: 0
  };
}

export const getInitialGameState = function() {
  let state = {
    activeEpoch: 1,
    inflatonMultiplier: new Decimal(1),
    cosmicAge: new Decimal(0),
    plasmaTemperature: new Decimal(10000000),
    eraITemperature: new Decimal(COSMIC_REGISTRY.constants.eraIStartingTemp),
    resources: {
      quantumFluctuations: { amount: new Decimal(0) },
      energyDensity: { amount: new Decimal(0) },
      quarks: { amount: new Decimal(0) },
      gluons: { amount: new Decimal(0) },
      protons: { amount: new Decimal(0) },
      leptons: { amount: new Decimal(0) },
      electrons: { amount: new Decimal(0) },
      hydrogen: { amount: new Decimal(0) },
      helium: { amount: new Decimal(0) },
      carbon: { amount: new Decimal(0) },
      iron: { amount: new Decimal(0) },
      planetaryDebris: { amount: new Decimal(0) },
      darkMatter: { amount: new Decimal(0) },
      darkEnergyResidue: { amount: new Decimal(0) },
      antimatterResidue: { amount: new Decimal(0) }
    },
    currencies: {
      stardust: { amount: new Decimal(0) },
      pulsarShards: { amount: new Decimal(0) },
      singularityMass: { amount: new Decimal(0) },
      hawkingRadiation: { amount: new Decimal(0) },
      bits: { amount: new Decimal(0) }
    },
    upgrades: { quantum: {}, plasma: {}, stardust: {}, pulsar: {}, singularity: {}, galaxy: {}, tuning: {} },
    unfold: {
      hasUnlocked1QF: false,
      hasUnlocked10QF: false,
      hasUnlocked100QF: false,
      introCompleted: false
    },
    era1: {
      currentAct: 1,
      quantumFoam: 0,
      vacuumCoherence: 0.0,
      unfoldCount: 0
    },
    era1Act2Notified: false,
    era1Step0Logged: false,
    era1Step1Logged: false,
    era1Step2Logged: false,
    era1Step3Logged: false,
    era1Collapses: 0,
    era2Act: 1,
    era2CoolingNotified: false,
    era3CarbonNotified: false,
    era2: getInitialEra2State(),
    era3: getInitialEra3State(),
    era4: getInitialEra4State(),
    era5: getInitialEra5State(),
    cosmicConstants: getInitialCosmicConstants(),
    prestige: {
      autoStabilizer: false
    },
    artifacts: {
      equipped: [null, null, null],
      unlocked: ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"],
      modifiers: {
        productionMult: 1.0,
        costDiscount: 0.0,
        clickCoherenceBonus: 0.0,
        clickPassiveBoost: 0.0,
        act3Multiplier: 1.0,
        activeClickBoostSec: 0
      }
    },
    settings: {
      crtOverlay: true
    },
    coherence: new Decimal(0),
    activeTab: "core",
    buyMode: 1,
    autoBuyer: {
      hydrogen: { active: false }
    },
    stats: {
      supernovas: new Decimal(0),
      totalStardust: new Decimal(0),
      maxTemp: new Decimal(0),
      flaresCollected: new Decimal(0)
    },
    achievements: {
      firstSupernova: { unlocked: false },
      firstIron: { unlocked: false }
    },
    flares: { nextSpawnInSec: new Decimal(120), active: null },
    buffs: { fusionSurge: { remainingSec: new Decimal(0) } }
  };

  for (let category of ['quantum', 'plasma', 'stardust', 'pulsar', 'singularity', 'galaxy', 'era5']) {
    state.upgrades[category] = state.upgrades[category] || {};
    for (let key in COSMIC_REGISTRY.upgrades[category]) {
      let def = COSMIC_REGISTRY.upgrades[category][key];
      state.upgrades[category][key] = { level: 0, cost: new Decimal(def.baseCost) };
    }
  }
  // Tuning: state is tracked via cosmicConstants (integer levels), not upgrades slice
  // But we still seed the upgrades.tuning slice for Economy.buy() compatibility
  state.upgrades.tuning = state.upgrades.tuning || {};
  for (let key in COSMIC_REGISTRY.upgrades.tuning) {
    let def = COSMIC_REGISTRY.upgrades.tuning[key];
    state.upgrades.tuning[key] = { level: 0, cost: new Decimal(def.baseCost) };
  }

  state.systemRank = 1;
  state.completedMissions = [];
  state.cards = {};
  for (let key in COSMIC_REGISTRY.celestialCards) {
    let def = COSMIC_REGISTRY.celestialCards[key];
    state.cards[key] = { level: 0, cost: new Decimal(def.baseCost) };
  }

  return state;
}

export const createReactiveState = function(obj, onDirty) {
  if (typeof obj !== 'object' || obj === null || obj instanceof Decimal || obj.__isProxy) {
    return obj;
  }
  for (let key in obj) {
    obj[key] = createReactiveState(obj[key], onDirty);
  }
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === '__isProxy') return true;
      return target[prop];
    },
    set(target, prop, value) {
      if (target[prop] !== value) {
        target[prop] = createReactiveState(value, onDirty);
        onDirty(prop);
      }
      return true;
    }
  });
};

export let isDirty = true;
export function setIsDirty(val) {
  isDirty = val;
}
export let gameState = createReactiveState(getInitialGameState(), (prop) => {
  isDirty = true;
});
export function setGameState(newState) {
  gameState = newState;
}
export let lastTick = Date.now();
let audioCtx;
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;

export const ensureStateShape = function() {
  const initialState = getInitialGameState();
  if (!gameState.unfold) {
    gameState.unfold = { hasUnlocked1QF: false, hasUnlocked10QF: false, hasUnlocked100QF: false, introCompleted: false };
  }
  if (typeof gameState.unfold.hasUnlocked1QF !== 'boolean') gameState.unfold.hasUnlocked1QF = false;
  if (typeof gameState.unfold.hasUnlocked10QF !== 'boolean') gameState.unfold.hasUnlocked10QF = false;
  if (typeof gameState.unfold.hasUnlocked100QF !== 'boolean') gameState.unfold.hasUnlocked100QF = false;
  if (typeof gameState.unfold.introCompleted !== 'boolean') gameState.unfold.introCompleted = false;
  if (!gameState.era1) {
    gameState.era1 = { currentAct: 1, quantumFoam: 0, vacuumCoherence: 0.0, unfoldCount: 0 };
  }
  if (typeof gameState.era1.currentAct !== 'number') gameState.era1.currentAct = 1;
  if (typeof gameState.era1.quantumFoam !== 'number') gameState.era1.quantumFoam = 0;
  if (typeof gameState.era1.vacuumCoherence !== 'number') gameState.era1.vacuumCoherence = 0.0;
  if (typeof gameState.era1.unfoldCount !== 'number') gameState.era1.unfoldCount = 0;

  if (!gameState.era2 || typeof gameState.era2 !== 'object') {
    gameState.era2 = getInitialEra2State();
  }
  if (typeof gameState.era2.currentAct !== 'number') gameState.era2.currentAct = 1;
  if (typeof gameState.era2.starlightEnergy !== 'number') gameState.era2.starlightEnergy = 0;
  if (typeof gameState.era2.fusionStage !== 'string') gameState.era2.fusionStage = "H";

  if (!gameState.prestige) {
    gameState.prestige = { autoStabilizer: false };
  }
  if (typeof gameState.prestige.autoStabilizer !== 'boolean') gameState.prestige.autoStabilizer = false;

  if (!gameState.artifacts || typeof gameState.artifacts !== 'object') {
    gameState.artifacts = {
      equipped: [null, null, null],
      unlocked: ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"],
      modifiers: { productionMult: 1.0, costDiscount: 0.0, clickCoherenceBonus: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0, activeClickBoostSec: 0 }
    };
  }
  if (!Array.isArray(gameState.artifacts.equipped)) gameState.artifacts.equipped = [null, null, null];
  while (gameState.artifacts.equipped.length < 3) gameState.artifacts.equipped.push(null);
  if (!Array.isArray(gameState.artifacts.unlocked)) {
    gameState.artifacts.unlocked = ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"];
  }
  if (!gameState.artifacts.modifiers) {
    gameState.artifacts.modifiers = { productionMult: 1.0, costDiscount: 0.0, clickCoherenceBonus: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0, activeClickBoostSec: 0 };
  }

  if (typeof gameState.era1Act !== 'number') gameState.era1Act = 1;
  if (typeof gameState.era1Act2Notified !== 'boolean') gameState.era1Act2Notified = false;
  if (typeof gameState.era1Step0Logged !== 'boolean') gameState.era1Step0Logged = false;
  if (typeof gameState.era1Step1Logged !== 'boolean') gameState.era1Step1Logged = false;
  if (typeof gameState.era1Step2Logged !== 'boolean') gameState.era1Step2Logged = false;
  if (typeof gameState.era1Step3Logged !== 'boolean') gameState.era1Step3Logged = false;
  if (typeof gameState.era1Collapses !== 'number') gameState.era1Collapses = 0;
  if (typeof gameState.era2Act !== 'number') gameState.era2Act = 1;
  if (typeof gameState.era2CoolingNotified !== 'boolean') gameState.era2CoolingNotified = false;
  if (typeof gameState.era3CarbonNotified !== 'boolean') gameState.era3CarbonNotified = false;
  if (gameState.era3 === undefined) gameState.era3 = getInitialEra3State();
  if (!(gameState.era3.lifetimeCarbonThisRun instanceof Decimal)) {
    gameState.era3.lifetimeCarbonThisRun = new Decimal(gameState.era3.lifetimeCarbonThisRun || 0);
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

  for (let resKey in initialState.resources) {
    if (!gameState.resources[resKey]) {
      gameState.resources[resKey] = { amount: new Decimal(0) };
    } else if (!(gameState.resources[resKey].amount instanceof Decimal)) {
      gameState.resources[resKey].amount = new Decimal(gameState.resources[resKey].amount || 0);
    }
  }

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

  // Ensure upgrades.era5 and upgrades.tuning state slices exist
  if (!gameState.upgrades.era5) gameState.upgrades.era5 = {};
  for (let key in COSMIC_REGISTRY.upgrades.era5) {
    if (!gameState.upgrades.era5[key]) {
      gameState.upgrades.era5[key] = { level: 0, cost: new Decimal(COSMIC_REGISTRY.upgrades.era5[key].baseCost) };
    }
  }
  if (!gameState.upgrades.tuning) gameState.upgrades.tuning = {};
  for (let key in COSMIC_REGISTRY.upgrades.tuning) {
    if (!gameState.upgrades.tuning[key]) {
      gameState.upgrades.tuning[key] = { level: 0, cost: new Decimal(COSMIC_REGISTRY.upgrades.tuning[key].baseCost) };
    }
  }
}

// ==========================================================================
// [SEC-16] PERSISTENCE MIGRATION & STORAGE ENGINES
// ==========================================================================
export const serializeState = function(obj) {
  if (obj instanceof Decimal) return { __type: 'Decimal', value: obj.toString() };
  if (Array.isArray(obj)) return obj.map(serializeState);
  if (obj !== null && typeof obj === 'object') {
    let res = {};
    for (let key in obj) res[key] = serializeState(obj[key]);
    return res;
  }
  return obj;
}

export const deserializeState = function(obj) {
  if (obj !== null && typeof obj === 'object') {
    if (obj.__type === 'Decimal') return new Decimal(obj.value);
    if (Array.isArray(obj)) return obj.map(deserializeState);
    let res = {};
    for (let key in obj) res[key] = deserializeState(obj[key]);
    return res;
  }
  return obj;
}

function deepMergeMissing(target, source) {
  for (let key in source) {
    if (target[key] === undefined) {
      if (source[key] instanceof Decimal) target[key] = new Decimal(source[key]);
      else if (source[key] !== null && typeof source[key] === 'object') target[key] = deserializeState(serializeState(source[key]));
      else target[key] = source[key];
    } else if (source[key] !== null && typeof source[key] === 'object' && !(source[key] instanceof Decimal)) {
      deepMergeMissing(target[key], source[key]);
    }
  }
}

export const saveGame = function() {
  const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
  localStorage.setItem('starForgeSave_v15', JSON.stringify(saveState));
}

const MIGRATIONS = {
  13: (legacyState) => {
    let migrated = getInitialGameState();
    deepMergeMissing(migrated, legacyState);
    migrated.version = 14;
    return migrated;
  },
  14: (legacyState) => {
    let migrated = getInitialGameState();
    deepMergeMissing(migrated, legacyState);
    migrated.version = 15;
    return migrated;
  }
};

export const loadGame = function() {
  try {
    let rawData = localStorage.getItem('starForgeSave_v15') || 
                  localStorage.getItem('starForgeSave_v14') || 
                  localStorage.getItem('starForgeSave_v13') || 
                  localStorage.getItem('starForgeSave');
    if (!rawData) {
      ensureStateShape();
      document.body.setAttribute('data-epoch', gameState.activeEpoch);
      document.body.setAttribute('data-tab', gameState.activeTab);
      return;
    }

    let parsed = JSON.parse(rawData);
    if (!parsed || !parsed.gameState) {
      ensureStateShape();
      document.body.setAttribute('data-epoch', gameState.activeEpoch);
      document.body.setAttribute('data-tab', gameState.activeTab);
      return;
    }

    let stateVersion = parsed.version || 13;
    if (stateVersion < 13) stateVersion = 13; // default to generic migration for very old saves
    let loadedState = deserializeState(parsed.gameState);

    // Chain migrations sequentially
    while (stateVersion < SAVE_VERSION) {
      const migrationFn = MIGRATIONS[stateVersion];
      if (!migrationFn) break;
      loadedState = migrationFn(loadedState);
      stateVersion = loadedState.version || (stateVersion + 1);
    }

    gameState = createReactiveState(loadedState, (prop) => {
      isDirty = true;
    });
    ensureStateShape();
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);

    // Calculate offline progress
    const lastSaved = parsed.lastSavedTime || Date.now();
    const elapsedSec = Math.max(0, (Date.now() - lastSaved) / 1000);
    if (elapsedSec > 5) {
      const offlineSec = Math.min(elapsedSec, 43200); // capped at 12 hours max
      Timeline.process(offlineSec);

      const hrs = Math.floor(offlineSec / 3600);
      const mins = Math.floor((offlineSec % 3600) / 60);
      const secs = Math.floor(offlineSec % 60);
      let timeStr = "";
      if (hrs > 0) timeStr += `${hrs}h `;
      if (mins > 0 || hrs > 0) timeStr += `${mins}m `;
      timeStr += `${secs}s`;

      setTimeout(() => {
        Viewport.showToast(`✨ WELCOME BACK: Universe simulated ${timeStr} of offline cosmic progression!`);
      }, 500);
    }
  } catch (e) {
    console.error("Failed to load save:", e);
    ensureStateShape();
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
  }
}


export const exportSave = function() {
  saveGame();
  let rawData = localStorage.getItem('starForgeSave_v15');
  if (rawData) {
    let encoded = btoa(rawData);
    navigator.clipboard.writeText(encoded).then(() => Viewport.showToast("Universe encrypted to clipboard!"))
      .catch(() => Viewport.showToast("Clipboard write permission blocked."));
  }
}

export const importSave = function() {
  let input = document.getElementById('import-string').value.trim();
  if (!input) return;
  try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (parsed && parsed.version === SAVE_VERSION) {
      let temp = gameState;
      try {
        gameState = createReactiveState(deserializeState(parsed.gameState), (prop) => {
          isDirty = true;
        });
        ensureStateShape();
        localStorage.setItem('starForgeSave_v15', decoded);
        location.reload();
      } finally {
        gameState = temp;
      }
    } else { Viewport.showToast("Unsupported timeline formatting configuration."); }
  } catch (e) { Viewport.showToast("Fatal transmission verification corruption."); }
}

export function wipeSave() {
  if (confirm("Are you sure you want to reset all universe progression? This cannot be undone.")) {
    const overlay = document.getElementById('intro-screen-overlay');
    if (overlay) delete overlay.dataset.initialized;
    localStorage.removeItem('starForgeSave_v15');
    localStorage.removeItem('starForgeSave_v14');
    location.reload();
  }
}

// ==========================================================================