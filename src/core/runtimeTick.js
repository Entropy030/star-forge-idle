/* global Decimal */
import { gameState } from './state.js';
import { getAmount } from './economy.js';
import { Timeline } from './timeline.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getVacuumCoherence, getVacuumCoherenceRates, setVacuumCoherence, isVacuumFieldAllocationUnlocked } from '../eras/quantum/coherence.js';
import { updateObjectiveProgress } from './objectives.js';
import { appendHistoryEntry } from '../state/history.js';
import { getTickContext } from './tickContext.js';

export function advanceGameTick(dt, effectSink, context) {
  const tickContext = getTickContext(context);
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
    const vacuumCoherence = getVacuumCoherence(gameState);
    if (vacuumCoherence.lt(100)) {
      const { passiveRate } = getVacuumCoherenceRates(gameState);
      setVacuumCoherence(gameState, Decimal.min(100, vacuumCoherence.plus(passiveRate.times(dt))));
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
        appendHistoryEntry(gameState, { msg: message, id });
        emitEffect({ type: 'NARRATIVE_MILESTONE', id, message });
      }
    };

    if (currentQF.gte(1)) recordNarrativeMilestone('qf_1', '[SYSTEM]: Quantum Foam compiled. Primary metric online.');
    if (currentQF.gte(10)) recordNarrativeMilestone('qf_10', '[SYSTEM]: Energy density sufficient. Compiling Fluctuation Condenser...');
    if (currentQF.gte(100)) recordNarrativeMilestone('qf_100', '[SYSTEM]: Weak Nuclear Vector unlocked. Symmetry breaking begins.');
    if (currentQF.gte(500)) recordNarrativeMilestone('qf_500', '[SYSTEM]: Electromagnetic Tensor engaged. Photons propagating.');
    if (currentQF.gte(2500)) recordNarrativeMilestone('qf_2500', '[SYSTEM]: Harmonic density threshold reached. Field stabilization potential detected.');
    if (currentQF.gte(10000)) recordNarrativeMilestone('qf_10000', '[SYSTEM]: Strong Color Force bound. Baryogenesis imminent.');

    if (isVacuumFieldAllocationUnlocked(gameState)) {
      recordNarrativeMilestone('vacuum_allocation_unlocked', 'Vacuum Resonance available. Field Allocation is now accessible: propagate Fundamental Laws, balance the field, or accelerate stabilization.');
    }
  }

  Timeline.process(dt, tickContext);
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
