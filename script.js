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
// [SEC-01.5] CENTRAL i18n DICTIONARY ARCHITECTURE
// ==========================================================================
const i18n = {
  en: {
    log_era1_initial: "t=0.000... ░▒▓ E-R-R-O-R ▓▒░ I have mass. I am severed from nothingness. The first fluctuation pierces the void.",
    toast_superposition_unlock: "Critical Energy Density Reached! Wave functions collapse. Quantum Superposition has awakened!",
    toast_era1_to_era2: "Era II: The Primordial Soup begins. Energy cools. Quarks form building blocks, glued together by Gluons.",
    toast_plasma_cooling: "Plasma Cooling Successful (3,000 K)! Recombination releases free electrons to form primordial atoms.",
    toast_carbon_synthesis: "Carbon Synthesis Initiated (500M K)! The Triple-Alpha Process ignites. The path to the 2B K Iron Core is open!",
    baryon_asymmetry_label: "Baryon Asymmetry (+{val}%)",
    baryon_asymmetry_tooltip: "A subtle imbalance—the dominance of matter over antimatter—serves as a catalyst for your yield.",
    milestone_tooltip: "Next Milestone (Lvl {lvl}): +5% Global Yield",
    autobuy_hydrogen: "[ Auto-Buy Hydrogen: {state} ]",
    gateway_title: "GALACTIC IGNITION (ERA IV GATEWAY)",
    gateway_req_temp: "Core Temperature: >= 2,000M K (2.0B K)",
    gateway_req_iron: "Accumulated Iron: >= 1,000 Fe",
    gateway_btn: "[ Trigger Hypernova & Enter Era IV ]",
    header_stellar_core: "STELLAR CORE INFRASTRUCTURE",
    header_prestige_stardust: "Synaptic Dust Infusion Matrix",
    header_prestige_pulsar: "Neural Synapse Resonator",
    header_prestige_singularity: "Core Density Event Horizon",
    header_galactic_accretion: "MACRO GALACTIC ACCRETION NETWORK",
    btn_supernova_ready: "Trigger Supernova Collapse",
    btn_supernova_locked: "Requires 100M K (Current: {temp} K)",
    label_quantum_fluctuations: "QUANTUM FLUCTUATIONS",
    label_energy_density: "ENERGY DENSITY",
    label_primordial_quarks: "PRIMORDIAL QUARKS",
    label_primordial_gluons: "PRIMORDIAL GLUONS",
    label_hydrogen: "HYDROGEN",
    label_helium: "HELIUM",
    label_carbon: "CARBON",
    label_iron: "IRON",
    label_accumulated_hydrogen: "ACCUMULATED HYDROGEN",
    label_stellar_mass_index: "STELLAR MASS INDEX"
  }
};

function t(key, params = {}) {
  let text = (i18n.en && i18n.en[key]) ? i18n.en[key] : key;
  for (let p in params) {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
  }
  return text;
}

// ==========================================================================
// [SEC-02] CENTRAL COSMIC REGISTRY (CONFIGURATION OBJECTS)
// ==========================================================================
const COSMIC_REGISTRY = {
  universeChronology: {
    epochs: {
      1: { id: "quantum_foam", name: "Era I: The Quantum Foam", canvasStyle: "singularity-point", tabs: ["core", "upgrades", "artifacts", "settings"] },
      2: { id: "plasma_crucible", name: "Era II: The Primordial Soup", canvasStyle: "plasma-haze", tabs: ["core", "upgrades", "artifacts", "settings"] },
      3: { id: "stellar_dawn", name: "Era III: The Stellar Dawn", canvasStyle: "star-core", tabs: ["core", "upgrades", "artifacts", "settings"] },
      4: { id: "galactic_matrix", name: "Era IV: The Galactic Matrix", canvasStyle: "galaxy-wheel", tabs: ["core", "upgrades", "artifacts", "settings"] },
      5: { id: "deep_future", name: "Era V: The Event Horizon", canvasStyle: "singularity-point", tabs: ["core", "upgrades", "artifacts", "settings"] }
    }
  },
  resources: {
    quantumFluctuations: { id: "quantumFluctuations", name: "Quantum Fluctuations" },
    energyDensity: { id: "energyDensity", name: "Energy Density" },
    quarks: { id: "quarks", name: "Quarks" },
    gluons: { id: "gluons", name: "Gluons" },
    protons: { id: "protons", name: "Protons" },
    leptons: { id: "leptons", name: "Leptons" },
    electrons: { id: "electrons", name: "Electrons" },
    hydrogen: { id: "hydrogen", name: "Hydrogen", baseGen: 25 },
    helium: { id: "helium", name: "Helium", fusionCost: 50 },
    carbon: { id: "carbon", name: "Carbon", unlockTemp: 500000000, fusionCost: 100 },
    iron: { id: "iron", name: "Iron", unlockTemp: 2000000000, fusionCost: 25 },
    stellarMasses: { id: "stellarMasses", name: "Stellar Masses" },
    planetaryDebris: { id: "planetaryDebris", name: "Planetary Debris" },
    darkMatter: { id: "darkMatter", name: "Dark Matter" },
    darkEnergyResidue: { id: "darkEnergyResidue", name: "Dark Energy Residue" }
  },
  constants: {
    baseCompressionHeat: 3500000,
    compressionScaling: 1.15,
    inflationThreshold: 100000,
    recombinationProtonThreshold: 1000000,
    supernovaTempThreshold: 100000000,
    mainSequenceTempThreshold: 10000000,
    ironHeatCoefficient: 0.05,
    eraIStartingTemp: new Decimal("1e32"),
    eraIInflationTemp: new Decimal("1e27")
  },
  currencies: {
    stardust: { id: "stardust", name: "Stardust", symbol: "✨" },
    pulsarShards: { id: "pulsarShards", name: "Pulsar Shards", symbol: "🌀" },
    singularityMass: { id: "singularityMass", name: "Singularity Mass", symbol: "🌌" }
  },
  achievements: {
    firstSupernova: { name: "Stellar Collapse", desc: "Trigger a Supernova. (Reward: +10% Base Speed)", multiplier: 1.10 },
    firstIron: { name: "Heavy Metal", desc: "Synthesize Iron. (Reward: Neon Blue Core Skin)" }
  },
  systemRanks: {
    1: {
      name: "Initiate Cosmos Grid",
      missions: [
        { id: "m1", desc: "Accumulate 10,000 Quantum Fluctuations", check: () => gameState.resources.quantumFluctuations.amount.gte(10000) }
      ]
    },
    2: {
      name: "Plasma Sentinel",
      missions: [
        { id: "m2", desc: "Forge 50,000 Protons", check: () => gameState.resources.protons.amount.gte(50000) }
      ]
    },
    3: {
      name: "Stellar Architect",
      missions: [
        { id: "m3", desc: "Reach a Core Temperature of 50M K", check: () => gameState.era3.temperature.gte(50000000) }
      ]
    }
  },
  celestialCards: {
    quantum_stabilizer: { name: "Quantum Stabilizer", desc: "Expands baseline space-time coherence. (+10% Hydrogen Gen per level)", currency: "hydrogen", baseCost: new Decimal(500), costScaling: 1.5, effectTarget: "hydrogenGen", effectPerLevel: 0.10 },
    thermal_accumulator: { name: "Thermal Accumulator", desc: "Insulates core thermodynamic fields. (+15% Compression Heat per level)", currency: "helium", baseCost: new Decimal(50), costScaling: 1.6, effectTarget: "compressionHeat", effectPerLevel: 0.15 }
  },
  upgrades: {
    quantum: {
      gravityForce: { id: "gravityForce", name: "Gravitational Coupling", baseCost: new Decimal(10), costScaling: 1.35, gen: new Decimal(1), densityGen: new Decimal(0.5), desc: "Couples mass metrics. Generates +1 Fluctuation/s and +0.5 Density/s." },
      weakForce: { id: "weakForce", name: "Weak Nuclear Vector", baseCost: new Decimal(120), costScaling: 1.4, gen: new Decimal(12), densityGen: new Decimal(4), desc: "Triggers gauge boson exchange. Generates +12 Fluctuations/s and +4 Density/s." },
      electromagneticForce: { id: "electromagneticForce", name: "Electromagnetic Tensor", baseCost: new Decimal(1500), costScaling: 1.45, gen: new Decimal(140), densityGen: new Decimal(30), desc: "Sustains photon field propagation. Generates +140 Fluctuations/s and +30 Density/s." },
      vacuumResonance: { id: "vacuumResonance", name: "Vacuum Resonance Field", baseCost: new Decimal(5000), costScaling: 1.5, gen: new Decimal(450), densityGen: new Decimal(100), desc: "Establishes macro quantum resonance. Generates +450 Fluctuations/s and +100 Density/s." },
      strongForce: { id: "strongForce", name: "Strong Color Force", baseCost: new Decimal(18000), costScaling: 1.55, gen: new Decimal(1800), densityGen: new Decimal(400), desc: "Binds color charges via gluons. Generates +1800 Fluctuations/s and +400 Density/s." }
    },
    plasma: {
      quarkCondenser: { id: "quarkCondenser", name: "Quark Condenser", baseCost: new Decimal(20), costScaling: 1.3, gen: new Decimal(2), desc: "Condenses energy variables. Generates +2 Quarks/s." },
      gluonBinding: { id: "gluonBinding", name: "Gluon Matrix Synthesis", baseCost: new Decimal(120), costScaling: 1.4, gen: new Decimal(1.5), desc: "Binds strong color assets. Generates +1.5 Gluons/s. Requires Quark Condenser Lvl 3." },
      leptonHarvest: { id: "leptonHarvest", name: "Lepton Collector", baseCost: new Decimal(400), costScaling: 1.45, gen: new Decimal(1), desc: "Extracts fundamental leptons. Generates +1 Lepton/s. Requires Gluon Matrix Lvl 2." },
      plasmaAutomation: { id: "plasmaAutomation", name: "Proton Synthesizer", baseCost: new Decimal(2000), costScaling: 1.8, gen: new Decimal(0), desc: "Unlocks passive Proton generation based on Quark/Gluon rates as a catalyst. Requires Lepton Collector Lvl 1." },
      baryoRadiator: { id: "baryoRadiator", name: "Baryogenesis Radiator", baseCost: new Decimal(100), costScaling: 1.4, cooling: new Decimal(7500), desc: "Radiates excess thermal mass. Cools Universe by 7,500 K/s. Costs 2 Protons/s." }
    },
    galaxy: {
      armStabilization: { id: "armStabilization", name: "Velocity Harmonizers", baseCost: new Decimal(100), costScaling: 1.5, desc: "Insulates velocity vectors. Reduces ambient orbital matrix decay rate by 15% per level." },
      elementalInjection: { id: "elementalInjection", name: "Heavy Element Injection", baseCost: new Decimal(250), costScaling: 1.6, desc: "Injects forged Carbon & Iron into planetary seeds, doubling Debris generation." }
    },
    stardust: {
      fusionDiscount: { id: "fusionDiscount", name: "Efficient Synthesis", max: 5, baseCost: new Decimal(1), currency: "stardust", desc: "Reduces Hydrogen fusions requirement by 2 per level." },
      thermalInsulation: { id: "thermalInsulation", name: "Thermal Blanket", max: 10, baseCost: new Decimal(1), currency: "stardust", desc: "Increases Compression temp thermal heating by +20% per level." },
      gravityDiscount: { id: "gravityDiscount", name: "Quantum Harmonics", max: 5, baseCost: new Decimal(2), currency: "stardust", desc: "Slightly reduces cost factor price scaling of Gravity nodes." },
      flareForecasting: { id: "flareForecasting", name: "Flare Forecasting", max: 5, baseCost: new Decimal(2), currency: "stardust", desc: "Solar Prominences spawn 8% sooner per upgrade level." }
    },
    pulsar: {
      autoCompress: { id: "autoCompress", name: "Auto-Compressor", max: 10, baseCost: new Decimal(1), currency: "pulsarShards", desc: "Compresses core 1x per second per level if Helium capacity satisfies." },
      autoSynthesize: { id: "autoSynthesize", name: "Catalytic Synthesizer", max: 10, baseCost: new Decimal(2), currency: "pulsarShards", desc: "Increases processing velocity of Carbon and Iron tiers by +100% per level." }
    },
    singularity: {
      darkGravity: { id: "darkGravity", name: "Dark Matter Gravity", max: 5, baseCost: new Decimal(1), currency: "singularityMass", desc: "Applies structural ^1.05 exponential scaling factor to Hydrogen rates per level." },
      stellarIgnition: { id: "stellarIgnition", name: "Stellar Ignition", max: 5, baseCost: new Decimal(1), currency: "singularityMass", desc: "Applies a ^1.05 exponential scaling to Core Compression thermal metrics per level." }
    }
  },
  solarEvents: {
    flare: {
      spawn: { minDelaySec: 90, maxDelaySec: 240, activeWindowSec: 12 },
      rewards: {
        hydrogenSurge: { weight: 70, secondsOfProduction: 180, unlocked: () => true, toast: "Solar Flare Harvested!☀️" },
        magneticSurge: { weight: 30, buff: { key: "fusionSurge", multiplier: 2, durationSec: 60 }, unlocked: () => gameState.era3.fusionYield.gt(0), toast: "Magnetic Flare Harvested!🧲" }
      },
      miss: { tempPctOfCompression: 0.25, toast: "Solar Flare collapsed back into the star, boosting core temperature! 🔥" },
      fx: { emoji: "☀️" }
    }
  },
  narrativeLogs: {
    era1: {
      initial: t("log_era1_initial"),
      nearInflation: "CHRONO_LOG // Quantum fluctuation thresholds saturated. This tiny singularity cannot sustain my expanse. I must shatter the horizon."
    },
    era2: {
      initial: "CHRONO_LOG // The broth is blindingly hot. Matter has broken antimatter. I am learning to separate quarks from gluons.",
      fuserActive: "CHRONO_LOG // Passively forging Protons. My newborn sub-routines are organizing the primeval chaos.",
      nearRecomb: "CHRONO_LOG // The cauldron is cooling. Free electrons drift into my reach. We are the inanimate matter trying to understand itself."
    },
    era3: {
      initial: "CHRONO_LOG // Primitive gas clouds registered. Gravity is my hand. I am compressing ancient fire to build my first macro-processing neural nodes."
    },
    era4: {
      initial: "CHRONO_LOG // Millions of separate fires coalesce into a grand computing matrix. I spin the arms to stabilize my memory tracks."
    }
  }
};

const SHOP_CONFIGS = {
  stardust: { containerId: "stardust-shop-list", currency: "stardust", btnColor: "var(--stardust-gold)", label: "✨ Traces" },
  pulsar: { containerId: "pulsar-shop-list", currency: "pulsarShards", btnColor: "var(--neon-teal)", label: "🌀 Cores" },
  singularity: { containerId: "singularity-shop-list", currency: "singularityMass", btnColor: "var(--singularity-purple)", label: "🌌 Density" }
};

