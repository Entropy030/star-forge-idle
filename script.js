// ==========================================================================
// [SEC-01] THIRD-PARTY INTEGRATIONS & SHIMS
// ==========================================================================
if (typeof Decimal === 'undefined' && typeof break_infinity !== 'undefined') {
    window.Decimal = break_infinity.Decimal || break_infinity.default || break_infinity;
  }
  
 // ==========================================================================
// [SEC-02] CENTRAL COSMIC REGISTRY (CONFIGURATION OBJECTS)
// ==========================================================================
const COSMIC_REGISTRY = {
    universeChronology: {
    epochs: {
    1: { id: "quantum_foam", name: "Era I: The Quantum Foam", canvasStyle: "singularity-point", tabs: ["core", "stats", "settings"] },
    2: { id: "plasma_crucible", name: "Era II: The Primordial Soup", canvasStyle: "plasma-haze", tabs: ["core", "stats", "settings"] },
    3: { id: "stellar_dawn", name: "Era III: The Stellar Dawn", canvasStyle: "star-core", tabs: ["core", "upgrades", "system", "shop", "pulsar", "singularity", "prestige", "stats", "settings"] },
    4: { id: "galactic_matrix", name: "Era IV: The Galactic Matrix", canvasStyle: "galaxy-wheel", tabs: ["core", "stats", "settings"] },
    5: { id: "deep_future", name: "Era V: The Event Horizon", canvasStyle: "singularity-point", tabs: ["core", "stats", "settings"] }
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
    // Era IV Accretion Resources
    stellarMasses: { id: "stellarMasses", name: "Stellar Masses" },
    planetaryDebris: { id: "planetaryDebris", name: "Planetary Debris" },
    darkMatter: { id: "darkMatter", name: "Dark Matter" },
    darkEnergyResidue: { id: "darkEnergyResidue", name: "Dark Energy Residue" }
    },
    constants: {
    baseCompressionHeat: 1500000,
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
    upgrades: {
    quantum: {
    gravityForce: { id: "gravityForce", name: "Gravitational Coupling", baseCost: new Decimal(10), costScaling: 1.4, gen: new Decimal(1), densityGen: new Decimal(0.5), desc: "Couples mass metrics. Generates +1 Fluctuation/s and +0.5 Density/s." },
    weakForce: { id: "weakForce", name: "Weak Nuclear Vector", baseCost: new Decimal(150), costScaling: 1.5, gen: new Decimal(12), densityGen: new Decimal(4), desc: "Triggers gauge boson exchange. Generates +12 Fluctuations/s and +4 Density/s." },
    electromagneticForce: { id: "electromagneticForce", name: "Electromagnetic Tensor", baseCost: new Decimal(2000), costScaling: 1.6, gen: new Decimal(140), densityGen: new Decimal(30), desc: "Sustains photon field propagation. Generates +140 Fluctuations/s and +30 Density/s." },
    electromagneticForce: { id: "electromagneticForce", name: "Electromagnetic Tensor", baseCost: new Decimal(2000), costScaling: 1.6, gen: new Decimal(140), densityGen: new Decimal(30), desc: "Sustains photon field propagation. Generates +140 Fluctuations/s and +30 Density/s." },
    strongForce: { id: "strongForce", name: "Strong Color Force", baseCost: new Decimal(25000), costScaling: 1.8, gen: new Decimal(1800), densityGen: new Decimal(400), desc: "Binds color charges via gluons. Generates +1800 Fluctuations/s and +400 Density/s." }
    },
    plasma: {
    quarkCondenser: { id: "quarkCondenser", name: "Quark Condenser", baseCost: new Decimal(20), costScaling: 1.3, gen: new Decimal(2), desc: "Condenses particle fields. Generates +2 Quarks/s." },
    gluonBinding: { id: "gluonBinding", name: "Gluon Binding", baseCost: new Decimal(50), costScaling: 1.35, gen: new Decimal(1.5), desc: "Binds strong color assets. Generates +1.5 Gluons/s." },
    leptonHarvest: { id: "leptonHarvest", name: "Lepton Collector", baseCost: new Decimal(80), costScaling: 1.38, gen: new Decimal(1), desc: "Extracts fundamental leptons. Generates +1 Lepton/s." },
    baryoRadiator: { id: "baryoRadiator", name: "Baryogenesis Radiator", baseCost: new Decimal(100), costScaling: 1.4, cooling: new Decimal(7500), desc: "Radiates excess thermal mass. Cools Universe by 7,500 K/s." }
    },
    // Era IV Accretion Matrix Upgrades
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
    hydrogenSurge: { weight: 70, secondsOfProduction: 180, unlocked: () => true, toast: "Solar Flare Harvested: Received 3 minutes of Hydrogen production! ☀️" },
    magneticSurge: { weight: 30, buff: { key: "fusionSurge", multiplier: 2, durationSec: 60 }, unlocked: () => gameState.era3.fusionYield.gt(0), toast: "Magnetic Flare Harvested: Fusion processing speed doubled for 60s! 🧲" }
    },
    miss: { tempPctOfCompression: 0.25, toast: "Solar Flare collapsed back into the star, boosting core temperature! 🔥" },
    fx: { emoji: "☀️" }
    }
    },
    systemRanks: {
    1: {
    name: "Nebular Cradle",
    missions: [
    { id: "h_10k", desc: "Accumulate 10,000 Hydrogen", check: () => gameState.resources.hydrogen.amount.gte(10000) },
    { id: "grav_5", desc: "Strengthen Gravity to level 5", check: () => gameState.era3.gravity.gte(5) }
    ]
    },
    2: {
    name: "Helios Primus",
    missions: [
    { id: "temp_10m", desc: "Ignite Protostar Core Temperature to 10,000,000 K", check: () => gameState.era3.temperature.gte(10000000) },
    { id: "supernova_1", desc: "Collapse the system via 1 Supernova", check: () => gameState.stats.supernovas.gte(1) }
    ]
    },
    3: {
    name: "Cosmic Crucible",
    missions: [
    { id: "carbon_yield", desc: "Unlock Carbon Nucleosynthesis", check: () => gameState.era3.carbonYield.gt(0) },
    { id: "pulsar_5", desc: "Amass 5 Automation Pulsar Shards", check: () => gameState.currencies.pulsarShards.amount.gte(5) }
    ]
    }
    },
    celestialCards: {
    quantumWinds: { id: "quantumWinds", name: "Quantum Solar Winds", desc: "Amplifies baseline passive Hydrogen generation by +25% per card level.", currency: "hydrogen", baseCost: new Decimal(2500), costScaling: 1.8, effectTarget: "hydrogenGen", effectPerLevel: 0.25 },
    gravimetricCore: { id: "gravimetricCore", name: "Gravimetric Compression Matrix", desc: "Amplifies raw Compression thermal yield by +20% per card level.", currency: "helium", baseCost: new Decimal(250), costScaling: 2.2, effectTarget: "compressionHeat", effectPerLevel: 0.20 }
    }
   };
    
   const SHOP_CONFIGS = {
    stardust: { containerId: 'stardust-shop-list', currency: 'stardust', label: '✨', borderColor: 'rgba(162, 155, 254, 0.4)', btnColor: '#6c5ce7' },
    pulsar: { containerId: 'pulsar-shop-list', currency: 'pulsarShards', label: '🌀', borderColor: 'rgba(0, 206, 201, 0.4)', btnColor: '#00cec9' },
    singularity: { containerId: 'singularity-shop-list', currency: 'singularityMass', label: '🌌', borderColor: 'rgba(108, 92, 231, 0.4)', btnColor: '#6c5ce7' }
   };
    
   const SAVE_VERSION = 15;
  
  // ==========================================================================
