import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Decimal from 'break_infinity.js';
import {
  getPresetEraIIISupernovaReady,
  getPresetEraIIRecombinationReady,
  getPresetEraIIUpgradeChain,
  getPresetFreshEraI,
  getPresetFreshEraII,
  getPresetFreshEraIII,
  getPresetLateEraI,
  getPresetMidEraIII
} from '../src/dev/playtestPresets.js';
import { getCosmosPresentation, getNextStellarThreshold } from '../src/engine/cosmosPresentation.js';
import { renderCosmosExperience } from '../src/ui/cosmosExperience.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility } from '../src/eras/stellar/selectors.js';
import { stellarCommandHandlers } from '../src/eras/stellar/commands.js';
import { replaceRuntimeState } from '../src/core/state.js';
import { Viewport } from '../src/ui/viewport.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(testDir, '../index.html'), 'utf8');
const bodyMarkup = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

function snapshot(value) {
  if (value instanceof Decimal) return { decimal: value.toString() };
  if (value instanceof Set) return { set: [...value].sort() };
  if (Array.isArray(value)) return value.map(snapshot);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, snapshot(child)]));
  return value;
}

function installMarkup() {
  document.body.innerHTML = bodyMarkup;
  document.body.className = '';
  Viewport.clearElCache();
}

