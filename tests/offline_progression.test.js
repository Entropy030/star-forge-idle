import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { advanceOfflineProgress, runOfflineCatchUp } from '../src/core/offline.js';
import { clearLiveSimulationClock, consumeLiveElapsedSeconds, resetLiveSimulationClock } from '../src/core/liveClock.js';
import { OFFLINE_TICK_CONTEXT } from '../src/core/tickContext.js';
import { gameState, getInitialGameState, replaceRuntimeState } from '../src/core/state.js';
import { serializeState, deserializeState } from '../src/state/serialization.js';
import { loadGame, saveGame, setPlaytestSpeedMultiplier } from '../src/core/persistence.js';
import { setVacuumCoherence } from '../src/eras/quantum/coherence.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility } from '../src/eras/stellar/selectors.js';
import {
  getPresetEraIIUpgradeChain,
  getPresetMidEraIII
} from '../src/dev/playtestPresets.js';

const noYield = async () => {};

function cloneState(state) {
  return deserializeState(serializeState(state));
}

async function runOffline(state, seconds, options = {}) {
  replaceRuntimeState(cloneState(state));
  const result = await advanceOfflineProgress({
    creditedElapsedSeconds: seconds,
    yieldControl: noYield,
    ...options
  });
  return { result, state: cloneState(gameState) };
}

function expectDecimalEqual(actual, expected) {
  expect(actual.eq(expected)).toBe(true);
}