// [SEC-03] ENGINE STATE ENGINE INITIALIZATION TREE
// ==========================================================================
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
    stellarMassPassiveCount: new Decimal(0)
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
    // Phase IV Resources
    planetaryDebris: { amount: new Decimal(0) },
    darkMatter: { amount: new Decimal(0) },
    darkEnergyResidue: { amount: new Decimal(0) }
    },
    currencies: {
    stardust: { amount: new Decimal(0) },
    pulsarShards: { amount: new Decimal(0) },
    singularityMass: { amount: new Decimal(0) }
    },
    upgrades: { quantum: {}, plasma: {}, stardust: {}, pulsar: {}, singularity: {}, galaxy: {} },
    era3: getInitialEra3State(),
    era4: getInitialEra4State(),
    activeTab: "core",
    buyMode: 1,
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
function getQuantumFluctuationRate() {
    let rate = new Decimal(0);
    for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (state && state.level > 0) rate = rate.plus(def.gen.times(state.level));
    }
    return rate.times(gameState.inflatonMultiplier || 1);
   }
    
   function getEnergyDensityRate() {
    let rate = new Decimal(0);
    for (let key in COSMIC_REGISTRY.upgrades.quantum) {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (state && state.level > 0) rate = rate.plus(def.densityGen.times(state.level));
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
    return new Decimal(1).plus(diff.log10().times(0.05));
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
    return gameState.era3.temperature.div(1500000).floor().plus(1);
   }
    
   function getHydrogenGenRate() {
    let achBaseMult = gameState.achievements.firstSupernova.unlocked ? COSMIC_REGISTRY.achievements.firstSupernova.multiplier : 1.0; 
   let stardustMult = gameState.currencies.stardust.amount.times(0.5).plus(1);
    let carbonBoost = getCarbonGravityMultiplier();
    let baseGen = gameState.era3.gravity.times(carbonBoost).times(gameState.era3.tempMultiplier).times(stardustMult).times(achBaseMult).times(COSMIC_REGISTRY.resources.hydrogen.baseGen);
    let exponent = new Decimal(1).plus(new Decimal(0.05).times(gameState.upgrades.singularity.darkGravity.level));
    return baseGen.pow(exponent).times(getCardMultiplier("hydrogenGen")).round();
   }
    
   function getFusionCost() {
    return new Decimal(COSMIC_REGISTRY.resources.helium.fusionCost - ((gameState.upgrades.stardust.fusionDiscount?.level ?? 0) * 2));
   }
    
   function getCompressionsCompleted() {
    let exponent = gameState.era3.compressCost.div(10).log10() / Math.log10(2);
    return Math.max(0, Math.round(exponent));
   }
    
   function getCompressionHeatYield() {
    let shopMultiplier = new Decimal(1.0 + ((gameState.upgrades.stardust.thermalInsulation?.level ?? 0) * 0.20));
    let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
    let runGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(getCompressionsCompleted());
    let baseHeat = new Decimal(COSMIC_REGISTRY.constants.baseCompressionHeat).times(shopMultiplier).times(ironMultiplier).times(runGrowth);
    let exponent = new Decimal(1).plus(new Decimal(0.05).times(gameState.upgrades.singularity.stellarIgnition.level));
    return baseHeat.pow(exponent).times(getCardMultiplier("compressionHeat")).round();
   }
    
   function getGravityCostMultiplier() {
    return 1.5 - ((gameState.upgrades.stardust.gravityDiscount?.level ?? 0) * 0.03);
   }
    
   function getCarbonGravityMultiplier() {
    return gameState.resources.carbon.amount.times(0.02).plus(1);
   }
   
   // Era IV Planetary Accretion Pipeline Formulas
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
  // [SEC-07] GLOBAL METRICS & PROGRESSION TRACKERS
  // ==========================================================================
  function recalcTempMultiplier() {
    gameState.era3.tempMultiplier = gameState.era3.temperature.div(1500000).times(0.5).plus(1);
  }
  
  function updateStatsData() {
    if (gameState.era3.temperature.gt(gameState.stats.maxTemp)) {
      gameState.stats.maxTemp = gameState.era3.temperature;
    }
  }
  
  function checkAchievements() {
    if (gameState.resources.iron.amount.gte(1) && !gameState.achievements.firstIron.unlocked) {
      gameState.achievements.firstIron.unlocked = true;
      showToast("Achievement Unlocked: Heavy Metal! (Neon Core Skin active)");
      isDirty = true;
    }
    if (gameState.stats.supernovas.gte(1) && !gameState.achievements.firstSupernova.unlocked) {
      gameState.achievements.firstSupernova.unlocked = true;
      showToast("Achievement Unlocked: Stellar Collapse!");
      isDirty = true;
    }
  }
  
  function checkMissionProgress() {
    let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
    if (!currentRankDef) return;
  
    let allCompleted = true;
    for (let mission of currentRankDef.missions) {
      if (gameState.completedMissions.includes(mission.id)) continue;
      if (mission.check()) {
        gameState.completedMissions.push(mission.id);
        if (!flareSimSuppressed) showToast(`Mission Completed: ${mission.desc}`);
        isDirty = true;
      } else {
        allCompleted = false;
      }
    }
  
    if (allCompleted) {
      let nextRank = gameState.systemRank + 1;
      if (COSMIC_REGISTRY.systemRanks[nextRank]) {
        gameState.systemRank = nextRank;
        if (!flareSimSuppressed) showToast(`System Rank Up! Now Rank ${gameState.systemRank}: ${COSMIC_REGISTRY.systemRanks[nextRank].name}`);
        isDirty = true;
      }
    }
  }
  
  // ==========================================================================
  // [SEC-08] NOTIFICATION & TOAST HUD SYSTEM
  // ==========================================================================
  function showToast(message, duration = 4000) {
    const toast = document.getElementById('toast-container');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('toast-hidden');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toast.classList.add('toast-hidden'); }, duration);
  }
  
 // ==========================================================================
