// [SEC-15] TIME LOOP & EPOCH CHUNK SIMULATION// [SEC-06] CORE PHYSICS & SIMULATION LOOP
import { updateStatsData, recalcTempMultiplier } from './economy.js';
import { spawnFlare, expireFlare } from './stellar.js';
let autoCompressAccumulator = 0;
let flareSimSuppressed = false;
// ==========================================================================
import { gameState } from './state.js';
import { Economy, getAmount, getCompressionScaling, processEraV, getQuantumFluctuationRate, getEnergyDensityRate, getPlasmaPassiveRates, getBaryonAsymmetryMultiplier, getProtonFusionCap, getHydrogenGenRate, getBuyLoopCount, getFusionCost, getFusionSurgeMultiplier, getCompressionHeatYield, getGalacticDebrisRate, getGalacticDarkMatterRate } from './economy.js';
import { COSMIC_REGISTRY } from '../config/registry.js';

import { simulateQuantumEra } from '../eras/quantum/simulation.js';
import { simulatePlasmaEra } from '../eras/plasma/simulation.js';
import { simulateStellarEra } from '../eras/stellar/simulation.js';

const simulationHandlers = {
  1: simulateQuantumEra,
  2: simulatePlasmaEra,
  3: simulateStellarEra,
  // 4: simulateGalacticEra,
  // 5: simulateEraV
};

export const Timeline = {
  process(dt) {
    if (dt <= 0) return;
    const MAX_STEPS = 120;
    const stepCount = Math.min(MAX_STEPS, Math.ceil(dt / 1.0));
    const chunkDt = dt / stepCount;

    for (let i = 0; i < stepCount; i++) {
      this.simulate(chunkDt);
    }
  },

  simulate(dt) {
    if (gameState.era5?.isHeatDeath) {
      return; // Stop all other physics
    }

    const handler = simulationHandlers[gameState.activeEpoch];
    if (handler) {
      handler(gameState, dt);
    } else {
      // Fallback for not yet implemented eras
      if (gameState.activeEpoch === 4) {
        this.galacticMatrix(dt);
      } else if (gameState.activeEpoch === 5) {
        processEraV(dt);
      }
    }

    gameState.buffs.fusionSurge.remainingSec = Decimal.max(0, gameState.buffs.fusionSurge.remainingSec.minus(dt));
  },




  galacticMatrix(dt) {
    const smAccelLvl = gameState.upgrades.galaxy?.stellarMassAccelerator?.level || 0;
    const smMult = 1.0 + (0.25 * smAccelLvl);
    gameState.era4.stellarMassPassiveCount = gameState.era4.stellarMassPassiveCount.plus(new Decimal(0.2).times(smMult).times(dt));

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

    let gMod = 1.0 + (0.10 * (gameState.cosmicConstants?.G || 0));
    gameState.era4.stability = Decimal.max(5, gameState.era4.stability.minus(dynamicDecay.times(dt).times(gMod)));
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

    if (!gameState.stats.maxQF) gameState.stats.maxQF = new Decimal(0);
    if (currentQF.gt(gameState.stats.maxQF)) {
      gameState.stats.maxQF = currentQF;
    }

    // Era 1 Act unfolding progression removed from here (handled by ActManager)
  } else if (gameState.activeEpoch === 2) {
    // Era 2 Coherence Equilibrium: high temp (>8M K) slightly drains coherence, cooling (<500k K) recovers it toward 100%
    if (gameState.plasmaTemperature.gt(8000000)) {
      gameState.coherence = Decimal.max(10, gameState.coherence.minus(new Decimal(0.2).times(dt)));
    } else if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.5).times(dt)));
    }

    // Era 2 Act unfolding progression removed from here (handled by ActManager)
  } else if (gameState.activeEpoch === 3) {
    // Era 3 Coherence Equilibrium: extreme temp (>1.5B K) causes subtle coherence stress, normal operation recovers it
    if (gameState.era3.temperature.gt(1500000000)) {
      gameState.coherence = Decimal.max(20, gameState.coherence.minus(new Decimal(0.1).times(dt)));
    } else if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.5).times(dt)));
    }

    // Carbon notification flag logic removed (handled narratively or not needed)
  } else if (gameState.activeEpoch === 4) {
    // Era 4 Coherence Integration: Coherence tracks Galaxy Stability
    if (gameState.era4 && gameState.era4.stability) {
      gameState.coherence = Decimal.min(100, Decimal.max(0, gameState.era4.stability));
    }
  } else if (gameState.activeEpoch === 5) {
    // Era 5 Coherence Integration: Coherence dissolves inversely to rising Entropy
    const entropyVal = gameState.era5?.entropy || 0;
    gameState.coherence = Decimal.max(0, new Decimal(100).minus(entropyVal));
  }
  Timeline.process(dt);

  // Achievement checks (inline — only need gameState + events)
  if (gameState.resources.iron && gameState.resources.iron.amount.gte(1) && !gameState.achievements.firstIron.unlocked) {
    gameState.achievements.firstIron.unlocked = true;
    window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: "Achievement Unlocked: Heavy Metal! (Neon Core Skin active)" }));
  }
  if (gameState.stats.supernovas.gte(1) && !gameState.achievements.firstSupernova.unlocked) {
    gameState.achievements.firstSupernova.unlocked = true;
    window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: "Achievement Unlocked: Stellar Collapse!" }));
  }
  if (gameState.stats.firstGalaxyTriggered && !gameState.achievements.firstGalaxy.unlocked) {
    gameState.achievements.firstGalaxy.unlocked = true;
    window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: "Achievement Unlocked: Galactic Formation!" }));
  }
  if (gameState.stats.firstBlackHoleTriggered && !gameState.achievements.firstBlackHole.unlocked) {
    gameState.achievements.firstBlackHole.unlocked = true;
    window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: "Achievement Unlocked: Event Horizon!" }));
  }
  if (gameState.stats.firstHawkingRadiationTriggered && !gameState.achievements.firstHawkingRadiation.unlocked) {
    gameState.achievements.firstHawkingRadiation.unlocked = true;
    window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: "Achievement Unlocked: Quantum Evaporation!" }));
  }

  // Mission progress (inline)
  if (COSMIC_REGISTRY.systemRanks) {
    let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
    if (currentRankDef) {
      let allCompleted = true;
      for (let mission of currentRankDef.missions) {
        if (gameState.completedMissions.includes(mission.id)) continue;
        if (mission.check(gameState)) {
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
  }
}

export { gameTick };

// ==========================================================================
