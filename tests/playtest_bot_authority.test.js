import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { getInitialGameState, gameState, replaceRuntimeState } from '../src/core/state.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getVacuumCoherenceRates } from '../src/eras/quantum/coherence.js';
import { getQuantumUpgradeEligibility } from '../src/eras/quantum/eligibility.js';
import { getPlasmaUpgradeEligibility, getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { playtestHarness } from '../src/core/playtestBot.js';

function installState(configure) {
  const state = getInitialGameState();
  configure(state);
  replaceRuntimeState(state);
  playtestHarness.resetStats('efficient', 'authority-test');
  return gameState;
}

describe('playtest bot gameplay authority', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it.each([
    ['just below QF', 99999, 50000, 100, false],
    ['at every threshold', 100000, 50000, 100, true],
    ['above every threshold', 100001, 50001, 100, true],
    ['missing Energy Density', 100001, 49999, 100, false],
    ['missing Vacuum Coherence', 100001, 50000, 99, false]
  ])('matches Inflation eligibility when %s', (_label, qf, energyDensity, coherence, expected) => {
    installState(state => {
      state.activeEpoch = 1;
      state.resources.quantumFluctuations.amount = new Decimal(qf);
      state.resources.energyDensity.amount = new Decimal(energyDensity);
      state.coherence = new Decimal(coherence);
    });
    const authoritative = getInflationEligibility(gameState).isEligible;

    playtestHarness.stepBotDecision();

    expect(authoritative).toBe(expected);
    expect(gameState.activeEpoch === 2).toBe(authoritative);
    expect(Boolean(playtestHarness.stats.milestones['Era I Complete (Cosmic Inflation Ready)'])).toBe(authoritative);
  });

  it.each([
    ['below both boundaries', 24999, 3001, false],
    ['at proton boundary', 25000, 3001, true],
    ['at temperature boundary', 0, 3000, true]
  ])('matches Recombination eligibility when %s', (_label, protons, temperature, expected) => {
    installState(state => {
      state.activeEpoch = 2;
      state.resources.protons.amount = new Decimal(protons);
      state.plasmaTemperature = new Decimal(temperature);
    });
    const authoritative = getRecombinationEligibility(gameState).isEligible;

    playtestHarness.stepBotDecision();

    expect(authoritative).toBe(expected);
    expect(gameState.activeEpoch === 3).toBe(authoritative);
    expect(Boolean(playtestHarness.stats.milestones['Era II Complete (Recombination Ready)'])).toBe(authoritative);
  });

  it('does not count or attempt a quantum upgrade whose authoritative prerequisites are missing', () => {
    installState(state => {
      state.activeEpoch = 1;
      state.resources.quantumFluctuations.amount = new Decimal(1000000);
      state.stats.maxQF = new Decimal(1000000);
      state.upgrades.quantum.gravityForce.level = 0;
      state.upgrades.quantum.gravityForce.cost = new Decimal(1e30);
      state.upgrades.quantum.weakForce.cost = new Decimal(10);
    });

    expect(getQuantumUpgradeEligibility(gameState, 'weakForce').unlocked).toBe(false);

    playtestHarness.handleEra1Upgrades(gameState);

    expect(gameState.upgrades.quantum.weakForce.level).toBe(0);
    expect(playtestHarness.stats.totalUpgradesBought).toBe(0);
  });

  it('does not count or attempt a plasma upgrade whose authoritative prerequisites are missing', () => {
    installState(state => {
      state.activeEpoch = 2;
      state.resources.quarks.amount = new Decimal(20);
      state.resources.gluons.amount = new Decimal(0);
      state.resources.protons.amount = new Decimal(1000);
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.quarkCondenser.cost = new Decimal(1e30);
      state.upgrades.plasma.plasmaAutomation.level = 0;
      state.upgrades.plasma.baryoRadiator.cost = new Decimal(10);
    });

    expect(getPlasmaUpgradeEligibility(gameState, 'baryoRadiator').unlocked).toBe(false);

    playtestHarness.handleEra2Upgrades(gameState);

    expect(gameState.upgrades.plasma.baryoRadiator.level).toBe(0);
    expect(playtestHarness.stats.totalUpgradesBought).toBe(0);
  });

  it('advances authoritative simulation exactly once before one strategy action', () => {
    installState(state => {
      state.activeEpoch = 1;
      state.coherence = new Decimal(50);
      state.upgrades.quantum.gravityForce.level = 1;
    });
    const rates = getVacuumCoherenceRates(gameState);
    const expectedCoherence = gameState.coherence
      .plus(rates.passiveRate.times(0.1))
      .plus(rates.observationGain);

    playtestHarness.runGameTicks(0.1, true, 1);

    // 0.15001 QF from one authoritative simulation step (coherence rises to 50.01%, field quality 1.5001, 1.5001 QF/s * 0.1s = 0.15001 QF), then 1 QF from one bot observation.
    expect(gameState.resources.quantumFluctuations.amount.eq('1.15001')).toBe(true);
    expect(gameState.coherence.eq(expectedCoherence)).toBe(true);
    expect(playtestHarness.stats.ticksElapsed).toBe(1);
    expect(playtestHarness.stats.totalClicks).toBe(1);
  });
});