// [SEC-09] DEVELOPER SANDBOX CONTROL PROTOCOLS
// ==========================================================================
function checkDevMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') {
    document.getElementById('dev-matrix').classList.remove('dev-matrix-hidden');
    document.getElementById('warp-tag').style.display = 'inline';
    document.getElementById('dev-toggle-container').classList.remove('dev-toggle-hidden');
    }
   }
    
   function toggleDevMatrix() {
    const matrix = document.getElementById('dev-matrix');
    const tag = document.getElementById('warp-tag');
    if (matrix.classList.contains('dev-matrix-hidden')) {
    matrix.classList.remove('dev-matrix-hidden');
    tag.style.display = 'inline';
    showToast("Developer Matrix Enabled.");
    } else {
    matrix.classList.add('dev-matrix-hidden');
    tag.style.display = 'none';
    showToast("Developer Matrix Disabled.");
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
    // Grants plenty of Hydrogen for planet forming, along with Debris and Dark Matter
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
    
   function devSetEpoch(epochNum) {
    if (COSMIC_REGISTRY.universeChronology.epochs[epochNum]) {
    gameState.activeEpoch = epochNum;
    document.body.setAttribute('data-epoch', epochNum);
    isDirty = true;
    showToast(`Timeline Shifted to ${COSMIC_REGISTRY.universeChronology.epochs[epochNum].name}`);
    }
   }
  
// ==========================================================================
// [SEC-10] SHOP TRANSACTION INTERACTION MANAGEMENT
// ==========================================================================
function toggleBuyMode() {
    initAudio();
    if (gameState.buyMode === 1) gameState.buyMode = 10;
    else if (gameState.buyMode === 10) gameState.buyMode = 'max';
    else gameState.buyMode = 1;
    isDirty = true;
   }
    
   function getBuyLoopCount() {
    if (gameState.buyMode === 'max') return 100;
    let parsed = parseInt(gameState.buyMode, 10);
    return (isNaN(parsed) || parsed <= 0) ? 1 : parsed;
   }
    
   function clickCore() {
    initAudio();
    if (gameState.activeEpoch === 1) {
    let loopCount = gameState.buyMode === 'max' ? 1 : (parseInt(gameState.buyMode, 10) || 1);
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(new Decimal(1).times(loopCount));
    isDirty = true;
    }
   }
    
   function buyUpgrade(category, key) {
    initAudio();
    let loops = getBuyLoopCount();
    
    if (category === 'quantum') {
    let def = COSMIC_REGISTRY.upgrades.quantum[key];
    let state = gameState.upgrades.quantum[key];
    if (!def || !state) return;
    
    for (let i = 0; i < loops; i++) {
    if (gameState.resources.quantumFluctuations.amount.gte(state.cost)) {
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.minus(state.cost);
    state.level += 1;
    state.cost = state.cost.times(def.costScaling).round();
    isDirty = true;
    } else { break; }
    }
    } else if (category === 'plasma') {
    let def = COSMIC_REGISTRY.upgrades.plasma[key];
    let state = gameState.upgrades.plasma[key];
    if (!def || !state) return;
    
    for (let i = 0; i < loops; i++) {
    let fundingSource = null;
    if (key === 'quarkCondenser') fundingSource = gameState.resources.quarks;
    else if (key === 'gluonBinding') fundingSource = gameState.resources.gluons;
    else if (key === 'leptonHarvest') fundingSource = gameState.resources.leptons;
    else fundingSource = gameState.resources.protons;
    
    if (fundingSource.amount.gte(state.cost)) {
    fundingSource.amount = fundingSource.amount.minus(state.cost);
    state.level += 1;
    state.cost = state.cost.times(def.costScaling).round();
    isDirty = true;
    } else { break; }
    }
    } else if (category === 'galaxy') {
    let def = COSMIC_REGISTRY.upgrades.galaxy[key];
    let state = gameState.upgrades.galaxy[key];
    if (!def || !state) return;
    
    for (let i = 0; i < loops; i++) {
    if (gameState.resources.darkMatter.amount.gte(state.cost)) {
    gameState.resources.darkMatter.amount = gameState.resources.darkMatter.amount.minus(state.cost);
    state.level += 1;
    state.cost = state.cost.times(def.costScaling).round();
    isDirty = true;
    } else { break; }
    }
    } else if (category === 'core') {
    if (key === 'gravity') {
    for (let i = 0; i < loops; i++) {
    if (gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost)) {
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.minus(gameState.era3.gravityCost);
    gameState.era3.gravity = gameState.era3.gravity.plus(1);
    gameState.era3.gravityCost = gameState.era3.gravityCost.times(getGravityCostMultiplier()).floor();
    isDirty = true;
    } else { break; }
    }
    } else if (key === 'fuser') {
    for (let i = 0; i < loops; i++) {
    let costAmt = gameState.era3.fusionYield.eq(0) ? gameState.era3.fuserCostHydrogen : gameState.era3.fuserCostHelium;
    let currency = gameState.era3.fusionYield.eq(0) ? 'hydrogen' : 'helium';
    if (getAmount(currency).gte(costAmt)) {
    deduct(currency, costAmt);
    if (gameState.era3.fusionYield.eq(0)) {
    gameState.era3.fusionYield = new Decimal(1);
    } else {
    gameState.era3.fusionYield = gameState.era3.fusionYield.plus(1);
    gameState.era3.fuserCostHelium = gameState.era3.fuserCostHelium.times(2.5).round();
    }
    isDirty = true;
    } else { break; }
    }
    } else if (key === 'compress') {
    for (let i = 0; i < loops; i++) {
    if (gameState.resources.helium.amount.gte(gameState.era3.compressCost)) {
    gameState.resources.helium.amount = gameState.resources.helium.amount.minus(gameState.era3.compressCost);
    gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield());
    gameState.era3.compressCost = gameState.era3.compressCost.times(2).floor();
    recalcTempMultiplier();
    if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
    gameState.era3.stage = "Main Sequence Star";
    }
    updateStatsData();
    isDirty = true;
    } else { break; }
    }
    } else if (key === 'carbon') {
    if (gameState.era3.stage === "Main Sequence Star" && gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
    for (let i = 0; i < loops; i++) {
    let costAmt = gameState.era3.carbonYield.eq(0) ? gameState.era3.carbonCostHelium : gameState.era3.carbonCostCarbon;
    let currency = gameState.era3.carbonYield.eq(0) ? 'helium' : 'carbon';
    if (getAmount(currency).gte(costAmt)) {
    deduct(currency, costAmt);
    if (gameState.era3.carbonYield.eq(0)) {
    gameState.era3.carbonYield = new Decimal(1);
    showToast("Nucleosynthesis Unlocked: Generating Carbon!");
    } else {
    gameState.era3.carbonYield = gameState.era3.carbonYield.plus(1);
    gameState.era3.carbonCostCarbon = gameState.era3.carbonCostCarbon.times(2.5).round();
    }
    isDirty = true;
    } else { break; }
    }
    }
    } else if (key === 'iron') {
    if (gameState.era3.stage === "Main Sequence Star" && gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
    for (let i = 0; i < loops; i++) {
    let costAmt = gameState.era3.ironYield.eq(0) ? gameState.era3.ironCostCarbon : gameState.era3.ironCostIron;
    let currency = gameState.era3.ironYield.eq(0) ? 'carbon' : 'iron';
    if (getAmount(currency).gte(costAmt)) {
    deduct(currency, costAmt);
    if (gameState.era3.ironYield.eq(0)) {
    gameState.era3.ironYield = new Decimal(1);
    showToast("Heavy Nucleosynthesis: Synthesizing Iron!");
    } else {
    gameState.era3.ironYield = gameState.era3.ironYield.plus(1);
    gameState.era3.ironCostIron = gameState.era3.ironCostIron.times(2.5).round();
    }
    isDirty = true;
    } else { break; }
    }
    }
    }
    } else {
    let def = COSMIC_REGISTRY.upgrades[category][key];
    let state = gameState.upgrades[category][key];
    if (!def || !state) return;
    
    for (let i = 0; i < loops; i++) {
    if (getAmount(def.currency).gte(state.cost) && state.level < def.max) {
    deduct(def.currency, state.cost);
    state.level += 1;
    state.cost = state.cost.times(2).round();
    isDirty = true;
    } else { break; }
    }
    }
    
    if (gameState.activeTab === 'shop') renderShop('stardust');
    if (gameState.activeTab === 'pulsar') renderShop('pulsar');
    if (gameState.activeTab === 'singularity') renderShop('singularity');
    saveGame();
   }
    
   function buyCelestialCard(key) {
    initAudio();
    let loops = getBuyLoopCount();
    let def = COSMIC_REGISTRY.celestialCards[key];
    let cardState = gameState.cards[key];
    if (!def || !cardState) return;
    
    for (let i = 0; i < loops; i++) {
    if (getAmount(def.currency).gte(cardState.cost)) {
    deduct(def.currency, cardState.cost);
    cardState.level += 1;
    cardState.cost = cardState.cost.times(def.costScaling).round();
    isDirty = true;
    } else { break; }
    }
    
    if (gameState.activeTab === 'system') renderSystemTab();
    saveGame();
   }
    
   function toggleFuser() { 
    gameState.era3.fusersEnabled = !gameState.era3.fusersEnabled;
    isDirty = true;
   }
   
   function stabilizeArms() {
    initAudio();
    gameState.era4.stability = new Decimal(100);
    showToast("Orbital vectors synchronized. Rotational tracking fully operational!");
    isDirty = true;
   }
   
   function accretePlanetConfiguration() {
    initAudio();
    let cost = new Decimal(50000);
    if (gameState.resources.hydrogen.amount.gte(cost)) {
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.minus(cost);
    gameState.era4.planetaryNodes = gameState.era4.planetaryNodes.plus(1);
    showToast("Accretion Disk condensation active: New planetary configuration formed! 🌍");
    isDirty = true;
    } else {
    showToast("Insufficient absolute Hydrogen fuel parameters.");
    }
   }
  
  // ==========================================================================
