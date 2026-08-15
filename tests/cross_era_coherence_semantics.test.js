import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { gameState, getInitialGameState, replaceRuntimeState } from '../src/core/state.js';
import { getEntropyBitProductionMultiplier } from '../src/eras/galactic/selectors.js';
import { getVacuumCoherence, setVacuumCoherence } from '../src/eras/quantum/coherence.js';
import { simulateStellarEra } from '../src/eras/stellar/simulation.js';
import { deserializeState, serializeState } from '../src/state/serialization.js';

function installEra(epoch, configure = () => {}) {
  const state = getInitialGameState();
  state.activeEpoch = epoch;
  state.coherence = new Decimal(37);
  configure(state);
  replaceRuntimeState(state);
  return gameState;
}

describe('cross-era Vacuum Coherence ownership', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the v17 compatibility key behind Era I semantic accessors', () => {
    const state = getInitialGameState();
    setVacuumCoherence(state, new Decimal(42));

    expect(getVacuumCoherence(state).eq(42)).toBe(true);
    expect(state.coherence.eq(42)).toBe(true);
  });

  it('does not reinterpret Vacuum Coherence as Era II thermal equilibrium', () => {
    installEra(2, state => {
      state.plasmaTemperature = new Decimal(9000000);
    });

    advanceGameTick(1);

    expect(getVacuumCoherence(gameState).eq(37)).toBe(true);
  });

  it('does not reinterpret Vacuum Coherence as Era III stellar stability', () => {
    const state = getInitialGameState();
    state.activeEpoch = 3;
    state.coherence = new Decimal(37);
    state.upgrades.stellar.efficient.level = 5;

    simulateStellarEra(state, 1);

    expect(getVacuumCoherence(state).eq(37)).toBe(true);
  });

  it('keeps Era IV Galaxy Stability as the sole stability authority', () => {
    installEra(4, state => {
      state.era4.stability = new Decimal(72);
    });

    advanceGameTick(1);

    expect(gameState.era4.stability.lt(72)).toBe(true);
    expect(getVacuumCoherence(gameState).eq(37)).toBe(true);
  });

  it('derives the Era V bit multiplier directly from Entropy without stored duplicate truth', () => {
    installEra(5, state => {
      state.era5.entropy = 40;
      state.resources.hawkingRadiation = { amount: new Decimal(10) };
      state.upgrades.era5.infoExtractor.level = 1;
    });

    expect(getEntropyBitProductionMultiplier(gameState).eq(1.3)).toBe(true);

    advanceGameTick(1);

    expect(gameState.currencies.bits.amount.eq(1.3)).toBe(true);
    expect(gameState.era5.entropy).toBe(40.5);
    expect(getVacuumCoherence(gameState).eq(37)).toBe(true);

    gameState.era5.entropy = 100;
    expect(getEntropyBitProductionMultiplier(gameState).eq(1)).toBe(true);
  });

  it('round-trips Vacuum Coherence independently from later-era native metrics', () => {
    const state = getInitialGameState();
    state.coherence = new Decimal(81);
    state.era4.stability = new Decimal(23);
    state.era5.entropy = 64;

    const restored = deserializeState(serializeState(state));

    expect(getVacuumCoherence(restored).eq(81)).toBe(true);
    expect(restored.era4.stability.eq(23)).toBe(true);
    expect(restored.era5.entropy).toBe(64);
  });
});