describe('authoritative offline progression', () => {
  beforeEach(() => {
    replaceRuntimeState(getInitialGameState());
    setPlaytestSpeedMultiplier(1);
    clearLiveSimulationClock();
  });

  it('matches sixty authoritative 1-second ticks for deterministic Era I state', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    initial.resources.quantumFluctuations.amount = new Decimal(49);

    replaceRuntimeState(cloneState(initial));
    for (let second = 0; second < 60; second += 1) {
      advanceGameTick(1, undefined, OFFLINE_TICK_CONTEXT);
    }
    const liveEquivalent = cloneState(gameState);
    const offline = await runOffline(initial, 60);

    expectDecimalEqual(offline.state.resources.quantumFluctuations.amount, liveEquivalent.resources.quantumFluctuations.amount);
    expectDecimalEqual(offline.state.resources.energyDensity.amount, liveEquivalent.resources.energyDensity.amount);
    expectDecimalEqual(offline.state.coherence, liveEquivalent.coherence);
    expectDecimalEqual(offline.state.eraITemperature, liveEquivalent.eraITemperature);
    expect(offline.state.completedObjectives).toEqual(liveEquivalent.completedObjectives);
    expect([...offline.state.discoveries]).toEqual([...liveEquivalent.discoveries]);
    expect(offline.result.logicalTicksProcessed).toBe(60);
  });

  it('advances passive Vacuum Coherence and caps it at 100', async () => {
    const initial = getInitialGameState();
    setVacuumCoherence(initial, new Decimal('99.95'));

    const { state } = await runOffline(initial, 60);

    expectDecimalEqual(state.coherence, 100);
  });

  it('can make Inflation ready without buying laws or triggering the transition', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    initial.resources.quantumFluctuations.amount = new Decimal(99999);
    initial.resources.energyDensity.amount = new Decimal(49999);
    setVacuumCoherence(initial, new Decimal('99.9'));
    const levelsBefore = Object.fromEntries(Object.entries(initial.upgrades.quantum).map(([key, value]) => [key, value.level]));

    const { state } = await runOffline(initial, 2);

    expect(getInflationEligibility(state).isEligible).toBe(true);
    expect(state.activeEpoch).toBe(1);
    expect(Object.fromEntries(Object.entries(state.upgrades.quantum).map(([key, value]) => [key, value.level]))).toEqual(levelsBefore);
  });

  it('advances deterministic Era II production, synthesis, and cooling', async () => {
    const initial = getPresetEraIIUpgradeChain();
    initial.upgrades.plasma.baryoRadiator.level = 1;
    initial.upgrades.plasma.plasmaAutomation.level = 3;
    const before = cloneState(initial);

    const { state } = await runOffline(initial, 60);

    expect(state.resources.quarks.amount.eq(before.resources.quarks.amount)).toBe(false);
    expect(state.resources.gluons.amount.eq(before.resources.gluons.amount)).toBe(true);
    expect(state.resources.protons.amount.gt(before.resources.protons.amount)).toBe(true);
    expect(state.plasmaTemperature.lt(before.plasmaTemperature)).toBe(true);
    expect(state.activeEpoch).toBe(2);
  });

  it('can make Recombination ready without changing Era', async () => {
    const initial = getPresetEraIIUpgradeChain();
    initial.upgrades.plasma.baryoRadiator.level = 1;
    initial.plasmaTemperature = new Decimal(10000);
    initial.resources.protons.amount = new Decimal(100);

    const { state } = await runOffline(initial, 1);

    expect(getRecombinationEligibility(state).isEligible).toBe(true);
    expect(state.activeEpoch).toBe(2);
  });

  it('advances deterministic Era III fusion while suppressing autobuy, auto-compress, shards, and flares', async () => {
    const initial = getPresetMidEraIII();
    initial.autoBuyer.hydrogen.active = true;
    initial.upgrades.pulsar.autoCompress.level = 10;
    initial.upgrades.stellar.compact.level = 5;
    initial.flares.nextSpawnInSec = new Decimal(1);
    const gravity = new Decimal(initial.era3.gravity);
    const temperature = new Decimal(initial.era3.temperature);
    const compressCost = new Decimal(initial.era3.compressCost);
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    const { state } = await runOffline(initial, 60);
    random.mockRestore();

    expect(state.resources.hydrogen.amount.gt(initial.resources.hydrogen.amount)).toBe(true);
    expect(state.resources.helium.amount.gt(initial.resources.helium.amount)).toBe(true);
    expectDecimalEqual(state.era3.gravity, gravity);
    expectDecimalEqual(state.era3.temperature, temperature);
    expectDecimalEqual(state.era3.compressCost, compressCost);
    expectDecimalEqual(state.currencies.pulsarShards.amount, 0);
    expectDecimalEqual(state.flares.nextSpawnInSec, 1);
    expect(state.flares.active).toBeNull();
  });

  it('can make Supernova and Galactic Ignition ready without executing either event', async () => {
    const initial = getPresetMidEraIII();
    initial.era3.temperature = new Decimal(2000000000);
    initial.era3.ironYield = new Decimal(1);
    initial.resources.carbon.amount = new Decimal(1000);
    initial.resources.iron.amount = new Decimal(999);
    const supernovasBefore = new Decimal(initial.stats.supernovas);

    const { state } = await runOffline(initial, 1);

    expect(getSupernovaEligibility(state).canTrigger).toBe(true);
    expect(getGalacticIgnitionEligibility(state).isEligible).toBe(true);
    expect(state.activeEpoch).toBe(3);
    expectDecimalEqual(state.stats.supernovas, supernovasBefore);
    expect(state.achievements.firstIron.unlocked).toBe(true);
  });

  it('reconciles objectives, achievements, rank, narrative, and Codex without presentation replay', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    initial.resources.quantumFluctuations.amount = new Decimal(9999);
    initial.stats.maxQF = new Decimal(9999);

    const { result, state } = await runOffline(initial, 3);

    expect(state.systemRank).toBe(2);
    expect(state.completedMissions).toContain('m1');
    expect(state.completedObjectives).toContain('obj_qf_intro');
    expect(state.history.filter(entry => entry.id === 'qf_10000')).toHaveLength(1);
    expect(state.codex.unlockedEntryIds).toContain('vacuum-resonance');
    expect(result.effects.some(effect => effect.type === 'NARRATIVE_MILESTONE')).toBe(true);
    expect(result.effects.some(effect => effect.type === 'CODEX_UNLOCKED')).toBe(true);
  });

  it('deduplicates narrative milestones across repeated offline sessions', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    initial.resources.quantumFluctuations.amount = new Decimal('0.5');

    const first = await runOffline(initial, 2);
    const second = await runOffline(first.state, 2);

    expect(second.state.history.filter(entry => entry.id === 'qf_1')).toHaveLength(1);
  });

  it('uses gameplay time once and never inherits the playtest speed multiplier', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    initial.cosmicConstants.c = 1;
    setPlaytestSpeedMultiplier(25);

    replaceRuntimeState(cloneState(initial));
    for (let second = 0; second < 67; second += 1) {
      advanceGameTick(1, undefined, OFFLINE_TICK_CONTEXT);
    }
    advanceGameTick(0.2, undefined, OFFLINE_TICK_CONTEXT);
    const liveEquivalent = cloneState(gameState);

    const { result, state } = await runOffline(initial, 60);

    expect(result.gameplayMultiplier).toBe(1.12);
    expect(result.simulatedSeconds).toBeCloseTo(67.2);
    expectDecimalEqual(state.resources.quantumFluctuations.amount, liveEquivalent.resources.quantumFluctuations.amount);
  });

  it('checkpoints once and refuses to consume the same load result twice', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    replaceRuntimeState(initial);
    const metadata = { loaded: true, creditedElapsedSeconds: 60 };
    const checkpoint = vi.fn(() => ({ success: true }));

    const first = await runOfflineCatchUp(metadata, { checkpoint, yieldControl: noYield });
    const amountAfterFirst = new Decimal(gameState.resources.quantumFluctuations.amount);
    const second = await runOfflineCatchUp(metadata, { checkpoint, yieldControl: noYield });

    expect(first.applied).toBe(true);
    expect(first.checkpoint).toEqual({ success: true });
    expect(second).toMatchObject({ applied: false, reason: 'ALREADY_CONSUMED' });
    expect(checkpoint).toHaveBeenCalledTimes(1);
    expectDecimalEqual(gameState.resources.quantumFluctuations.amount, amountAfterFirst);
  });

  it('anchors a successful checkpoint so a reload cannot credit the same interval', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
    localStorage.clear();
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    replaceRuntimeState(initial);

    const result = await runOfflineCatchUp(
      { loaded: true, creditedElapsedSeconds: 60 },
      { checkpoint: saveGame, yieldControl: noYield }
    );
    const amountAfterCatchUp = new Decimal(gameState.resources.quantumFluctuations.amount);
    const nextLoad = loadGame({ now: 100_000 });
    vi.useRealTimers();

    expect(result.checkpoint.success).toBe(true);
    expect(nextLoad.creditedElapsedSeconds).toBe(0);
    expectDecimalEqual(gameState.resources.quantumFluctuations.amount, amountAfterCatchUp);
  });

  it('keeps caught-up in-memory progress usable when checkpoint storage fails', async () => {
    const initial = getInitialGameState();
    initial.upgrades.quantum.gravityForce.level = 1;
    replaceRuntimeState(initial);

    const result = await runOfflineCatchUp(
      { loaded: true, creditedElapsedSeconds: 60 },
      { checkpoint: () => ({ success: false, message: 'storage denied' }), yieldControl: noYield }
    );

    expect(result.applied).toBe(true);
    expect(result.checkpoint.success).toBe(false);
    expect(gameState.resources.quantumFluctuations.amount.gt(0)).toBe(true);
    expect(gameState.activeEpoch).toBe(1);
  });

  it('resets the live clock so scheduler elapsed begins after catch-up', () => {
    resetLiveSimulationClock(100_000);
    expect(consumeLiveElapsedSeconds(100_100)).toBeCloseTo(0.1);
    expect(consumeLiveElapsedSeconds(100_200)).toBeCloseTo(0.1);
  });
});
