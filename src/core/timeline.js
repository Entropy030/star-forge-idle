// [SEC-15] TIME LOOP & EPOCH CHUNK SIMULATION// [SEC-06] CORE PHYSICS & SIMULATION LOOP
// ==========================================================================
import { gameState } from './state.js';
import { Economy, getAmount, getCompressionScaling, processEraV } from './economy.js';
import { Viewport } from '../ui/viewport.js';
import { COSMIC_REGISTRY } from '../config/registry.js';

export const Timeline = {
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
    if (gameState.activeEpoch === 5) {
      processEraV(dt);
    }

    if (gameState.era5?.isHeatDeath) {
      return; // Stop all other physics
    }

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
    }

    let passiveDensity = getEnergyDensityRate().times(dt);
    if (passiveDensity.gt(0)) {
      gameState.resources.energyDensity.amount = gameState.resources.energyDensity.amount.plus(passiveDensity);
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
    }

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
    if (autoRate.gt(0)) {
      gameState.resources.hydrogen.amount = gameState.resources.hydrogen.amount.plus(autoRate);
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
        const alphaMod = 1.0 + (0.30 * (gameState.cosmicConstants?.alpha || 0));
        const totalHeliumYield = targetFusions.times(getFusionSurgeMultiplier()).times(stardustBoost).times(alphaMod);
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
            new Decimal(getCompressionScaling()),
            0
          );
          let countToCompress = Decimal.min(new Decimal(triggers), maxAffordable);

          if (countToCompress.gt(0)) {
            let totalCost = Decimal.sumGeometricSeries(
              countToCompress,
              gameState.era3.compressCost,
              new Decimal(getCompressionScaling()),
              0
            );

            gameState.resources.helium.amount = gameState.resources.helium.amount.minus(totalCost);
            gameState.era3.temperature = gameState.era3.temperature.plus(getCompressionHeatYield().times(countToCompress));
            gameState.era3.compressCost = gameState.era3.compressCost.times(new Decimal(getCompressionScaling()).pow(countToCompress)).floor();

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
      let alphaMod = 1.0 + (0.30 * (gameState.cosmicConstants?.alpha || 0));
      let carbonGen = gameState.era3.carbonYield.times(velocityMult).times(dt).times(alphaMod);
      gameState.resources.carbon.amount = gameState.resources.carbon.amount.plus(carbonGen);
      gameState.era3.lifetimeCarbonThisRun = (gameState.era3.lifetimeCarbonThisRun || new Decimal(0)).plus(carbonGen);

      if (gameState.era3.ironYield.gt(0) && gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        let ironGen = gameState.era3.ironYield.times(velocityMult).times(dt).times(alphaMod);
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

  // Achievement checks (inline — only need gameState + Viewport)
  if (gameState.resources.iron.amount.gte(1) && !gameState.achievements.firstIron.unlocked) {
    gameState.achievements.firstIron.unlocked = true;
    Viewport.showToast("Achievement Unlocked: Heavy Metal! (Neon Core Skin active)");
  }
  if (gameState.stats.supernovas.gte(1) && !gameState.achievements.firstSupernova.unlocked) {
    gameState.achievements.firstSupernova.unlocked = true;
    Viewport.showToast("Achievement Unlocked: Stellar Collapse!");
  }

  // Mission progress (inline)
  if (COSMIC_REGISTRY.systemRanks) {
    let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
    if (currentRankDef) {
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
  }
}

export { gameTick };

// ==========================================================================