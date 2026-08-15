import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import { gameState, getInitialGameState, replaceRuntimeState } from '../src/core/state.js';
import { playtestHarness } from '../src/core/playtestBot.js';
import { getSupernovaOutcome } from '../src/eras/stellar/selectors.js';

function installSupernovaReadyState() {
  const state = getInitialGameState();
  state.activeEpoch = 3;
  state.era3.stage = 'Main Sequence Star';
  state.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
  state.era3.ironYield = new Decimal(2);
  state.resources.hydrogen.amount = new Decimal(1000);
  state.resources.helium.amount = new Decimal(1000);
  state.resources.carbon.amount = new Decimal(10000);
  state.resources.iron.amount = new Decimal(1000);
  state.upgrades.stellar.efficient.level = 5;
  replaceRuntimeState(state);
}

describe('Bounded bot correctness smoke', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('uses authoritative ticks and commands through Supernova reset and the second-run checkpoint', () => {
    installSupernovaReadyState();
    playtestHarness.resetStats('efficient', 'bot-smoke');
    playtestHarness.target = 'p2c-second-run';

    const predicted = getSupernovaOutcome(gameState);
    const stardustBefore = gameState.currencies.stardust.amount;

    playtestHarness.runGameTicks(0.1, true, 1);

    expect(playtestHarness.runPhase).toBe('SECOND_STELLAR_RUN');
    expect(playtestHarness.stats.supernovaOutcome).toBe(predicted.outcome);
    expect(playtestHarness.stats.grantedRewards.stardust.eq(predicted.rewards.stardust)).toBe(true);
    expect(gameState.currencies.stardust.amount.minus(stardustBefore).eq(predicted.rewards.stardust)).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    expect(gameState.meta.stellarRunsCompleted).toBe(1);
    expect(gameState.meta.secondStellarRunUnlocked).toBe(true);

    gameState.resources.helium.amount = new Decimal(1000);
    playtestHarness.runGameTicks(0.1, true, 1);

    expect(playtestHarness.runPhase).toBe('COMPLETE');
    expect(playtestHarness.stats.result).toBe('SUCCESS');
    expect(playtestHarness.stats.ticksElapsed).toBe(2);
    expect(playtestHarness.stats.legacyModifiers.secondRunStabilityMult).toBeGreaterThan(1);
    expect(playtestHarness.stats.milestones['Second Stellar Run Checkpoint Reached']).toBeDefined();
  });

  it('fails cleanly when a bounded headless run exhausts its tick budget', () => {
    replaceRuntimeState(getInitialGameState());

    playtestHarness.runHeadlessSim({
      profile: 'efficient',
      target: 'p2c-second-run',
      maxTicks: 10,
      seed: 'bounded-failure'
    });

    expect(playtestHarness.stats.result).toBe('FAILED');
    expect(playtestHarness.stats.failureReason).toBe('MAX_TICKS_EXCEEDED');
    expect(playtestHarness.runPhase).toBe('FAILED');
  });
});
