import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../../src/state/createInitialState.js';
import { setGameState } from '../../src/core/state.js';
import { engine } from '../../src/engine/instance.js';
import { playtestHarness } from '../../src/core/playtestBot.js';

function createSeededRandom(seed) {
  let state = 2166136261;
  for (const char of seed) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function runLongSimulation(options) {
  vi.spyOn(Math, 'random').mockImplementation(createSeededRandom(options.seed));
  playtestHarness.runHeadlessSim(options);
}

describe('Bot long-run strategy and balance telemetry', () => {
  beforeEach(() => {
    // Reset state before each test
    const initialState = createInitialState();
    setGameState(initialState);
    engine.loadState(initialState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the efficient profile through the second run checkpoint successfully', () => {
    // We use a small tick budget that should be enough for the efficient bot to reach the checkpoint in fast sim
    // We can allow up to 100,000 ticks (10000s in-game) for a full run
    runLongSimulation({
      profile: 'efficient',
      target: 'p2c-second-run',
      maxTicks: 30000000, 
      seed: 'test-seed'
    });

    const stats = playtestHarness.stats;
    
    // Assert bounded ticks
    expect(stats.ticksElapsed).toBeLessThan(30000000);
    
    // Assert success
    expect(stats.result).toBe('SUCCESS');
    expect(playtestHarness.runPhase).toBe('COMPLETE');
    
    // Assert outcome mismatch didn't happen
    expect(stats.failureReason).toBeNull();
    
    // Check outcome was efficient
    expect(stats.supernovaOutcome).toBe('white-dwarf');
    
    // Verify isolated architecture levels
    expect(stats.stellarArchitectureLevels.efficient).toBeGreaterThan(0);
    expect(stats.stellarArchitectureLevels.massive).toBe(0);
    expect(stats.stellarArchitectureLevels.compact).toBe(0);
    
    // Verify second run progress
    const state = engine.getStateUnsafe();
    expect(state.activeEpoch).toBe(3);
    expect(state.meta.stellarRunsCompleted).toBe(1);
    expect(state.meta.secondStellarRunUnlocked).toBe(true);
    expect(state.era3.temperature.toNumber()).toBeGreaterThan(5000);
    
    // Verify rewards granted (stardust)
    expect(stats.grantedRewards.stardust.toNumber()).toBeGreaterThan(0);
  });

  it('runs the massive profile through the second run checkpoint successfully', () => {
    runLongSimulation({
      profile: 'massive',
      target: 'p2c-second-run',
      maxTicks: 30000000,
      seed: 'test-seed-massive'
    });

    const stats = playtestHarness.stats;
    expect(stats.result).toBe('SUCCESS');
    expect(playtestHarness.runPhase).toBe('COMPLETE');
    expect(stats.failureReason).toBeNull();
    expect(stats.supernovaOutcome).toBe('black-hole');
    
    expect(stats.stellarArchitectureLevels.efficient).toBe(0);
    expect(stats.stellarArchitectureLevels.massive).toBeGreaterThan(0);
    expect(stats.stellarArchitectureLevels.compact).toBe(0);
  });

  it('runs the compact profile through the second run checkpoint successfully', () => {
    runLongSimulation({
      profile: 'compact',
      target: 'p2c-second-run',
      maxTicks: 30000000, 
      seed: 'test-seed-3'
    });

    const stats = playtestHarness.stats;
    expect(stats.result).toBe('SUCCESS');
    expect(playtestHarness.runPhase).toBe('COMPLETE');
    expect(stats.failureReason).toBeNull();
    expect(stats.supernovaOutcome).toBe('neutron-star');
    
    expect(stats.stellarArchitectureLevels.efficient).toBe(0);
    expect(stats.stellarArchitectureLevels.massive).toBe(0);
    expect(stats.stellarArchitectureLevels.compact).toBeGreaterThan(0);
  });
});
