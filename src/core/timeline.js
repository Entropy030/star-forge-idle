// [SEC-15] TIME LOOP & EPOCH CHUNK SIMULATION// [SEC-06] CORE PHYSICS & SIMULATION LOOP
import { gameState } from './state.js';
import { processEraV, getGalacticDebrisRate, getGalacticDarkMatterRate } from './economy.js';

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
  process(dt, context) {
    if (dt <= 0) return;
    const MAX_STEPS = 120;
    const stepCount = Math.min(MAX_STEPS, Math.ceil(dt / 1.0));
    const chunkDt = dt / stepCount;

    for (let i = 0; i < stepCount; i++) {
      this.simulate(chunkDt, context);
    }
  },

  simulate(dt, context) {
    if (gameState.era5?.isHeatDeath) {
      return; // Stop all other physics
    }

    const handler = simulationHandlers[gameState.activeEpoch];
    if (handler) {
      handler(gameState, dt, context);
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

// ==========================================================================
