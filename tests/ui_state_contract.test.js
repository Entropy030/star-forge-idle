import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import { createInitialState } from '../src/state/createInitialState.js';
import {
  gameState,
  getRuntimeState,
  replaceRuntimeState
} from '../src/core/state.js';
import { engine } from '../src/engine/instance.js';
import {
  getPresetFreshEraI,
  getPresetLateEraI,
  getPresetFreshEraII,
  getPresetEraIIUpgradeChain,
  getPresetEraIIRecombinationReady,
  getPresetFreshEraIII,
  getPresetMidEraIII,
  getPresetEraIIISupernovaReady
} from '../src/dev/playtestPresets.js';
import { getCurrentPhase } from '../src/engine/selectors.js';
import { getCurrentObjective, updateObjectiveProgress } from '../src/ui/objectives.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getRecombinationEligibility } from '../src/eras/plasma/eligibility.js';
import { getStellarRates, getSupernovaEligibility } from '../src/eras/stellar/selectors.js';
import { simulateStellarEra } from '../src/eras/stellar/simulation.js';
import { updateSupernovaOutcome } from '../src/ui/stellar.js';
import { Viewport } from '../src/ui/viewport.js';

const presetCases = [
  ['Fresh Era I', getPresetFreshEraI],
  ['Late Era I', getPresetLateEraI],
  ['Fresh Era II', getPresetFreshEraII],
  ['Mid Era II', getPresetEraIIUpgradeChain],
  ['Recombination Ready', getPresetEraIIRecombinationReady],
  ['Fresh Era III', getPresetFreshEraIII],
  ['Mid Era III', getPresetMidEraIII],
  ['Supernova Ready', getPresetEraIIISupernovaReady]
];

function installTestDom() {
  document.body.innerHTML = `
    <span id="active-epoch-name"></span>
    <span id="stage"></span>
    <section id="objective-tracker">
      <strong id="objective-title"></strong>
      <span id="objective-instruction"></span>
      <small id="objective-explanation"></small>
      <div id="objective-progress-bar"></div>
      <span id="objective-progress-text"></span>
    </section>
    <div id="era1-locked-card"></div>
    <button id="btn-inflation"></button>
    <div id="era2-locked-card"></div>
    <button id="btn-recombination"></button>
    <div id="supernova-outcome-type"></div>
    <div id="supernova-outcome-archetype"></div>
    <div id="supernova-outcome-yields"></div>
    <div id="supernova-outcome-reasons"></div>
    <div id="supernova-outcome-status"></div>
    <button id="btn-supernova"></button>
  `;
  Viewport.clearElCache();
}

function expectNormalizedState(state) {
  expect(state.era3.gravity).toBeInstanceOf(Decimal);
  expect(state.era3.gravityCost).toBeInstanceOf(Decimal);
  expect(state.era3.compressCost).toBeInstanceOf(Decimal);
  expect(state.era3.carbonYield).toBeInstanceOf(Decimal);
  expect(state.era3.ironYield).toBeInstanceOf(Decimal);

  for (const [category, definitions] of Object.entries(COSMIC_REGISTRY.upgrades)) {
    for (const key of Object.keys(definitions)) {
      expect(state.upgrades[category][key], `${category}.${key}`).toBeDefined();
      expect(state.upgrades[category][key].cost, `${category}.${key}.cost`).toBeInstanceOf(Decimal);
    }
  }
}