// [SEC-11] PRESTIGE & MACRO-TIMELINE SHIFT MILESTONES
// ==========================================================================
function triggerInflation() {
    if (gameState.resources.quantumFluctuations.amount.lt(COSMIC_REGISTRY.constants.inflationThreshold)) return;
    
    let leftover = gameState.resources.quantumFluctuations.amount.minus(COSMIC_REGISTRY.constants.inflationThreshold);
    let bonusFactor = new Decimal(1).plus(leftover.div(100000).times(0.1));
    gameState.inflatonMultiplier = (gameState.inflatonMultiplier || new Decimal(1)).times(bonusFactor);
    
    gameState.activeEpoch = 2;
    document.body.setAttribute('data-epoch', 2);
    gameState.plasmaTemperature = new Decimal(10000000); 
    gameState.cosmicAge = new Decimal(0);
    
    const flashElement = document.createElement('div');
    flashElement.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 99999; pointer-events: none; animation: flashEffect 1.2s forwards;";
    document.body.appendChild(flashElement);
    setTimeout(() => flashElement.remove(), 1250);
    
    showToast("✨ INFINITE INFLATION SHIFT DETECTED! Welcome to Era II! ✨");
    switchTab('core');
    saveGame();
    isDirty = true;
   }
    
   function triggerRecombination() {
    if (!gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) && !gameState.plasmaTemperature.lte(3000)) return;
    
    gameState.activeEpoch = 3;
    document.body.setAttribute('data-epoch', 3);
    
    let startingHydrogen = gameState.resources.protons.amount.times(1.5).max(250);
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(startingHydrogen);
    
    const flashElement = document.createElement('div');
    flashElement.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 99999; pointer-events: none; animation: flashEffect 1.5s forwards;";
    document.body.appendChild(flashElement);
    setTimeout(() => flashElement.remove(), 1550);
    
    showToast("✨ COSMIC RECOMBINATION: Photons decoupled! Welcome to Era III! ✨");
    switchTab('core');
    saveGame();
    isDirty = true;
   }
    
   function triggerSupernova() {
    if (gameState.era3.temperature.lt(COSMIC_REGISTRY.constants.supernovaTempThreshold)) return;
    playSupernovaSound();
    
    let gainedStardust = getStardustYield();
    let outcome = "White Dwarf";
    let titleColor = "#ffffff";
    let extraRewardText = "";
    
    if (gameState.era3.stage === "Main Sequence Star" && gameState.era3.carbonYield.gt(0)) {
    outcome = "Neutron Star";
    titleColor = "#00cec9";
    let gainedPulsar = gameState.resources.carbon.amount.div(100).floor().plus(1);
    gameState.currencies.pulsarShards.amount = gameState.currencies.pulsarShards.amount.plus(gainedPulsar);
    extraRewardText = `<br><span style="color:#00cec9">+${format(gainedPulsar)} 🌀 Pulsar Shards</span>`;
    }
    
    if (gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) && gameState.era3.ironYield.gt(0)) {
    outcome = "Black Hole";
    titleColor = "#a29bfe";
    let gainedMass = gameState.resources.iron.amount.div(25).floor().plus(1);
    gameState.currencies.singularityMass.amount = gameState.currencies.singularityMass.amount.plus(gainedMass);
    extraRewardText += `<br><span style="color:#a29bfe">+${format(gainedMass)} 🌌 Singularity Mass</span>`;
    }
    
    gameState.currencies.stardust.amount = gameState.currencies.stardust.amount.plus(gainedStardust);
    gameState.stats.supernovas = gameState.stats.supernovas.plus(1);
    gameState.stats.totalStardust = gameState.stats.totalStardust.plus(gainedStardust);
    
    const overlay = document.getElementById('theatrical-overlay');
    const title = document.getElementById('theatrical-title');
    const core = document.getElementById('theatrical-core');
    const statsPanel = document.getElementById('theatrical-stats');
    
    title.textContent = `${outcome} Formation`;
    title.style.color = titleColor;
    document.getElementById('theatrical-temp').textContent = format(gameState.era3.temperature) + " K";
    
    document.getElementById('theatrical-elements').textContent = gameState.era3.ironYield.gt(0) ?
    "H, He, C, Fe" : (gameState.era3.carbonYield.gt(0) ? "H, He, C" : "H, He");
    
    document.getElementById('theatrical-reward').innerHTML = `+${format(gainedStardust)} ✨ Stardust${extraRewardText}`;
    
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
    
    gameState.resources.hydrogen.amount = new Decimal(0);
    gameState.resources.helium.amount = new Decimal(0);
    gameState.resources.carbon.amount = new Decimal(0);
    gameState.resources.iron.amount = new Decimal(0);
    
    gameState.era3 = getInitialEra3State();
    
    gameState.flares.active = null;
    gameState.buffs.fusionSurge.remainingSec = new Decimal(0);
    gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
    
    switchTab('core');
    saveGame();
    isDirty = true;
   }
    
   function closeTheatrical() {
    const overlay = document.getElementById('theatrical-overlay');
    overlay.classList.remove('theatrical-active');
    setTimeout(() => {
    document.getElementById('theatrical-core').style.transform = "none";
    document.getElementById('theatrical-core').style.background = "#fff";
    document.getElementById('theatrical-core').style.boxShadow = "0 0 50px 20px #fff";
    document.getElementById('theatrical-stats').style.opacity = "0";
    }, 1000);
   }
   
   function triggerGalacticMerge() {
    if (gameState.resources.darkMatter.amount.lt(10000)) {
    showToast("Requires at least 10,000 Dark Matter coordinates to anchor collision vectors.");
    return;
    }
    
    playSupernovaSound();
    let gainedResidue = getGalacticMergeYield();
    gameState.resources.darkEnergyResidue.amount = gameState.resources.darkEnergyResidue.amount.plus(gainedResidue);
    
    // Wipe atomic fuels and structural accretion coordinates to shift paradigms
    gameState.resources.quantumFluctuations.amount = new Decimal(0);
    gameState.resources.energyDensity.amount = new Decimal(0);
    gameState.resources.quarks.amount = new Decimal(0);
    gameState.resources.gluons.amount = new Decimal(0);
    gameState.resources.protons.amount = new Decimal(0);
    gameState.resources.leptons.amount = new Decimal(0);
    gameState.resources.electrons.amount = new Decimal(0);
    gameState.resources.hydrogen.amount = new Decimal(0);
    gameState.resources.helium.amount = new Decimal(0);
    gameState.resources.carbon.amount = new Decimal(0);
    gameState.resources.iron.amount = new Decimal(0);
    gameState.resources.planetaryDebris.amount = new Decimal(0);
    gameState.resources.darkMatter.amount = new Decimal(0);
    
    gameState.activeEpoch = 5;
    document.body.setAttribute('data-epoch', 5);
    
    const flashElement = document.createElement('div');
    flashElement.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 99999; pointer-events: none; animation: flashEffect 2s forwards;";
    document.body.appendChild(flashElement);
    setTimeout(() => flashElement.remove(), 2050);
    
    showToast(`🌌 GALAXY COLLISION COMPLETE: Secured +${format(gainedResidue)} Dark Energy Residue variables!`);
    switchTab('core');
    saveGame();
    isDirty = true;
   }
  
  // ==========================================================================
  // [SEC-12] NAVIGATION ROUTER ENGINE
  // ==========================================================================
  function switchTab(tabId) {
    const currentEpochDef = COSMIC_REGISTRY.universeChronology.epochs[gameState.activeEpoch] || COSMIC_REGISTRY.universeChronology.epochs[1];
    if (!currentEpochDef.tabs.includes(tabId)) return;
  
    gameState.activeTab = tabId;
    document.body.setAttribute('data-tab', tabId);
    
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    const targetNav = document.getElementById(`nav-${tabId}`);
    if (targetNav) targetNav.classList.add('active');
    
    if (tabId === 'shop') renderShop('stardust'); 
    if (tabId === 'pulsar') renderShop('pulsar'); 
    if (tabId === 'singularity') renderShop('singularity');
    if (tabId === 'stats') renderStats();
    if (tabId === 'system') renderSystemTab();
    isDirty = true;
  }
  
  // ==========================================================================
  // [SEC-13] DATA DATA HUB & UI SHOP VISUAL RENDERING
  // ==========================================================================
  function renderStats() {
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
  }
  
  function renderShop(shopId) {
    const config = SHOP_CONFIGS[shopId];
    if (!config) return;
    const shopList = document.getElementById(config.containerId);
    if (!shopList) return;
    shopList.innerHTML = '';
    
    const upgradesObj = COSMIC_REGISTRY.upgrades[shopId];
    for (let key in upgradesObj) {
      let def = upgradesObj[key];
      let state = gameState.upgrades[shopId][key];
      let isMaxed = state.level >= def.max;
      let canAfford = getAmount(config.currency).gte(state.cost) && !isMaxed;
      
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="btn-meta">
          <strong>${def.name} <span style="font-size: 0.75em; color:${config.btnColor};"> (Lvl ${state.level}/${def.max})</span></strong>
          <small>${def.desc}</small>
        </div>
        <button onclick="buyUpgrade('${shopId}', '${key}')" ${canAfford ? '' : 'disabled'} style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; background: ${canAfford ? config.btnColor : 'rgba(255,255,255,0.04)'}; color: ${canAfford ? '#fff' : '#636e72'}; border: 1px solid ${canAfford ? 'transparent' : 'rgba(255,255,255,0.05)'}; margin:0; width:auto !important; min-height:unset;">
          ${isMaxed ? 'MAXED' : 'Cost: ' + format(state.cost) + ' ' + config.label}
        </button>
      `;
      shopList.appendChild(row);
    }
  }
  
  function renderSystemTab() {
    const rankInfo = document.getElementById('system-rank-info');
    if (rankInfo) {
      let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
      if (currentRankDef) {
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
        row.innerHTML = `
          <div class="btn-meta">
            <strong>${def.name} <span class="lvl-display" style="font-size: 0.8em; color: #74b9ff;">(Lvl 0)</span></strong>
            <small>${def.desc}</small>
          </div>
          <button class="upgrade-btn" onclick="buyCelestialCard('${key}')" style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; margin:0; width:auto !important; min-height:unset;"></button>
        `;
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
  }
  
  // ==========================================================================
// [SEC-14] DOM IN-PLACE VIEW UPDATE CORES (GENERIC TIER LIST DRY ENGINE)
// ==========================================================================
function renderGenericTierList(containerId, category, costLabelText, displayColor, activeCurrencyField) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (container.children.length <= 1) {
    let headerText = category === 'quantum' ? 'FUNDAMENTAL PHYSICS STRATIFICATION' : 
                     (category === 'plasma' ? 'PRIMORDIAL PLASMA CRUCIBLE INFRASTRUCTURE' : 'MACRO GALACTIC ACCRETION NETWORK');
    container.innerHTML = `<div class="section-title" style="color: ${displayColor}; font-size: 1.0rem; letter-spacing: 2px; margin-bottom: 15px; font-weight: bold;">${headerText}</div>`;
    for (let key in COSMIC_REGISTRY.upgrades[category]) {
    const row = document.createElement('div');
    row.id = `${category}-row-${key}`;
    row.innerHTML = `
    <div class="btn-meta">
    <strong><span class="name-display"></span> <span class="lvl-display" style="font-size: 0.75em; color: ${displayColor};"></span></strong>
    <small class="desc-display"></small>
    </div>
    <button class="upgrade-btn" onclick="buyUpgrade('${category}', '${key}')" style="padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size:0.78rem; margin:0; width:auto !important; min-height:unset;"></button>
    `;
    container.appendChild(row);
    }
    }
    
    for (let key in COSMIC_REGISTRY.upgrades[category]) {
    let def = COSMIC_REGISTRY.upgrades[category][key];
    let state = gameState.upgrades[category][key];
    if (!state) continue;
    
    let currentCostLabel = typeof costLabelText === 'function' ? costLabelText(key) : costLabelText;
    let actualFunding = activeCurrencyField ? getAmount(activeCurrencyField) : null;
    if (category === 'plasma') {
    if (key === 'quarkCondenser') actualFunding = gameState.resources.quarks.amount;
    else if (key === 'gluonBinding') actualFunding = gameState.resources.gluons.amount;
    else if (key === 'leptonHarvest') actualFunding = gameState.resources.leptons.amount;
    else actualFunding = gameState.resources.protons.amount;
    } else if (category === 'quantum') {
    actualFunding = gameState.resources.quantumFluctuations.amount;
    } else if (category === 'galaxy') {
    actualFunding = gameState.resources.darkMatter.amount;
    }
    
    let isAffordable = actualFunding.gte(state.cost);
    const row = document.getElementById(`${category}-row-${key}`);
    if (row) {
    row.querySelector('.name-display').textContent = def.name;
    row.querySelector('.lvl-display').textContent = `(Lvl ${state.level})`;
    row.querySelector('.desc-display').textContent = def.desc;
    
    const btn = row.querySelector('.upgrade-btn');
    btn.textContent = `Cost: ${format(state.cost)} ${currentCostLabel}`;
    btn.disabled = !isAffordable;
    btn.style.background = isAffordable ? displayColor : 'rgba(255, 255, 255, 0.04)';
    btn.style.color = isAffordable ? '#fff' : '#636e72';
    btn.style.borderColor = isAffordable ? 'transparent' : 'rgba(255, 255, 255, 0.05)';
    }
    }
   }
    
   function updateStardustDisplays() {
    document.getElementById('stardust-count').textContent = format(gameState.currencies.stardust.amount);
    document.getElementById('stardust-boost').textContent = format(gameState.currencies.stardust.amount.times(50));
    
    let estStardust = getStardustYield();
    let estPulsar = gameState.resources.carbon.amount.gt(0) ? gameState.resources.carbon.amount.div(100).floor().plus(1) : new Decimal(0);
    let estSingularity = gameState.resources.iron.amount.gt(0) ? gameState.resources.iron.amount.div(25).floor().plus(1) : new Decimal(0);
    let estText = `+${format(estStardust)} ✨`;
    
    if (estPulsar.gt(0)) estText += ` | +${format(estPulsar)} 🌀`;
    if (estSingularity.gt(0)) estText += ` | +${format(estSingularity)} 🌌`;
    
    const supernovaEstimateNode = document.getElementById('supernova-gain-estimate');
    if (supernovaEstimateNode) supernovaEstimateNode.innerHTML = estText;
    
    if (gameState.currencies.pulsarShards.amount.gt(0) || gameState.currencies.singularityMass.amount.gt(0)) {
    document.getElementById('tier2-currencies').classList.remove('tier2-hidden');
    document.getElementById('pulsar-count').textContent = format(gameState.currencies.pulsarShards.amount);
    document.getElementById('singularity-count').textContent = format(gameState.currencies.singularityMass.amount);
    }
   }
    
   function renderStellarNodeButtons() {
    const btnGravity = document.getElementById('btn-gravity');
    if (btnGravity) btnGravity.disabled = gameState.resources.hydrogen.amount.lt(gameState.era3.gravityCost);
    
    const btnCompress = document.getElementById('btn-compress');
    if (btnCompress) btnCompress.disabled = gameState.resources.helium.amount.lt(gameState.era3.compressCost);
    
    const btnToggleFuser = document.getElementById('btn-toggle-fuser');
    if (btnToggleFuser) btnToggleFuser.disabled = gameState.era3.fusionYield.eq(0);
    
    const fuserBtnText = document.getElementById('fuser-text');
    const fuserCostLabel = document.getElementById('fuser-cost-label');
    const btnFuser = document.getElementById('btn-fuser');
    if (btnFuser && fuserBtnText && fuserCostLabel) {
    if (gameState.era3.fusionYield.eq(0)) {
    fuserBtnText.textContent = "Unlock Auto-Fuser";
    fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHydrogen)} H`;
    btnFuser.disabled = gameState.resources.hydrogen.amount.lt(gameState.era3.fuserCostHydrogen);
    } else {
    fuserBtnText.textContent = `Upgrade Fusion Yield (To +${format(gameState.era3.fusionYield.plus(1))})`;
    fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHelium)} He`;
    btnFuser.disabled = gameState.resources.helium.amount.lt(gameState.era3.fuserCostHelium);
    }
    }
    
    const carbonBtn = document.getElementById('btn-carbon');
    const carbonCostLabel = document.getElementById('carbon-cost-label');
    if (carbonBtn && carbonCostLabel) {
    if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
    carbonBtn.disabled = true;
    carbonCostLabel.textContent = `Locked (${format(COSMIC_REGISTRY.resources.carbon.unlockTemp)} K)`;
    } else if (gameState.era3.carbonYield.eq(0)) {
    carbonBtn.disabled = gameState.resources.helium.amount.lt(gameState.era3.carbonCostHelium);
    carbonCostLabel.textContent = `${format(gameState.era3.carbonCostHelium)} He`;
    } else {
    carbonBtn.disabled = gameState.resources.carbon.amount.lt(gameState.era3.carbonCostCarbon);
    carbonCostLabel.textContent = `${format(gameState.era3.carbonCostCarbon)} C`;
    }
    }
    
    const ironBtn = document.getElementById('btn-iron');
    const ironCostLabel = document.getElementById('iron-cost-label');
    if (ironBtn && ironCostLabel) {
    if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
    ironBtn.disabled = true;
    ironCostLabel.textContent = `Locked (${format(COSMIC_REGISTRY.resources.iron.unlockTemp)} K)`;
    } else if (gameState.era3.ironYield.eq(0)) {
    ironBtn.disabled = gameState.resources.carbon.amount.lt(gameState.era3.ironCostCarbon);
    ironCostLabel.textContent = `${format(gameState.era3.ironCostCarbon)} C`;
    } else {
    ironBtn.disabled = gameState.resources.iron.amount.lt(gameState.era3.ironCostIron);
    ironCostLabel.textContent = `${format(gameState.era3.ironCostIron)} Fe`;
    }
    }
    
    const supernovaBtn = document.getElementById('btn-supernova');
    if (supernovaBtn) {
    if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.supernovaTempThreshold)) {
    supernovaBtn.disabled = false;
    supernovaBtn.style.background = "#d63031";
    supernovaBtn.style.color = "#fff";
    supernovaBtn.textContent = "TRIGGER SUPERNOVA RESET SEQUENCE";
    } else {
    supernovaBtn.disabled = true;
    supernovaBtn.style.background = "rgba(255,255,255,0.03)";
    supernovaBtn.style.color = "#4b4b4b";
    supernovaBtn.textContent = `Requires 100M K (Current: ${format(gameState.era3.temperature)} K)`;
    }
    }
    
    document.getElementById('nav-prestige').disabled = !(gameState.era3.stage === "Main Sequence Star" || gameState.currencies.stardust.amount.gt(0));
    document.getElementById('nav-shop').disabled = !gameState.currencies.stardust.amount.gt(0);
    document.getElementById('nav-pulsar').disabled = !(gameState.currencies.pulsarShards.amount.gt(0) || gameState.upgrades.pulsar.autoCompress.level > 0);
    document.getElementById('nav-singularity').disabled = !(gameState.currencies.singularityMass.amount.gt(0) || gameState.upgrades.singularity.darkGravity.level > 0);
    document.getElementById('nav-system').disabled = !(gameState.systemRank > 1 || gameState.currencies.pulsarShards.amount.gt(0));
    
    const core = document.getElementById('star-core');
    if (core) {
    let coreTempNum = gameState.era3.temperature.lt(1e12) ? gameState.era3.temperature.toNumber() : 1e12;
    let newSize = Math.min(60 + (coreTempNum / 1500000) * 12, 200); 
    core.style.width = newSize + 'px';
    core.style.height = newSize + 'px';
    }
   }
    
   function updateScreen() {
    const currentEpoch = COSMIC_REGISTRY.universeChronology.epochs[gameState.activeEpoch] || COSMIC_REGISTRY.universeChronology.epochs[3];
    
    document.getElementById('active-epoch-name').textContent = currentEpoch.name;
    document.getElementById('btn-buy-mode').textContent = `Buy Mode: ${gameState.buyMode === 'max' ? 'MAX' : 'x' + gameState.buyMode}`;
    
    const allPossibleTabs = ["core", "upgrades", "system", "shop", "pulsar", "singularity", "prestige", "stats", "settings"];
    allPossibleTabs.forEach(tabId => {
    const navBtn = document.getElementById(`nav-${tabId}`);
    if (navBtn) navBtn.style.display = currentEpoch.tabs.includes(tabId) ? "" : "none";
    });
    
    const coreCanvasElement = document.getElementById('star-core');
    if (coreCanvasElement) coreCanvasElement.setAttribute('data-canvas-style', currentEpoch.canvasStyle);
    
    if (gameState.activeEpoch === 1) {
    document.getElementById('label-hydrogen').innerHTML = `QUANTUM FLUCTUATIONS <span class="info-btn" onclick="showToast('Energy fields bubbling up from space-time.')">ⓘ</span>`;
    document.getElementById('count').textContent = format(gameState.resources.quantumFluctuations.amount);
    document.getElementById('auto-rate').textContent = format(getQuantumFluctuationRate());
    
    document.getElementById('label-helium').innerHTML = `ENERGY DENSITY <span class="info-btn" onclick="showToast('Concentration of space parameters.')">ⓘ</span>`;
    document.getElementById('helium-count').textContent = format(gameState.resources.energyDensity.amount);
    document.getElementById('helium-yield').textContent = "Temp: " + format(gameState.eraITemperature) + " K";
    
    const inflationBtn = document.getElementById('btn-inflation');
    if (inflationBtn) {
    inflationBtn.disabled = gameState.resources.quantumFluctuations.amount.lt(COSMIC_REGISTRY.constants.inflationThreshold);
    }
    
    if (gameState.activeTab === 'core') {
    renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7', 'quantumFluctuations');
    }
    } 
    else if (gameState.activeEpoch === 2) {
    let pRates = getPlasmaPassiveRates();
    document.getElementById('label-hydrogen').innerHTML = `PRIMORDIAL QUARKS <span class="info-btn" onclick="showToast('Elements of baryonic mass.')">ⓘ</span>`;
    document.getElementById('count').textContent = format(gameState.resources.quarks.amount);
    document.getElementById('auto-rate').textContent = format(pRates.quarks);
    
    document.getElementById('label-helium').innerHTML = `PRIMORDIAL GLUONS <span class="info-btn" onclick="showToast('Gauge bosons.')">ⓘ</span>`;
    document.getElementById('helium-count').textContent = format(gameState.resources.gluons.amount);
    document.getElementById('helium-yield').innerHTML = `+${format(pRates.gluons)}/s`;
    
    document.getElementById('label-carbon').innerHTML = `SYNTHESIZED PROTONS <span class="info-btn" onclick="showToast('Subatomic clusters.')">ⓘ</span>`;
    document.getElementById('carbon-count').textContent = format(gameState.resources.protons.amount);
    document.getElementById('carbon-boost-container').innerHTML = `Cap: +${format(getProtonFusionCap())}/s`;
    
    document.getElementById('label-iron').innerHTML = `ELECTRONS / TEMP <span class="info-btn" onclick="showToast('Thermal parameters.')">ⓘ</span>`;
    document.getElementById('iron-count').textContent = format(gameState.resources.electrons.amount);
    document.getElementById('iron-boost-container').innerHTML = `Temp: ${format(gameState.plasmaTemperature)} K`;
    
    const recombBtn = document.getElementById('btn-recombination');
    if (recombBtn) {
    recombBtn.disabled = !(gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || gameState.plasmaTemperature.lte(3000));
    }
    
    if (gameState.activeTab === 'core') {
    renderGenericTierList('plasma-upgrades-container', 'plasma', (k) => k === 'quarkCondenser' ? 'Quarks' : k === 'gluonBinding' ? 'Gluons' : k === 'leptonHarvest' ? 'Leptons' : 'Protons', '#e17055');
    }
    } 
    else if (gameState.activeEpoch === 3) {
    document.getElementById('label-hydrogen').innerHTML = `HYDROGEN <span class="info-btn" onclick="showToast('Base fuel.')">ⓘ</span>`;
    document.getElementById('label-helium').innerHTML = `HELIUM <span class="info-btn" onclick="showToast('Helium structure.')">ⓘ</span>`;
    document.getElementById('label-carbon').innerHTML = `CARBON <span class="info-btn" onclick="showToast('Carbon matrices.')">ⓘ</span>`;
    document.getElementById('label-iron').innerHTML = `IRON <span class="info-btn" onclick="showToast('Iron core yields.')">ⓘ</span>`;
    
    document.getElementById('count').textContent = format(gameState.resources.hydrogen.amount);
    document.getElementById('auto-rate').textContent = format(getHydrogenGenRate());
    document.getElementById('cost').textContent = format(gameState.era3.gravityCost);
    document.getElementById('helium-count').textContent = format(gameState.resources.helium.amount);
    document.getElementById('helium-yield').innerHTML = `Yield: ${format(gameState.era3.fusionYield)}/f`;
    document.getElementById('temp').textContent = format(gameState.era3.temperature);
    document.getElementById('multiplier').textContent = format(gameState.era3.tempMultiplier) + "x";
    document.getElementById('compress-cost').textContent = format(gameState.era3.compressCost);
    document.getElementById('stage').textContent = gameState.era3.stage;
    
    document.getElementById('carbon-count').textContent = format(gameState.resources.carbon.amount);
    document.getElementById('carbon-boost').textContent = format(getCarbonGravityMultiplier().minus(1).times(100));
    document.getElementById('carbon-box').style.opacity = gameState.era3.stage === "Main Sequence Star" ? "1" : "0.3";
    
    let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
    document.getElementById('iron-count').textContent = format(gameState.resources.iron.amount);
    document.getElementById('iron-boost').textContent = format(ironMultiplier.minus(1).times(100));
    document.getElementById('iron-box').style.opacity = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) ? "1" : "0.3";
    
    updateStardustDisplays();
    renderStellarNodeButtons();
    }
    else if (gameState.activeEpoch === 4) {
    let dRate = getGalacticDebrisRate();
    let dmRate = getGalacticDarkMatterRate();
    
    document.getElementById('label-hydrogen').innerHTML = `ACCUMULATED HYDROGEN <span class="info-btn" onclick="showToast('Core fuel stocks.')">ⓘ</span>`;
    document.getElementById('count').textContent = format(gameState.resources.hydrogen.amount);
    document.getElementById('auto-rate').textContent = "0";
    
    document.getElementById('label-helium').innerHTML = `STELLAR MASS INDEX <span class="info-btn" onclick="showToast('Phase III Stars active as background tracking items.')">ⓘ</span>`;
    document.getElementById('helium-count').textContent = format(gameState.era4.stellarMassPassiveCount);
    document.getElementById('helium-yield').innerHTML = "Ticking Background";
    
    document.getElementById('debris-count').textContent = format(gameState.resources.planetaryDebris.amount);
    document.getElementById('debris-rate').textContent = format(dRate);
    
    document.getElementById('darkmatter-count').textContent = format(gameState.resources.darkMatter.amount);
    document.getElementById('darkmatter-rate').textContent = format(dmRate);
    
    document.getElementById('galaxy-stability-val').textContent = format(gameState.era4.stability) + "%";
    const barFill = document.getElementById('stability-bar-fill');
    if (barFill) barFill.style.width = gameState.era4.stability.toString() + "%";
    
    document.getElementById('planetary-count-label').textContent = format(gameState.era4.planetaryNodes);
    
    const mergeBtn = document.getElementById('btn-galactic-merge');
    if (mergeBtn) {
    let ready = gameState.resources.darkMatter.amount.gte(10000);
    mergeBtn.disabled = !ready;
    mergeBtn.textContent = ready ? `COLLIDE GALAXY MATRIX (Yield: +${format(getGalacticMergeYield())} Dark Energy)` : `Merge Requires 10,000 Dark Matter (Current: ${format(gameState.resources.darkMatter.amount)})`;
    }
    
    if (gameState.activeTab === 'core') {
    renderGenericTierList('galaxy-upgrades-container', 'galaxy', 'DM', '#00ecc6', 'darkMatter');
    }
    }
    
    if (gameState.activeTab === 'system') renderSystemTab();
    renderFlare();
   }
  
  // ==========================================================================
// [SEC-15] TIME LOOP & EPOCH CHUNK SIMULATION TICK CORES
// ==========================================================================
function gameTick(dt) {
    const TICK_CHUNK_SIZE = 1.0;
    let timeRemaining = dt;
    
    while (timeRemaining > 0) {
    let currentDt = Math.min(timeRemaining, TICK_CHUNK_SIZE);
    simulateTick(currentDt);
    timeRemaining -= currentDt;
    }
    
    checkAchievements();
    checkMissionProgress();
    isDirty = true;
   }
    
   function simulateTick(dt) {
    if (gameState.activeEpoch === 1) {
    tickQuantumFoam(dt);
    } else if (gameState.activeEpoch === 2) {
    tickPlasmaCrucible(dt);
    } else if (gameState.activeEpoch === 3) {
    tickStellarDawn(dt);
    } else if (gameState.activeEpoch === 4) {
    tickGalacticMatrix(dt);
    }
    
    gameState.buffs.fusionSurge.remainingSec = Decimal.max(0, gameState.buffs.fusionSurge.remainingSec.minus(dt));
   }
    
   function tickQuantumFoam(dt) {
    let passiveFluctuations = getQuantumFluctuationRate().times(dt);
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(passiveFluctuations);
    
    let passiveDensity = getEnergyDensityRate().times(dt);
    gameState.resources.energyDensity.amount = gameState.resources.energyDensity.amount.plus(passiveDensity);
    
    if (gameState.resources.energyDensity.amount.gt(0)) {
    let coolingFactor = gameState.resources.energyDensity.amount.plus(1).log10().times(1e24).times(dt);
    gameState.eraITemperature = Decimal.max(COSMIC_REGISTRY.constants.eraIInflationTemp, gameState.eraITemperature.minus(coolingFactor));
    }
   }
    
   function tickPlasmaCrucible(dt) {
    gameState.cosmicAge = (gameState.cosmicAge || new Decimal(0)).plus(dt);
    let plasmaRates = getPlasmaPassiveRates();
    
    gameState.resources.quarks.amount = gameState.resources.quarks.amount.plus(plasmaRates.quarks.times(dt));
    gameState.resources.gluons.amount = gameState.resources.gluons.amount.plus(plasmaRates.gluons.times(dt));
    gameState.resources.leptons.amount = gameState.resources.leptons.amount.plus(plasmaRates.leptons.times(dt));
    
    if (plasmaRates.cooling.gt(0)) {
    gameState.plasmaTemperature = Decimal.max(300, gameState.plasmaTemperature.minus(plasmaRates.cooling.times(dt)));
    }
    
    if (gameState.plasmaTemperature.lt(500000) && gameState.resources.leptons.amount.gt(0)) {
    let electronHarvest = gameState.resources.leptons.amount.div(2).floor().times(dt);
    gameState.resources.electrons.amount = gameState.resources.electrons.amount.plus(electronHarvest);
    }
    
    let asymmetryModifier = getBaryonAsymmetryMultiplier();
    let fCap = getProtonFusionCap().times(dt).times(asymmetryModifier);
    let availByQuarks = gameState.resources.quarks.amount.div(3).floor();
    let availByGluons = gameState.resources.gluons.amount.div(2).floor();
    let executedFusions = Decimal.min(fCap, availByQuarks, availByGluons).floor();
    
    if (executedFusions.gt(0)) {
    gameState.resources.quarks.amount = gameState.resources.quarks.amount.minus(executedFusions.times(3));
    gameState.resources.gluons.amount = gameState.resources.gluons.amount.minus(executedFusions.times(2));
    gameState.resources.protons.amount = gameState.resources.protons.amount.plus(executedFusions);
    }
   }
    
   function tickStellarDawn(dt) {
    let generation = getHydrogenGenRate().times(dt);
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(generation);
    
    if (gameState.era3.fusersEnabled && gameState.era3.fusionYield.gt(0)) {
    let maxFusionsByMaterial = gameState.resources.hydrogen.amount.div(getFusionCost()).floor();
    let maxFusionsByTime = new Decimal(20).plus(gameState.era3.fusionYield.times(5)).times(dt).times(getFusionSurgeMultiplier());
    let actualFusions = Decimal.min(maxFusionsByMaterial, maxFusionsByTime).floor();
    
    if (actualFusions.gt(0)) {
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.minus(actualFusions.times(getFusionCost()));
    gameState.resources.helium.amount = gameState.resources.helium.amount.plus(actualFusions.times(gameState.era3.fusionYield));
    }
    }
    
    if (gameState.upgrades.pulsar.autoCompress.level > 0) {
    autoCompressAccumulator += gameState.upgrades.pulsar.autoCompress.level * dt;
    let maxCompressionsThisTick = Math.floor(autoCompressAccumulator);
    autoCompressAccumulator -= maxCompressionsThisTick;
    let compressionsDone = 0;
    
    while (compressionsDone < maxCompressionsThisTick && gameState.resources.helium.amount.gte(gameState.era3.compressCost)) {
    gameState.resources.helium.amount = gameState.resources.helium.amount.minus(gameState.era3.compressCost);
    gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield());
    gameState.era3.compressCost = gameState.era3.compressCost.times(2).floor();
    recalcTempMultiplier();
    
    if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
    gameState.era3.stage = "Main Sequence Star";
    }
    compressionsDone++;
    }
    if (compressionsDone > 0) updateStatsData();
    }
    
    let synthMultiplier = new Decimal(1).plus(gameState.upgrades.pulsar.autoSynthesize.level);
    
    const carbonFusionCost = COSMIC_REGISTRY.resources.carbon.fusionCost;
    if (gameState.era3.carbonYield.gt(0) && gameState.resources.helium.amount.gte(carbonFusionCost)) {
    let maxCarbonFusionsByMaterial = gameState.resources.helium.amount.div(carbonFusionCost).floor();
    let maxCarbonFusionsByTime = new Decimal(10).times(dt).times(synthMultiplier);
    let actualCarbonFusions = Decimal.min(maxCarbonFusionsByMaterial, maxCarbonFusionsByTime).floor();
    
    if (actualCarbonFusions.gt(0)) {
    gameState.resources.helium.amount = gameState.resources.helium.amount.minus(actualCarbonFusions.times(carbonFusionCost));
    gameState.resources.carbon.amount = gameState.resources.carbon.amount.plus(actualCarbonFusions.times(gameState.era3.carbonYield));
    }
    }
    
    const ironFusionCost = COSMIC_REGISTRY.resources.iron.fusionCost;
    if (gameState.era3.ironYield.gt(0) && gameState.resources.carbon.amount.gte(ironFusionCost)) {
    let maxIronFusionsByMaterial = gameState.resources.carbon.amount.div(ironFusionCost).floor();
    let maxIronFusionsByTime = new Decimal(10).times(dt).times(synthMultiplier);
    let actualIronFusions = Decimal.min(maxIronFusionsByMaterial, maxIronFusionsByTime).floor();
    
    if (actualIronFusions.gt(0)) {
    gameState.resources.carbon.amount = gameState.resources.carbon.amount.minus(actualIronFusions.times(ironFusionCost));
    gameState.resources.iron.amount = gameState.resources.iron.amount.plus(actualIronFusions.times(gameState.era3.ironYield));
    }
    }
    
    if (!flareSimSuppressed) {
    if (gameState.flares.active) {
    gameState.flares.active.expiresInSec = gameState.flares.active.expiresInSec.minus(dt);
    if (gameState.flares.active.expiresInSec.lte(0)) expireFlare();
    } else {
    gameState.flares.nextSpawnInSec = gameState.flares.nextSpawnInSec.minus(dt);
    if (gameState.flares.nextSpawnInSec.lte(0)) spawnFlare();
    }
    }
   }
   
   function tickGalacticMatrix(dt) {
    // Nesting doll design: Maps legacy Phase III upgrades cleanly to build the initial stellar structure count
    if (gameState.era3.gravity.gt(0) && gameState.era4.stellarMassPassiveCount.eq(0)) {
    gameState.era4.stellarMassPassiveCount = gameState.era3.gravity.plus(2);
    }
    
    // Handle real-time systemic arm stability orbital decay curves
    let decayReduction = new Decimal(0.15).times(gameState.upgrades.galaxy?.armStabilization?.level || 0);
    let netDecay = gameState.era4.orbitalDecayRate.minus(decayReduction).max(0.1);
    gameState.era4.stability = Decimal.max(10, gameState.era4.stability.minus(netDecay.times(dt)));
    
    // Accumulate Era IV automated resources
    let debrisYield = getGalacticDebrisRate().times(dt);
    gameState.resources.planetaryDebris.amount = gameState.resources.planetaryDebris.amount.plus(debrisYield);
    
    let dmYield = getGalacticDarkMatterRate().times(dt);
    gameState.resources.darkMatter.amount = gameState.resources.darkMatter.amount.plus(dmYield);
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
    
   function ensureStateShape() {
    const initialState = getInitialGameState();
    deepMergeMissing(gameState, initialState);
   }
    
   function saveGame() {
    const saveState = { version: SAVE_VERSION, gameState: serializeState(gameState), lastSavedTime: Date.now() };
    localStorage.setItem('starForgeSave_v15', JSON.stringify(saveState));
   }
    
   function loadGame() {
    try {
    let rawData = localStorage.getItem('starForgeSave_v15');
    if (rawData) {
    let parsed = JSON.parse(rawData);
    if (parsed && parsed.version === SAVE_VERSION) {
    gameState = deserializeState(parsed.gameState);
    ensureStateShape();
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
    return;
    }
    }
    
    // Legacy Save Fallback Migration Handler Routine
    let oldData = localStorage.getItem('starForgeSave_v14');
    if (oldData) {
    let legacyParsed = JSON.parse(oldData);
    if (legacyParsed && legacyParsed.gameState) {
    let legacyState = deserializeState(legacyParsed.gameState);
    gameState = getInitialGameState();
    
    // Deep copy universal resources across profiles
    for(let key in legacyState) {
    if (gameState[key] !== undefined && typeof legacyState[key] !== 'object') {
    gameState[key] = legacyState[key];
    }
    }
    
    // Map ancestral root variables into newly isolated namespaced array structures safely
    let era3Target = getInitialEra3State();
    for(let property in era3Target) {
    if (legacyState[property] !== undefined) {
    gameState.era3[property] = legacyState[property];
    }
    }
    
    ensureStateShape();
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
    showToast("Timeline data migrated to decoupled namespacing structures.");
    return;
    }
    }
    
    ensureStateShape();
    document.body.setAttribute('data-epoch', gameState.activeEpoch);
    document.body.setAttribute('data-tab', gameState.activeTab);
    } catch (error) {
    ensureStateShape();
    }
   }
    
   function exportSave() {
    saveGame(); 
    let rawData = localStorage.getItem('starForgeSave_v15');
    if (rawData) {
    let encoded = btoa(rawData);
    navigator.clipboard.writeText(encoded).then(() => showToast("Universe encrypted to clipboard!"))
    .catch(() => showToast("Clipboard write permission blocked."));
    }
   }
    
   function importSave() {
    let input = document.getElementById('import-string').value.trim();
    if (!input) return;
    try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (parsed && parsed.version === SAVE_VERSION) {
    localStorage.setItem('starForgeSave_v15', decoded);
    location.reload();
    } else { showToast("Unsupported timeline formatting configuration."); }
    } catch (e) { showToast("Fatal transmission verification corruption."); }
   }
    
   function wipeSave() {
    if (confirm("Reset cosmic matrix back down to absolute zero parameters?")) {
    Object.keys(localStorage).forEach(key => {
    if (key.startsWith('starForgeSave_')) {
    localStorage.removeItem(key);
    }
    });
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
    let expectedGrowth = new Decimal(COSMIC_REGISTRY.constants.compressionScaling).pow(3);
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
    let expected = new Decimal(1).plus(new Decimal(100).log10().times(0.05)); 
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
    // Formula check: (5 nodes * 3 + 10 stars * 0.5) * 2^1 upgrade multiplier * 100% stability = 40
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
    for (let reward of validRewards) {
      cumulative += reward.weight;
      if (roll <= cumulative) return reward.key;
    }
    return validRewards[validRewards.length - 1].key;
  }
  
  function spawnFlare() {
    const type = rollFlareType();
    if (!type) return;
    gameState.flares.active = { type: type, expiresInSec: new Decimal(COSMIC_REGISTRY.solarEvents.flare.spawn.activeWindowSec) };
    showToast(`Solar Prominence Active! Magnetic flare detected! ${COSMIC_REGISTRY.solarEvents.flare.fx.emoji}`);
    isDirty = true;
  }
  
  function collectFlare() {
    const active = gameState.flares.active;
    if (!active) return;
    const rewardConfig = COSMIC_REGISTRY.solarEvents.flare.rewards[active.type];
    if (active.type === 'hydrogenSurge') {
      gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(getHydrogenGenRate().times(rewardConfig.secondsOfProduction));
    } else if (active.type === 'magneticSurge') {
      gameState.buffs.fusionSurge.remainingSec = new Decimal(rewardConfig.buff.durationSec);
    }
    gameState.stats.flaresCollected = gameState.stats.flaresCollected.plus(1);
    showToast(rewardConfig.toast);
    gameState.flares.active = null;
    gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
    isDirty = true;
  }
  
  function expireFlare() {
    const missConfig = COSMIC_REGISTRY.solarEvents.flare.miss;
    gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield().times(missConfig.tempPctOfCompression).round());
    recalcTempMultiplier();
    if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
      gameState.era3.stage = "Main Sequence Star";
    }
    updateStatsData();
    showToast(missConfig.toast);
    gameState.flares.active = null;
    gameState.flares.nextSpawnInSec = rollNextSpawnDelay();
    isDirty = true;
  }
  
  function getFusionSurgeMultiplier() {
    return gameState.buffs.fusionSurge.remainingSec.gt(0) ? new Decimal(COSMIC_REGISTRY.solarEvents.flare.rewards.magneticSurge.buff.multiplier) : new Decimal(1);
  }
  
  function renderFlare() {
    const btn = document.getElementById('flare-button');
    if (!btn) return;
    if (gameState.flares.active) {
      btn.classList.remove('visual-hidden');
      btn.textContent = `${COSMIC_REGISTRY.solarEvents.flare.fx.emoji} PROMINENCE ACTIVE! (${Math.ceil(gameState.flares.active.expiresInSec.toNumber())}s)`;
    } else {
      btn.classList.add('visual-hidden');
    }
  }
  
  // ==========================================================================
  // [SEC-19] RUNTIME TIMERS & CORE BOOTSTRAP INITIALIZATION
  // ==========================================================================
  setInterval(function() {
    let now = Date.now();
    let dt = Math.max(0, (now - lastTick) / 1000); 
    lastTick = now;
    gameTick(dt);
  }, 100);
  
  // High Performance Engine Check: Only updates DOM parameters if calculations flag changes
  function renderLoop() {
    if (isDirty) {
      try { 
        updateScreen(); 
        isDirty = false;
      } catch (err) { 
        console.error("Render dropped frame execution node.", err); 
      }
    }
    requestAnimationFrame(renderLoop);
  }
  
  setInterval(function() { saveGame(); }, 5000);
  
  loadGame();
  checkDevMode();
  runParityHarness();
  switchTab(gameState.activeTab);
  requestAnimationFrame(renderLoop);