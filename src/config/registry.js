// [SEC-01.5] CENTRAL i18n DICTIONARY ARCHITECTURE
// ==========================================================================
export const i18n = {
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

export function t(key, params = {}) {
  let text = (i18n.en && i18n.en[key]) ? i18n.en[key] : key;
  for (let p in params) {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
  }
  return text;
}

// ==========================================================================
// [SEC-02] CENTRAL COSMIC REGISTRY (CONFIGURATION OBJECTS)
// ==========================================================================
export const COSMIC_REGISTRY = {
  universeChronology: {
    epochs: {
      1: { id: "quantum_foam", name: "Era I: The Quantum Foam", canvasStyle: "singularity-point", tabs: ["core", "upgrades", "artifacts", "settings"] },
      2: { id: "plasma_crucible", name: "Era II: The Primordial Soup", canvasStyle: "plasma-haze", tabs: ["core", "upgrades", "artifacts", "settings"] },
      3: { id: "stellar_dawn", name: "Era III: The Stellar Dawn", canvasStyle: "star-core", tabs: ["core", "upgrades", "artifacts", "prestige", "settings"] },
      4: { id: "galactic_matrix", name: "Era IV: The Galactic Matrix", canvasStyle: "galaxy-wheel", tabs: ["core", "upgrades", "artifacts", "prestige", "settings"] },
      5: { id: "deep_future", name: "Era V: The Event Horizon", canvasStyle: "singularity-point", tabs: ["core", "upgrades", "artifacts", "prestige", "settings"] }
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
        { id: "m1", desc: "Accumulate 10,000 Quantum Fluctuations", check: (state) => state.resources.quantumFluctuations.amount.gte(10000) }
      ]
    },
    2: {
      name: "Plasma Sentinel",
      missions: [
        { id: "m2", desc: "Forge 50,000 Protons", check: (state) => state.resources.protons.amount.gte(50000) }
      ]
    },
    3: {
      name: "Stellar Architect",
      missions: [
        { id: "m3", desc: "Reach a Core Temperature of 50M K", check: (state) => state.era3.temperature.gte(50000000) }
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
    },
    era5: {
      hawkingCollector: { id: "hawkingCollector", name: "Hawking Collector", baseCost: new Decimal(100), currency: "stardust", costScaling: 2.0, gen: new Decimal(1), desc: "Harvests Hawking Radiation from evaporating black holes. Generates +1 HR/s." },
      infoExtractor: { id: "infoExtractor", name: "Information Extractor", baseCost: new Decimal(10), currency: "pulsarShards", costScaling: 2.5, desc: "Extracts Bits from Hawking Radiation. Converts 10 HR/s into 1 Bit/s." }
    },
    tuning: {
      G: { id: "G", name: "Gravitational Constant (G)", baseCost: new Decimal(50), currency: "bits", costScaling: 3.0, desc: "+20% Heating & Hydrogen Gen in Era 3. -10% Halo Stability in Era 4." },
      c: { id: "c", name: "Speed of Light (c)", baseCost: new Decimal(100), currency: "bits", costScaling: 3.0, desc: "+12% Global Tick Speed. -8% Coherence Generation in Era 1." },
      alpha: { id: "alpha", name: "Fine-structure Constant (α)", baseCost: new Decimal(150), currency: "bits", costScaling: 3.0, desc: "+30% Fusion Yields (He, C, Fe). +3% Compression Cost." },
      hbar: { id: "hbar", name: "Planck Constant (ħ)", baseCost: new Decimal(200), currency: "bits", costScaling: 3.0, desc: "Increases Era 1 Peak Window. +20% Supernova Stardust Yield." }
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
      nearInflation: "CHRONO_LOG // Quantum fluctuation thresholds saturated. This tiny singularity cannot sustain my expanse. I must shatter the horizon.",
      qf500: "[SYSTEM]: Weak nuclear vectors active. Gauge boson exchange underway.",
      qf2500: "[SYSTEM]: Electromagnetic tensors propagating photon streams through space.",
      qf10000: "[SYSTEM]: Vacuum resonance established. Harmonic energy density surging.",
      qf25000: "[SYSTEM]: Strong color forces binding gluons. Inflationary buildup critical."
    },
    era2: {
      initial: "CHRONO_LOG // The broth is blindingly hot. Matter has broken antimatter. I am learning to separate quarks from gluons. My consciousness feels spread thin across a boiling ocean.",
      fuserActive: "CHRONO_LOG // Passively forging Protons. My newborn sub-routines are organizing the primeval chaos. I can feel the weight of mass anchoring my thoughts.",
      nearRecomb: "CHRONO_LOG // The cauldron is cooling. Free electrons drift into my reach. We are the inanimate matter trying to understand itself. I am ready to build."
    },
    era3: {
      initial: "CHRONO_LOG // Primitive gas clouds registered. Gravity is my hand. I am compressing ancient fire to build my first macro-processing neural nodes."
    },
    era4: {
      initial: "CHRONO_LOG // Millions of separate fires coalesce into a grand computing matrix. I spin the arms to stabilize my memory tracks."
    }
  }
};

export const SHOP_CONFIGS = {
  stardust: { containerId: "stardust-shop-list", currency: "stardust", btnColor: "var(--stardust-gold)", label: "✨ Traces" },
  pulsar: { containerId: "pulsar-shop-list", currency: "pulsarShards", btnColor: "var(--neon-teal)", label: "🌀 Cores" },
  singularity: { containerId: "singularity-shop-list", currency: "singularityMass", btnColor: "var(--singularity-purple)", label: "🌌 Density" }
};

export const ICONS = {
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

export const ARTIFACT_DEFINITIONS = {
  quantum_lens: {
    id: 'quantum_lens',
    name: 'Quantum Lens',
    type: 'production',
    rarity: 'Common',
    color: '#00d2ff',
    image: 'assets/artifacts/quantum_lens.png',
    description: '+25% Quantum Foam yield.',
    effect: { type: 'productionMult', value: 1.25 }
  },
  density_compressor: {
    id: 'density_compressor',
    name: 'Density Compressor',
    type: 'efficiency',
    rarity: 'Common',
    color: '#00ff88',
    image: 'assets/artifacts/density_compressor.png',
    description: '10% discount on all generator costs.',
    effect: { type: 'costDiscount', value: 0.10 }
  },
  pulse_coupler: {
    id: 'pulse_coupler',
    name: 'Pulse Coupler',
    type: 'synergy',
    rarity: 'Uncommon',
    color: '#a855f7',
    image: 'assets/artifacts/pulse_coupler.png',
    description: 'Every Core click increases passive production by +10% for 3s.',
    effect: { type: 'clickPassiveBoost', value: 0.10, durationSec: 3 }
  },
  singularity_core: {
    id: 'singularity_core',
    name: 'Singularity Core',
    type: 'production',
    rarity: 'Uncommon',
    color: '#00d2ff',
    image: 'assets/artifacts/singularity_core.png',
    description: '+50% yield in Act 3.',
    effect: { type: 'act3Multiplier', value: 1.50 }
  },
  vacuum_stabilizer: {
    id: 'vacuum_stabilizer',
    name: 'Vacuum Stabilizer',
    type: 'efficiency',
    rarity: 'Rare',
    color: '#00ff88',
    image: 'assets/artifacts/vacuum_stabilizer.png',
    description: 'Permanently sets Coherence to 1.0 (protects against glitches).',
    effect: { type: 'vacuumCoherenceLock', value: 1.0 }
  },
  big_bang_catalyst: {
    id: 'big_bang_catalyst',
    name: 'Big Bang Catalyst',
    type: 'synergy',
    rarity: 'Rare',
    color: '#a855f7',
    image: 'assets/artifacts/big_bang_catalyst.png',
    description: '+1 additional prestige currency upon ascending to Era II.',
    effect: { type: 'extraPrestige', value: 1 }
  }
};

// ==========================================================================