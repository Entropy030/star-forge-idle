import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '../src/state/createInitialState.js';
import { setGameState } from '../src/core/state.js';
import { engine } from '../src/engine/instance.js';
import { playtestHarness } from '../src/core/playtestBot.js';

describe('P2C Playtest Bot Automation', () => {
  beforeEach(() => {
    // Reset state before each test
    const initialState = createInitialState();
    setGameState(initialState);
    engine.loadState(initialState);
  });

  it('runs the efficient profile through the second run checkpoint successfully', () => {
    // We use a small tick budget that should be enough for the efficient bot to reach the checkpoint in fast sim
    // We can allow up to 100,000 ticks (10000s in-game) for a full run
    playtestHarness.runHeadlessSim({
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
    playtestHarness.runHeadlessSim({
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
    playtestHarness.runHeadlessSim({
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
  
  it('fails cleanly with MAX_TICKS_EXCEEDED when given an insufficient budget', () => {
    playtestHarness.runHeadlessSim({
      profile: 'efficient',
      target: 'p2c-second-run',
      maxTicks: 100, // Not enough time to even finish Era 1
      seed: 'test-seed-fail'
    });

    const stats = playtestHarness.stats;
    expect(stats.result).toBe('FAILED');
    expect(stats.failureReason).toBe('MAX_TICKS_EXCEEDED');
    expect(playtestHarness.runPhase).toBe('FAILED');
  });
});
