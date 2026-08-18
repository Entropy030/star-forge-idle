import { CODEX_ENTRIES } from '../content/codex.js';
import { isVacuumFieldAllocationUnlocked } from '../eras/quantum/coherence.js';

export function isCodexEntryUnlocked(entry, state) {
  const condition = entry?.unlockCondition;
  if (!condition) return false;

  switch (condition.type) {
    case 'epoch_reached':
      return state.activeEpoch >= condition.epoch;
    case 'quantum_fluctuations':
      return Boolean(state.resources.quantumFluctuations?.amount.gte(condition.amount));
    case 'protons':
      return Boolean(state.resources.protons?.amount.gte(condition.amount));
    case 'upgrade_unlocked':
      return Boolean(state.upgrades[condition.category]?.[condition.id]?.level > 0);
    case 'supernova_completed':
      return Boolean(state.stats?.supernovas?.gte(condition.amount));
    case 'has_remnant':
      return Boolean(state.meta?.lastSupernovaOutcome);
    case 'vacuum_allocation_unlocked':
      return isVacuumFieldAllocationUnlocked(state);
    default:
      return false;
  }
}

export function reconcileCodexUnlocks(state) {
  if (!state.codex) return [];

  const currentUnlocks = new Set(state.codex.unlockedEntryIds || []);
  const unlockedEntryIds = [];
  for (const entry of CODEX_ENTRIES) {
    if (currentUnlocks.has(entry.id) || !isCodexEntryUnlocked(entry, state)) continue;
    currentUnlocks.add(entry.id);
    unlockedEntryIds.push(entry.id);
  }

  if (unlockedEntryIds.length > 0) {
    state.codex.unlockedEntryIds = Array.from(currentUnlocks);
  }
  return unlockedEntryIds;
}
