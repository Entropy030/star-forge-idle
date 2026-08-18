/* global Decimal */
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../config/registry.js';

export function getInitialEra1State() {
  return {
    currentAct: 1,
    quantumFoam: 0,
    unfoldCount: 0,
    vacuumAllocation: 'BALANCED'
  };
}

export function getInitialEra2State() {
  return {
    currentAct: 1,
    starlightEnergy: 0,
    fusionStage: "H",
    plasmaFusersEnabled: false,
    posture: "BALANCE"
  };
}

export function getInitialEra3State() {
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

export function getInitialEra4State() {
  return {
    stability: new Decimal(100),
    orbitalDecayRate: new Decimal(0.8),
    planetaryNodes: new Decimal(0),
    planetaryNodeCost: new Decimal(1000),
    stellarMassPassiveCount: new Decimal(0),
    act2Notified: false,
    act3Notified: false
  };
}

export function getInitialEra5State() {
  return {
    entropy: 0.0,
    isHeatDeath: false,
    hawkingCollectors: 0,
    infoExtractors: 0
  };
}

export function getInitialCosmicConstants() {
  return {
    G: 0,
    c: 0,
    alpha: 0,
    hbar: 0
  };
}

export function createInitialState() {
  let state = {
    activeEpoch: 1,
    inflatonMultiplier: new Decimal(1),
    cosmicAge: new Decimal(0),
    history: [],
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
    upgrades: { quantum: {}, plasma: {}, stellar: {}, stardust: {}, pulsar: {}, singularity: {}, galaxy: {}, tuning: {} },
    unfold: {
      hasUnlocked1QF: false,
      hasUnlocked10QF: false,
      hasUnlocked100QF: false,
      introCompleted: false
    },
    era1: getInitialEra1State(),
    era1Collapses: 0,
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
      unlocked: [],
      modifiers: {
        productionMult: 1.0,
        costDiscount: 0.0,
        clickPassiveBoost: 0.0,
        act3Multiplier: 1.0,
        activeClickBoostSec: 0
      }
    },
    settings: {
      crtOverlay: true
    },
    // Save v17 compatibility key; authoritative only as Era I Vacuum Coherence.
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
      maxQF: new Decimal(0),
      flaresCollected: new Decimal(0)
    },
    achievements: {
      firstSupernova: { unlocked: false },
      firstIron: { unlocked: false },
      firstGalaxy: { unlocked: false },
      firstBlackHole: { unlocked: false },
      firstHawkingRadiation: { unlocked: false }
    },
    codex: {
      unlockedEntryIds: []
    },
    flares: { nextSpawnInSec: new Decimal(120), active: null },
    buffs: { fusionSurge: { remainingSec: new Decimal(0) } }
  };

  for (let category of ['quantum', 'plasma', 'stellar', 'stardust', 'pulsar', 'singularity', 'galaxy', 'era5']) {
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
  state.completedObjectives = [];
  state.cards = {};
  for (let key in COSMIC_REGISTRY.celestialCards) {
    let def = COSMIC_REGISTRY.celestialCards[key];
    state.cards[key] = { level: 0, cost: new Decimal(def.baseCost) };
  }

  return state;
}
