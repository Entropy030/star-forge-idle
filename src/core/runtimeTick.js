/* global Decimal */
import { gameState } from './state.js';
import { getAmount } from './economy.js';
import { Timeline } from './timeline.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getVacuumCoherenceRates } from '../eras/quantum/coherence.js';
import { updateObjectiveProgress } from './objectives.js';

export function advanceGameTick(dt, effectSink) {
  const effects = [];
  const emitEffect = effect => {
    effects.push(effect);
    if (effectSink) effectSink(effect);
  };

  if (gameState.artifacts && gameState.artifacts.modifiers && gameState.artifacts.modifiers.activeClickBoostSec > 0) {
    gameState.artifacts.modifiers.activeClickBoostSec = Math.max(0, gameState.artifacts.modifiers.activeClickBoostSec - dt);
  }

  if (gameState.activeEpoch === 1) {
    // Baseline passive equilibrium recovery in Era 1
    if (gameState.coherence.lt(100)) {
      const { passiveRate } = getVacuumCoherenceRates(gameState);
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(passiveRate.times(dt)));
    }

    if (!gameState.discoveries) gameState.discoveries = new Set();
    const currentQF = getAmount('quantumFluctuations');

    if (!gameState.stats.maxQF) gameState.stats.maxQF = new Decimal(0);
    if (currentQF.gt(gameState.stats.maxQF)) {
      gameState.stats.maxQF = currentQF;
    }

    // Narrative milestones intentionally observe pre-production QF.
    const recordNarrativeMilestone = (id, message) => {
      if (!gameState.discoveries.has(id)) {
        gameState.discoveries.add(id);
        if (!gameState.history) gameState.history = [];
        gameState.history.push({ time: gameState.totalGameTime, msg: message, type: 'milestone', id });
        emitEffect({ type: 'NARRATIVE_MILESTONE', id, message });
      }
    };

    if (currentQF.gte(1)) recordNarrativeMilestone('qf_1', '[SYSTEM]: Quantum Foam compiled. Primary metric online.');
    if (currentQF.gte(10)) recordNarrativeMilestone('qf_10', '[SYSTEM]: Energy density sufficient. Compiling Fluctuation Condenser...');
    if (currentQF.gte(100)) recordNarrativeMilestone('qf_100', '[SYSTEM]: Weak Nuclear Vector unlocked. Symmetry breaking begins.');
    if (currentQF.gte(500)) recordNarrativeMilestone('qf_500', '[SYSTEM]: Electromagnetic Tensor engaged. Photons propagating.');
    if (currentQF.gte(2500)) recordNarrativeMilestone('qf_2500', '[SYSTEM]: Vacuum Resonance stabilized. Coherence recovering.');
    if (currentQF.gte(10000)) recordNarrativeMilestone('qf_10000', '[SYSTEM]: Strong Color Force bound. Baryogenesis imminent.');
  } else if (gameState.activeEpoch === 2) {
    // Era 2 Coherence Equilibrium: high temp (>8M K) slightly drains coherence, cooling (<500k K) recovers it toward 100%
    if (gameState.plasmaTemperature.gt(8000000)) {
      gameState.coherence = Decimal.max(10, gameState.coherence.minus(new Decimal(0.2).times(dt)));
    } else if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.5).times(dt)));
    }
  } else if (gameState.activeEpoch === 3) {
    // Era 3 Coherence Equilibrium: extreme temp (>1.5B K) causes subtle coherence stress, normal operation recovers it
    if (gameState.era3.temperature.gt(1500000000)) {
      gameState.coherence = Decimal.max(20, gameState.coherence.minus(new Decimal(0.1).times(dt)));
    } else if (gameState.coherence.lt(100)) {
      gameState.coherence = Decimal.min(100, gameState.coherence.plus(new Decimal(0.5).times(dt)));
    }
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
  updateObjectiveProgress(gameState);

  // Achievement state mutates here; presentation receives an explicit effect.
  if (gameState.resources.iron && gameState.resources.iron.amount.gte(1) && !gameState.achievements.firstIron.unlocked) {
    gameState.achievements.firstIron.unlocked = true;
    emitEffect({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: 'firstIron', message: 'Achievement Unlocked: Heavy Metal! (Neon Core Skin active)' });
  }
  if (gameState.stats.supernovas.gte(1) && !gameState.achievements.firstSupernova.unlocked) {
    gameState.achievements.firstSupernova.unlocked = true;
    emitEffect({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: 'firstSupernova', message: 'Achievement Unlocked: Stellar Collapse!' });
  }
  if (gameState.stats.firstGalaxyTriggered && !gameState.achievements.firstGalaxy.unlocked) {
    gameState.achievements.firstGalaxy.unlocked = true;
    emitEffect({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: 'firstGalaxy', message: 'Achievement Unlocked: Galactic Formation!' });
  }
  if (gameState.stats.firstBlackHoleTriggered && !gameState.achievements.firstBlackHole.unlocked) {
    gameState.achievements.firstBlackHole.unlocked = true;
    emitEffect({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: 'firstBlackHole', message: 'Achievement Unlocked: Event Horizon!' });
  }
  if (gameState.stats.firstHawkingRadiationTriggered && !gameState.achievements.firstHawkingRadiation.unlocked) {
    gameState.achievements.firstHawkingRadiation.unlocked = true;
    emitEffect({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: 'firstHawkingRadiation', message: 'Achievement Unlocked: Quantum Evaporation!' });
  }

  // Mission progress
  if (COSMIC_REGISTRY.systemRanks) {
    const currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
    if (currentRankDef) {
      let allCompleted = true;
      for (const mission of currentRankDef.missions) {
        if (gameState.completedMissions.includes(mission.id)) continue;
        if (mission.check(gameState)) {
          gameState.completedMissions.push(mission.id);
        } else {
          allCompleted = false;
        }
      }
      if (allCompleted) {
        const nextRank = gameState.systemRank + 1;
        if (COSMIC_REGISTRY.systemRanks[nextRank]) {
          gameState.systemRank = nextRank;
        }
      }
    }
  }

  return { effects };
}
