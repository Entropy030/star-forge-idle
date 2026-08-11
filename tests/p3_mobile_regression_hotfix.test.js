import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Decimal from 'break_infinity.js';
import {
  getPresetFreshEraI,
  getPresetFreshEraII,
  getPresetFreshEraIII,
  getPresetLateEraI
} from '../src/dev/playtestPresets.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';
import { getActionFailureMessage, isActionSuccessful } from '../src/ui/actionFeedback.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { renderCosmosExperience } from '../src/ui/cosmosExperience.js';
import { Viewport } from '../src/ui/viewport.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(testDir, '../index.html'), 'utf8');
const bodyMarkup = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

function installMarkup() {
  document.body.innerHTML = bodyMarkup;
  document.body.className = '';
  document.body.dataset.tab = 'upgrades';
  const visibilityContract = document.createElement('style');
  visibilityContract.textContent = `
    .era1-only, .era2-only, .era3-only { display: none; }
    body[data-epoch="1"] .era1-only { display: block; }
    body[data-epoch="2"] .era2-only { display: block; }
    body[data-epoch="3"] .era3-only { display: block; }
  `;
  document.head.append(visibilityContract);
  Viewport.clearElCache();
}

function installState(factory) {
  const state = factory();
  state.unfold.introCompleted = true;
  state.activeTab = 'upgrades';
  replaceRuntimeState(state);
  Viewport.update();
}

describe('P3.3B5.1 mobile regression hotfix', () => {
  beforeEach(installMarkup);

  it('synchronizes the body Era contract on every render and activates only the matching Forge', () => {
    installState(getPresetFreshEraI);
    expect(document.body.dataset.epoch).toBe('1');
    expect(getComputedStyle(document.getElementById('quantum-upgrades-container').parentElement).display).toBe('block');

    document.body.dataset.epoch = '1';
    installState(getPresetFreshEraII);
    expect(document.body.dataset.epoch).toBe('2');
    expect(document.getElementById('plasma-upgrades-container').textContent).toContain('PRIMORDIAL PRODUCTION CHAIN');
    expect(getComputedStyle(document.getElementById('quantum-upgrades-container').parentElement).display).toBe('none');
    expect(getComputedStyle(document.getElementById('plasma-upgrades-container').parentElement).display).toBe('block');

    document.body.dataset.epoch = '1';
    installState(getPresetFreshEraIII);
    expect(document.body.dataset.epoch).toBe('3');
    expect(getComputedStyle(document.getElementById('quantum-upgrades-container').parentElement).display).toBe('none');
    expect(getComputedStyle(document.getElementById('plasma-upgrades-container').parentElement).display).toBe('none');
    expect(getComputedStyle(document.getElementById('stellar-core-metrics')).display).toBe('block');
  });

  it('repairs a stale epoch attribute even without runtime state replacement', () => {
    installState(getPresetFreshEraI);
    gameState.activeEpoch = 2;
    document.body.dataset.epoch = '1';
    Viewport.update();
    expect(document.body.dataset.epoch).toBe('2');
  });

  it('accepts both engine and legacy success result shapes', () => {
    expect(isActionSuccessful({ ok: true })).toBe(true);
    expect(isActionSuccessful({ success: true })).toBe(true);
    expect(isActionSuccessful({ ok: false })).toBe(false);
  });

  it('never formats incomplete command metadata into player-facing garbage', () => {
    expect(getActionFailureMessage({ ok: false, error: { code: 'LOCKED' } })).toBe('Upgrade requirements are not satisfied.');
    expect(getActionFailureMessage({ success: false, cost: 0 })).toBe('Upgrade requirements are not satisfied.');
    expect(getActionFailureMessage({ success: false, cost: new Decimal(25), currency: 'Quarks' })).toBe('Requires 25 Quarks');
    expect(getActionFailureMessage({ success: false, message: 'Custom requirement.' })).toBe('Custom requirement.');
    expect(getActionFailureMessage({ success: false, message: '[object Object]' })).not.toMatch(/undefined|null|NaN|\[object Object\]/);
  });

  it('places feedback inside its Forge card and clears it atomically when Era changes', () => {
    installState(getPresetFreshEraI);
    Viewport.renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7');
    const row = document.getElementById('quantum-row-gravityForce');
    Viewport.setInlineActionFeedback(row.id, 'Upgrade requirements are not satisfied.');
    expect(row.querySelector(`#${row.id}-feedback`)).not.toBeNull();
    expect(row.nextElementSibling?.classList.contains('inline-feedback-text')).not.toBe(true);

    gameState.activeEpoch = 2;
    Viewport.update();
    expect(document.querySelector('.inline-feedback-text')).toBeNull();
  });

  it('clears local feedback after a successful engine-shaped Forge purchase', () => {
    installState(getPresetFreshEraI);
    gameState.stats.maxQF = new Decimal(100);
    gameState.resources.quantumFluctuations.amount = new Decimal(1000000);
    Viewport.renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7');
    const row = document.getElementById('quantum-row-gravityForce');
    Viewport.setInlineActionFeedback(row.id, 'Old failure');
    row.querySelector('.upgrade-btn').click();
    expect(document.getElementById(`${row.id}-feedback`)).toBeNull();
    expect(document.body.textContent).not.toContain('Requires 0 undefined');
  });

  it('renders readiness status, label, and changing numbers as separate semantic columns', () => {
    const state = getPresetLateEraI();
    renderCosmosExperience(document, getCosmosPresentation(state));
    const check = document.querySelector('[data-requirement-id="quantumFluctuations"]');
    expect(check.querySelector('.cosmos-check-icon')).not.toBeNull();
    expect(check.querySelector('.cosmos-check-label').textContent).toBe('Quantum Fluctuations');
    expect(check.querySelector('.cosmos-check-value').textContent).toContain('/ 100,000');
    expect(check.childElementCount).toBe(3);
  });
});
