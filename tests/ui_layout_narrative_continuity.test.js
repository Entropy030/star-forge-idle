import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { getInitialGameState } from '../src/core/state.js';
import { getPresetLateEraI } from '../src/dev/playtestPresets.js';
import { isInflationPreparationRelevant, isVacuumCoherenceRelevant } from '../src/eras/quantum/coherence.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { renderCosmosExperience } from '../src/ui/cosmosExperience.js';
import { CodexEngine } from '../src/ui/codex.js';

function installCosmos() {
  document.body.innerHTML = `
    <div id="tab-content-core"></div>
    <section id="cosmos-primary-status"></section>
    <section id="core-context"></section>
    <section id="cosmos-process-status"></section>
    <button id="star-core"></button>
  `;
}

describe('UI layout stability and narrative continuity', () => {
  beforeEach(installCosmos);

  it('keeps Cosmos labels and live values as distinct, stable DOM nodes', () => {
    const state = getPresetLateEraI();
    renderCosmosExperience(document, getCosmosPresentation(state));
    const label = document.querySelector('.cosmos-check-label');
    const value = document.querySelector('.cosmos-check-value');
    const current = value.querySelector('.metric-comparison-current');
    const separator = value.querySelector('.metric-comparison-separator');
    const target = value.querySelector('.metric-comparison-target');
    const originalValue = value.textContent;

    state.resources.quantumFluctuations.amount = state.resources.quantumFluctuations.amount.plus(1000);
    renderCosmosExperience(document, getCosmosPresentation(state));

    expect(document.querySelector('.cosmos-check-label')).toBe(label);
    expect(document.querySelector('.cosmos-check-value')).toBe(value);
    expect(value.querySelector('.metric-comparison-current')).toBe(current);
    expect(value.querySelector('.metric-comparison-separator')).toBe(separator);
    expect(value.querySelector('.metric-comparison-target')).toBe(target);
    expect(value.textContent).not.toBe(originalValue);
  });

  it('introduces Vacuum Coherence before the Inflation Horizon', () => {
    const state = getInitialGameState();
    state.stats.maxQF = new Decimal(2500);
    state.upgrades.quantum.electromagneticForce.level = 5;

    expect(isVacuumCoherenceRelevant(state)).toBe(true);
    expect(isInflationPreparationRelevant(state)).toBe(false);
    expect(getCosmosPresentation(state).primary).toBeNull();

    state.stats.maxQF = new Decimal(10000);
    state.upgrades.quantum.vacuumResonance.level = 5;
    expect(isInflationPreparationRelevant(state)).toBe(true);
  });

  it('keeps the Archive layout container while Codex detail content changes', () => {
    document.body.innerHTML = `
      <div class="archive-layout"><div id="codex-entry-list" class="archive-list"></div><div id="codex-detail-view" class="archive-detail"><h3 id="codex-detail-title"></h3><p id="codex-detail-body"></p></div></div>
    `;
    const state = getInitialGameState();
    state.codex.unlockedEntryIds = ['void', 'vacuum-coherence'];
    const layout = document.querySelector('.archive-layout');

    CodexEngine.render(state);
    const entries = document.querySelectorAll('#codex-entry-list button');
    entries[0].click();
    entries[1].click();

    expect(document.querySelector('.archive-layout')).toBe(layout);
    expect(document.querySelector('.archive-detail')).not.toBeNull();
    expect(document.getElementById('codex-detail-body').textContent).toContain('Vacuum Coherence');
  });
});