describe('UI state truth contract', () => {
  beforeEach(() => {
    installTestDom();
    replaceRuntimeState(createInitialState());
  });

  it.each(presetCases)('%s installs a complete normalized state for every consumer', (_label, createPreset) => {
    replaceRuntimeState(createPreset());

    expect(getRuntimeState()).toBe(gameState);
    expect(engine.getStateUnsafe()).toBe(gameState);
    expectNormalizedState(gameState);

    updateObjectiveProgress(gameState);
    const objective = getCurrentObjective(gameState);
    expect(objective).not.toBeNull();
    expect(objective.epoch).toBe(gameState.activeEpoch);

    if (gameState.activeEpoch === 3) {
      expect(() => getStellarRates(gameState)).not.toThrow();
      expect(() => simulateStellarEra(gameState, 0.1)).not.toThrow();
    }
  });

  it('switching presets replaces stale state and keeps the engine on the canonical proxy', () => {
    replaceRuntimeState(getPresetFreshEraI());
    const oldRuntimeState = getRuntimeState();

    replaceRuntimeState(getPresetEraIIISupernovaReady());
    expect(oldRuntimeState.activeEpoch).toBe(1);
    expect(gameState.activeEpoch).toBe(3);
    expect(engine.getStateUnsafe()).toBe(gameState);

    replaceRuntimeState(getPresetFreshEraII());
    expect(gameState.activeEpoch).toBe(2);
    expect(engine.getStateUnsafe()).toBe(gameState);
    expect(engine.getStateUnsafe()).not.toBe(oldRuntimeState);
  });

  it('normalizes a legacy partial Era III replacement before simulation or rendering', () => {
    const partial = createInitialState();
    partial.activeEpoch = 3;
    partial.era3 = {
      stage: 'Main Sequence Star',
      temperature: new Decimal(3500000000)
    };
    partial.upgrades.plasma = {
      quarkCondenser: { level: 3 }
    };

    replaceRuntimeState(partial);

    expectNormalizedState(gameState);
    expect(engine.getStateUnsafe()).toBe(gameState);
    expect(() => simulateStellarEra(gameState, 0.1)).not.toThrow();
    expect(() => Viewport.update()).not.toThrow();
  });

  it('renders Header phase and Objective from the same active Era', () => {
    replaceRuntimeState(getPresetFreshEraII());
    Viewport.update();

    expect(document.getElementById('active-epoch-name').textContent)
      .toBe(COSMIC_REGISTRY.universeChronology.epochs[2].name);
    expect(document.getElementById('stage').textContent).toBe(getCurrentPhase(gameState));
    expect(getCurrentObjective(gameState).epoch).toBe(2);

    replaceRuntimeState(getPresetMidEraIII());
    Viewport.update();

    expect(document.getElementById('active-epoch-name').textContent)
      .toBe(COSMIC_REGISTRY.universeChronology.epochs[3].name);
    expect(document.getElementById('stage').textContent).toBe(getCurrentPhase(gameState));
    expect(getCurrentObjective(gameState).epoch).toBe(3);
  });

  it('clears stale Objective text and progress across objective and Era replacement', () => {
    const eraI = getPresetFreshEraI();
    eraI.unfold.introCompleted = true;
    replaceRuntimeState(eraI);
    Viewport.update();
    expect(document.getElementById('objective-explanation').textContent).not.toBe('');

    replaceRuntimeState(getPresetFreshEraII());
    Viewport.update();
    expect(document.getElementById('objective-title').textContent).toBe('Condense Quarks');
    expect(document.getElementById('objective-explanation').textContent).toBe('');

    const eraIV = createInitialState();
    eraIV.activeEpoch = 4;
    eraIV.unfold.introCompleted = true;
    replaceRuntimeState(eraIV);
    Viewport.update();

    expect(document.getElementById('objective-tracker').style.display).toBe('none');
    expect(document.getElementById('objective-title').textContent).toBe('');
    expect(document.getElementById('objective-instruction').textContent).toBe('');
    expect(document.getElementById('objective-explanation').textContent).toBe('');
    expect(document.getElementById('objective-progress-bar').style.width).toBe('0%');
    expect(document.getElementById('objective-progress-text').textContent).toBe('');
  });

  it('uses the same Inflation and Recombination eligibility in UI and commands', () => {
    replaceRuntimeState(getPresetLateEraI());
    Viewport.update();
    expect(getInflationEligibility(gameState).isEligible).toBe(false);
    expect(document.getElementById('btn-inflation').style.display).toBe('none');
    expect(document.getElementById('btn-inflation').disabled).toBe(true);
    expect(engine.dispatch({ type: 'TRIGGER_INFLATION' }).ok).toBe(false);

    const inflationReady = getPresetLateEraI();
    inflationReady.resources.quantumFluctuations.amount = new Decimal(100000);
    inflationReady.resources.energyDensity.amount = new Decimal(50000);
    inflationReady.coherence = new Decimal(100);
    replaceRuntimeState(inflationReady);
    Viewport.update();

    expect(getInflationEligibility(gameState).isEligible).toBe(true);
    expect(document.getElementById('btn-inflation').style.display).toBe('block');
    expect(engine.dispatch({ type: 'TRIGGER_INFLATION' }).ok).toBe(true);
    expect(gameState.activeEpoch).toBe(2);
    Viewport.update();
    expect(document.getElementById('btn-inflation').style.display).toBe('none');
    expect(document.getElementById('btn-inflation').disabled).toBe(true);

    replaceRuntimeState(getPresetFreshEraII());
    Viewport.update();
    expect(getRecombinationEligibility(gameState).isEligible).toBe(false);
    expect(document.getElementById('btn-recombination').style.display).toBe('none');
    expect(engine.dispatch({ type: 'TRIGGER_RECOMBINATION' }).ok).toBe(false);

    replaceRuntimeState(getPresetEraIIRecombinationReady());
    Viewport.update();
    expect(getRecombinationEligibility(gameState).isEligible).toBe(true);
    expect(document.getElementById('btn-recombination').style.display).toBe('block');
    expect(document.getElementById('btn-recombination').disabled).toBe(false);
    expect(engine.dispatch({ type: 'TRIGGER_RECOMBINATION' }).ok).toBe(true);
    expect(gameState.activeEpoch).toBe(3);
    Viewport.update();
    expect(document.getElementById('btn-recombination').style.display).toBe('none');
    expect(document.getElementById('btn-recombination').disabled).toBe(true);
  });

  it('renders Supernova readiness from the same Era III state as the Header and command', () => {
    replaceRuntimeState(getPresetFreshEraI());
    const priorState = gameState;
    replaceRuntimeState(getPresetEraIIISupernovaReady());

    Viewport.update();
    updateSupernovaOutcome();

    expect(priorState.activeEpoch).toBe(1);
    expect(gameState.activeEpoch).toBe(3);
    expect(engine.getStateUnsafe()).toBe(gameState);
    expect(document.getElementById('active-epoch-name').textContent)
      .toBe(COSMIC_REGISTRY.universeChronology.epochs[3].name);
    expect(getSupernovaEligibility(gameState).canTrigger).toBe(true);
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Ready for Supernova');
    expect(document.getElementById('btn-supernova').disabled).toBe(false);
    expect(engine.dispatch({ type: 'TRIGGER_SUPERNOVA' }).ok).toBe(true);
  });
});
