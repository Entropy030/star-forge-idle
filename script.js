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
      1: { id: "quantum_foam", name: "Era I: The Quantum Foam", canvasStyle: "singularity-point", tabs: ["core", "upgrades", "settings"] },
      2: { id: "plasma_crucible", name: "Era II: The Primordial Soup", canvasStyle: "plasma-haze", tabs: ["core", "upgrades", "settings"] },
      3: { id: "stellar_dawn", name: "Era III: The Stellar Dawn", canvasStyle: "star-core", tabs: ["core", "upgrades", "prestige", "settings"] },
      4: { id: "galactic_matrix", name: "Era IV: The Galactic Matrix", canvasStyle: "galaxy-wheel", tabs: ["core", "settings"] },
      5: { id: "deep_future", name: "Era V: The Event Horizon", canvasStyle: "singularity-point", tabs: ["core", "settings"] }
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
      gravityForce: { id: "gravityForce", name: "🌌 Gravitational Coupling", baseCost: new Decimal(10), costScaling: 1.4, gen: new Decimal(1), densityGen: new Decimal(0.5), desc: "Couples mass metrics. Generates +1 Fluctuation/s and +0.5 Density/s." },
      weakForce: { id: "weakForce", name: "⚛️ Weak Nuclear Vector", baseCost: new Decimal(150), costScaling: 1.5, gen: new Decimal(12), densityGen: new Decimal(4), desc: "Triggers gauge boson exchange. Generates +12 Fluctuations/s and +4 Density/s." },
      electromagneticForce: { id: "electromagneticForce", name: "🧲 Electromagnetic Tensor", baseCost: new Decimal(2000), costScaling: 1.6, gen: new Decimal(140), densityGen: new Decimal(30), desc: "Sustains photon field propagation. Generates +140 Fluctuations/s and +30 Density/s." },
      strongForce: { id: "strongForce", name: "💥 Strong Color Force", baseCost: new Decimal(25000), costScaling: 1.8, gen: new Decimal(1800), densityGen: new Decimal(400), desc: "Binds color charges via gluons. Generates +1800 Fluctuations/s and +400 Density/s." }
    },
    plasma: {
      quarkCondenser: { id: "quarkCondenser", name: "💠 Quark Condenser", baseCost: new Decimal(20), costScaling: 1.3, gen: new Decimal(2), desc: "Condenses energy variables. Generates +2 Quarks/s." },
      gluonBinding: { id: "gluonBinding", name: "🕸️ Gluon Matrix Synthesis", baseCost: new Decimal(120), costScaling: 1.4, gen: new Decimal(1.5), desc: "Binds strong color assets. Generates +1.5 Gluons/s. Requires Quark Condenser Lvl 3." },
      leptonHarvest: { id: "leptonHarvest", name: "🔋 Lepton Collector", baseCost: new Decimal(400), costScaling: 1.45, gen: new Decimal(1), desc: "Extracts fundamental leptons. Generates +1 Lepton/s. Requires Gluon Matrix Lvl 2." },
      plasmaAutomation: { id: "plasmaAutomation", name: "🤖 Proton Synthesizer", baseCost: new Decimal(2000), costScaling: 1.8, gen: new Decimal(0), desc: "Unlocks passive Proton generation based on Quark/Gluon rates as a catalyst. Requires Lepton Collector Lvl 1." },
      baryoRadiator: { id: "baryoRadiator", name: "❄️ Baryogenesis Radiator", baseCost: new Decimal(100), costScaling: 1.4, cooling: new Decimal(7500), desc: "Radiates excess thermal mass. Cools Universe by 7,500 K/s. Costs 2 Protons/s." }
    },
    galaxy: {
      armStabilization: { id: "armStabilization", name: "🌀 Velocity Harmonizers", baseCost: new Decimal(100), costScaling: 1.5, desc: "Insulates velocity vectors. Reduces ambient orbital matrix decay rate by 15% per level." },
      elementalInjection: { id: "elementalInjection", name: "🧪 Heavy Element Injection", baseCost: new Decimal(250), costScaling: 1.6, desc: "Injects forged Carbon & Iron into planetary seeds, doubling Debris generation." }
    },
    stardust: {
      fusionDiscount: { id: "fusionDiscount", name: "✨ Efficient Synthesis", max: 5, baseCost: new Decimal(1), currency: "stardust", desc: "Reduces Hydrogen fusions requirement by 2 per level." },
      thermalInsulation: { id: "thermalInsulation", name: "🔥 Thermal Blanket", max: 10, baseCost: new Decimal(1), currency: "stardust", desc: "Increases Compression temp thermal heating by +20% per level." },
      gravityDiscount: { id: "gravityDiscount", name: "🪐 Quantum Harmonics", max: 5, baseCost: new Decimal(2), currency: "stardust", desc: "Slightly reduces cost factor price scaling of Gravity nodes." },
      flareForecasting: { id: "flareForecasting", name: "☀️ Flare Forecasting", max: 5, baseCost: new Decimal(2), currency: "stardust", desc: "Solar Prominences spawn 8% sooner per upgrade level." }
    },
    pulsar: {
      autoCompress: { id: "autoCompress", name: "⚙️ Auto-Compressor", max: 10, baseCost: new Decimal(1), currency: "pulsarShards", desc: "Compresses core 1x per second per level if Helium capacity satisfies." },
      autoSynthesize: { id: "autoSynthesize", name: "🔬 Catalytic Synthesizer", max: 10, baseCost: new Decimal(2), currency: "pulsarShards", desc: "Increases processing velocity of Carbon and Iron tiers by +100% per level." }
    },
    singularity: {
      darkGravity: { id: "darkGravity", name: "🌌 Dark Matter Gravity", max: 5, baseCost: new Decimal(1), currency: "singularityMass", desc: "Applies structural ^1.05 exponential scaling factor to Hydrogen rates per level." },
      stellarIgnition: { id: "stellarIgnition", name: "🌟 Stellar Ignition", max: 5, baseCost: new Decimal(1), currency: "singularityMass", desc: "Applies a ^1.05 exponential scaling to Core Compression thermal metrics per level." }
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
      initial: "CHRONO_LOG // Darkness. Chaotic high-frequency noise. I do not think yet; I fluctuate.",
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

// ==========================================================================
// [SEC-03] ENGINE STATE ENGINE INITIALIZATION TREE
// ==========================================================================
const SAVE_VERSION = 15;

function getInitialEra2State() {
  return { plasmaFusersEnabled: false };
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
    era2: getInitialEra2State(),
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

function ensureStateShape() {
  const initialState = getInitialGameState();
  deepMergeMissing(gameState, initialState);
  if (gameState.era2 === undefined) gameState.era2 = getInitialEra2State();
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
function startEraTransition(targetEpoch, transitionText, onConfirm) {
  const overlay = document.getElementById('era-transition-overlay');
  const titleEl = document.getElementById('trans-title');
  const descEl = document.getElementById('trans-desc');
  const confirmBtn = document.getElementById('btn-trans-confirm');

  if (!overlay || !titleEl || !descEl || !confirmBtn) {
    onConfirm();
    return;
  }

  overlay.style.display = 'flex';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease-in-out';
  setTimeout(() => overlay.style.opacity = '1', 10);

  titleEl.textContent = `Era ${targetEpoch === 2 ? 'II' : 'III'} Cosmic Transition`;
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

function typeWriter(element, text, speed = 25) {
  element.textContent = "";
  let i = 0;
  clearInterval(window.typewriterInterval);
  window.typewriterInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(window.typewriterInterval);
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
  return gameState.era3.temperature.div(1500000).floor().plus(1);
}

function getPulsarShardYield() {
  return gameState.resources.carbon.amount.div(100).floor().plus(1);
}

function getSingularityMassYield() {
  return gameState.resources.iron.amount.div(25).floor().plus(1);
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
  let logPrimitive = gameState.era3.compressCost.div(10).log10();
  let exponent = logPrimitive / Math.log10(2);
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
  syncAnchor() {
    const core = document.getElementById('star-core');
    if (core) {
      const rect = core.getBoundingClientRect();
      const centerY = rect.top + (rect.height / 2);
      const centerX = rect.left + (rect.width / 2);
      document.documentElement.style.setProperty('--core-anchor-y', `${centerY}px`);
      document.documentElement.style.setProperty('--core-anchor-x', `${centerX}px`);

      let totalProgress = 0;
      for (let cat of ['quantum', 'plasma']) {
        for (let key in gameState.upgrades[cat]) {
          totalProgress += (gameState.upgrades[cat][key].level || 0);
        }
      }
      document.documentElement.style.setProperty('--cosmic-progress', totalProgress);
    }
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
        row.querySelector('.upgrade-btn').addEventListener('click', () => Economy.buy(category, key));
        container.appendChild(row);
      }
    }

    for (let key in COSMIC_REGISTRY.upgrades[category]) {
      let def = COSMIC_REGISTRY.upgrades[category][key];
      let state = gameState.upgrades[category][key];
      if (!state) continue;

      const row = document.getElementById(`${category}-row-${key}`);
      if (category === 'plasma' && row) {
        if (key === 'gluonBinding' && gameState.upgrades.plasma.quarkCondenser.level < 3) { row.style.display = 'none'; continue; }
        else if (key === 'leptonHarvest' && gameState.upgrades.plasma.gluonBinding.level < 2) { row.style.display = 'none'; continue; }
        else if (key === 'plasmaAutomation' && gameState.upgrades.plasma.leptonHarvest.level < 1) { row.style.display = 'none'; continue; }
        else { row.style.display = 'flex'; }
      }

      let currentCostLabel = typeof costLabelText === 'function' ? costLabelText(key) : costLabelText;
      const currencyKey = Economy.resolveCurrencyKey(category, key, def);
      let actualFunding = getAmount(currencyKey);

      const loops = getBuyMultiplierCount(category, key, def, state, currencyKey);
      const displayCost = getCumulativeCost(state.cost, def.costScaling, loops);

      let isAffordable = actualFunding.gte(displayCost);
      if (row) {
        row.querySelector('.name-display').textContent = def.name;
        row.querySelector('.lvl-display').textContent = `(Lvl ${state.level})`;
        row.querySelector('.desc-display').textContent = def.desc;

        if (isAffordable) row.classList.add('upgrade-affordable');
        else row.classList.remove('upgrade-affordable');

        const btn = row.querySelector('.upgrade-btn');
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

    document.getElementById('stardust-count').textContent = format(gameState.currencies.stardust.amount);
    document.getElementById('stardust-boost').textContent = format(gameState.currencies.stardust.amount.times(50));

    let estStardust = getStardustYield();
    let estPulsar = gameState.resources.carbon.amount.gt(0) ? getPulsarShardYield() : new Decimal(0);
    let estSingularity = gameState.resources.iron.amount.gt(0) ? getSingularityMassYield() : new Decimal(0);
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
  },

  renderStellarNodeButtons() {
    const btnGravity = document.getElementById('btn-gravity');
    if (btnGravity) {
      let canAfford = gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost);
      btnGravity.disabled = !canAfford;
      if (canAfford) btnGravity.classList.add('upgrade-affordable');
      else btnGravity.classList.remove('upgrade-affordable');
    }

    const btnCompress = document.getElementById('btn-compress');
    if (btnCompress) {
      let canAfford = gameState.resources.helium.amount.gte(gameState.era3.compressCost);
      btnCompress.disabled = !canAfford;
      if (canAfford) btnCompress.classList.add('upgrade-affordable');
      else btnCompress.classList.remove('upgrade-affordable');
    }

    const btnToggleFuser = document.getElementById('btn-toggle-fuser');
    if (btnToggleFuser) btnToggleFuser.disabled = gameState.era3.fusionYield.eq(0);

    const fuserBtnText = document.getElementById('fuser-text');
    const fuserCostLabel = document.getElementById('fuser-cost-label');
    const btnFuser = document.getElementById('btn-fuser');
    if (btnFuser && fuserBtnText && fuserCostLabel) {
      let canAfford = false;
      if (gameState.era3.fusionYield.eq(0)) {
        fuserBtnText.textContent = "Unlock Auto-Fuser";
        fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHydrogen)} H`;
        canAfford = gameState.resources.hydrogen.amount.gte(gameState.era3.fuserCostHydrogen);
      } else {
        fuserBtnText.textContent = `Upgrade Fusion Yield (To +${format(gameState.era3.fusionYield.plus(1))})`;
        fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHelium)} He`;
        canAfford = gameState.resources.helium.amount.gte(gameState.era3.fuserCostHelium);
      }
      btnFuser.disabled = !canAfford;
      if (canAfford) btnFuser.classList.add('upgrade-affordable');
      else btnFuser.classList.remove('upgrade-affordable');
    }

    const carbonBtn = document.getElementById('btn-carbon');
    const carbonCostLabel = document.getElementById('carbon-cost-label');
    const carbonText = document.getElementById('carbon-text');
    if (carbonBtn && carbonCostLabel) {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
        carbonBtn.disabled = true;
        carbonBtn.classList.remove('upgrade-affordable');
        carbonCostLabel.textContent = `Locked (${format(COSMIC_REGISTRY.resources.carbon.unlockTemp)} K)`;
        if (carbonText) carbonText.textContent = "Unlock Carbon Fusion";
      } else {
        let canAfford = false;
        if (gameState.era3.carbonYield.eq(0)) {
          canAfford = gameState.resources.helium.amount.gte(gameState.era3.carbonCostHelium);
          carbonCostLabel.textContent = `${format(gameState.era3.carbonCostHelium)} He`;
          if (carbonText) carbonText.textContent = "Unlock Carbon Fusion";
        } else {
          canAfford = gameState.resources.carbon.amount.gte(gameState.era3.carbonCostCarbon);
          carbonCostLabel.textContent = `${format(gameState.era3.carbonCostCarbon)} C`;
          if (carbonText) carbonText.textContent = `Upgrade Carbon Yield (To +${format(gameState.era3.carbonYield.plus(1))})`;
        }
        carbonBtn.disabled = !canAfford;
        if (canAfford) carbonBtn.classList.add('upgrade-affordable');
        else carbonBtn.classList.remove('upgrade-affordable');
      }
    }

    const ironBtn = document.getElementById('btn-iron');
    const ironCostLabel = document.getElementById('iron-cost-label');
    const ironText = document.getElementById('iron-text');
    if (ironBtn && ironCostLabel) {
      if (gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        ironBtn.disabled = true;
        ironBtn.classList.remove('upgrade-affordable');
        ironCostLabel.textContent = `Locked (${format(COSMIC_REGISTRY.resources.iron.unlockTemp)} K)`;
        if (ironText) ironText.textContent = "Unlock Iron Fusion";
      } else {
        let canAfford = false;
        if (gameState.era3.ironYield.eq(0)) {
          canAfford = gameState.resources.carbon.amount.gte(gameState.era3.ironCostCarbon);
          ironCostLabel.textContent = `${format(gameState.era3.ironCostCarbon)} C`;
          if (ironText) ironText.textContent = "Unlock Iron Fusion";
        } else {
          canAfford = gameState.resources.iron.amount.gte(gameState.era3.ironCostIron);
          ironCostLabel.textContent = `${format(gameState.era3.ironCostIron)} Fe`;
          if (ironText) ironText.textContent = `Upgrade Iron Yield (To +${format(gameState.era3.ironYield.plus(1))})`;
        }
        ironBtn.disabled = !canAfford;
        if (canAfford) ironBtn.classList.add('upgrade-affordable');
        else ironBtn.classList.remove('upgrade-affordable');
      }
    }

    const supernovaBtn = document.getElementById('btn-supernova');
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
      btn.classList.remove('visual-hidden');
      btn.textContent = `${COSMIC_REGISTRY.solarEvents.flare.fx.emoji} PROMINENCE ACTIVE! (${Math.ceil(gameState.flares.active.expiresInSec.toNumber())}s)`;
    } else {
      btn.classList.add('visual-hidden');
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
      pct = gameState.era3.temperature.div(COSMIC_REGISTRY.constants.supernovaTempThreshold).times(100).toNumber();
    } else if (epoch === 4) {
      pct = gameState.resources.darkMatter.amount.div(10000).times(100).toNumber();
    }

    pct = Math.max(0, Math.min(100, pct));

    container.style.display = 'block';
    bar.style.width = `${pct}%`;
    bar.style.background = epoch === 1 ? 'linear-gradient(90deg, var(--neon-teal), #a29bfe)' :
      (epoch === 2 ? 'linear-gradient(90deg, #ff7675, #ffeaa7)' :
        (epoch === 3 ? 'linear-gradient(90deg, #fdcb6e, #e17055)' :
          'linear-gradient(90deg, #00ecc6, #0984e3)'));
    bar.style.boxShadow = `0 0 8px ${epoch === 1 ? 'var(--neon-teal)' : (epoch === 2 ? '#ff7675' : (epoch === 3 ? '#fdcb6e' : '#00ecc6'))}`;
  },

  updateVisualProgression() {
    const core = document.getElementById('star-core');
    if (!core) return;

    const epoch = gameState.activeEpoch;

    if (epoch === 1) {
      let gLvl = gameState.upgrades.quantum.gravityForce?.level || 0;
      let wLvl = gameState.upgrades.quantum.weakForce?.level || 0;
      let eLvl = gameState.upgrades.quantum.electromagneticForce?.level || 0;
      let sLvl = gameState.upgrades.quantum.strongForce?.level || 0;
      let totalLvl = gLvl + wLvl + eLvl + sLvl;

      // Core size grows from 8px to 30px
      let coreSize = Math.min(8 + totalLvl * 0.8, 30);
      core.style.setProperty('width', `${coreSize}px`, 'important');
      core.style.setProperty('height', `${coreSize}px`, 'important');

      // Core glow spreads wider
      let glowSize = Math.min(16 + totalLvl * 1.5, 55);
      let glowSpread = Math.min(6 + totalLvl * 0.4, 20);
      core.style.setProperty('box-shadow', `0 0 ${glowSize}px ${glowSpread}px #ffffff`, 'important');

      // Orbits fade in based on respective forces purchased
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');

      if (orbit1) orbit1.style.opacity = Math.min(gLvl * 0.15, 0.7);
      if (orbit2) orbit2.style.opacity = Math.min(eLvl * 0.15, 0.7);
      if (orbit3) orbit3.style.opacity = Math.min(sLvl * 0.15, 0.7);
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
      core.style.setProperty('width', `${coreSize}px`, 'important');
      core.style.setProperty('height', `${coreSize}px`, 'important');

      // Glow intensifies
      let glowSize = Math.min(45 + totalLvl * 1.8, 100);
      let opacity = Math.min(0.45 + totalLvl * 0.015, 0.9);
      core.style.setProperty('box-shadow', `0 0 ${glowSize}px 15px rgba(255, 107, 107, ${opacity}), inset 0 0 15px rgba(255,255,255,0.6)`, 'important');

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
    this.updateStardustDisplays();
    const currentEpoch = COSMIC_REGISTRY.universeChronology.epochs[gameState.activeEpoch] || COSMIC_REGISTRY.universeChronology.epochs[3];

    // Visibility handled natively by CSS matching body[data-epoch] and body[data-tab]

    document.getElementById('active-epoch-name').textContent = currentEpoch.name;
    document.getElementById('btn-buy-mode').textContent = `Buy Mode: ${gameState.buyMode === 'max' ? 'MAX' : 'x' + gameState.buyMode}`;

    const allPossibleTabs = ["core", "upgrades", "system", "shop", "pulsar", "singularity", "prestige", "settings"];
    allPossibleTabs.forEach(tabId => {
      const navBtn = document.getElementById(`nav-${tabId}`);
      if (navBtn) navBtn.style.display = currentEpoch.tabs.includes(tabId) ? "" : "none";
    });

    const coreCanvasElement = document.getElementById('star-core');
    if (coreCanvasElement) coreCanvasElement.setAttribute('data-canvas-style', currentEpoch.canvasStyle);

    const logNode = document.getElementById('chrono-neural-log');
    if (logNode) {
      let activeLog = "";
      if (gameState.activeEpoch === 1) {
        activeLog = gameState.resources.quantumFluctuations.amount.gte(80000) ?
          COSMIC_REGISTRY.narrativeLogs.era1.nearInflation : COSMIC_REGISTRY.narrativeLogs.era1.initial;
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
        typeWriter(logNode, activeLog, 25);
      }
    }

    if (gameState.activeEpoch === 1) {
      document.getElementById('label-hydrogen').innerHTML = `QUANTUM FLUCTUATIONS`;
      document.getElementById('count').textContent = format(gameState.resources.quantumFluctuations.amount);
      document.getElementById('auto-rate').innerHTML = `+${format(getQuantumFluctuationRate())}/s`;

      document.getElementById('label-helium').innerHTML = `ENERGY DENSITY`;
      document.getElementById('helium-count').textContent = format(gameState.resources.energyDensity.amount);
      document.getElementById('helium-yield').textContent = "Temp: " + format(gameState.eraITemperature) + " K";

      const inflationBtn = document.getElementById('btn-inflation');
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
      let actualQuarkLoss = new Decimal(0);
      let actualGluonLoss = new Decimal(0);
      let protonGainRate = isFuserActive ? getProtonFusionCap().times(gameState.upgrades.plasma.plasmaAutomation.level).times(asymmetryModifier) : new Decimal(0);

      let radiatorLevel = gameState.upgrades.plasma.baryoRadiator.level || 0;
      let radiatorProtonDrain = new Decimal(radiatorLevel * 2);

      document.getElementById('label-hydrogen').innerHTML = `PRIMORDIAL QUARKS`;
      document.getElementById('count').textContent = format(gameState.resources.quarks.amount);
      document.getElementById('auto-rate').innerHTML = `+${format(pRates.quarks)}/s`;

      document.getElementById('label-helium').innerHTML = `PRIMORDIAL GLUONS`;
      document.getElementById('helium-count').textContent = format(gameState.resources.gluons.amount);
      document.getElementById('helium-yield').innerHTML = `+${format(pRates.gluons)}/s`;

      // Update dedicated Era II elements
      const leptonCountEl = document.getElementById('lepton-count');
      if (leptonCountEl) leptonCountEl.textContent = format(gameState.resources.leptons.amount);
      const leptonRateEl = document.getElementById('lepton-rate');
      if (leptonRateEl) leptonRateEl.innerHTML = `+${format(pRates.leptons)}/s`;

      const protonCountEl = document.getElementById('proton-count');
      if (protonCountEl) protonCountEl.textContent = format(gameState.resources.protons.amount);
      const protonRateEl = document.getElementById('proton-rate');
      if (protonRateEl) {
        protonRateEl.innerHTML = `+${format(protonGainRate)}/s` + (radiatorLevel > 0 ? ` <span style='color:#ff7675'>(-${format(radiatorProtonDrain)})</span>` : '');
      }

      const electronCountEl = document.getElementById('electron-count');
      if (electronCountEl) electronCountEl.textContent = format(gameState.resources.electrons.amount);
      const electronRateEl = document.getElementById('electron-rate');
      if (electronRateEl) {
        let electronRate = (gameState.plasmaTemperature.lt(500000) && gameState.resources.leptons.amount.gt(0)) ?
          gameState.resources.leptons.amount.div(2).floor() : new Decimal(0);
        electronRateEl.innerHTML = `+${format(electronRate)}/s`;
      }

      const tempCountEl = document.getElementById('plasma-temp-count');
      if (tempCountEl) tempCountEl.textContent = `${format(gameState.plasmaTemperature)} K`;
      const tempRateEl = document.getElementById('plasma-temp-rate');
      if (tempRateEl) {
        tempRateEl.innerHTML = pRates.cooling.gt(0) ? `Cooling: -${format(pRates.cooling)} K/s` : `Stable`;
      }
      const recombBtn = document.getElementById('btn-recombination');
      if (recombBtn) {
        recombBtn.disabled = !(gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || gameState.plasmaTemperature.lte(3000));
      }

      if (gameState.activeTab === 'upgrades') {
        this.renderGenericTierList('plasma-upgrades-container', 'plasma', (k) => (k === 'quarkCondenser' || k === 'plasmaAutomation') ? 'Quarks' : (k === 'gluonBinding' || k === 'leptonHarvest') ? 'Gluons' : 'Protons', '#e17055');
      }
    }
    else if (gameState.activeEpoch === 3) {
      const cLabel = document.getElementById('label-carbon');
      if (cLabel) cLabel.innerHTML = `CARBON`;
      const iLabel = document.getElementById('label-iron');
      if (iLabel) iLabel.innerHTML = `IRON`;

      document.getElementById('label-hydrogen').innerHTML = `HYDROGEN`;
      document.getElementById('label-helium').innerHTML = `HELIUM`;

      document.getElementById('count').textContent = format(gameState.resources.hydrogen.amount);
      document.getElementById('auto-rate').innerHTML = `+${format(getHydrogenGenRate())}/s`;
      document.getElementById('cost').textContent = format(gameState.era3.gravityCost);
      document.getElementById('helium-count').textContent = format(gameState.resources.helium.amount);
      document.getElementById('helium-yield').innerHTML = `Yield: ${format(gameState.era3.fusionYield)}/f`;
      document.getElementById('temp').textContent = format(gameState.era3.temperature);
      document.getElementById('multiplier').textContent = format(gameState.era3.tempMultiplier) + "x";
      document.getElementById('compress-cost').textContent = format(gameState.era3.compressCost);
      document.getElementById('stage').textContent = gameState.era3.stage;

      document.getElementById('carbon-count').textContent = format(gameState.resources.carbon.amount);
      document.getElementById('carbon-box').style.opacity = gameState.era3.stage === "Main Sequence Star" ? "1" : "0.3";
      const carbonMult = getCarbonGravityMultiplier();
      const carbonBoostContainer = document.getElementById('carbon-boost-container');
      if (carbonBoostContainer) {
        carbonBoostContainer.textContent = `Grav: +${format(carbonMult.minus(1).times(100))}%`;
      }

      let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
      document.getElementById('iron-count').textContent = format(gameState.resources.iron.amount);
      document.getElementById('iron-box').style.opacity = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) ? "1" : "0.3";
      const ironBoostContainer = document.getElementById('iron-boost-container');
      if (ironBoostContainer) {
        ironBoostContainer.textContent = `Heat: +${format(ironMultiplier.minus(1).times(100))}%`;
      }

      this.updateStardustDisplays();
      this.renderStellarNodeButtons();
    }
    else if (gameState.activeEpoch === 4) {
      let dRate = getGalacticDebrisRate();
      let dmRate = getGalacticDarkMatterRate();

      document.getElementById('label-hydrogen').innerHTML = `ACCUMULATED HYDROGEN`;
      document.getElementById('count').textContent = format(gameState.resources.hydrogen.amount);
      document.getElementById('auto-rate').textContent = "0";

      document.getElementById('label-helium').innerHTML = `STELLAR MASS INDEX`;
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

    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && state.level >= def.max) break;
      if (getAmount(currencyKey).lt(state.cost)) break;

      deduct(currencyKey, state.cost);
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
        gameState.era3.compressCost = gameState.era3.compressCost.times(2).floor();
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
      if (!flareSimSuppressed) Viewport.showToast(`Mission Completed: ${mission.desc}`);
      isDirty = true;
    } else {
      allCompleted = false;
    }
  }

  if (allCompleted) {
    let nextRank = gameState.systemRank + 1;
    if (COSMIC_REGISTRY.systemRanks[nextRank]) {
      gameState.systemRank = nextRank;
      if (!flareSimSuppressed) Viewport.showToast(`System Rank Up! Now Rank ${gameState.systemRank}: ${COSMIC_REGISTRY.systemRanks[nextRank].name}`);
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

function devSetEpoch(epochNum) {
  if (COSMIC_REGISTRY.universeChronology.epochs[epochNum]) {
    gameState.activeEpoch = epochNum;
    document.body.setAttribute('data-epoch', epochNum);
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

  Viewport.showToast(`🌌 GALAXY COLLISION COMPLETE: Secured +${format(gainedResidue)} Dark Energy Residue variables!`);
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
    let cost = new Decimal(50000);
    if (gameState.resources.hydrogen.amount.gte(cost)) {
      gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.minus(cost);
      gameState.era4.planetaryNodes = gameState.era4.planetaryNodes.plus(1);
      Viewport.showToast("Hydrogen metrics condensed into a stable macro planetary node.");
      isDirty = true;
    } else {
      Viewport.showToast(`Accretion requires ${format(cost)} Hydrogen Parameters.`);
    }
  }
}

// ==========================================================================
// [SEC-13] CLICK & TRANSACTION UTILITY IMPLEMENTATION (RECONSTRUCTED)
// ==========================================================================
function spawnFloatingText(text, color, e, offsetX = 0) {
  const canvas = document.querySelector('.core-canvas');
  if (!canvas) return;

  const particle = document.createElement('div');
  particle.className = 'floating-text-particle';
  particle.textContent = text;
  particle.style.color = color || '#fff';

  let x, y;
  if (e && e.clientX && e.clientY) {
    const rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left + offsetX;
    y = e.clientY - rect.top;
  } else {
    x = canvas.clientWidth / 2 + offsetX;
    y = canvas.clientHeight / 2;
  }

  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  canvas.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 1000);
}



function clickCore(e) {
  initAudio();

  if (gameState.activeEpoch === 1) {
    let mult = getCardMultiplier("hydrogenGen");
    let gain = new Decimal(1).times(mult);
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(gain);
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

  isDirty = true;
}

function toggleBuyMode() {
  initAudio();
  if (gameState.buyMode === 1) gameState.buyMode = 10;
  else if (gameState.buyMode === 10) gameState.buyMode = 100;
  else if (gameState.buyMode === 100) gameState.buyMode = 'max';
  else gameState.buyMode = 1;

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
    const TICK_CHUNK_SIZE = 1.0;
    let timeRemaining = dt;

    while (timeRemaining > 0) {
      let currentDt = Math.min(timeRemaining, TICK_CHUNK_SIZE);
      this.simulate(currentDt);
      timeRemaining -= currentDt;
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
    gameState.resources.quantumFluctuations.amount = gameState.resources.quantumFluctuations.amount.plus(passiveFluctuations);

    let passiveDensity = getEnergyDensityRate().times(dt);
    gameState.resources.energyDensity.amount = gameState.resources.energyDensity.amount.plus(passiveDensity);

    if (gameState.resources.energyDensity.amount.gt(0)) {
      let densityLogPrimitive = gameState.resources.energyDensity.amount.plus(1).log10();
      let coolingFactor = new Decimal(densityLogPrimitive).times(1e24).times(dt);
      gameState.eraITemperature = Decimal.max(COSMIC_REGISTRY.constants.eraIInflationTemp, gameState.eraITemperature.minus(coolingFactor));
    }
  },

  plasmaCrucible(dt) {
    gameState.cosmicAge = (gameState.cosmicAge || new Decimal(0)).plus(dt);
    let plasmaRates = getPlasmaPassiveRates();

    gameState.resources.quarks.amount = gameState.resources.quarks.amount.plus(plasmaRates.quarks.times(dt));
    gameState.resources.gluons.amount = gameState.resources.gluons.amount.plus(plasmaRates.gluons.times(dt));
    gameState.resources.leptons.amount = gameState.resources.leptons.amount.plus(plasmaRates.leptons.times(dt));

    if (plasmaRates.cooling.gt(0)) {
      gameState.plasmaTemperature = Decimal.max(300, gameState.plasmaTemperature.minus(plasmaRates.cooling.times(dt)));

      let radiatorLevel = gameState.upgrades.plasma.baryoRadiator.level || 0;
      if (radiatorLevel > 0) {
        let protonDrain = new Decimal(radiatorLevel * 2).times(dt);
        gameState.resources.protons.amount = Decimal.max(0, gameState.resources.protons.amount.minus(protonDrain));
      }
    }

    if (gameState.plasmaTemperature.lt(500000) && gameState.resources.leptons.amount.gt(0)) {
      let electronHarvest = gameState.resources.leptons.amount.div(2).floor().times(dt);
      gameState.resources.electrons.amount = gameState.resources.electrons.amount.plus(electronHarvest);
    }

    if (gameState.upgrades.plasma.plasmaAutomation.level > 0) {
      let asymmetryModifier = getBaryonAsymmetryMultiplier();
      let fusionRate = getProtonFusionCap().times(gameState.upgrades.plasma.plasmaAutomation.level).times(asymmetryModifier);
      gameState.resources.protons.amount = gameState.resources.protons.amount.plus(fusionRate.times(dt));
    }
  },

  stellarDawn(dt) {
    let autoRate = getHydrogenGenRate().times(dt);
    gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(autoRate);

    if (gameState.era3.fusersEnabled && gameState.era3.fusionYield.gt(0)) {
      let costPerYield = getFusionCost();
      let maxPossibleFusions = gameState.resources.hydrogen.amount.div(costPerYield).floor();
      let targetFusions = Decimal.min(maxPossibleFusions, gameState.era3.fusionYield.times(dt));

      if (targetFusions.gt(0)) {
        gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.minus(targetFusions.times(costPerYield));
        gameState.resources.helium.amount = gameState.resources.helium.amount.plus(targetFusions.times(getFusionSurgeMultiplier()));
      }
    }

    let autoCompressLvl = gameState.upgrades.pulsar.autoCompress?.level ?? 0;
    if (autoCompressLvl > 0) {
      autoCompressAccumulator += autoCompressLvl * dt;
      if (autoCompressAccumulator >= 1.0) {
        let triggers = Math.floor(autoCompressAccumulator);
        autoCompressAccumulator -= triggers;
        for (let i = 0; i < triggers; i++) {
          if (gameState.resources.helium.amount.gte(gameState.era3.compressCost)) {
            gameState.resources.helium.amount = gameState.resources.helium.amount.minus(gameState.era3.compressCost);
            gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield());
            gameState.era3.compressCost = gameState.era3.compressCost.times(2).floor();
            recalcTempMultiplier();
            if (gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && gameState.era3.stage === "Protostar") {
              gameState.era3.stage = "Main Sequence Star";
            }
            updateStatsData();
          } else { break; }
        }
      }
    }

    if (gameState.era3.stage === "Main Sequence Star" && gameState.era3.carbonYield.gt(0)) {
      let synthLvl = gameState.upgrades.pulsar.autoSynthesize?.level ?? 0;
      let velocityMult = new Decimal(1).plus(synthLvl);
      let carbonGen = gameState.era3.carbonYield.times(velocityMult).times(dt);
      gameState.resources.carbon.amount = gameState.resources.carbon.amount.plus(carbonGen);

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

    gameState.era4.stability = Decimal.max(5, gameState.era4.stability.minus(dynamicDecay.times(dt)));
  }
};

function gameTick(dt) {
  Timeline.process(dt);
  checkAchievements();
  checkMissionProgress();
  isDirty = true;
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
    for (let key in legacyState) {
      if (migrated[key] !== undefined && typeof legacyState[key] !== 'object') {
        migrated[key] = legacyState[key];
      }
    }
    let era3Target = getInitialEra3State();
    for (let property in era3Target) {
      if (legacyState[property] !== undefined) {
        migrated.era3[property] = legacyState[property];
      }
    }
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
Viewport.switchTab(gameState.activeTab);

window.addEventListener('resize', () => Viewport.syncAnchor());

requestAnimationFrame(renderLoop);

// ==========================================================================
// [SEC-20] IRON-CLAD DECOUPLED RUNTIME EVENT BINDING INITIALIZER
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-menu .tab-btn, .side-rail .rail-btn').forEach(btn => {
    const tabId = btn.id.replace('nav-', '');
    btn.addEventListener('click', () => Viewport.switchTab(tabId));
  });

  const core = document.getElementById('star-core');
  if (core) core.addEventListener('click', clickCore);

  const bindClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  bindClick('btn-buy-mode', toggleBuyMode);
  bindClick('btn-inflation', triggerInflation);
  bindClick('btn-recombination', triggerRecombination);
  bindClick('btn-supernova', triggerSupernova);
  bindClick('btn-galactic-merge', triggerGalacticMerge);
  bindClick('btn-stabilize-arms', stabilizeArms);
  bindClick('btn-accrete-planet', accretePlanetConfiguration);
  bindClick('flare-button', collectFlare);


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