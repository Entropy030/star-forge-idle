import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { createGameEngine } from '../src/engine/createEngine.js';
import { quantumCommandHandlers } from '../src/eras/quantum/commands.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { getVacuumCoherenceRates } from '../src/eras/quantum/coherence.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getQuantumRates } from '../src/eras/quantum/selectors.js';
import { simulateQuantumEra } from '../src/eras/quantum/simulation.js';
import { getQuarkGluonImbalanceMultiplier } from '../src/eras/plasma/imbalance.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { gameState, replaceRuntimeState, serializeState } from '../src/core/state.js';
import { importSave, saveGame, setPlaytestMode } from '../src/core/persistence.js';
import { SAVE_VERSION } from '../src/state/migrations.js';

describe('pre-P4 Era I phantom baryon cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
    setPlaytestMode(false);
    replaceRuntimeState(createInitialState());
  });

  it('keeps the supported Era I rate, click, coherence, and Inflation contracts', () => {
    const state = createInitialState();
    state.upgrades.quantum.gravityForce.level = 1;
    const rates = getQuantumRates(state);

    expect(rates.fluctuationsProduction.eq(1)).toBe(true);
    expect(rates.densityProduction.eq(0.5)).toBe(true);
    expect(Object.keys(rates).sort()).toEqual(['densityProduction', 'fluctuationsProduction']);
    expect(getVacuumCoherenceRates(state).passiveRate.eq(0.1)).toBe(true);
    expect(getVacuumCoherenceRates(state).observationGain.eq(0.5)).toBe(true);

    const engine = createGameEngine({ initialState: state, commandHandlers: quantumCommandHandlers });
    const click = engine.dispatch({ type: 'CLICK_CORE' });
    expect(click.events[0]).toMatchObject({ gain: '1', coherenceGain: '0.5' });

    state.resources.quantumFluctuations.amount = new Decimal(100000);
    state.resources.energyDensity.amount = new Decimal(50000);
    state.coherence = new Decimal(100);
    expect(getInflationEligibility(state).isEligible).toBe(true);
  });

  it('keeps supported passive production and temperature cooling without recreating phantom resources', () => {
    const state = createInitialState();
    state.upgrades.quantum.gravityForce.level = 1;
    const temperatureBefore = state.eraITemperature;

    simulateQuantumEra(state, 2);

    expect(state.resources.quantumFluctuations.amount.eq(2)).toBe(true);
    expect(state.resources.energyDensity.amount.eq(1)).toBe(true);
    expect(state.eraITemperature.lt(temperatureBefore)).toBe(true);
    expect(state.resources).not.toHaveProperty('annihilationEnergy');
    expect(state.resources).not.toHaveProperty('survivingMatter');
  });

  it('preserves the exact Era II imbalance output and click gains', () => {
    const state = createInitialState();
    state.activeEpoch = 2;
    state.resources.quarks.amount = new Decimal(1000);
    state.resources.gluons.amount = new Decimal(900);

    expect(getQuarkGluonImbalanceMultiplier(state).eq(1.1)).toBe(true);

    const engine = createGameEngine({ initialState: state, commandHandlers: plasmaCommandHandlers });
    const click = engine.dispatch({ type: 'CLICK_CORE_ERA2' });
    expect(click.events[0].quarkGain).toBe('3.3000000000000003');
    expect(click.events[0].gluonGain).toBe('2.2');
  });

  it('normalizes old v17 phantom keys away while retaining supported and future-compatible state', () => {
    const oldState = createInitialState();
    oldState.version = SAVE_VERSION;
    oldState.activeEpoch = 2;
    oldState.era1.asymmetryBias = 0.73;
    oldState.resources.annihilationEnergy = { amount: new Decimal(456) };
    oldState.resources.survivingMatter = { amount: new Decimal(123) };
    oldState.resources.antimatterResidue.amount = new Decimal(7);
    oldState.resources.quantumFluctuations.amount = new Decimal(321);
    const encoded = btoa(JSON.stringify({
      version: SAVE_VERSION,
      gameState: serializeState(oldState),
      lastSavedTime: Date.now()
    }));

    expect(importSave(encoded).success).toBe(true);
    expect(gameState.activeEpoch).toBe(2);
    expect(gameState.resources.quantumFluctuations.amount.eq(321)).toBe(true);
    expect(gameState.era1).not.toHaveProperty('asymmetryBias');
    expect(gameState.resources).not.toHaveProperty('annihilationEnergy');
    expect(gameState.resources).not.toHaveProperty('survivingMatter');
    expect(gameState.resources.antimatterResidue.amount.eq(7)).toBe(true);

    expect(saveGame().success).toBe(true);
    const nextSave = JSON.parse(localStorage.getItem('starForgeSave_v17'));
    expect(nextSave.version).toBe(SAVE_VERSION);
    expect(nextSave.gameState.era1).not.toHaveProperty('asymmetryBias');
    expect(nextSave.gameState.resources).not.toHaveProperty('annihilationEnergy');
    expect(nextSave.gameState.resources).not.toHaveProperty('survivingMatter');
    expect(nextSave.gameState.resources).toHaveProperty('antimatterResidue');
  });
});