describe('Era-specific Cosmos experience', () => {
  beforeEach(installMarkup);

  it('keeps Fresh Era I focused on observation and hides future progression', () => {
    const model = getCosmosPresentation(getPresetFreshEraI());
    expect(model.mode).toBe('observation');
    expect(model.primary).toBeNull();
    expect(model.process).toBeNull();
    expect(model.transition.visible).toBe(false);
    expect(model.core.instruction).toContain('collapse a fluctuation');
  });

  it('presents Inflation as one authoritative all-requirements checklist', () => {
    const model = getCosmosPresentation(getPresetLateEraI());
    expect(model.mode).toBe('inflation');
    expect(model.primary.mode).toBe('all');
    expect(model.primary.checks.map(check => check.id)).toEqual(['quantumFluctuations', 'energyDensity', 'coherence']);
    expect(model.transition).toMatchObject({ type: 'inflation', visible: true, ready: false });
  });

  it('introduces only the current foundational Era II process', () => {
    const model = getCosmosPresentation(getPresetFreshEraII());
    expect(model.mode).toBe('quark-condensation');
    expect(model.process.nodes.map(node => node.label)).toEqual(['Quark condensation']);
    expect(model.process.nodes.map(node => node.label)).not.toContain('Recombination');
  });

  it('shows exact Proton inputs, output, and a visible limiting input', () => {
    const state = getPresetEraIIUpgradeChain();
    state.upgrades.plasma.quarkCondenser.level = 0;
    state.resources.quarks.amount = new Decimal(0);
    state.resources.gluons.amount = new Decimal(1000);
    const model = getCosmosPresentation(state);
    expect(model.mode).toBe('proton-synthesis');
    expect(model.process.summary).toContain('Three Quarks and one Gluon');
    expect(model.process.bottleneck).toContain('Quarks');
    expect(model.process.nodes.map(node => node.label)).toEqual(['Quarks', 'Gluons', 'Proton Synthesizer', 'Protons']);
  });

  it('models Recombination readiness as either route and exposes the satisfied route', () => {
    const state = getPresetEraIIRecombinationReady();
    state.resources.protons.amount = new Decimal(0);
    const model = getCosmosPresentation(state);
    expect(model.primary.mode).toBe('any');
    expect(model.primary.ready).toBe(true);
    expect(model.transition.satisfiedVia).toBe('Plasma cooling');
    expect(model.process.title).toBe('Atomic recombination');
  });

  it('uses registry-backed stellar thresholds and Temperature as the single primary progression signal', () => {
    const fresh = getPresetFreshEraIII();
    const mid = getPresetMidEraIII();
    expect(getNextStellarThreshold(fresh).label).toBe('Main Sequence');
    expect(getNextStellarThreshold(mid).label).toBe('Carbon synthesis');
    expect(getCosmosPresentation(fresh).primary.title).toBe('Core Temperature');
    expect(getCosmosPresentation(fresh).process.action.id).toBe('gravity');
  });

  it('reveals Carbon and Iron progressively without inventing resources', () => {
    const state = getPresetMidEraIII();
    expect(getCosmosPresentation(state).elementFocus).toEqual({ carbonVisible: false, ironVisible: false });
    state.era3.temperature = new Decimal(500000000);
    expect(getCosmosPresentation(state).elementFocus).toEqual({ carbonVisible: true, ironVisible: false });
    state.era3.temperature = new Decimal(2000000000);
    expect(getCosmosPresentation(state).elementFocus).toEqual({ carbonVisible: true, ironVisible: true });
  });

  it('keeps repeatable Supernova distinct from permanent Galactic Ignition', () => {
    const state = getPresetEraIIISupernovaReady();
    const model = getCosmosPresentation(state);
    expect(getSupernovaEligibility(state).canTrigger).toBe(true);
    expect(getGalacticIgnitionEligibility(state).isEligible).toBe(true);
    expect(model.resetSemantics.supernova).toMatchObject({ repeatable: true, location: 'Legacy', advancesEra: false });
    expect(model.resetSemantics.galacticIgnition).toMatchObject({ repeatable: false, location: 'Cosmos', advancesEra: true });

    const result = stellarCommandHandlers.TRIGGER_GALACTIC_IGNITION(state);
    expect(result.ok).toBe(true);
    expect(state.activeEpoch).toBe(4);
    expect(result.events).toEqual([{ type: 'ERA_TRANSITION', targetEra: 4 }]);
  });

  it('does not mutate gameplay state while selecting presentation', () => {
    const state = getPresetEraIIUpgradeChain();
    const before = snapshot(state);
    getCosmosPresentation(state);
    expect(snapshot(state)).toEqual(before);
  });

  it('replaces all Era-specific DOM atomically across preset switches', () => {
    const eraThree = getCosmosPresentation(getPresetEraIIISupernovaReady());
    renderCosmosExperience(document, eraThree);
    expect(document.getElementById('cosmos-primary-status').textContent).toContain('Core Temperature');
    expect(document.getElementById('cosmos-process-status').textContent).toContain('Supernova');

    const eraOne = getCosmosPresentation(getPresetFreshEraI());
    renderCosmosExperience(document, eraOne);
    expect(document.getElementById('cosmos-primary-status').hidden).toBe(true);
    expect(document.getElementById('cosmos-primary-status').textContent).toBe('');
    expect(document.getElementById('cosmos-process-status').hidden).toBe(true);
    expect(document.getElementById('cosmos-process-status').textContent).toBe('');
    expect(document.getElementById('core-context').textContent).not.toContain('stellar');
  });

  it('keeps document order Objective → primary → Core → process → support → Chrono → transition', () => {
    const tab = document.getElementById('tab-content-core');
    const selectors = ['#objective-tracker', '#cosmos-primary-status', '.core-canvas', '#core-context', '#cosmos-process-status', '#resource-hud', '.neural-log-wrapper', '.era-transition-shell'];
    const positions = selectors.map(selector => [...tab.children].indexOf(tab.querySelector(selector)));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('prevents stale transition status during authoritative preset replacement', () => {
    replaceRuntimeState(getPresetEraIIISupernovaReady());
    Viewport.update();
    expect(document.getElementById('era3-card-gateway').hidden).toBe(false);
    expect(document.getElementById('gateway-temp-status').textContent).toContain('✓');

    replaceRuntimeState(getPresetFreshEraI());
    Viewport.update();
    expect(document.getElementById('era3-card-gateway').hidden).toBe(true);
    expect(document.getElementById('tab-content-core').dataset.cosmosEra).toBe('1');
  });
});
