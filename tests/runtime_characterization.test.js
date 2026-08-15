import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { getInitialGameState, gameState, replaceRuntimeState } from '../src/core/state.js';
import { gameTick, Timeline } from '../src/core/timeline.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getQuantumUpgradeEligibility } from '../src/eras/quantum/eligibility.js';
import { getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { getGalacticIgnitionEligibility } from '../src/eras/stellar/selectors.js';

function installState(configure) {
  const state = getInitialGameState();
  configure(state);
  replaceRuntimeState(state);
  return gameState;
}

describe('production runtime characterization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('makes Era I production visible to transition eligibility in the producing tick', () => {
    installState(state => {
      state.activeEpoch = 1;
      state.resources.quantumFluctuations.amount = new Decimal(99999);
      state.resources.energyDensity.amount = new Decimal(50000);
      state.coherence = new Decimal(100);
      state.upgrades.quantum.gravityForce.level = 1;
    });

    expect(getInflationEligibility(gameState).isEligible).toBe(false);

    gameTick(1);

    expect(gameState.resources.quantumFluctuations.amount.gte(100000)).toBe(true);
    expect(getInflationEligibility(gameState).isEligible).toBe(true);
  });

  it('records Era I peak-QF law eligibility and narrative on the tick after production crosses the boundary', () => {
    installState(state => {
      state.activeEpoch = 1;
      state.resources.quantumFluctuations.amount = new Decimal('99.5');
      state.stats.maxQF = new Decimal(99);
      state.upgrades.quantum.gravityForce.level = 5;
      state.discoveries = new Set();
    });

    gameTick(1);

    expect(gameState.resources.quantumFluctuations.amount.gte(100)).toBe(true);
    expect(gameState.stats.maxQF.eq('99.5')).toBe(true);
    expect(getQuantumUpgradeEligibility(gameState, 'weakForce').unlocked).toBe(false);
    expect(gameState.discoveries.has('qf_100')).toBe(false);

    gameTick(0.001);

    expect(gameState.stats.maxQF.gte(100)).toBe(true);
    expect(getQuantumUpgradeEligibility(gameState, 'weakForce').unlocked).toBe(true);
    expect(gameState.discoveries.has('qf_100')).toBe(true);
  });

  it('makes Era II cooling visible to Recombination eligibility in the cooling tick', () => {
    installState(state => {
      state.activeEpoch = 2;
      state.plasmaTemperature = new Decimal(3500);
      state.resources.protons.amount = new Decimal(2);
      state.upgrades.plasma.baryoRadiator.level = 1;
    });

    expect(getRecombinationEligibility(gameState).isEligible).toBe(false);

    gameTick(1);

    expect(gameState.plasmaTemperature.lte(3000)).toBe(true);
    expect(getRecombinationEligibility(gameState).isEligible).toBe(true);
  });

  it('makes Era III iron production, Galactic Ignition readiness, and achievements visible in one tick', () => {
    const achievementEvent = vi.fn();
    window.addEventListener('achievementUnlocked', achievementEvent, { once: true });
    installState(state => {
      state.activeEpoch = 3;
      state.era3.stage = 'Main Sequence Star';
      state.era3.temperature = new Decimal(2000000000);
      state.era3.ironYield = new Decimal(1);
      state.resources.carbon.amount = new Decimal(1000);
      state.resources.iron.amount = new Decimal('999.5');
      state.upgrades.pulsar.autoCompress.level = 0;
      state.upgrades.stellar.compact.level = 0;
      state.achievements.firstIron.unlocked = false;
    });

    expect(getGalacticIgnitionEligibility(gameState).isEligible).toBe(false);

    gameTick(1);

    expect(gameState.resources.iron.amount.gte(1000)).toBe(true);
    expect(getGalacticIgnitionEligibility(gameState).isEligible).toBe(true);
    expect(gameState.achievements.firstIron.unlocked).toBe(true);
    expect(achievementEvent).toHaveBeenCalledTimes(1);
  });

  it('treats accelerated duration as more simulated time, not a different production formula', () => {
    const simulateFor = seconds => {
      installState(state => {
        state.activeEpoch = 1;
        state.upgrades.quantum.gravityForce.level = 1;
      });
      Timeline.process(seconds);
      return gameState.resources.quantumFluctuations.amount;
    };

    const oneSecond = simulateFor(1);
    const fiveSeconds = simulateFor(5);

    expect(fiveSeconds.eq(oneSecond.times(5))).toBe(true);
  });
});