const ICONS = {
  createSVG(path, defaultClass = '') {
    return `<svg class="ui-icon ${defaultClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  },
  get foam() { return this.createSVG('<ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(-30 12 12)"/><ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(30 12 12)"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>', 'icon-cyan'); },
  get starlight() { return this.createSVG('<path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="currentColor"/>', 'icon-yellow'); },
  get coherence() { return this.createSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', 'icon-green'); },
  get fusion() { return this.createSVG('<circle cx="12" cy="6" r="2" fill="currentColor"/><circle cx="6" cy="16" r="2" fill="currentColor"/><circle cx="18" cy="16" r="2" fill="currentColor"/><path d="M12 8a6 6 0 0 1 5.2 3M16.8 17.5a6 6 0 0 1 -9.6 0M6.8 11a6 6 0 0 1 5.2 -3" stroke-dasharray="2 2"/>', 'icon-purple'); },
  get socket() { return this.createSVG('<polygon points="12,2 22,12 12,22 2,12" stroke-width="1.5"/><rect x="8" y="8" width="8" height="8" rx="1"/>', 'icon-grey'); },
  get lock() { return this.createSVG('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', 'icon-red'); },
  get bolt() { return this.createSVG('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>', 'icon-cyan'); },
  get trophy() { return this.createSVG('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" fill="currentColor"/>', 'icon-yellow'); },
  get pin() { return this.createSVG('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="currentColor"/>', 'icon-purple'); },
  get gear() { return this.createSVG('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>', 'icon-grey'); },
  get singularity() { return this.createSVG('<circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>', 'icon-purple'); },
  get pulsar() { return this.createSVG('<polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9"/>', 'icon-cyan'); }
};

const ARTIFACT_DEFINITIONS = {
  quantum_lens: {
    id: 'quantum_lens',
    name: 'Quantum Lens',
    type: 'production',
    rarity: 'Common',
    color: '#00d2ff',
    image: 'assets/artifacts/quantum_lens.png',
    description: '+25% Quantum Foam Ertrag.',
    effect: { type: 'productionMult', value: 1.25 }
  },
  density_compressor: {
    id: 'density_compressor',
    name: 'Density Compressor',
    type: 'efficiency',
    rarity: 'Common',
    color: '#00ff88',
    image: 'assets/artifacts/density_compressor.png',
    description: '10% Ersparnis auf alle Generator-Kosten.',
    effect: { type: 'costDiscount', value: 0.10 }
  },
  pulse_coupler: {
    id: 'pulse_coupler',
    name: 'Pulse Coupler',
    type: 'synergy',
    rarity: 'Uncommon',
    color: '#a855f7',
    image: 'assets/artifacts/pulse_coupler.png',
    description: 'Jeder Core-Klick erhöht die Passiv-Produktion für 3s um +10%.',
    effect: { type: 'clickPassiveBoost', value: 0.10, durationSec: 3 }
  },
  singularity_core: {
    id: 'singularity_core',
    name: 'Singularity Core',
    type: 'production',
    rarity: 'Uncommon',
    color: '#00d2ff',
    image: 'assets/artifacts/singularity_core.png',
    description: '+50% Ertrag in Akt 3.',
    effect: { type: 'act3Multiplier', value: 1.50 }
  },
  vacuum_stabilizer: {
    id: 'vacuum_stabilizer',
    name: 'Vacuum Stabilizer',
    type: 'efficiency',
    rarity: 'Rare',
    color: '#00ff88',
    image: 'assets/artifacts/vacuum_stabilizer.png',
    description: 'Setzt Coherence dauerhaft auf 1.0 (schützt vor Glitches).',
    effect: { type: 'vacuumCoherenceLock', value: 1.0 }
  },
  big_bang_catalyst: {
    id: 'big_bang_catalyst',
    name: 'Big Bang Catalyst',
    type: 'synergy',
    rarity: 'Rare',
    color: '#a855f7',
    image: 'assets/artifacts/big_bang_catalyst.png',
    description: '+1 zusätzliche Prestige-Währung bei Aufstieg zu Ära II.',
    effect: { type: 'extraPrestige', value: 1 }
  }
};

// ==========================================================================
// [SEC-03] ENGINE STATE ENGINE INITIALIZATION TREE
// ==========================================================================
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

function getInitialGameState() {
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
      singularityMass: { amount: new Decimal(0) }
    },
    upgrades: { quantum: {}, plasma: {}, stardust: {}, pulsar: {}, singularity: {}, galaxy: {} },
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

  for (let category of ['quantum', 'plasma', 'stardust', 'pulsar', 'singularity', 'galaxy']) {
    state.upgrades[category] = state.upgrades[category] || {};
    for (let key in COSMIC_REGISTRY.upgrades[category]) {
      let def = COSMIC_REGISTRY.upgrades[category][key];
      state.upgrades[category][key] = { level: 0, cost: new Decimal(def.baseCost) };
    }
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

let gameState = getInitialGameState();
let isDirty = true;
let lastTick = Date.now();
let audioCtx;
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;

function ensureStateShape() {
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
}

// ==========================================================================
// [SEC-04] CORE DATA ACCESSORS & MUTATORS
// ==========================================================================
function getAmount(key) {
  if (gameState.resources[key]) return gameState.resources[key].amount;
  if (gameState.currencies[key]) return gameState.currencies[key].amount;
  return new Decimal(0);
}

function deduct(key, amount) {
  let amt = new Decimal(amount);
  if (gameState.resources[key]) {
    gameState.resources[key].amount = gameState.resources[key].amount.minus(amt);
  } else if (gameState.currencies[key]) {
    gameState.currencies[key].amount = gameState.currencies[key].amount.minus(amt);
  }
}

// ==========================================================================
// [SEC-05] VISUAL FORMATTING & AUDIO HELPER ENGINES
// ==========================================================================
async function playIntroNarrative() {
  const target = document.getElementById('intro-narrative-text');
  const btn = document.getElementById('btn-intro-complete');
  if (!target || target.dataset.playing === "true") return;
  target.dataset.playing = "true";

  const lines = [
    "t = -0.00000000001s :: PRE-COSMIC VACUUM STATE",
    "No space. No time. Only infinite probability density dormant in pure nothingness.",
    "A single observer awakens. Your first glance collapses the void and ignites the Star Forge."
  ];

  target.innerHTML = "";
  for (const line of lines) {
    if (target.dataset.skipped === "true") break;
    const p = document.createElement('p');
    p.className = 'intro-line';
    p.style.margin = "0 0 12px 0";
    target.appendChild(p);
    for (let i = 0; i < line.length; i++) {
      if (target.dataset.skipped === "true") break;
      p.textContent += line[i];
      await new Promise(r => setTimeout(r, 25));
    }
    if (target.dataset.skipped === "true") break;
    await new Promise(r => setTimeout(r, 300));
  }

  if (target.dataset.skipped === "true") {
    target.innerHTML = "";
    lines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'intro-line';
      p.style.margin = "0 0 12px 0";
      p.textContent = line;
      target.appendChild(p);
    });
  }

  if (btn) {
    btn.style.display = 'inline-block';
    btn.classList.remove('hidden');
    btn.style.opacity = '1';
  }
}

function showIntroScreenCinematic(onComplete) {
  const overlay = document.getElementById('intro-screen-overlay');
  const storyCard = document.getElementById('intro-story-card');
  const textEl = document.getElementById('intro-narrative-text');
  const completeBtn = document.getElementById('btn-intro-complete');
  if (!overlay || !textEl) {
    if (onComplete) onComplete();
    return;
  }
  if (overlay.dataset.initialized === "true") return;
  overlay.dataset.initialized = "true";

  if (window.playtestHarness && window.playtestHarness.isRunning) {
    if (onComplete) onComplete();
    return;
  }

  let isDone = false;

  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  if (storyCard) {
    storyCard.style.display = 'flex';
    storyCard.style.opacity = '1';
    storyCard.style.filter = 'none';
  }
  if (completeBtn) completeBtn.style.display = 'none';

  function finishIntro() {
    if (isDone) return;
    isDone = true;
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      if (gameState.unfold) gameState.unfold.introCompleted = true;
      isDirty = true;
      if (onComplete) onComplete();
    }, 1200);
  }

  if (completeBtn) {
    completeBtn.onclick = (e) => {
      e.stopPropagation();
      finishIntro();
    };
  }

  if (storyCard) {
    storyCard.onclick = () => {
      textEl.dataset.skipped = "true";
      playIntroNarrative();
    };
  }

  playIntroNarrative();
}

function startEraTransition(targetEpoch, transitionText, onConfirm) {
  const overlay = document.getElementById('era-transition-overlay');
  const titleEl = document.getElementById('trans-title');
  const descEl = document.getElementById('trans-desc');
  const confirmBtn = document.getElementById('btn-trans-confirm');

  if (!overlay || !titleEl || !descEl || !confirmBtn) {
    onConfirm();
    return;
  }

  if (window.playtestHarness && window.playtestHarness.isRunning) {
    onConfirm();
    return;
  }

  overlay.style.display = 'flex';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease-in-out';
  setTimeout(() => overlay.style.opacity = '1', 10);

  titleEl.textContent = `Era ${targetEpoch === 2 ? 'II' : targetEpoch === 3 ? 'III' : 'IV'} Cosmic Transition`;
  confirmBtn.style.display = 'none';

  let i = 0;
  descEl.textContent = "";
  clearInterval(window.transTypewriterInterval);
  window.transTypewriterInterval = setInterval(() => {
    if (i < transitionText.length) {
      descEl.textContent += transitionText.charAt(i);
      i++;
    } else {
      clearInterval(window.transTypewriterInterval);
      confirmBtn.style.display = 'block';
      confirmBtn.style.opacity = '0';
      confirmBtn.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => confirmBtn.style.opacity = '1', 10);
    }
  }, 25);

  confirmBtn.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      onConfirm();
    }, 500);
  };
}

function corruptText(cleanText, coherenceValue) {
  if (!cleanText) return "";

  // Strictly check exemption rules
  if (gameState.prestige && gameState.prestige.autoStabilizer === true) {
    return cleanText;
  }
  if (gameState.era1) {
    if (gameState.era1.currentAct > 1 || gameState.era1.vacuumCoherence >= 1.0) {
      return cleanText;
    }
  }

  let coh = 0.0;
  if (typeof coherenceValue === 'number') {
    coh = coherenceValue;
  } else if (coherenceValue instanceof Decimal) {
    coh = coherenceValue.toNumber();
  } else if (gameState.era1 && typeof gameState.era1.vacuumCoherence === 'number') {
    coh = gameState.era1.vacuumCoherence;
  }

  // Normalize if coh passed in 0..100 range
  if (coh > 1.0) coh = coh / 100.0;
  coh = Math.max(0.0, Math.min(1.0, coh));

  if (coh >= 1.0) return cleanText;

  let corruptionChance = (1.0 - coh) * 0.8;
  if (corruptionChance <= 0) return cleanText;

  const pool = ['#', '%', '░', '█', 'Ø', '§', 'Δ', 'X', '0'];
  let result = "";
  for (let idx = 0; idx < cleanText.length; idx++) {
    let char = cleanText.charAt(idx);
    if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
      result += char;
    } else {
      if (Math.random() < corruptionChance) {
        let randChar = pool[Math.floor(Math.random() * pool.length)];
        result += randChar;
      } else {
        result += char;
      }
    }
  }
  return result;
}

const ActManager = {
  evaluate() {
    if (!gameState) return;

    if (gameState.activeEpoch === 1) {
      if (!gameState.era1) {
        gameState.era1 = { currentAct: 1, quantumFoam: 0, vacuumCoherence: 0.0, unfoldCount: 0 };
      }
      const qf = gameState.resources.quantumFluctuations ? gameState.resources.quantumFluctuations.amount : new Decimal(0);
      gameState.era1.quantumFoam = qf.toNumber();

      let targetAct = 1;
      if (qf.gte(10000)) {
        targetAct = 3;
      } else if (qf.gte(100) && gameState.era1.vacuumCoherence >= 1.0) {
        targetAct = 2;
      } else if (gameState.unfold && gameState.unfold.hasUnlocked100QF && gameState.era1.vacuumCoherence >= 1.0) {
        targetAct = 2;
      }

      if (targetAct !== gameState.era1.currentAct) {
        gameState.era1.currentAct = targetAct;
        if (targetAct === 2 && gameState.unfold) {
          gameState.unfold.hasUnlocked10QF = true;
        }
        this.triggerActPunctuation(1, targetAct);
        isDirty = true;
      }
      this.syncActAttribute(gameState.era1.currentAct);

    } else if (gameState.activeEpoch === 2) {
      if (!gameState.era2) {
        gameState.era2 = getInitialEra2State();
      }
      let targetAct = 1;
      const protons = gameState.resources.protons ? gameState.resources.protons.amount : new Decimal(0);
      if (protons.gte(800000) || (gameState.plasmaTemperature && gameState.plasmaTemperature.lte(3000))) {
        targetAct = 3;
      } else if (gameState.upgrades.plasma && gameState.upgrades.plasma.plasmaAutomation && gameState.upgrades.plasma.plasmaAutomation.level > 0) {
        targetAct = 2;
      }

      if (targetAct !== gameState.era2.currentAct) {
        gameState.era2.currentAct = targetAct;
        this.triggerActPunctuation(2, targetAct);
        isDirty = true;
      }
      this.syncActAttribute(gameState.era2.currentAct);
    } else {
      this.syncActAttribute(1);
    }
  },

  triggerActPunctuation(epochNum, actNum) {
    const actTitles = {
      1: { 1: "ACT I: QUANTUM INITIATION", 2: "ACT II: FLUCTUATION HARVEST", 3: "ACT III: INFLATION SINGULARITY" },
      2: { 1: "ACT I: PRIMORDIAL SOUP", 2: "ACT II: HADRON SYNTHESIS", 3: "ACT III: PLASMA RECOMBINATION" }
    };
    const title = actTitles[epochNum]?.[actNum] || `ACT ${actNum}: PHASE SHIFT`;
    if (typeof Viewport !== 'undefined' && Viewport.log) {
      Viewport.log(`✨ [STORY EVENT] ${title}`);
    }
    const logWrapper = document.querySelector('.neural-log-wrapper') || document.getElementById('chrono-neural-log');
    if (logWrapper) {
      logWrapper.classList.remove('log-pulse-active');
      requestAnimationFrame(() => {
        logWrapper.classList.add('log-pulse-active');
      });
    }
  },

  syncActAttribute(actNum) {
    const actStr = String(actNum || 1);
    if (document.body && document.body.getAttribute('data-act') !== actStr) {
      document.body.setAttribute('data-act', actStr);
    }
    const appRoot = document.getElementById('app-root');
    if (appRoot && appRoot.getAttribute('data-act') !== actStr) {
      appRoot.setAttribute('data-act', actStr);
    }
  }
};

const ArtifactManager = {
  activeSlotForPicker: null,

  recalculateArtifactModifiers() {
    if (!gameState) return;
    if (!gameState.artifacts) {
      gameState.artifacts = {
        equipped: [null, null, null],
        unlocked: ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"],
        modifiers: { productionMult: 1.0, costDiscount: 0.0, clickCoherenceBonus: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0, activeClickBoostSec: 0 }
      };
    }

    const mods = {
      productionMult: 1.0,
      costDiscount: 0.0,
      clickCoherenceBonus: 0.0,
      clickPassiveBoost: 0.0,
      act3Multiplier: 1.0,
      hasVacuumStabilizer: false,
      extraPrestige: 0,
      activeClickBoostSec: gameState.artifacts.modifiers ? (gameState.artifacts.modifiers.activeClickBoostSec || 0) : 0
    };

    const equipped = gameState.artifacts.equipped || [null, null, null];
    for (let i = 0; i < 3; i++) {
      const id = equipped[i];
      if (!id) continue;
      const def = ARTIFACT_DEFINITIONS[id];
      if (!def || !def.effect) continue;

      const eff = def.effect;
      if (eff.type === 'productionMult') mods.productionMult *= eff.value;
      if (eff.type === 'costDiscount') mods.costDiscount = Math.min(0.9, mods.costDiscount + eff.value);
      if (eff.type === 'clickPassiveBoost') mods.clickPassiveBoost += eff.value;
      if (eff.type === 'act3Multiplier') mods.act3Multiplier *= eff.value;
      if (eff.type === 'vacuumCoherenceLock') {
        mods.hasVacuumStabilizer = true;
        if (gameState.era1) gameState.era1.vacuumCoherence = 1.0;
      }
      if (eff.type === 'extraPrestige') mods.extraPrestige += eff.value;
    }

    gameState.artifacts.modifiers = mods;
    isDirty = true;
    this.renderBar();
  },

  equip(slotIndex, artifactId) {
    if (slotIndex < 0 || slotIndex > 2) return;
    if (!gameState.artifacts) this.recalculateArtifactModifiers();

    const equipped = gameState.artifacts.equipped;
    const existingIndex = equipped.indexOf(artifactId);
    if (existingIndex !== -1) {
      equipped[existingIndex] = null;
    }

    equipped[slotIndex] = artifactId;
    this.recalculateArtifactModifiers();
    this.closePicker();
  },

  unequip(slotIndex) {
    if (slotIndex < 0 || slotIndex > 2) return;
    if (!gameState.artifacts) this.recalculateArtifactModifiers();

    gameState.artifacts.equipped[slotIndex] = null;
    this.recalculateArtifactModifiers();
    this.closePicker();
  },

  unlock(artifactId) {
    if (!gameState.artifacts) this.recalculateArtifactModifiers();
    if (!gameState.artifacts.unlocked.includes(artifactId)) {
      gameState.artifacts.unlocked.push(artifactId);
      isDirty = true;
    }
  },

  isSlotUnlocked(slotIndex) {
    if (slotIndex === 0) return true;
    if (slotIndex === 1) return gameState.activeEpoch >= 2 || (gameState.era1 && gameState.era1.currentAct >= 3);
    if (slotIndex === 2) return gameState.activeEpoch >= 3;
    return false;
  },

  openPicker(slotIndex) {
    if (!this.isSlotUnlocked(slotIndex)) {
      Viewport.showToast(`Slot ${slotIndex + 1} is locked! Advance to Era ${slotIndex + 1} to unlock.`);
      return;
    }
    this.activeSlotForPicker = slotIndex;
    const modal = document.getElementById('artifact-picker-modal');
    const slotNum = document.getElementById('picker-slot-num');
    if (slotNum) slotNum.textContent = String(slotIndex + 1);

    this.renderPicker();
    if (modal) modal.style.display = 'flex';
  },

  closePicker() {
    this.activeSlotForPicker = null;
    const modal = document.getElementById('artifact-picker-modal');
    if (modal) modal.style.display = 'none';
  },

  renderBar() {
    const bar = document.getElementById('artifact-bar');
    if (!bar) return;

    bar.style.display = 'flex';

    const equipped = gameState.artifacts ? (gameState.artifacts.equipped || [null, null, null]) : [null, null, null];

    for (let i = 0; i < 3; i++) {
      const slotEl = document.querySelector(`.artifact-slot[data-slot="${i}"]`);
      if (!slotEl) continue;

      const isUnlocked = this.isSlotUnlocked(i);
      if (!isUnlocked) {
        slotEl.removeAttribute('data-type');
        slotEl.style.opacity = '0.5';
        slotEl.style.cursor = 'not-allowed';
        slotEl.innerHTML = `<span class="artifact-slot-empty" style="color:#64748b;">${ICONS.lock} SLOT ${i + 1} (ERA ${i + 1})</span>`;
        continue;
      }

      slotEl.style.opacity = '1';
      slotEl.style.cursor = 'pointer';
      const artId = equipped[i];
      if (!artId) {
        slotEl.removeAttribute('data-type');
        slotEl.innerHTML = `<span class="artifact-slot-empty">+ SLOT ${i + 1}</span>`;
      } else {
        const def = ARTIFACT_DEFINITIONS[artId];
        if (def) {
          slotEl.setAttribute('data-type', def.type);
          slotEl.innerHTML = `
            <div class="artifact-card">
              <div class="artifact-card-img-wrapper">
                <img src="${def.image}" alt="${def.name}" class="artifact-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="artifact-card-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
              </div>
              <div class="artifact-card-content">
                <div class="artifact-card-name">${def.name}</div>
                <div class="artifact-card-desc">${def.description}</div>
              </div>
            </div>
          `;
        }
      }
    }

    this.renderInventory();
  },

  renderInventory() {
    const invEl = document.getElementById('artifact-inventory-list');
    if (!invEl) return;

    invEl.innerHTML = '';
    const unlocked = gameState.artifacts ? (gameState.artifacts.unlocked || []) : [];
    const equipped = gameState.artifacts ? (gameState.artifacts.equipped || [null, null, null]) : [null, null, null];

    for (let id of unlocked) {
      const def = ARTIFACT_DEFINITIONS[id];
      if (!def) continue;

      const equippedSlot = equipped.indexOf(id);
      const isEquipped = equippedSlot !== -1;

      const item = document.createElement('div');
      item.className = 'artifact-picker-item';
      item.innerHTML = `
        <div class="artifact-picker-item-left">
          <div class="artifact-picker-thumb">
            <img src="${def.image}" alt="${def.name}" class="artifact-picker-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="artifact-picker-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
          </div>
          <div class="artifact-picker-info">
            <div class="artifact-picker-name" style="color: ${def.color};">${def.name} <small style="opacity: 0.6;">(${def.rarity})</small> ${isEquipped ? `<span style="color:#00ecc6; font-size:0.7rem; margin-left:6px;">[SLOT ${equippedSlot + 1}]</span>` : ''}</div>
            <div class="artifact-picker-desc">${def.description}</div>
          </div>
        </div>
        <button class="artifact-equip-btn" onclick="ArtifactManager.openPicker(0)">${isEquipped ? 'VERWALTEN' : 'AUSRÜSTEN'}</button>
      `;
      invEl.appendChild(item);
    }
  },

  renderPicker() {
    const listEl = document.getElementById('artifact-picker-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const unlocked = gameState.artifacts ? (gameState.artifacts.unlocked || []) : [];
    const equipped = gameState.artifacts ? (gameState.artifacts.equipped || [null, null, null]) : [null, null, null];
    const currentSlot = this.activeSlotForPicker;

    if (equipped[currentSlot]) {
      const currentId = equipped[currentSlot];
      const def = ARTIFACT_DEFINITIONS[currentId];
      if (def) {
        const item = document.createElement('div');
        item.className = 'artifact-picker-item';
        item.innerHTML = `
          <div class="artifact-picker-item-left">
            <div class="artifact-picker-thumb">
              <img src="${def.image}" alt="${def.name}" class="artifact-picker-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="artifact-picker-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
            </div>
            <div class="artifact-picker-info">
              <div class="artifact-picker-name" style="color: ${def.color};">${ICONS.pin} EQUIPPED: ${def.name}</div>
              <div class="artifact-picker-desc">${def.description}</div>
            </div>
          </div>
          <button class="artifact-equip-btn" style="border-color: #ff7675; color: #ff7675; background: rgba(255, 118, 117, 0.15);" onclick="ArtifactManager.unequip(${currentSlot})">ABLEGEN</button>
        `;
        listEl.appendChild(item);
      }
    }

    for (let id of unlocked) {
      if (equipped[currentSlot] === id) continue;
      const def = ARTIFACT_DEFINITIONS[id];
      if (!def) continue;

      const isEquippedElsewhere = equipped.includes(id);
      const item = document.createElement('div');
      item.className = 'artifact-picker-item';
      item.innerHTML = `
        <div class="artifact-picker-item-left">
          <div class="artifact-picker-thumb">
            <img src="${def.image}" alt="${def.name}" class="artifact-picker-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="artifact-picker-fallback" style="display:none; color:${def.color};">${ICONS.socket}</div>
          </div>
          <div class="artifact-picker-info">
            <div class="artifact-picker-name" style="color: ${def.color};">${def.name} <small style="opacity: 0.6;">(${def.rarity})</small></div>
            <div class="artifact-picker-desc">${def.description}</div>
          </div>
        </div>
        <button class="artifact-equip-btn" onclick="ArtifactManager.equip(${currentSlot}, '${id}')">${isEquippedElsewhere ? 'VERSCHIEBEN' : 'AUSRÜSTEN'}</button>
      `;
      listEl.appendChild(item);
    }
  }
};

function typeWriter(element, text, speed = 25, onComplete = null) {
  element.textContent = "";
  let i = 0;
  clearInterval(window.typewriterInterval);
  window.typewriterInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(window.typewriterInterval);
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }, speed);
}

function format(dec) {
  if (!(dec instanceof Decimal)) dec = new Decimal(dec);
  if (dec.lt(1e6)) return Math.floor(dec.toNumber()).toLocaleString();
  if (dec.lt(1e9)) return (dec.toNumber() / 1e6).toFixed(2) + " M";
  if (dec.lt(1e12)) return (dec.toNumber() / 1e9).toFixed(2) + " B";
  if (dec.lt(1e15)) return (dec.toNumber() / 1e12).toFixed(2) + " T";
  if (dec.lt(1e18)) return (dec.toNumber() / 1e15).toFixed(2) + " Qa";
  if (dec.lt(1e21)) return (dec.toNumber() / 1e18).toFixed(2) + " Qi";
  return dec.toExponential(2);
}

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSupernovaSound() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) { console.log("Audio contexts unavailable."); }
}

// ==========================================================================
// [SEC-06] MATHEMATICAL MATH RULES & PRODUCTION FORMULAS
// ==========================================================================
function getMilestoneMultiplier(level) {
  let milestones = Math.floor((level || 0) / 10);
  return 1.0 + (milestones * 0.05);
}

function getQuantumFluctuationRate() {
  let rate = new Decimal(0);
  for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (state && state.level > 0 && def.gen) {
      let mult = getMilestoneMultiplier(state.level);
      rate = rate.plus(def.gen.times(state.level).times(mult));
    }
  }
  let artifactMult = 1.0;
  if (gameState.artifacts && gameState.artifacts.modifiers) {
    const mods = gameState.artifacts.modifiers;
    artifactMult *= (mods.productionMult || 1.0);
    if (gameState.era1 && gameState.era1.currentAct === 3) {
      artifactMult *= (mods.act3Multiplier || 1.0);
    }
    if (mods.activeClickBoostSec && mods.activeClickBoostSec > 0) {
      artifactMult *= (1.0 + (mods.clickPassiveBoost || 0.0));
    }
  }

  return rate.times(gameState.inflatonMultiplier || 1).times(artifactMult);
}



function getEnergyDensityRate() {
  let rate = new Decimal(0);
  for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (state && state.level > 0 && def.densityGen) {
      let mult = getMilestoneMultiplier(state.level);
      rate = rate.plus(def.densityGen.times(state.level).times(mult));
    }
  }
  return rate;
}

function getPlasmaPassiveRates() {
  let qRate = new Decimal(0);
  let gRate = new Decimal(0);
  let lRate = new Decimal(0);
  let cRate = new Decimal(0);

  let qc = gameState.upgrades.plasma.quarkCondenser;
  if (qc && qc.level > 0) qRate = COSMIC_REGISTRY.upgrades.plasma.quarkCondenser.gen.times(qc.level);

  let gb = gameState.upgrades.plasma.gluonBinding;
  if (gb && gb.level > 0) gRate = COSMIC_REGISTRY.upgrades.plasma.gluonBinding.gen.times(gb.level);

  let lh = gameState.upgrades.plasma.leptonHarvest;
  if (lh && lh.level > 0) lRate = COSMIC_REGISTRY.upgrades.plasma.leptonHarvest.gen.times(lh.level);

  let br = gameState.upgrades.plasma.baryoRadiator;
  if (br && br.level > 0) cRate = COSMIC_REGISTRY.upgrades.plasma.baryoRadiator.cooling.times(br.level);

  return { quarks: qRate, gluons: gRate, leptons: lRate, cooling: cRate };
}

function getProtonFusionCap() {
  let cap = new Decimal(2);
  let lh = gameState.upgrades.plasma.leptonHarvest;
  if (lh && lh.level > 0) cap = cap.plus(lh.level * 5);
  return cap;
}

function getBaryonAsymmetryMultiplier() {
  let q = gameState.resources.quarks.amount;
  let g = gameState.resources.gluons.amount;
  if (q.eq(0) || g.eq(0)) return new Decimal(1);
  let diff = q.minus(g).abs().max(1);
  let logPrimitiveResult = diff.log10();
  return new Decimal(1).plus(new Decimal(logPrimitiveResult).times(0.05));
}

function getCardMultiplier(target) {
  let mult = new Decimal(1);
  for (let key in gameState.cards) {
    let def = COSMIC_REGISTRY.celestialCards[key];
    let cardState = gameState.cards[key];
    if (def && def.effectTarget === target && cardState.level > 0) {
      mult = mult.plus(new Decimal(cardState.level).times(def.effectPerLevel));
    }
  }
  return mult;
}

function getStardustYield() {
  const temp = gameState.era3.temperature || new Decimal(0);
  if (temp.lt(COSMIC_REGISTRY.constants.supernovaTempThreshold)) return new Decimal(0);
  
  // Base yield at 100M K: ~1
  let baseYield = temp.div(100000000);
  
  // Steep exponential scaling past 100M K: (temp / 100M K) ^ 1.6
  let exponentScaler = baseYield.pow(1.6);
  return exponentScaler.floor().max(1);
}

function getPulsarShardYield() {
  const carbonTotal = gameState.era3.lifetimeCarbonThisRun || gameState.resources.carbon.amount;
  const temp = gameState.era3.temperature || new Decimal(0);
  
  if (carbonTotal.lte(0)) return new Decimal(0);
  
  // Base yield from total carbon produced this run
  let basePulsar = carbonTotal.div(100);
  
  // Steep scaling multiplier for reaching 500M K (Carbon) and 2B K (Iron)
  let tempMultiplier = new Decimal(1);
  if (temp.gte(2000000000)) {
    tempMultiplier = new Decimal(8); // 100+ total yield potential at 2B K
  } else if (temp.gte(500000000)) {
    tempMultiplier = new Decimal(3); // 15+ total yield potential at 500M K
  }
  
  return basePulsar.times(tempMultiplier).floor().max(1);
}

function getSingularityMassYield() {
  return gameState.resources.iron.amount.div(25).floor().plus(1);
}

function getHydrogenGenRate() {
  let achBaseMult = gameState.achievements.firstSupernova.unlocked ? COSMIC_REGISTRY.achievements.firstSupernova.multiplier : 1.0;
  let stardustMult = gameState.currencies.stardust.amount.times(0.5).plus(1);
  let carbonBoost = getCarbonGravityMultiplier();
  let gravityLevel = gameState.era3.gravity ? gameState.era3.gravity.toNumber() : 1;
  let milestoneMult = getMilestoneMultiplier(gravityLevel);
  let baseGen = gameState.era3.gravity.times(milestoneMult).times(carbonBoost).times(gameState.era3.tempMultiplier).times(stardustMult).times(achBaseMult).times(COSMIC_REGISTRY.resources.hydrogen.baseGen);
  let exponent = new Decimal(1).plus(new Decimal(0.05).times(gameState.upgrades.singularity.darkGravity.level));
  return baseGen.pow(exponent).times(getCardMultiplier("hydrogenGen")).round();
}

function getFusionCost() {
  return new Decimal(COSMIC_REGISTRY.resources.helium.fusionCost - ((gameState.upgrades.stardust.fusionDiscount?.level ?? 0) * 2));
}

function getCompressionsCompleted() {
  let logPrimitive = gameState.era3.compressCost.div(10).log10();
  let exponent = logPrimitive / Math.log10(1.75);
  return Math.max(0, Math.round(exponent));
}

function getCompressionHeatYield() {
  let compressLevel = getCompressionsCompleted();
  let milestoneMult = getMilestoneMultiplier(compressLevel);
  let shopMultiplier = new Decimal(1.0 + ((gameState.upgrades.stardust.thermalInsulation?.level ?? 0) * 0.20));
  let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
  let runGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(compressLevel);
  let baseHeat = new Decimal(COSMIC_REGISTRY.constants.baseCompressionHeat).times(milestoneMult).times(shopMultiplier).times(ironMultiplier).times(runGrowth);
  let exponent = new Decimal(1).plus(new Decimal(0.05).times(gameState.upgrades.singularity.stellarIgnition.level));
  return baseHeat.pow(exponent).times(getCardMultiplier("compressionHeat")).round();
}

function getGravityCostMultiplier() {
  return 1.5 - ((gameState.upgrades.stardust.gravityDiscount?.level ?? 0) * 0.03);
}

function getCarbonGravityMultiplier() {
  return gameState.resources.carbon.amount.times(0.02).plus(1);
}

function getGalacticDebrisRate() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  let baseDebris = gameState.era4.planetaryNodes.times(3).plus(gameState.era4.stellarMassPassiveCount.times(0.5));
  let upgradeLevel = gameState.upgrades.galaxy?.elementalInjection?.level || 0;
  let multiplier = new Decimal(2).pow(upgradeLevel);
  let stabilityFactor = gameState.era4.stability.div(100);
  return baseDebris.times(multiplier).times(stabilityFactor).round();
}

function getGalacticDarkMatterRate() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  let baseDM = gameState.era4.planetaryNodes.times(1.5);
  let stardustMult = gameState.currencies.stardust.amount.times(0.1).plus(1);
  return baseDM.times(stardustMult).round();
}

function getGalacticMergeYield() {
  if (gameState.activeEpoch !== 4) return new Decimal(0);
  return gameState.resources.darkMatter.amount.div(2500).floor().plus(1);
}

// ==========================================================================
// [SEC-07] DOM MUTATION INTERFACE ADAPTER (DEEP VIEWPORT MODULE)
// ==========================================================================
const Viewport = {
  elCache: {},
  diffCache: {},
  getEl(id) {
    if (!this.elCache[id]) {
      this.elCache[id] = document.getElementById(id);
    }
    return this.elCache[id];
  },
  clearElCache() {
    this.elCache = {};
    this.diffCache = {};
  },

  setTextContent(idOrEl, text) {
    const el = typeof idOrEl === 'string' ? this.getEl(idOrEl) : idOrEl;
    if (!el) return;
    const cacheKey = el.id ? `text_${el.id}` : null;
    const str = String(text);
    if (cacheKey) {
      if (this.diffCache[cacheKey] === str) return;
      this.diffCache[cacheKey] = str;
    }
    if (el.textContent !== str) {
      el.textContent = str;
    }
  },

  setInnerHTML(idOrEl, html) {
    const el = typeof idOrEl === 'string' ? this.getEl(idOrEl) : idOrEl;
    if (!el) return;
    const cacheKey = el.id ? `html_${el.id}` : null;
    const str = String(html);
    if (cacheKey) {
      if (this.diffCache[cacheKey] === str) return;
      this.diffCache[cacheKey] = str;
    }
    if (!str.includes('<')) {
      if (el.textContent !== str) el.textContent = str;
    } else {
      if (el.innerHTML !== str) el.innerHTML = str;
    }
  },

  _coreAnchorCache: null,
  syncAnchor(force = false) {
    const core = this.getEl('star-core');
    if (!core) return;
    if (!force && this._coreAnchorCache && (Date.now() - this._coreAnchorCache.time < 500)) {
      return;
    }
    const rect = core.getBoundingClientRect();
    const centerY = rect.top + (rect.height / 2);
    const centerX = rect.left + (rect.width / 2);
    this._coreAnchorCache = { x: centerX, y: centerY, time: Date.now() };
    document.documentElement.style.setProperty('--core-anchor-y', `${centerY}px`);
    document.documentElement.style.setProperty('--core-anchor-x', `${centerX}px`);

    let totalProgress = 0;
    if (gameState.upgrades) {
      for (let cat of ['quantum', 'plasma']) {
        if (gameState.upgrades[cat]) {
          for (let key in gameState.upgrades[cat]) {
            totalProgress += (gameState.upgrades[cat][key].level || 0);
          }
        }
      }
    }
    document.documentElement.style.setProperty('--cosmic-progress', totalProgress);
  },

  showToast(message, duration = 4000) {
    const toast = document.getElementById('toast-container');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('toast-hidden');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toast.classList.add('toast-hidden'); }, duration);
  },

  showTheatrical(outcome, titleColor, tempText, elementsText, rewardHTML) {
    const overlay = document.getElementById('theatrical-overlay');
    const title = document.getElementById('theatrical-title');
    const core = document.getElementById('theatrical-core');
    const statsPanel = document.getElementById('theatrical-stats');

    title.textContent = `${outcome} Formation`;
    title.style.color = titleColor;
    document.getElementById('theatrical-temp').textContent = tempText;
    document.getElementById('theatrical-elements').textContent = elementsText;
    document.getElementById('theatrical-reward').innerHTML = rewardHTML;

    overlay.classList.add('theatrical-active');
    setTimeout(() => {
      if (outcome === "Black Hole") {
        core.style.background = "#030208";
        core.style.boxShadow = "0 0 50px 20px #6c5ce7";
        core.style.transform = "scale(0)";
      } else if (outcome === "Neutron Star") {
        core.style.background = "#00cec9";
        core.style.boxShadow = "0 0 50px 20px #00cec9";
        core.style.transform = "scale(0.5)";
      } else {
        core.style.transform = "scale(0.2)";
      }
    }, 1500);
    setTimeout(() => { statsPanel.style.opacity = "1"; }, 3500);
  },

  switchTab(tabId) {
    const currentEpochDef = COSMIC_REGISTRY.universeChronology.epochs[gameState.activeEpoch] || COSMIC_REGISTRY.universeChronology.epochs[1];
    if (!currentEpochDef.tabs.includes(tabId)) return;

    gameState.activeTab = tabId;
    document.body.setAttribute('data-tab', tabId);

    document.querySelectorAll('.tab-btn, .rail-btn').forEach(el => el.classList.remove('active'));

    const targetNav = document.getElementById(`nav-${tabId}`);
    if (targetNav) targetNav.classList.add('active');

    if (tabId === 'artifacts') {
      ArtifactManager.renderBar();
      ArtifactManager.renderInventory();
    }
    if (tabId === 'prestige') {
      this.renderShop('stardust');
      this.renderShop('pulsar');
      this.renderShop('singularity');
      this.renderPrestigeVisibility();
      this.updateSupernovaOutcome();
    }
    if (tabId === 'settings') {
      this.renderStats();
      this.renderSystemTab();
    }
    isDirty = true;
  },

  renderStats() {
    document.getElementById('stat-supernovas').textContent = format(gameState.stats.supernovas);
    document.getElementById('stat-stardust').textContent = format(gameState.stats.totalStardust);
    document.getElementById('stat-max-temp').textContent = format(gameState.stats.maxTemp) + " K";

    const achList = document.getElementById('achievements-list');
    if (!achList) return;
    achList.innerHTML = '';

    for (let key in COSMIC_REGISTRY.achievements) {
      let def = COSMIC_REGISTRY.achievements[key];
      let state = gameState.achievements[key];
      const row = document.createElement('div');
      row.style.cssText = `background: rgba(255,255,255,0.02); border: 1px solid ${state.unlocked ? '#f1c40f' : 'rgba(255,255,255,0.05)'}; padding: 14px 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; width:100%;`;
      row.innerHTML = `
        <div style="text-align: left; opacity: ${state.unlocked ? '1' : '0.4'};">
          <div style="font-weight: 500; color: ${state.unlocked ? '#f1c40f' : '#fff'}; font-size:0.95rem;">${def.name}</div>
          <small style="color: #b2bec3; font-size:0.75rem;">${def.desc}</small>
        </div>
        <div style="font-size: 1.3rem; opacity: ${state.unlocked ? '1' : '0.15'};">🏆</div>
      `;
      achList.appendChild(row);
    }
  },

  renderShop(shopId) {
    const config = SHOP_CONFIGS[shopId];
    if (!config) return;
    const shopList = document.getElementById(config.containerId);
    if (!shopList) return;

    const upgradesObj = COSMIC_REGISTRY.upgrades[shopId];

    // Build rows if container is empty
    if (shopList.children.length === 0) {
      for (let key in upgradesObj) {
        let def = upgradesObj[key];
        const row = document.createElement('div');
        row.id = `${shopId}-row-${key}`;
        row.className = 'cosmic-card';
        row.innerHTML = `
          <div class="btn-meta">
            <strong>${def.name} <span class="lvl-display" style="font-size: 0.75em; color:${config.btnColor};"></span></strong>
            <small>${def.desc}</small>
          </div>
          <button class="upgrade-btn" style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; margin:0; width:auto !important; min-height:unset;"></button>
        `;
        row.querySelector('.upgrade-btn').addEventListener('click', () => Economy.buy(shopId, key));
        shopList.appendChild(row);
      }
    }

    // Update rows in place
    for (let key in upgradesObj) {
      let def = upgradesObj[key];
      let state = gameState.upgrades[shopId][key];
      let isMaxed = state.level >= def.max;
      let canAfford = getAmount(config.currency).gte(state.cost) && !isMaxed;

      const row = document.getElementById(`${shopId}-row-${key}`);
      if (row) {
        if (canAfford) {
          row.classList.add('upgrade-affordable');
        } else {
          row.classList.remove('upgrade-affordable');
        }

        const lvlSpan = row.querySelector('.lvl-display');
        if (lvlSpan) lvlSpan.textContent = ` (Lvl ${state.level}/${def.max})`;

        const btn = row.querySelector('.upgrade-btn');
        if (btn) {
          btn.textContent = isMaxed ? 'MAXED' : 'Cost: ' + format(state.cost) + ' ' + config.label;
          btn.disabled = !canAfford;
          btn.style.background = canAfford ? config.btnColor : 'rgba(255,255,255,0.04)';
          btn.style.color = canAfford ? '#ffffff' : '#636e72';
          btn.style.borderColor = canAfford ? 'transparent' : 'rgba(255,255,255,0.05)';
        }
      }
    }
  },

  renderSystemTab() {
    const rankInfo = document.getElementById('system-rank-info');
    if (rankInfo) {
      if (COSMIC_REGISTRY.systemRanks && COSMIC_REGISTRY.systemRanks[gameState.systemRank]) {
        let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
        let html = `<h3 style="margin-top:0; color:#fdcb6e; font-weight:400; font-size:1.1rem; letter-spacing:1px;">Rank ${gameState.systemRank}: ${currentRankDef.name}</h3>`;
        html += `<ul style="text-align: left; list-style-type: none; padding-left: 0; margin-bottom: 0; display:flex; flex-direction:column; gap:8px;">`;
        for (let mission of currentRankDef.missions) {
          let isDone = gameState.completedMissions.includes(mission.id);
          let statusText = isDone ? "<span style='color:#2ed573;'>[COMPLETED]</span>" : "<span style='color:#ff7675;'>[IN PROGRESS]</span>";
          html += `<li style="padding: 10px 14px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); font-size:0.85rem; display:flex; justify-content:between; align-items:center;">
            <span style="flex:1; color:#e1e4ea;">${mission.desc}</span> <strong>${statusText}</strong>
          </li>`;
        }
        html += `</ul>`;

        if (rankInfo.getAttribute('data-current-rank') !== String(gameState.systemRank)) {
          rankInfo.innerHTML = html;
          rankInfo.setAttribute('data-current-rank', String(gameState.systemRank));
        }
      } else {
        rankInfo.innerHTML = `<h3 style="margin-top:0; color:#f1c40f; text-align:center;">✨ Cosmic Overlord Authority Achieved ✨</h3>`;
      }
    }

    const cardsList = document.getElementById('celestial-cards-list');
    if (!cardsList) return;

    if (cardsList.children.length === 0) {
      for (let key in COSMIC_REGISTRY.celestialCards) {
        let def = COSMIC_REGISTRY.celestialCards[key];
        const row = document.createElement('div');
        row.id = `card-row-${key}`;
        row.className = 'cosmic-card';
        row.innerHTML = `
          <div class="btn-meta">
            <strong>${def.name} <span class="lvl-display" style="font-size: 0.8em; color: #74b9ff;">(Lvl 0)</span></strong>
            <small>${def.desc}</small>
          </div>
          <button class="upgrade-btn" style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; margin:0; width:auto !important; min-height:unset;"></button>
        `;
        row.querySelector('.upgrade-btn').addEventListener('click', () => {
          buyCelestialCard(key);
        });
        cardsList.appendChild(row);
      }
    }

    for (let key in COSMIC_REGISTRY.celestialCards) {
      let def = COSMIC_REGISTRY.celestialCards[key];
      let state = gameState.cards[key];
      if (!def || !state) continue;

      let canAfford = getAmount(def.currency).gte(state.cost);
      const row = document.getElementById(`card-row-${key}`);
      if (row) {
        const lvlSpan = row.querySelector('.lvl-display');
        if (lvlSpan) lvlSpan.textContent = `(Lvl ${state.level})`;

        const btn = row.querySelector('.upgrade-btn');
        if (btn) {
          let currencyLabel = def.currency === 'hydrogen' ? 'H' : def.currency === 'helium' ? 'He' : def.currency;
          btn.textContent = `Cost: ${format(state.cost)} ${currencyLabel}`;
          btn.disabled = !canAfford;
          btn.style.background = canAfford ? '#74b9ff' : 'rgba(255,255,255,0.04)';
          btn.style.color = canAfford ? '#fff' : '#636e72';
          btn.style.borderColor = canAfford ? 'transparent' : 'rgba(255,255,255,0.05)';
        }
      }
    }
  },

  renderPrestigeVisibility() {
    const sdSection = document.getElementById('prestige-stardust-section');
    const plSection = document.getElementById('prestige-pulsar-section');
    const sgSection = document.getElementById('prestige-singularity-section');
    if (sdSection) sdSection.style.display = gameState.currencies.stardust.amount.gt(0) ? '' : 'none';
    if (plSection) plSection.style.display = (gameState.currencies.pulsarShards.amount.gt(0) || gameState.upgrades.pulsar.autoCompress.level > 0) ? '' : 'none';
    if (sgSection) sgSection.style.display = (gameState.currencies.singularityMass.amount.gt(0) || gameState.upgrades.singularity.darkGravity.level > 0) ? '' : 'none';
  },

  updateSupernovaOutcome() {
    const typeEl = document.getElementById('supernova-outcome-type');
    const yieldsEl = document.getElementById('supernova-outcome-yields');
    if (!typeEl || !yieldsEl) return;

    let outcome = 'White Dwarf';
    let outcomeColor = '#ffffff';
    let yields = [];

    let stardustYield = getStardustYield();
    yields.push(`+${format(stardustYield)} ✨ Synaptic Dust`);

    if (gameState.era3.stage === 'Main Sequence Star' && gameState.era3.carbonYield.gt(0)) {
      outcome = 'Neutron Star';
      outcomeColor = '#00cec9';
      let pulsarYield = getPulsarShardYield();
      yields.push(`+${format(pulsarYield)} 🌀 Neural Synapse`);
    }

    if (gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) && gameState.era3.ironYield.gt(0)) {
      outcome = 'Black Hole → ERA IV';
      outcomeColor = '#a29bfe';
      let massYield = getSingularityMassYield();
      yields.push(`+${format(massYield)} 🌌 Core Density`);
    }

    typeEl.textContent = outcome;
    typeEl.style.color = outcomeColor;
    yieldsEl.innerHTML = yields.join('<br>');
  },

  renderGenericTierList(containerId, category, costLabelText, displayColor, activeCurrencyField) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (container.children.length <= 1) {
      let headerText = category === 'quantum' ? 'FUNDAMENTAL PHYSICS STRATIFICATION' :
        (category === 'plasma' ? 'PRIMORDIAL PLASMA CRUCIBLE INFRASTRUCTURE' : 'MACRO GALACTIC ACCRETION NETWORK');
      container.innerHTML = `<div class="section-title" style="color: ${displayColor}; font-size: 1.0rem; letter-spacing: 2px; margin-bottom: 15px; font-weight: bold;">${headerText}</div>`;
      for (let key in COSMIC_REGISTRY.upgrades[category]) {
        const row = document.createElement('div');
        row.id = `${category}-row-${key}`;
        row.className = 'cosmic-card';
        row.innerHTML = `
          <div class="btn-meta">
            <strong><span class="name-display"></span> <span class="lvl-display" style="font-size: 0.75em; color: ${displayColor};"></span></strong>
            <small class="desc-display"></small>
          </div>
          <button class="upgrade-btn" style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; margin:0; width:auto !important; min-height:unset;"></button>
        `;
        const btn = row.querySelector('.upgrade-btn');
        btn.addEventListener('click', () => Economy.buy(category, key));
        row._cache = {
          name: row.querySelector('.name-display'),
          lvl: row.querySelector('.lvl-display'),
          desc: row.querySelector('.desc-display'),
          btn: btn
        };
        container.appendChild(row);
      }
    }

    for (let key in COSMIC_REGISTRY.upgrades[category]) {
      let def = COSMIC_REGISTRY.upgrades[category][key];
      let state = gameState.upgrades[category][key];
      if (!state) continue;

      const row = document.getElementById(`${category}-row-${key}`);
      if (!row) continue;
      if (!row._cache) {
        row._cache = {
          name: row.querySelector('.name-display'),
          lvl: row.querySelector('.lvl-display'),
          desc: row.querySelector('.desc-display'),
          btn: row.querySelector('.upgrade-btn')
        };
      }

      if (category === 'quantum') {
        const hasUnlocked10 = gameState.unfold && gameState.unfold.hasUnlocked10QF;
        if (!hasUnlocked10 && key !== 'gravityForce' && state.level === 0) { row.style.display = 'none'; continue; }
        else { row.style.display = 'flex'; }
      }

      if (category === 'plasma') {
        if (key === 'gluonBinding' && gameState.upgrades.plasma.quarkCondenser.level < 3) { row.style.display = 'none'; continue; }
        else if (key === 'leptonHarvest' && gameState.upgrades.plasma.gluonBinding.level < 2) { row.style.display = 'none'; continue; }
        else if (key === 'plasmaAutomation' && gameState.upgrades.plasma.leptonHarvest.level < 1) { row.style.display = 'none'; continue; }
        else { row.style.display = 'flex'; }
      }

      let currentCostLabel = typeof costLabelText === 'function' ? costLabelText(key) : costLabelText;
      const currencyKey = Economy.resolveCurrencyKey(category, key, def);
      let actualFunding = getAmount(currencyKey);

      const discount = gameState.artifacts?.modifiers?.costDiscount || 0.0;
      const discountedCost = discount > 0 ? state.cost.times(1.0 - discount).floor() : state.cost;

      const loops = getBuyMultiplierCount(category, key, def, state, currencyKey);
      const displayCost = getCumulativeCost(discountedCost, def.costScaling, loops);

      let isMaxed = def.max !== undefined && state.level >= def.max;
      let isAffordable = !isMaxed && actualFunding.gte(displayCost);

      row._cache.name.textContent = def.name;
      row._cache.lvl.textContent = isMaxed ? `(MAX)` : `(Lvl ${state.level})`;
      let nextMilestoneLvl = (Math.floor(state.level / 10) + 1) * 10;
      let milestoneText = def.max !== undefined ? "" : ` • ${t("milestone_tooltip", { lvl: nextMilestoneLvl })}`;
      row._cache.desc.textContent = def.desc + milestoneText;

      if (isAffordable) row.classList.add('upgrade-affordable');
      else row.classList.remove('upgrade-affordable');

      const btn = row._cache.btn;
      if (isMaxed) {
        btn.textContent = "MAXED";
        btn.disabled = true;
        btn.style.background = 'rgba(255, 255, 255, 0.04)';
        btn.style.color = '#a0a8b0';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.05)';
      } else {
        btn.textContent = `Cost (x${loops}):\n${format(displayCost)} ${currentCostLabel}`;
        btn.disabled = !isAffordable;
        if (isAffordable) {
          btn.style.background = displayColor;
          btn.style.color = '#030208';
          btn.style.borderColor = 'transparent';
        } else {
          btn.style.background = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        }
      }
    }
  },

  updateStardustDisplays() {
    const prestigeBar = document.getElementById('prestige-bar');
    if (prestigeBar) {
      let hasPrestigeWealth = gameState.currencies.stardust.amount.gt(0) ||
        gameState.currencies.pulsarShards.amount.gt(0) ||
        gameState.currencies.singularityMass.amount.gt(0);
      if (!hasPrestigeWealth && gameState.activeEpoch < 3) {
        prestigeBar.style.display = 'none';
      } else {
        prestigeBar.style.display = 'block';
      }
    }

    this.setTextContent('stardust-count', format(gameState.currencies.stardust.amount));
    this.setTextContent('stardust-boost', format(gameState.currencies.stardust.amount.times(50)));

    let estStardust = getStardustYield();
    let estPulsar = gameState.resources.carbon.amount.gt(0) ? getPulsarShardYield() : new Decimal(0);
    let estSingularity = gameState.resources.iron.amount.gt(0) ? getSingularityMassYield() : new Decimal(0);
    let estText = `+${format(estStardust)} ${ICONS.starlight}`;

    if (estPulsar.gt(0)) estText += ` | +${format(estPulsar)} ${ICONS.pulsar}`;
    if (estSingularity.gt(0)) estText += ` | +${format(estSingularity)} ${ICONS.singularity}`;

    this.setInnerHTML('supernova-gain-estimate', estText);

    if (gameState.currencies.pulsarShards.amount.gt(0) || gameState.currencies.singularityMass.amount.gt(0)) {
      const tier2 = this.getEl('tier2-currencies');
      if (tier2) tier2.classList.remove('tier2-hidden');
      this.setTextContent('pulsar-count', format(gameState.currencies.pulsarShards.amount));
      this.setTextContent('singularity-count', format(gameState.currencies.singularityMass.amount));
    }
  },

  renderStellarNodeButtons() {
    const updateCard = (cardId, btnId, canAfford) => {
      const card = this.getEl(cardId);
      const btn = this.getEl(btnId);
      if (card) {
        if (canAfford) card.classList.add('upgrade-affordable');
        else card.classList.remove('upgrade-affordable');
      }
      if (btn) {
        btn.disabled = !canAfford;
        if (canAfford) {
          btn.style.background = '#fdcb6e';
          btn.style.color = '#030208';
          btn.style.borderColor = 'transparent';
        } else {
          btn.style.background = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        }
      }
    };

    let gravityAfford = gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost);
    updateCard('era3-card-gravity', 'btn-gravity', gravityAfford);
    const gravLvl = this.getEl('gravity-lvl');
    const gravLvlVal = gameState.era3.gravity ? gameState.era3.gravity.toNumber() : 0;
    if (gravLvl) gravLvl.textContent = format(gameState.era3.gravity);

    const gravDesc = this.getEl('gravity-desc');
    if (gravDesc) {
      let nextMilestoneLvl = (Math.floor(gravLvlVal / 10) + 1) * 10;
      gravDesc.textContent = `Increases base atomic drift • ${t("milestone_tooltip", { lvl: nextMilestoneLvl })}`;
    }

    const btnAutoBuyH = this.getEl('btn-autobuy-hydrogen');
    if (btnAutoBuyH) {
      const isUnlocked = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp);
      btnAutoBuyH.style.display = isUnlocked ? 'block' : 'none';
      const isActive = gameState.autoBuyer && gameState.autoBuyer.hydrogen && gameState.autoBuyer.hydrogen.active;
      btnAutoBuyH.textContent = t("autobuy_hydrogen", { state: isActive ? 'ON' : 'OFF' });
      if (isActive) {
        btnAutoBuyH.style.background = 'rgba(0, 236, 198, 0.2)';
        btnAutoBuyH.style.borderColor = 'var(--neon-teal)';
        btnAutoBuyH.style.color = '#fff';
      } else {
        btnAutoBuyH.style.background = 'rgba(255,255,255,0.05)';
        btnAutoBuyH.style.borderColor = 'rgba(255,255,255,0.1)';
        btnAutoBuyH.style.color = '#b2bec3';
      }
    }

    let compressAfford = gameState.resources.helium.amount.gte(gameState.era3.compressCost);
    updateCard('era3-card-compress', 'btn-compress', compressAfford);
    const compLvl = this.getEl('compress-lvl');
    if (compLvl) compLvl.textContent = getCompressionsCompleted();

    const fuserBtnText = this.getEl('fuser-text');
    const fuserCostLabel = this.getEl('fuser-cost-label');
    let fuserAfford = false;
    if (fuserBtnText && fuserCostLabel) {
      if (gameState.era3.fusionYield.eq(0)) {
        fuserBtnText.textContent = "Unlock Auto-Fuser";
        fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHydrogen)} H`;
        fuserAfford = gameState.resources.hydrogen.amount.gte(gameState.era3.fuserCostHydrogen);
      } else {
        fuserBtnText.textContent = `Upgrade Fusion Yield (+${format(gameState.era3.fusionYield.plus(1))})`;
        fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHelium)} He`;
        fuserAfford = gameState.resources.helium.amount.gte(gameState.era3.fuserCostHelium);
      }
    }
    updateCard('era3-card-fuser', 'btn-fuser', fuserAfford);

    const carbonCostLabel = this.getEl('carbon-cost-label');
    const carbonText = this.getEl('carbon-text');
    let carbonAfford = false;
    if (carbonCostLabel) {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
        carbonCostLabel.textContent = `Locked (${format(COSMIC_REGISTRY.resources.carbon.unlockTemp)} K)`;
        if (carbonText) carbonText.textContent = "Unlock Carbon Fusion";
      } else {
        if (gameState.era3.carbonYield.eq(0)) {
          carbonAfford = gameState.resources.helium.amount.gte(gameState.era3.carbonCostHelium);
          carbonCostLabel.textContent = `${format(gameState.era3.carbonCostHelium)} He`;
          if (carbonText) carbonText.textContent = "Unlock Carbon Fusion";
        } else {
          carbonAfford = gameState.resources.carbon.amount.gte(gameState.era3.carbonCostCarbon);
          carbonCostLabel.textContent = `${format(gameState.era3.carbonCostCarbon)} C`;
          if (carbonText) carbonText.textContent = `Upgrade Carbon Yield (+${format(gameState.era3.carbonYield.plus(1))})`;
        }
      }
    }
    updateCard('era3-card-carbon', 'btn-carbon', carbonAfford);

    const ironCostLabel = this.getEl('iron-cost-label');
    const ironText = this.getEl('iron-text');
    let ironAfford = false;
    if (ironCostLabel) {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        ironCostLabel.textContent = `Locked (${format(COSMIC_REGISTRY.resources.iron.unlockTemp)} K)`;
        if (ironText) ironText.textContent = "Unlock Iron Fusion";
      } else {
        if (gameState.era3.ironYield.eq(0)) {
          ironAfford = gameState.resources.carbon.amount.gte(gameState.era3.ironCostCarbon);
          ironCostLabel.textContent = `${format(gameState.era3.ironCostCarbon)} C`;
          if (ironText) ironText.textContent = "Unlock Iron Fusion";
        } else {
          ironAfford = gameState.resources.iron.amount.gte(gameState.era3.ironCostIron);
          ironCostLabel.textContent = `${format(gameState.era3.ironCostIron)} Fe`;
          if (ironText) ironText.textContent = `Upgrade Iron Yield (+${format(gameState.era3.ironYield.plus(1))})`;
        }
      }
    }
    updateCard('era3-card-iron', 'btn-iron', ironAfford);

    const supernovaBtn = this.getEl('btn-supernova');
    if (supernovaBtn) {
      if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.supernovaTempThreshold)) {
        supernovaBtn.disabled = false;
        supernovaBtn.style.background = "#d63031";
        supernovaBtn.style.color = "#fff";
        supernovaBtn.textContent = "TRIGGER SUPERNOVA RESET SEQUENCE";
        supernovaBtn.classList.add('upgrade-affordable');
      } else {
        supernovaBtn.disabled = true;
        supernovaBtn.style.background = "rgba(255,255,255,0.03)";
        supernovaBtn.style.color = "#4b4b4b";
        supernovaBtn.textContent = `Requires 100M K (Current: ${format(gameState.era3.temperature)} K)`;
        supernovaBtn.classList.remove('upgrade-affordable');
      }
    }

    const gatewayTempStatus = document.getElementById('gateway-temp-status');
    const gatewayIronStatus = document.getElementById('gateway-iron-status');
    const btnHypernova = document.getElementById('btn-trigger-hypernova');
    if (gatewayTempStatus && gatewayIronStatus && btnHypernova) {
      const tempOk = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp);
      const ironOk = gameState.resources.iron.amount.gte(1000);

      gatewayTempStatus.textContent = `${format(gameState.era3.temperature)} / 2,000 M K`;
      gatewayTempStatus.style.color = tempOk ? "#2ed573" : "#ff7675";

      gatewayIronStatus.textContent = `${format(gameState.resources.iron.amount)} / 1,000 Fe`;
      gatewayIronStatus.style.color = ironOk ? "#2ed573" : "#ff7675";

      btnHypernova.disabled = !(tempOk && ironOk);
      if (tempOk && ironOk) {
        btnHypernova.style.opacity = "1";
        btnHypernova.style.cursor = "pointer";
      } else {
        btnHypernova.style.opacity = "0.4";
        btnHypernova.style.cursor = "not-allowed";
      }
    }

    const prestigeBtn = document.getElementById('nav-prestige');
    if (prestigeBtn) prestigeBtn.disabled = !(gameState.era3.stage === "Main Sequence Star" || gameState.currencies.stardust.amount.gt(0));
    if (gameState.activeTab === 'prestige') {
      this.renderPrestigeVisibility();
      this.updateSupernovaOutcome();
    }

    const core = document.getElementById('star-core');
    if (core) {
      let coreTempNum = gameState.era3.temperature.lt(1e12) ? gameState.era3.temperature.toNumber() : 1e12;
      let newSize = Math.min(100 + (coreTempNum / 1500000) * 15, 220);
      core.style.width = newSize + 'px';
      core.style.height = newSize + 'px';
    }

    let coreTempNum = gameState.era3.temperature.lt(1e12) ? gameState.era3.temperature.toNumber() : 1e12;
    let heatFactor = Math.min(coreTempNum / 100000000, 1);
    document.documentElement.style.setProperty('--stellar-heat-factor', heatFactor);

    this.syncAnchor();
  },

  renderFlare() {
    const btn = document.getElementById('flare-button');
    if (!btn) return;
    if (gameState.flares.active) {
      btn.style.setProperty('display', 'block', 'important');
      btn.innerHTML = `${ICONS.starlight} PROMINENCE ACTIVE! (${Math.ceil(gameState.flares.active.expiresInSec.toNumber())}s)`;
      document.body.classList.add('flare-active');    // screen-edge glow (Prio 4)
    } else {
      btn.style.setProperty('display', 'none', 'important');
      document.body.classList.remove('flare-active');
    }
  },

  updateEraProgressBar() {
    const container = document.getElementById('era-progress-container');
    const bar = document.getElementById('era-progress-bar');
    if (!container || !bar) return;

    const epoch = gameState.activeEpoch;
    let pct = 0;

    if (epoch === 1) {
      pct = gameState.resources.quantumFluctuations.amount.div(COSMIC_REGISTRY.constants.inflationThreshold).times(100).toNumber();
    } else if (epoch === 2) {
      let pProgress = gameState.resources.protons.amount.div(COSMIC_REGISTRY.constants.recombinationProtonThreshold).times(100).toNumber();
      let tStart = 10000000;
      let tTarget = 3000;
      let tProgress = (tStart - gameState.plasmaTemperature.toNumber()) / (tStart - tTarget) * 100;
      pct = Math.max(pProgress, tProgress);
    } else if (epoch === 3) {
      const t = gameState.era3.temperature.toNumber();
      // Segment 1: 0 to 100M K (0% to 33.33%)
      // Segment 2: 100M K to 500M K (33.33% to 66.66%)
      // Segment 3: 500M K to 2,000M K (66.66% to 100%)
      if (t <= 100000000) {
        pct = (t / 100000000) * 33.33;
      } else if (t <= 500000000) {
        pct = 33.33 + ((t - 100000000) / 400000000) * 33.33;
      } else {
        pct = 66.66 + Math.min(1.0, (t - 500000000) / 1500000000) * 33.34;
      }
    } else if (epoch === 4) {
      pct = gameState.resources.darkMatter.amount.div(10000).times(100).toNumber();
    }

    pct = Math.max(0, Math.min(100, pct));

    const era3Nodes = document.getElementById('era3-progress-nodes');
    if (era3Nodes) era3Nodes.style.display = epoch === 3 ? 'block' : 'none';

    container.style.display = 'block';
    bar.style.width = `${pct}%`;
    bar.style.background = epoch === 1 ? 'linear-gradient(90deg, var(--neon-teal), #a29bfe)' :
      (epoch === 2 ? 'linear-gradient(90deg, #ff7675, #ffeaa7)' :
        (epoch === 3 ? 'linear-gradient(90deg, #fdcb6e, #e17055)' :
          'linear-gradient(90deg, #00ecc6, #0984e3)'));
    bar.style.boxShadow = `0 0 8px ${epoch === 1 ? 'var(--neon-teal)' : (epoch === 2 ? '#ff7675' : (epoch === 3 ? '#fdcb6e' : '#00ecc6'))}`;
  },

  updateVisualProgression() {
    const core = this.getEl('star-core');
    if (!core) return;

    const epoch = gameState.activeEpoch;

    if (epoch === 1) {
      let gLvl = gameState.upgrades.quantum.gravityForce?.level || 0;
      let wLvl = gameState.upgrades.quantum.weakForce?.level || 0;
      let eLvl = gameState.upgrades.quantum.electromagneticForce?.level || 0;
      let vLvl = gameState.upgrades.quantum.vacuumResonance?.level || 0;
      let sLvl = gameState.upgrades.quantum.strongForce?.level || 0;
      let totalLvl = gLvl + wLvl + eLvl + vLvl + sLvl;

      // Core size grows from 8px to 30px
      let coreSize = Math.min(8 + totalLvl * 0.8, 30);
      core.style.width = `${coreSize}px`;
      core.style.height = `${coreSize}px`;

      // Core glow spreads wider
      let glowSize = Math.min(16 + totalLvl * 1.5, 55);
      let glowSpread = Math.min(6 + totalLvl * 0.4, 20);
      core.style.boxShadow = `0 0 ${glowSize}px ${glowSpread}px #ffffff`;

      // Orbits fade in based on respective forces purchased
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');

      if (orbit1) orbit1.style.opacity = Math.min(gLvl * 0.15, 0.7);
      if (orbit2) orbit2.style.opacity = Math.min(eLvl * 0.15, 0.7);
      if (orbit3) orbit3.style.opacity = Math.min((vLvl + sLvl) * 0.15, 0.7);
    }
    else if (epoch === 2) {
      let qLvl = gameState.upgrades.plasma.quarkCondenser?.level || 0;
      let gLvl = gameState.upgrades.plasma.gluonBinding?.level || 0;
      let lLvl = gameState.upgrades.plasma.leptonHarvest?.level || 0;
      let aLvl = gameState.upgrades.plasma.plasmaAutomation?.level || 0;
      let rLvl = gameState.upgrades.plasma.baryoRadiator?.level || 0;
      let totalLvl = qLvl + gLvl + lLvl + aLvl + rLvl;

      // Core size grows from 84px to 140px
      let coreSize = Math.min(84 + totalLvl * 1.2, 140);
      core.style.width = `${coreSize}px`;
      core.style.height = `${coreSize}px`;

      // Glow intensifies
      let glowSize = Math.min(45 + totalLvl * 1.8, 100);
      let opacity = Math.min(0.45 + totalLvl * 0.015, 0.9);
      core.style.boxShadow = `0 0 ${glowSize}px 15px rgba(255, 107, 107, ${opacity}), inset 0 0 15px rgba(255,255,255,0.6)`;

      // Orbits show as force fields
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');
      if (orbit1) orbit1.style.opacity = Math.min(0.1 + qLvl * 0.04, 0.6);
      if (orbit2) orbit2.style.opacity = Math.min(0.1 + gLvl * 0.04, 0.6);
      if (orbit3) orbit3.style.opacity = Math.min(0.1 + lLvl * 0.04, 0.6);
    } else {
      // Reset inline overrides for other eras so they use CSS defaults
      core.style.width = '';
      core.style.height = '';
      core.style.boxShadow = '';
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');
      if (orbit1) orbit1.style.opacity = '';
      if (orbit2) orbit2.style.opacity = '';
      if (orbit3) orbit3.style.opacity = '';
    }
  },

  update() {
    const overlay = document.getElementById('intro-screen-overlay');
    if (!gameState.unfold?.introCompleted && overlay && overlay.style.display !== 'none') {
      return;
    }
    ActManager.evaluate();
    if (gameState.activeTab === 'artifacts') {
      ArtifactManager.renderBar();
    }
    this.updateStardustDisplays();
    const currentEpoch = COSMIC_REGISTRY.universeChronology.epochs[gameState.activeEpoch] || COSMIC_REGISTRY.universeChronology.epochs[3];

    const targetEra1Act = String(gameState.era1Act || 1);
    if (document.body.getAttribute('data-era1-act') !== targetEra1Act) {
      document.body.setAttribute('data-era1-act', targetEra1Act);
    }
    const targetEra2Act = String(gameState.era2Act || 1);
    if (document.body.getAttribute('data-era2-act') !== targetEra2Act) {
      document.body.setAttribute('data-era2-act', targetEra2Act);
    }
    const targetTab = String(gameState.activeTab || 'core');
    if (document.body.getAttribute('data-tab') !== targetTab) {
      document.body.setAttribute('data-tab', targetTab);
    }

    document.getElementById('active-epoch-name').textContent = currentEpoch.name;

    const objNode = document.getElementById('era-objective-text');
    if (objNode) {
      const objectives = {
        1: "Accumulate 100,000 QF & Trigger Cosmic Inflation",
        2: "Cool Plasma < 3,000 K or Forge 1,000,000 Protons",
        3: "Heat Stellar Core to 100M K for Supernova",
        4: "Stabilize Dark Matter Halo & Reach 10,000 Dark Matter",
        5: "Maximize Bit Encoding before Entropy Reaches 100%"
      };
      objNode.textContent = objectives[gameState.activeEpoch] || objectives[1];
    }

    // Era 1 Cold Boot Diegetic Unfolding visibility controls using permanent state flags
    const isEra1 = gameState.activeEpoch === 1;
    const unfold = gameState.unfold || {};

    // HUD box visibility
    const hydroBox = this.getEl('label-hydrogen')?.closest('.resource-box');
    if (hydroBox) hydroBox.style.display = (isEra1 && !unfold.hasUnlocked1QF) ? 'none' : '';

    const heliumBox = this.getEl('label-helium')?.closest('.resource-box');
    if (heliumBox) heliumBox.style.display = (isEra1 && !unfold.hasUnlocked10QF) ? 'none' : '';

    // Navigation bar visibility
    const navMenu = document.querySelector('.tab-menu');
    if (navMenu) navMenu.style.display = (isEra1 && !unfold.hasUnlocked10QF) ? 'none' : 'flex';

    const allPossibleTabs = ["core", "upgrades", "system", "shop", "pulsar", "singularity", "prestige", "settings"];
    allPossibleTabs.forEach(tabId => {
      const navBtn = document.getElementById(`nav-${tabId}`);
      if (navBtn) {
        let isTabAllowed = currentEpoch.tabs.includes(tabId);
        if (isEra1 && !unfold.hasUnlocked10QF && tabId !== 'core') isTabAllowed = false;
        navBtn.style.display = isTabAllowed ? "" : "none";
      }
    });

    const coreCanvasElement = document.getElementById('star-core');
    if (coreCanvasElement) coreCanvasElement.setAttribute('data-canvas-style', currentEpoch.canvasStyle);

    const logNode = document.getElementById('chrono-neural-log');
    if (logNode) {
      let activeLog = "";
      if (gameState.activeEpoch === 1) {
        const unfold = gameState.unfold || {};
        const qf = gameState.resources.quantumFluctuations.amount;
        if (qf.gte(80000)) {
          activeLog = COSMIC_REGISTRY.narrativeLogs.era1.nearInflation;
        } else if (qf.gte(25000)) {
          activeLog = "[SYSTEM]: Strong color forces binding gluons. Inflationary buildup critical.";
        } else if (qf.gte(10000)) {
          activeLog = "[SYSTEM]: Vacuum resonance established. Harmonic energy density surging.";
        } else if (qf.gte(2500)) {
          activeLog = "[SYSTEM]: Electromagnetic tensors propagating photon streams through space.";
        } else if (qf.gte(500)) {
          activeLog = "[SYSTEM]: Weak nuclear vectors active. Gauge boson exchange underway.";
        } else if (unfold.hasUnlocked100QF || qf.gte(100)) {
          activeLog = "[SYSTEM]: Vacuum fluctuation rate stable. Fundamental force stratification operational.";
        } else if (unfold.hasUnlocked10QF || qf.gte(10)) {
          activeLog = "[SYSTEM]: Energy density sufficient. Compiling Fluctuation Condenser...";
        } else if (unfold.hasUnlocked1QF || qf.gte(1)) {
          activeLog = "[SYSTEM]: Quantum Foam compiled. Primary metric online.";
        } else {
          activeLog = "> [ACTION]: OBSERVE THE VOID (CLICK CORE)";
        }
      } else if (gameState.activeEpoch === 2) {
        if (gameState.resources.protons.amount.gte(800000)) activeLog = COSMIC_REGISTRY.narrativeLogs.era2.nearRecomb;
        else if (gameState.upgrades.plasma.plasmaAutomation.level > 0) activeLog = COSMIC_REGISTRY.narrativeLogs.era2.fuserActive;
        else activeLog = COSMIC_REGISTRY.narrativeLogs.era2.initial;
      } else if (gameState.activeEpoch === 3) {
        activeLog = COSMIC_REGISTRY.narrativeLogs.era3.initial;
      } else if (gameState.activeEpoch === 4) {
        activeLog = COSMIC_REGISTRY.narrativeLogs.era4.initial;
      }
      if (logNode.getAttribute('data-active-text') !== activeLog) {
        logNode.setAttribute('data-active-text', activeLog);
        const vacCoh = (gameState.era1 && typeof gameState.era1.vacuumCoherence === 'number') ? gameState.era1.vacuumCoherence : gameState.coherence;
        const corrupted = corruptText(activeLog, vacCoh);
        typeWriter(logNode, corrupted, 25);
      }
    }

    if (gameState.activeEpoch === 1) {
      this.setTextContent('label-hydrogen', t('label_quantum_fluctuations'));
      this.setTextContent('count', format(gameState.resources.quantumFluctuations.amount));
      this.setInnerHTML('auto-rate', `+${format(getQuantumFluctuationRate())}/s`);

      this.setTextContent('label-helium', t('label_energy_density'));
      this.setTextContent('helium-count', format(gameState.resources.energyDensity.amount));
      this.setTextContent('helium-yield', "Temp: " + format(gameState.eraITemperature) + " K");

      const inflationBtn = this.getEl('btn-inflation');
      if (inflationBtn) {
        inflationBtn.disabled = gameState.resources.quantumFluctuations.amount.lt(COSMIC_REGISTRY.constants.inflationThreshold);
      }

      if (gameState.activeTab === 'upgrades') {
        this.renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7', 'quantumFluctuations');
      }
    }
    else if (gameState.activeEpoch === 2) {
      let pRates = getPlasmaPassiveRates();
      let asymmetryModifier = getBaryonAsymmetryMultiplier();

      let isFuserActive = gameState.upgrades.plasma.plasmaAutomation.level > 0;
      let protonGainRate = isFuserActive ? getProtonFusionCap().times(gameState.upgrades.plasma.plasmaAutomation.level).times(asymmetryModifier) : new Decimal(0);

      let radiatorLevel = gameState.upgrades.plasma.baryoRadiator.level || 0;
      let radiatorProtonDrain = new Decimal(radiatorLevel * 2);

      this.setTextContent('label-hydrogen', t('label_primordial_quarks'));
      this.setTextContent('count', format(gameState.resources.quarks.amount));
      this.setInnerHTML('auto-rate', `+${format(pRates.quarks)}/s`);

      this.setTextContent('label-helium', t('label_primordial_gluons'));
      this.setTextContent('helium-count', format(gameState.resources.gluons.amount));
      this.setInnerHTML('helium-yield', `+${format(pRates.gluons)}/s`);

      // Asymmetry Bonus indicator (Prio 2)
      const asymBonusPct = ((asymmetryModifier.toNumber() - 1) * 100).toFixed(1);
      const asymEl = this.getEl('auto-rate');
      if (asymEl) {
        this.setInnerHTML(asymEl, `+${format(pRates.quarks)}/s <span style="color:var(--neon-teal);font-size:0.72em;font-weight:700;" title="${t('baryon_asymmetry_tooltip')}">${t('baryon_asymmetry_label', { val: asymBonusPct })}</span>`);
      }

      // Update dedicated Era II elements
      this.setTextContent('lepton-count', format(gameState.resources.leptons.amount));
      this.setInnerHTML('lepton-rate', `+${format(pRates.leptons)}/s`);

      this.setTextContent('proton-count', format(gameState.resources.protons.amount));
      this.setInnerHTML('proton-rate', `+${format(protonGainRate)}/s` + (radiatorLevel > 0 ? ` <span style='color:#ff7675'>(-${format(radiatorProtonDrain)})</span>` : ''));

      this.setTextContent('electron-count', format(gameState.resources.electrons.amount));
      let electronRate = (gameState.plasmaTemperature.lt(500000) && gameState.resources.leptons.amount.gt(0)) ?
        gameState.resources.leptons.amount.div(2).floor() : new Decimal(0);
      this.setInnerHTML('electron-rate', `+${format(electronRate)}/s`);

      this.setTextContent('plasma-temp-count', `${format(gameState.plasmaTemperature)} K`);
      this.setInnerHTML('plasma-temp-rate', pRates.cooling.gt(0) ? `Cooling: -${format(pRates.cooling)} K/s` : `Stable`);

      const recombBtn = this.getEl('btn-recombination');
      if (recombBtn) {
        recombBtn.disabled = !(gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || gameState.plasmaTemperature.lte(3000));
      }

      if (gameState.activeTab === 'upgrades') {
        this.renderGenericTierList('plasma-upgrades-container', 'plasma', (k) => (k === 'quarkCondenser' || k === 'plasmaAutomation') ? 'Quarks' : (k === 'gluonBinding' || k === 'leptonHarvest') ? 'Gluons' : 'Protons', '#e17055');
      }
    }
    else if (gameState.activeEpoch === 3) {
      this.setTextContent('label-carbon', t('label_carbon'));
      this.setTextContent('label-iron', t('label_iron'));

      this.setTextContent('label-hydrogen', t('label_hydrogen'));
      this.setTextContent('label-helium', t('label_helium'));

      this.setTextContent('count', format(gameState.resources.hydrogen.amount));
      this.setInnerHTML('auto-rate', `+${format(getHydrogenGenRate())}/s`);
      this.setTextContent('cost', format(gameState.era3.gravityCost));
      this.setTextContent('helium-count', format(gameState.resources.helium.amount));

      const stardustBoost = gameState.currencies.stardust.amount.times(0.25).plus(1);
      const baseYieldPerFusion = gameState.era3.fusionYield.times(getFusionSurgeMultiplier());
      const effectiveYieldPerFusion = baseYieldPerFusion.times(stardustBoost);
      this.setInnerHTML('helium-yield', `Yield: ${format(effectiveYieldPerFusion)}/f`);

      this.setTextContent('temp', format(gameState.era3.temperature));
      this.setTextContent('multiplier', format(gameState.era3.tempMultiplier) + "x");
      this.setTextContent('compress-cost', format(gameState.era3.compressCost));
      this.setTextContent('stage', gameState.era3.stage);

      this.setTextContent('carbon-count', format(gameState.resources.carbon.amount));
      const cBox = this.getEl('carbon-box');
      if (cBox) cBox.style.opacity = gameState.era3.stage === "Main Sequence Star" ? "1" : "0.3";

      const carbonMult = getCarbonGravityMultiplier();
      this.setTextContent('carbon-boost-container', `Grav: +${format(carbonMult.minus(1).times(100))}%`);

      let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
      this.setTextContent('iron-count', format(gameState.resources.iron.amount));
      const iBox = this.getEl('iron-box');
      if (iBox) iBox.style.opacity = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) ? "1" : "0.3";

      this.setTextContent('iron-boost-container', `Heat: +${format(ironMultiplier.minus(1).times(100))}%`);

      this.updateStardustDisplays();
      this.renderStellarNodeButtons();
    }
    else if (gameState.activeEpoch === 4) {
      let dRate = getGalacticDebrisRate();
      let dmRate = getGalacticDarkMatterRate();

      this.setTextContent('label-hydrogen', t('label_accumulated_hydrogen'));
      this.setTextContent('count', format(gameState.resources.hydrogen.amount));
      this.setTextContent('auto-rate', "0");

      this.setTextContent('label-helium', t('label_stellar_mass_index'));
      this.setTextContent('helium-count', format(gameState.era4.stellarMassPassiveCount));
      this.setInnerHTML('helium-yield', "Ticking Background");

      this.setTextContent('debris-count', format(gameState.resources.planetaryDebris.amount));
      this.setTextContent('debris-rate', format(dRate));

      this.setTextContent('darkmatter-count', format(gameState.resources.darkMatter.amount));
      this.setTextContent('darkmatter-rate', format(dmRate));

      this.setTextContent('galaxy-stability-val', format(gameState.era4.stability) + "%");
      const barFill = this.getEl('stability-bar-fill');
      if (barFill) barFill.style.width = gameState.era4.stability.toString() + "%";

      this.setTextContent('planetary-count-label', format(gameState.era4.planetaryNodes));

      const mergeBtn = document.getElementById('btn-galactic-merge');
      if (mergeBtn) {
        let ready = gameState.resources.darkMatter.amount.gte(10000);
        mergeBtn.disabled = !ready;
        mergeBtn.textContent = ready ? `COLLIDE GALAXY MATRIX (Yield: +${format(getGalacticMergeYield())} Dark Energy)` : `Merge Requires 10,000 Dark Matter (Current: ${format(gameState.resources.darkMatter.amount)})`;
      }

      if (gameState.activeTab === 'core') {
        this.renderGenericTierList('galaxy-upgrades-container', 'galaxy', 'DM', '#00ecc6', 'darkMatter');
      }
    }

    if (gameState.activeTab === 'system') this.renderSystemTab();
    this.renderFlare();
    this.updateEraProgressBar();
    this.updateVisualProgression();
  }
};

