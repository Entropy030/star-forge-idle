import Decimal from 'break_infinity.js';
import { getInflationEligibility } from '../eras/quantum/inflation.js';
import { getRecombinationEligibility } from '../eras/plasma/eligibility.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility } from '../eras/stellar/selectors.js';

export const OFFLINE_BRIEFING_MIN_SECONDS = 60;

function captureAmounts(bag = {}) {
  return Object.fromEntries(Object.entries(bag).map(([key, value]) => [
    key,
    new Decimal(value?.amount || 0).toString()
  ]));
}

function unlockedAchievementIds(state) {
  return Object.entries(state.achievements || {})
    .filter(([, achievement]) => achievement?.unlocked)
    .map(([id]) => id);
}

export function captureOfflineSnapshot(state) {
  return {
    epoch: state.activeEpoch,
    resources: captureAmounts(state.resources),
    currencies: captureAmounts(state.currencies),
    physical: {
      vacuumCoherence: new Decimal(state.coherence || 0).toString(),
      eraITemperature: new Decimal(state.eraITemperature || 0).toString(),
      plasmaTemperature: new Decimal(state.plasmaTemperature || 0).toString(),
      coreTemperature: new Decimal(state.era3?.temperature || 0).toString(),
      stellarStage: state.era3?.stage || null,
      systemRank: state.systemRank || 1
    },
    readiness: {
      inflation: getInflationEligibility(state).isEligible,
      recombination: getRecombinationEligibility(state).isEligible,
      supernova: getSupernovaEligibility(state).canTrigger,
      galacticIgnition: getGalacticIgnitionEligibility(state).isEligible
    },
    discoveries: Array.from(state.discoveries || []),
    codex: [...(state.codex?.unlockedEntryIds || [])],
    achievements: unlockedAchievementIds(state),
    objectives: [...(state.completedObjectives || [])],
    missions: [...(state.completedMissions || [])],
    automation: {
      hydrogenAutobuyer: Boolean(state.autoBuyer?.hydrogen?.active),
      autoCompressLevel: state.upgrades?.pulsar?.autoCompress?.level || 0
    }
  };
}

function difference(after = [], before = []) {
  const previous = new Set(before);
  return after.filter(value => !previous.has(value));
}

function resourceChanges(before, after) {
  const changes = [];
  for (const bagName of ['resources', 'currencies']) {
    const keys = new Set([...Object.keys(before[bagName] || {}), ...Object.keys(after[bagName] || {})]);
    for (const key of keys) {
      const from = new Decimal(before[bagName]?.[key] || 0);
      const to = new Decimal(after[bagName]?.[key] || 0);
      const delta = to.minus(from);
      if (delta.eq(0)) continue;
      changes.push({ key, bag: bagName, before: from.toString(), after: to.toString(), delta: delta.toString() });
    }
  }
  return changes;
}

function physicalChanges(before, after) {
  const fieldsByEpoch = {
    1: [['vacuumCoherence', 'Vacuum Coherence'], ['eraITemperature', 'Universe Temperature']],
    2: [['plasmaTemperature', 'Plasma Temperature']],
    3: [['coreTemperature', 'Core Temperature']]
  };
  const changes = [];
  for (const [key, label] of fieldsByEpoch[after.epoch] || []) {
    const from = new Decimal(before.physical[key] || 0);
    const to = new Decimal(after.physical[key] || 0);
    if (!from.eq(to)) changes.push({ key, label, before: from.toString(), after: to.toString() });
  }
  if (before.physical.stellarStage !== after.physical.stellarStage) {
    changes.push({
      key: 'stellarStage',
      label: 'Stellar Stage',
      before: before.physical.stellarStage,
      after: after.physical.stellarStage
    });
  }
  if (before.physical.systemRank !== after.physical.systemRank) {
    changes.push({
      key: 'systemRank',
      label: 'System Rank',
      before: String(before.physical.systemRank),
      after: String(after.physical.systemRank)
    });
  }
  return changes;
}

function readinessChanges(before, after) {
  const labels = {
    inflation: 'Cosmic Inflation',
    recombination: 'Cosmic Recombination',
    supernova: 'Supernova',
    galacticIgnition: 'Galactic Ignition'
  };
  return Object.keys(labels)
    .filter(key => !before.readiness[key] && after.readiness[key])
    .map(key => ({ key, label: labels[key] }));
}

function waitingDecisions(after) {
  const labels = {
    inflation: 'Initiate Cosmic Inflation',
    recombination: 'Initiate Cosmic Recombination',
    supernova: 'Trigger Supernova',
    galacticIgnition: 'Enter Galactic Ignition'
  };
  return Object.keys(labels)
    .filter(key => after.readiness[key])
    .map(key => ({ key, label: labels[key] }));
}

export function createOfflineSummary({ loadMetadata, beforeSnapshot, afterSnapshot, progression, checkpoint }) {
  if (!loadMetadata || !beforeSnapshot || !afterSnapshot || !progression) return null;

  const resources = resourceChanges(beforeSnapshot, afterSnapshot);
  const physical = physicalChanges(beforeSnapshot, afterSnapshot);
  const newReadiness = readinessChanges(beforeSnapshot, afterSnapshot);
  const discoveries = {
    narrative: difference(afterSnapshot.discoveries, beforeSnapshot.discoveries),
    codex: difference(afterSnapshot.codex, beforeSnapshot.codex),
    achievements: difference(afterSnapshot.achievements, beforeSnapshot.achievements),
    objectives: difference(afterSnapshot.objectives, beforeSnapshot.objectives),
    missions: difference(afterSnapshot.missions, beforeSnapshot.missions)
  };
  const decisionsWaiting = waitingDecisions(afterSnapshot);
  const pausedAutomation = [];
  if (afterSnapshot.automation.hydrogenAutobuyer) pausedAutomation.push('Hydrogen Autobuyer');
  if (afterSnapshot.automation.autoCompressLevel > 0) pausedAutomation.push('Auto-Compressor');
  const persistenceWarning = checkpoint && checkpoint.success === false ? checkpoint.message : null;
  const importantDiscovery = Object.values(discoveries).some(values => values.length > 0);
  const importantPhysicalChange = physical.some(change => change.key === 'stellarStage' || change.key === 'systemRank');
  const visible = loadMetadata.creditedElapsedSeconds >= OFFLINE_BRIEFING_MIN_SECONDS
    || newReadiness.length > 0
    || importantDiscovery
    || importantPhysicalChange
    || Boolean(persistenceWarning);

  return {
    visible,
    actualElapsedSeconds: loadMetadata.actualElapsedSeconds,
    creditedElapsedSeconds: loadMetadata.creditedElapsedSeconds,
    capApplied: loadMetadata.capApplied,
    clockAnomaly: loadMetadata.clockAnomaly,
    resources,
    physical,
    newReadiness,
    discoveries,
    decisionsWaiting,
    pausedAutomation,
    persistenceWarning
  };
}
