import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import {
  getPresetEraIIISupernovaReady,
  getPresetEraIIUpgradeChain,
  getPresetFreshEraI,
  getPresetFreshEraII,
  getPresetFreshEraIII,
  getPresetLateEraI,
  getPresetMidEraIII
} from '../src/dev/playtestPresets.js';
import { getEraResourcePresentation } from '../src/engine/resourcePresentation.js';
import { formatHudNumber, formatHudRate, formatHudValue } from '../src/ui/resourceFormatters.js';
import { renderResourceHud } from '../src/ui/resourceHud.js';

function ids(items) {
  return items.map((item) => item.id);
}

function allIds(presentation) {
  return ids([...presentation.primary, ...presentation.support, ...presentation.details]);
}

function snapshotState(value) {
  if (value instanceof Decimal) return { decimal: value.toString() };
  if (value instanceof Set) return { set: [...value].sort() };
  if (Array.isArray(value)) return value.map(snapshotState);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, snapshotState(child)]));
  }
  return value;
}

function installHud() {
  document.body.innerHTML = `
    <section id="resource-hud">
      <div id="resource-primary-region"></div>
      <div id="resource-support-region"></div>
      <div id="resource-details-region" hidden>
        <button id="resource-details-toggle" aria-expanded="false"><span>Details</span><span>⌄</span></button>
        <div id="resource-details-list" hidden></div>
      </div>
      <details id="meta-resource-summary" hidden>
        <summary id="meta-resource-label">Legacy resources</summary>
        <div id="meta-resource-list"></div>
      </details>
    </section>`;
  return document.getElementById('resource-hud');
}

describe('P3.3B2 era-specific resource hierarchy', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps Fresh Era I focused on Quantum Fluctuations alone', () => {
    const presentation = getEraResourcePresentation(getPresetFreshEraI());
    expect(ids(presentation.primary)).toEqual(['quantumFluctuations']);
    expect(presentation.support).toEqual([]);
    expect(allIds(presentation)).not.toContain('energyDensity');
    expect(allIds(presentation)).not.toContain('coherence');
  });

  it('reveals Energy Density in mid Era I without exposing Coherence early', () => {
    const state = getPresetFreshEraI();
    state.upgrades.quantum.gravityForce.level = 1;
    state.resources.quantumFluctuations.amount = new Decimal(50);
    const presentation = getEraResourcePresentation(state);

    expect(ids(presentation.primary)).toEqual(['quantumFluctuations']);
    expect(ids(presentation.support)).toEqual(['energyDensity']);
    expect(allIds(presentation)).not.toContain('coherence');
  });

  it('promotes compact readiness and all three requirements for Inflation preparation', () => {
    const presentation = getEraResourcePresentation(getPresetLateEraI());
    expect(ids(presentation.primary)).toEqual(['inflationReadiness']);
    expect(ids(presentation.support)).toEqual(['quantumFluctuations', 'energyDensity', 'coherence']);
    expect(presentation.primary[0].displayValue).toMatch(/^\d \/ 3$/);
  });

  it('hides unintroduced Era II intermediates even when dormant values exist', () => {
    const presentation = getEraResourcePresentation(getPresetFreshEraII());
    expect(ids(presentation.primary)).toEqual(['quarks']);
    expect(presentation.support).toEqual([]);
    expect(allIds(presentation)).not.toContain('gluons');
    expect(allIds(presentation)).not.toContain('leptons');
    expect(allIds(presentation)).not.toContain('electrons');
  });

  it('makes Protons primary during synthesis and moves inactive intermediates to Details', () => {
    const presentation = getEraResourcePresentation(getPresetEraIIUpgradeChain());
    expect(ids(presentation.primary)).toEqual(['protons']);
    expect(ids(presentation.support)).toEqual(['quarks', 'gluons']);
    expect(ids(presentation.details)).toContain('leptons');
    expect(ids(presentation.details)).not.toContain('electrons');
  });

  it('makes Plasma Temperature primary once active cooling begins', () => {
    const state = getPresetEraIIUpgradeChain();
    state.upgrades.plasma.baryoRadiator.level = 1;
    const presentation = getEraResourcePresentation(state);

    expect(ids(presentation.primary)).toEqual(['plasmaTemperature']);
    expect(ids(presentation.support)).toContain('protons');
    expect(ids(presentation.details)).toEqual(expect.arrayContaining(['quarks', 'gluons', 'leptons']));
  });

  it('keeps Era III temperature-first and hides Carbon and Iron before relevance', () => {
    for (const state of [getPresetFreshEraIII(), getPresetMidEraIII()]) {
      const presentation = getEraResourcePresentation(state);
      expect(ids(presentation.primary)).toEqual(['coreTemperature']);
      expect(ids(presentation.support)).toEqual(['hydrogen', 'helium']);
      expect(allIds(presentation)).not.toContain('carbon');
      expect(allIds(presentation)).not.toContain('iron');
    }
  });

  it('progressively introduces Carbon, then promotes Iron and its fuels late', () => {
    const carbonState = getPresetMidEraIII();
    carbonState.era3.temperature = new Decimal(500000000);
    const carbonPresentation = getEraResourcePresentation(carbonState);
    expect(ids(carbonPresentation.support)).toEqual(['hydrogen', 'helium', 'carbon']);
    expect(allIds(carbonPresentation)).not.toContain('iron');

    const latePresentation = getEraResourcePresentation(getPresetEraIIISupernovaReady());
    expect(ids(latePresentation.primary)).toEqual(['coreTemperature']);
    expect(ids(latePresentation.support)).toEqual(['iron', 'carbon', 'helium']);
    expect(ids(latePresentation.details)).toEqual(['hydrogen']);
  });

  it('hides zero-value meta currencies and exposes earned currency only in meta data', () => {
    const state = getPresetFreshEraIII();
    expect(getEraResourcePresentation(state).meta).toEqual([]);

    state.currencies.stardust.amount = new Decimal(12);
    expect(ids(getEraResourcePresentation(state).meta)).toEqual(['stardust']);
  });

  it('does not mutate gameplay state while selecting presentation', () => {
    const state = getPresetEraIIUpgradeChain();
    const before = snapshotState(state);
    getEraResourcePresentation(state);
    expect(snapshotState(state)).toEqual(before);
  });

  it('uses one compact formatting language with signed net rates', () => {
    expect(formatHudNumber(new Decimal(100000))).toBe('100,000');
    expect(formatHudNumber(new Decimal(1250000))).toBe('1.25M');
    expect(formatHudValue(new Decimal(50000000), 'K')).toBe('50.00M K');
    expect(formatHudRate(new Decimal(12))).toBe('+12/s');
    expect(formatHudRate(new Decimal(-3))).toBe('−3/s');
    expect(formatHudRate(new Decimal(-7500), 'K')).toBe('−7,500 K/s');
    expect(formatHudRate(new Decimal(0))).toBe('');
  });

  it('keeps Details keyboard-accessible and expanded across HUD refreshes', () => {
    const container = installHud();
    const presentation = getEraResourcePresentation(getPresetEraIIUpgradeChain());
    renderResourceHud(container, presentation, { protons: new Decimal(1), quarks: new Decimal(-3) });

    const toggle = document.getElementById('resource-details-toggle');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('resource-details-list').hidden).toBe(false);

    renderResourceHud(container, presentation, { protons: new Decimal(1), quarks: new Decimal(-3) });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('[data-resource-id="protons"] .resource-card-rate').textContent).toBe('+1/s');
    expect(document.querySelector('[data-resource-id="quarks"] .resource-card-rate').textContent).toBe('−3/s');
  });
});