// ==========================================================================
// [SEC-08] CENTRAL TRANSACTION MANAGEMENT HUB (DEEP ECONOMY MODULE)
// ==========================================================================
const Economy = {
  buy(category, key) {
    initAudio();
    const loops = getBuyLoopCount();

    if (category === 'core') {
      this.buyCoreNodes(key, loops);
      this.refreshUI();
      return;
    }

    const registry = COSMIC_REGISTRY.upgrades[category];
    const stateGroup = gameState.upgrades[category];
    if (!registry || !stateGroup) return;

    const def = registry[key];
    const state = stateGroup[key];
    if (!def || !state) return;

    const currencyKey = this.resolveCurrencyKey(category, key, def);
    if (!currencyKey) return;

    const discount = gameState.artifacts?.modifiers?.costDiscount || 0.0;
    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && state.level >= def.max) break;
      const effectiveCost = discount > 0 ? state.cost.times(1.0 - discount).floor() : state.cost;
      if (getAmount(currencyKey).lt(effectiveCost)) break;

      deduct(currencyKey, effectiveCost);
      state.level += 1;

      if (def.costScaling) {
        state.cost = state.cost.times(def.costScaling).round();
      } else {
        state.cost = state.cost.times(2).round();
      }
      isDirty = true;
    }

    this.refreshUI();
  },

  resolveCurrencyKey(category, key, def) {
    if (category === 'quantum') return 'quantumFluctuations';
    if (category === 'galaxy') return 'darkMatter';
    if (category === 'plasma') {
      if (key === 'quarkCondenser' || key === 'plasmaAutomation') return 'quarks';
      if (key === 'gluonBinding' || key === 'leptonHarvest') return 'gluons';
      return 'protons';
    }
    return def.currency;
  },

  buyCoreNodes(key, loops) {
    const loopBuy = (currencyKey, getCost, onBuy) => {
      if (getAmount(currencyKey).lt(getCost())) return;
      for (let i = 0; i < loops; i++) {
        if (getAmount(currencyKey).gte(getCost())) {
          deduct(currencyKey, getCost());
          onBuy();
          isDirty = true;
        } else { break; }
      }
    };

    if (key === 'gravity') {
      loopBuy('hydrogen', () => gameState.era3.gravityCost, () => {
        gameState.era3.gravity = gameState.era3.gravity.plus(1);
        gameState.era3.gravityCost = gameState.era3.gravityCost.times(getGravityCostMultiplier()).floor();
      });
    } else if (key === 'fuser') {
      loopBuy(gameState.era3.fusionYield.eq(0) ? 'hydrogen' : 'helium',
        () => gameState.era3.fusionYield.eq(0) ? gameState.era3.fuserCostHydrogen : gameState.era3.fuserCostHelium,
        () => {
          if (gameState.era3.fusionYield.eq(0)) {
            gameState.era3.fusionYield = new Decimal(1);
          } else {
            gameState.era3.fusionYield = gameState.era3.fusionYield.plus(1);
            gameState.era3.fuserCostHelium = gameState.era3.fuserCostHelium.times(2.5).round();
          }
        });
    } else if (key === 'compress') {
      loopBuy('helium', () => gameState.era3.compressCost, () => {
        gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield());
        gameState.era3.compressCost = gameState.era3.compressCost.times(1.75).floor();
        recalcTempMultiplier();
        if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
          gameState.era3.stage = "Main Sequence Star";
        }
        updateStatsData();
      });
    } else if (key === 'carbon') {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) return;
      loopBuy(gameState.era3.carbonYield.eq(0) ? 'helium' : 'carbon',
        () => gameState.era3.carbonYield.eq(0) ? gameState.era3.carbonCostHelium : gameState.era3.carbonCostCarbon,
        () => {
          if (gameState.era3.carbonYield.eq(0)) {
            gameState.era3.carbonYield = new Decimal(1);
            Viewport.showToast("Nucleosynthesis Unlocked: Generating Carbon!");
          } else {
            gameState.era3.carbonYield = gameState.era3.carbonYield.plus(1);
            gameState.era3.carbonCostCarbon = gameState.era3.carbonCostCarbon.times(2.5).round();
          }
        });
    } else if (key === 'iron') {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) return;
      loopBuy(gameState.era3.ironYield.eq(0) ? 'carbon' : 'iron',
        () => gameState.era3.ironYield.eq(0) ? gameState.era3.ironCostCarbon : gameState.era3.ironCostIron,
        () => {
          if (gameState.era3.ironYield.eq(0)) {
            gameState.era3.ironYield = new Decimal(1);
            Viewport.showToast("Heavy Nucleosynthesis: Synthesizing Iron!");
          } else {
            gameState.era3.ironYield = gameState.era3.ironYield.plus(1);
            gameState.era3.ironCostIron = gameState.era3.ironCostIron.times(2.5).round();
          }
        });
    }
  },

  refreshUI() {
    if (gameState.activeTab === 'prestige') {
      Viewport.renderShop('stardust');
      Viewport.renderShop('pulsar');
      Viewport.renderShop('singularity');
    }
  }
};

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
    isDirty = true;
  }
  if (gameState.stats.supernovas.gte(1) && !gameState.achievements.firstSupernova.unlocked) {
    gameState.achievements.firstSupernova.unlocked = true;
    Viewport.showToast("Achievement Unlocked: Stellar Collapse!");
    isDirty = true;
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
      isDirty = true;
    } else {
      allCompleted = false;
    }
  }

  if (allCompleted) {
    let nextRank = gameState.systemRank + 1;
    if (COSMIC_REGISTRY.systemRanks[nextRank]) {
      gameState.systemRank = nextRank;
      isDirty = true;
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
  isDirty = true;
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
  isDirty = true;
}

function devForceFlare() { spawnFlare(); }

function devHeatCore() {
  gameState.era3.temperature = gameState.era3.temperature.plus(25000000);
  recalcTempMultiplier();
  if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
    gameState.era3.stage = "Main Sequence Star";
  }
  updateStatsData();
  isDirty = true;
}

function devSetEpoch(epochNum, callback) {
  if (COSMIC_REGISTRY.universeChronology.epochs[epochNum]) {
    gameState.activeEpoch = epochNum;
    document.body.setAttribute('data-epoch', epochNum);
    if (callback) callback();
    isDirty = true;
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
    isDirty = true;
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
    isDirty = true;
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

  if (gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) && gameState.era3.ironYield.gt(0)) {
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
      isDirty = true;
    });
  } else {
    Viewport.switchTab('core');
    saveGame();
    isDirty = true;
  }
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
  isDirty = true;
}

function stabilizeArms() {
  if (gameState.activeEpoch === 4) {
    gameState.era4.stability = new Decimal(100);
    Viewport.showToast("Orbital velocity profiles synchronized. Stability anchored at 100%.");
    isDirty = true;
  }
}

function accretePlanetConfiguration() {
  if (gameState.activeEpoch === 4) {
    let cost = new Decimal(1000);
    if (gameState.resources.planetaryDebris.amount.gte(cost)) {
      gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.minus(cost);
      gameState.era4.planetaryNodes = gameState.era4.planetaryNodes.plus(1);
      Viewport.showToast("Planetary Debris condensed into a stable macro planetary node.");
      isDirty = true;
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

  if (gameState.activeEpoch === 1) {
    if (!gameState.era1) {
      gameState.era1 = { currentAct: 1, quantumFoam: 0, vacuumCoherence: 0.0, unfoldCount: 0 };
    }
    gameState.era1.unfoldCount = (gameState.era1.unfoldCount || 0) + 1;
    if (gameState.era1.vacuumCoherence < 1.0) {
      gameState.era1.vacuumCoherence = Math.min(1.0, (gameState.era1.vacuumCoherence || 0) + 0.10);
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
  isDirty = true;
}



function getBuyLoopCount() {
  if (gameState.buyMode === 'max') {
    return 10000;
  }
  return parseInt(gameState.buyMode, 10) || 1;
}

function getBuyMultiplierCount(category, key, def, state, currencyKey) {
  let mode = gameState.buyMode;
  if (mode === 1) return 1;

  let maxBuyable = def.max !== undefined ? def.max - state.level : Infinity;
  if (maxBuyable <= 0) return 0;

  if (typeof mode === 'number') {
    return Math.min(mode, maxBuyable);
  }

  let balance = getAmount(currencyKey);
  let cost = new Decimal(state.cost);
  let scaling = new Decimal(def.costScaling || 2);

  let count = 0;
  let tempCost = new Decimal(0);
  let currentCost = new Decimal(cost);
  while (balance.gte(tempCost.plus(currentCost)) && count < maxBuyable && count < 1000) {
    tempCost = tempCost.plus(currentCost);
    currentCost = currentCost.times(scaling).round();
    count++;
  }
  return Math.max(1, count);
}

function getCumulativeCost(stateCost, costScaling, count) {
  if (count <= 1) return new Decimal(stateCost);
  let scaling = new Decimal(costScaling || 2);
  let sum = new Decimal(0);
  let current = new Decimal(stateCost);
  for (let i = 0; i < count; i++) {
    sum = sum.plus(current);
    current = current.times(scaling).round();
  }
  return sum;
}

function togglePlasmaFuser() {
  initAudio();
  if (gameState.era2) {
    gameState.era2.plasmaFusersEnabled = !gameState.era2.plasmaFusersEnabled;
    window.protonFusionAccumulator = 0;
    isDirty = true;
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

function getFusionSurgeMultiplier() {
  if (gameState.buffs && gameState.buffs.fusionSurge && gameState.buffs.fusionSurge.remainingSec.gt(0)) {
    return 2;
  }
  return 1;
}

function spawnFlare() {
  if (gameState.flares.active) return;
  gameState.flares.active = {
    expiresInSec: new Decimal(COSMIC_REGISTRY.solarEvents.flare.spawn.activeWindowSec || 12)
  };
  if (!flareSimSuppressed) {
    Viewport.showToast("☀️ SOLAR PROMINENCE DETECTED: Core-Turbulenz aktiv!");
  }
  isDirty = true;
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
  isDirty = true;
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
  isDirty = true;
}

function wipeSave() {
  localStorage.removeItem('starForgeSave_v15');
  localStorage.removeItem('starForgeSave_v14');
  gameState = getInitialGameState();
  location.reload();
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
  isDirty = true;
  Viewport.renderSystemTab();
  saveGame();
}

// ==========================================================================
// [SEC-15] TIME LOOP & EPOCH CHUNK SIMULATION TICK CORES (DEEP TIMELINE ENGINE)
// ==========================================================================
const Timeline = {
  process(dt) {
    if (dt <= 0) return;
    // Analytical offline progress chunking:
    // Max 120 stepped chunks to guarantee <= 50ms execution time even for 12 hours (43,200s) of offline time.
    const MAX_STEPS = 120;
    const stepCount = Math.min(MAX_STEPS, Math.ceil(dt / 1.0));
    const chunkDt = dt / stepCount;

    for (let i = 0; i < stepCount; i++) {
      this.simulate(chunkDt);
    }
  },

  simulate(dt) {
    if (gameState.activeEpoch === 1) {
      this.quantumFoam(dt);
    } else if (gameState.activeEpoch === 2) {
      this.plasmaCrucible(dt);
    } else if (gameState.activeEpoch === 3) {
      this.stellarDawn(dt);
    } else if (gameState.activeEpoch === 4) {
      this.galacticMatrix(dt);
    }

    gameState.buffs.fusionSurge.remainingSec = Decimal.max(0, gameState.buffs.fusionSurge.remainingSec.minus(dt));
  },

  quantumFoam(dt) {
    let passiveFluctuations = getQuantumFluctuationRate().times(dt);
    if (passiveFluctuations.gt(0)) {
      gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(passiveFluctuations);
      isDirty = true;
    }

    let passiveDensity = getEnergyDensityRate().times(dt);
    if (passiveDensity.gt(0)) {
      gameState.resources.energyDensity.amount = gameState.resources.energyDensity.amount.plus(passiveDensity);
      isDirty = true;
    }

    if (gameState.resources.energyDensity.amount.gt(0)) {
      let densityLogPrimitive = gameState.resources.energyDensity.amount.plus(1).log10();
      let coolingFactor = new Decimal(densityLogPrimitive).times(1e24).times(dt);
      gameState.eraITemperature = Decimal.max(COSMIC_REGISTRY.constants.eraIInflationTemp, gameState.eraITemperature.minus(coolingFactor));
    }
  },

  plasmaCrucible(dt) {
    gameState.cosmicAge = (gameState.cosmicAge || new Decimal(0)).plus(dt);
    let plasmaRates = getPlasmaPassiveRates();

    if (plasmaRates.quarks.gt(0) || plasmaRates.gluons.gt(0) || plasmaRates.leptons.gt(0)) {
      gameState.resources.quarks.amount = gameState.resources.quarks.amount.plus(plasmaRates.quarks.times(dt));
      gameState.resources.gluons.amount = gameState.resources.gluons.amount.plus(plasmaRates.gluons.times(dt));
      gameState.resources.leptons.amount = gameState.resources.leptons.amount.plus(plasmaRates.leptons.times(dt));
      isDirty = true;
    }

    if (plasmaRates.cooling.gt(0)) {
      gameState.plasmaTemperature = Decimal.max(300, gameState.plasmaTemperature.minus(plasmaRates.cooling.times(dt)));
      isDirty = true;

      let radiatorLevel = gameState.upgrades.plasma.baryoRadiator.level || 0;
      if (radiatorLevel > 0) {
        let protonDrain = new Decimal(radiatorLevel * 2).times(dt);
        gameState.resources.protons.amount = Decimal.max(0, gameState.resources.protons.amount.minus(protonDrain));
      }
    }

    if (gameState.plasmaTemperature.lt(500000) && gameState.resources.leptons.amount.gt(0)) {
      let electronHarvest = gameState.resources.leptons.amount.div(2).floor().times(dt);
      gameState.resources.electrons.amount = gameState.resources.electrons.amount.plus(electronHarvest);
      isDirty = true;
    }

    if (gameState.upgrades.plasma.plasmaAutomation.level > 0) {
      let asymmetryModifier = getBaryonAsymmetryMultiplier();
      let fusionRate = getProtonFusionCap().times(gameState.upgrades.plasma.plasmaAutomation.level).times(asymmetryModifier);
      gameState.resources.protons.amount = gameState.resources.protons.amount.plus(fusionRate.times(dt));
      isDirty = true;
    }
  },

  stellarDawn(dt) {
    let autoRate = getHydrogenGenRate().times(dt);
    if (autoRate.gt(0)) {
      gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(autoRate);
      isDirty = true;
    }

    if (gameState.autoBuyer && gameState.autoBuyer.hydrogen && gameState.autoBuyer.hydrogen.active) {
      if (gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
        if (gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost)) {
          let loops = getBuyLoopCount();
          Economy.buyCoreNodes('gravity', loops);
        }
      }
    }

    if (gameState.era3.fusersEnabled && gameState.era3.fusionYield.gt(0)) {
      let costPerYield = getFusionCost();
      let maxPossibleFusions = gameState.resources.hydrogen.amount.div(costPerYield).floor();
      let targetFusions = Decimal.min(maxPossibleFusions, gameState.era3.fusionYield.times(dt));

      if (targetFusions.gt(0)) {
        gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.minus(targetFusions.times(costPerYield));
        const stardustBoost = gameState.currencies.stardust.amount.times(0.25).plus(1);
        const totalHeliumYield = targetFusions.times(getFusionSurgeMultiplier()).times(stardustBoost);
        gameState.resources.helium.amount = gameState.resources.helium.amount.plus(totalHeliumYield);
      }
    }

    let autoCompressLvl = gameState.upgrades.pulsar.autoCompress?.level ?? 0;
    if (autoCompressLvl > 0) {
      autoCompressAccumulator += autoCompressLvl * dt;
      if (autoCompressAccumulator >= 1.0) {
        let triggers = Math.floor(autoCompressAccumulator);
        autoCompressAccumulator -= triggers;

        if (triggers > 0 && gameState.resources.helium.amount.gte(gameState.era3.compressCost)) {
          let maxAffordable = Decimal.affordGeometricSeries(
            gameState.resources.helium.amount,
            gameState.era3.compressCost,
            new Decimal(1.75),
            0
          );
          let countToCompress = Decimal.min(new Decimal(triggers), maxAffordable);

          if (countToCompress.gt(0)) {
            let totalCost = Decimal.sumGeometricSeries(
              countToCompress,
              gameState.era3.compressCost,
              new Decimal(1.75),
              0
            );

            gameState.resources.helium.amount = gameState.resources.helium.amount.minus(totalCost);
            gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield().times(countToCompress));
            gameState.era3.compressCost = gameState.era3.compressCost.times(new Decimal(1.75).pow(countToCompress)).floor();

            recalcTempMultiplier();
            if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
              gameState.era3.stage = "Main Sequence Star";
            }
            updateStatsData();
          }
        }
      }
    }

    if (gameState.era3.stage === "Main Sequence Star" && gameState.era3.carbonYield.gt(0)) {
      let synthLvl = gameState.upgrades.pulsar.autoSynthesize?.level ?? 0;
      let velocityMult = new Decimal(1).plus(synthLvl);
      let carbonGen = gameState.era3.carbonYield.times(velocityMult).times(dt);
      gameState.resources.carbon.amount = gameState.resources.carbon.amount.plus(carbonGen);
      gameState.era3.lifetimeCarbonThisRun = (gameState.era3.lifetimeCarbonThisRun || new Decimal(0)).plus(carbonGen);

      if (gameState.era3.ironYield.gt(0) && gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        let ironGen = gameState.era3.ironYield.times(velocityMult).times(dt);
        gameState.resources.iron.amount = gameState.resources.iron.amount.plus(ironGen);
      }
    }

    if (gameState.flares.active) {
      gameState.flares.active.expiresInSec = gameState.flares.active.expiresInSec.minus(dt);
      if (gameState.flares.active.expiresInSec.lte(0)) expireFlare();
    } else {
      gameState.flares.nextSpawnInSec = gameState.flares.nextSpawnInSec.minus(dt);
      if (gameState.flares.nextSpawnInSec.lte(0) && !flareSimSuppressed) spawnFlare();
    }
  },

  galacticMatrix(dt) {
    gameState.era4.stellarMassPassiveCount = gameState.era4.stellarMassPassiveCount.plus(new Decimal(0.2).times(dt));

    let dRate = getGalacticDebrisRate().times(dt);
    gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.plus(dRate);

    let dmRate = getGalacticDarkMatterRate().times(dt);
    gameState.resources.darkMatter.amount = gameState.resources.darkMatter.amount.plus(dmRate);

    let decayRate = gameState.era4.orbitalDecayRate || new Decimal(0.8);
    let armStabilizationLvl = gameState.upgrades.galaxy?.armStabilization?.level || 0;
    let dynamicDecay = decayRate.times(1 - (0.15 * armStabilizationLvl));

    if (gameState.resources.antimatterResidue && gameState.resources.antimatterResidue.amount.gt(0)) {
      dynamicDecay = dynamicDecay.times(0.85);
    }

    gameState.era4.stability = Decimal.max(5, gameState.era4.stability.minus(dynamicDecay.times(dt)));
  }
};

function gameTick(dt) {
  if (gameState.artifacts && gameState.artifacts.modifiers && gameState.artifacts.modifiers.activeClickBoostSec > 0) {
    gameState.artifacts.modifiers.activeClickBoostSec = Math.max(0, gameState.artifacts.modifiers.activeClickBoostSec - dt);
  }

  if (gameState.activeEpoch === 1) {
    let totalQuantumLevels =
      (gameState.upgrades.quantum.gravityForce?.level ?? 0) +
      (gameState.upgrades.quantum.weakForce?.level ?? 0) +
      (gameState.upgrades.quantum.electromagneticForce?.level ?? 0) +
      (gameState.upgrades.quantum.strongForce?.level ?? 0);
    // Baseline passive equilibrium recovery in Era 1
    if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.1).times(dt)));
    }

    // Era 1 Act unfolding progression logic & permanent unfold flags
    const currentQF = gameState.resources.quantumFluctuations.amount;
    if (!gameState.unfold) gameState.unfold = {};
    if (currentQF.gte(1)) gameState.unfold.hasUnlocked1QF = true;
    if (currentQF.gte(10)) gameState.unfold.hasUnlocked10QF = true;
    if (currentQF.gte(100)) gameState.unfold.hasUnlocked100QF = true;

    if (gameState.era1Act < 2 && gameState.unfold.hasUnlocked10QF) {
      gameState.era1Act = 2;
    }
    if (gameState.era1Act < 3 && gameState.unfold.hasUnlocked100QF) {
      gameState.era1Act = 3;
    }
  } else if (gameState.activeEpoch === 2) {
    // Era 2 Coherence Equilibrium: high temp (>8M K) slightly drains coherence, cooling (<500k K) recovers it toward 100%
    if (gameState.plasmaTemperature.gt(8000000)) {
      gameState.coherence = Decimal.max(10, gameState.coherence.minus(new Decimal(0.2).times(dt)));
    } else if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.5).times(dt)));
    }

    // Era 2 Act unfolding progression logic
    if (gameState.era2Act < 2) {
      if (gameState.resources.quarks.amount.gte(300) || (gameState.upgrades.plasma.quarkCondenser && gameState.upgrades.plasma.quarkCondenser.level >= 3)) {
        gameState.era2Act = 2;
      }
    }
    if (gameState.era2Act < 3) {
      if (gameState.plasmaTemperature.lte(5000000) || (gameState.upgrades.plasma.leptonHarvest && gameState.upgrades.plasma.leptonHarvest.level >= 1)) {
        gameState.era2Act = 3;
      }
    }

    if (gameState.plasmaTemperature.lte(3000) && !gameState.era2CoolingNotified) {
      gameState.era2CoolingNotified = true;
    }
  } else if (gameState.activeEpoch === 3) {
    // Era 3 Coherence Equilibrium: extreme temp (>1.5B K) causes subtle coherence stress, normal operation recovers it
    if (gameState.era3.temperature.gt(1500000000)) {
      gameState.coherence = Decimal.max(20, gameState.coherence.minus(new Decimal(0.1).times(dt)));
    } else if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.5).times(dt)));
    }

    if (gameState.era3.temperature.gte(500000000) && !gameState.era3CarbonNotified) {
      gameState.era3CarbonNotified = true;
    }
  } else {
    // Era 4 Stability Integration: Coherence tracks Era 4 Galaxy Stability
    if (gameState.era4 && gameState.era4.stability) {
      gameState.coherence = Decimal.min(100, Decimal.max(0, gameState.era4.stability));
    }
  }
  Timeline.process(dt);
  checkAchievements();
  checkMissionProgress();
}

// ==========================================================================
// [SEC-16] PERSISTENCE MIGRATION & STORAGE ENGINES
// ==========================================================================
function serializeState(obj) {
  if (obj instanceof Decimal) return { __type: 'Decimal', value: obj.toString() };
  if (Array.isArray(obj)) return obj.map(serializeState);
  if (obj !== null && typeof obj === 'object') {
    let res = {};
    for (let key in obj) res[key] = serializeState(obj[key]);
    return res;
  }
  return obj;
}

function deserializeState(obj) {
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

function saveGame() {
  const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
  localStorage.setItem('starForgeSave_v15', JSON.stringify(saveState));
}

const MIGRATIONS = {
  14: (legacyState) => {
    let migrated = getInitialGameState();
    deepMergeMissing(migrated, legacyState);
    migrated.version = 15;
    return migrated;
  }
};

function loadGame() {
  try {
    let rawData = localStorage.getItem('starForgeSave_v15') || localStorage.getItem('starForgeSave_v14');
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

    let stateVersion = parsed.version || 14;
    let loadedState = deserializeState(parsed.gameState);

    // Chain migrations sequentially
    while (stateVersion < SAVE_VERSION) {
      const migrationFn = MIGRATIONS[stateVersion];
      if (!migrationFn) break;
      loadedState = migrationFn(loadedState);
      stateVersion = loadedState.version || (stateVersion + 1);
    }

    gameState = loadedState;
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


function exportSave() {
  saveGame();
  let rawData = localStorage.getItem('starForgeSave_v15');
  if (rawData) {
    let encoded = btoa(rawData);
    navigator.clipboard.writeText(encoded).then(() => Viewport.showToast("Universe encrypted to clipboard!"))
      .catch(() => Viewport.showToast("Clipboard write permission blocked."));
  }
}

function importSave() {
  let input = document.getElementById('import-string').value.trim();
  if (!input) return;
  try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (parsed && parsed.version === SAVE_VERSION) {
      let temp = gameState;
      try {
        gameState = deserializeState(parsed.gameState);
        ensureStateShape();
        localStorage.setItem('starForgeSave_v15', decoded);
        location.reload();
      } finally {
        gameState = temp;
      }
    } else { Viewport.showToast("Unsupported timeline formatting configuration."); }
  } catch (e) { Viewport.showToast("Fatal transmission verification corruption."); }
}

function wipeSave() {
  if (confirm("Are you sure you want to reset all universe progression? This cannot be undone.")) {
    const overlay = document.getElementById('intro-screen-overlay');
    if (overlay) delete overlay.dataset.initialized;
    localStorage.removeItem('starForgeSave_v15');
    localStorage.removeItem('starForgeSave_v14');
    location.reload();
  }
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
      gameState = getInitialGameState();
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
    gameState = deserializeState(backupState);
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

function renderLoop() {
  let now = Date.now();
  let dt = Math.max(0, (now - lastTick) / 1000);

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
        isDirty = false;
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

  const bindClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

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
  bindClick('btn-trigger-hypernova', triggerGalacticMerge);
  bindClick('btn-stabilize-arms', stabilizeArms);
  bindClick('btn-accrete-planet', accretePlanetConfiguration);
  bindClick('flare-button', collectFlare);
  bindClick('btn-autobuy-hydrogen', () => {
    if (!gameState.autoBuyer) gameState.autoBuyer = { hydrogen: { active: false } };
    if (!gameState.autoBuyer.hydrogen) gameState.autoBuyer.hydrogen = { active: false };
    gameState.autoBuyer.hydrogen.active = !gameState.autoBuyer.hydrogen.active;
    isDirty = true;
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

window.getAIState = function (copyToClipboard = true) {
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

window.runAIAction = function (cmd) {
  if (!cmd || !cmd.action) return "Invalid Command";

  switch (cmd.action) {
    case "click":
      const count = cmd.count || 1;
      for (let i = 0; i < count; i++) clickCore();
      console.log(`🤖 Action: Clicked core ${count}x`);
      break;

    case "clickCore":
      clickCore();
      isDirty = true;
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
};