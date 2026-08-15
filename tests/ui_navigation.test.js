import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Decimal from 'break_infinity.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';
import { ensureStateShape } from '../src/state/schema.js';
import {
  getPresetFreshEraI,
  getPresetLateEraI,
  getPresetFreshEraII,
  getPresetFreshEraIII,
  getPresetMidEraIII,
  getPresetEraIIISupernovaReady
} from '../src/dev/playtestPresets.js';
import {
  getPrimaryNavigation,
  hasArtifactAccess,
  isLegacyAvailable,
  normalizeViewId
} from '../src/ui/navigation.js';
import { CodexEngine } from '../src/ui/codex.js';
import { Viewport } from '../src/ui/viewport.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(testDir, '../index.html'), 'utf8');
const styleCss = fs.readFileSync(path.resolve(testDir, '../style.css'), 'utf8');
const mainJs = fs.readFileSync(path.resolve(testDir, '../src/main.js'), 'utf8');
const bodyMarkup = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

function installAppMarkup() {
  document.body.innerHTML = bodyMarkup;
  document.body.className = '';
  document.body.dataset.epoch = '1';
  document.body.dataset.tab = 'core';
  document.body.dataset.act = '1';
  Viewport.clearElCache();
}

function destinationIds(state) {
  return getPrimaryNavigation(state).map(destination => destination.id);
}

describe('Navigation and meta architecture', () => {
  beforeEach(() => {
    installAppMarkup();
    replaceRuntimeState(getPresetFreshEraI());
  });

  afterEach(() => {
    CodexEngine.dispose();
  });

  it('keeps Fresh Era I focused on Cosmos and reveals Forge and More with complexity', () => {
    expect(destinationIds(getPresetFreshEraI())).toEqual(['core']);
    Viewport.update();
    expect(document.querySelector('.tab-menu').style.display).toBe('none');

    const lateEraI = getPresetLateEraI();
    expect(destinationIds(lateEraI)).toEqual(['core', 'upgrades', 'settings']);
    replaceRuntimeState(lateEraI);
    Viewport.update();
    expect(document.getElementById('nav-upgrades').style.display).not.toBe('none');
    expect(document.getElementById('nav-settings').style.display).not.toBe('none');
  });

  it('keeps Legacy hidden until a meta mechanic is meaningfully introduced', () => {
    expect(isLegacyAvailable(getPresetFreshEraII())).toBe(false);
    expect(isLegacyAvailable(getPresetFreshEraIII())).toBe(false);
    expect(isLegacyAvailable(getPresetMidEraIII())).toBe(true);
    expect(destinationIds(getPresetMidEraIII())).toContain('prestige');
  });

  it('keeps More usable and separates Archive from Settings', () => {
    replaceRuntimeState(getPresetLateEraI());
    Viewport.update();
    Viewport.switchTab('settings');

    expect(gameState.activeTab).toBe('settings');
    expect(document.body.dataset.tab).toBe('settings');
    expect(document.getElementById('archive-section').closest('.tab-content').id).toBe('tab-content-settings');
    expect(document.getElementById('settings-section').closest('.tab-content').id).toBe('tab-content-settings');
    expect(document.getElementById('archive-section').contains(document.getElementById('codex-entry-list'))).toBe(true);
    expect(document.getElementById('settings-section').contains(document.getElementById('btn-export'))).toBe(true);
    expect(mainJs).toMatch(/document\.getElementById\('import-string'\)/);
  });

  it('keeps progression responsibilities out of the former System catch-all', () => {
    const legacy = document.getElementById('tab-content-prestige');
    const more = document.getElementById('tab-content-settings');

    for (const id of ['stat-supernovas', 'achievements-list', 'system-rank-info', 'celestial-cards-list']) {
      expect(document.getElementById(id).closest('.tab-content')).toBe(legacy);
      expect(more.contains(document.getElementById(id))).toBe(false);
    }
    expect(document.getElementById('btn-supernova').closest('.tab-content')).toBe(legacy);
    expect(document.getElementById('tab-content-upgrades').contains(document.getElementById('btn-supernova'))).toBe(false);
    expect(document.getElementById('tab-content-artifacts')).toBeNull();
    expect(document.getElementById('nav-artifacts')).toBeNull();
  });

  it('hides Loadout without artifacts and migrates an existing artifact save into Legacy', () => {
    replaceRuntimeState(getPresetMidEraIII());
    Viewport.update();
    expect(hasArtifactAccess(gameState)).toBe(false);
    expect(document.getElementById('legacy-loadout-section').hidden).toBe(true);

    const artifactSave = getPresetFreshEraII();
    artifactSave.activeTab = 'artifacts';
    artifactSave.artifacts.unlocked = ['quantum_lens'];
    replaceRuntimeState(artifactSave);
    Viewport.update();

    expect(gameState.activeTab).toBe('prestige');
    expect(document.body.dataset.tab).toBe('prestige');
    expect(document.getElementById('legacy-loadout-section').hidden).toBe(false);
    expect(document.getElementById('artifact-inventory-list').textContent).toContain('Quantum Lens');
    expect(document.getElementById('nav-prestige').disabled).toBe(false);
    expect(destinationIds(gameState)).toContain('prestige');
  });

  it('migrates persisted view aliases without changing gameplay data', () => {
    const state = getPresetEraIIISupernovaReady();
    state.activeTab = 'system';
    const ironBefore = state.resources.iron.amount;

    ensureStateShape(state);

    expect(state.activeTab).toBe('settings');
    expect(state.resources.iron.amount).toBe(ironBefore);
    expect(normalizeViewId(state, 'legacy')).toBe('prestige');
  });

  it('preserves an available active view and open details through normal updates', () => {
    const state = getPresetMidEraIII();
    state.activeTab = 'upgrades';
    replaceRuntimeState(state);
    Viewport.update();
    const details = document.querySelector('#tab-content-upgrades details');
    details.open = true;

    Viewport.update();
    Viewport.switchTab('prestige');
    Viewport.switchTab('upgrades');

    expect(gameState.activeTab).toBe('upgrades');
    expect(details.open).toBe(true);
  });

  it('normalizes an unavailable active view when a preset reduces complexity', () => {
    const advanced = getPresetEraIIISupernovaReady();
    advanced.activeTab = 'prestige';
    replaceRuntimeState(advanced);
    Viewport.update();
    expect(gameState.activeTab).toBe('prestige');

    const fresh = getPresetFreshEraI();
    fresh.activeTab = 'prestige';
    replaceRuntimeState(fresh);
    Viewport.update();
    expect(gameState.activeTab).toBe('core');
    expect(document.body.dataset.tab).toBe('core');
  });

  it('never exposes more than four persistent destinations or horizontal nav scrolling', () => {
    const states = [
      getPresetFreshEraI(),
      getPresetLateEraI(),
      getPresetFreshEraII(),
      getPresetFreshEraIII(),
      getPresetMidEraIII(),
      getPresetEraIIISupernovaReady()
    ];
    const withAllMeta = getPresetEraIIISupernovaReady();
    withAllMeta.currencies.stardust.amount = new Decimal(10);
    states.push(withAllMeta);

    for (const state of states) expect(getPrimaryNavigation(state).length).toBeLessThanOrEqual(4);
    expect(document.querySelectorAll('.tab-menu > .tab-btn')).toHaveLength(4);
    expect(styleCss).toMatch(/\.tab-menu\s*\{[^}]*overflow-x:\s*hidden/s);
    expect(styleCss).toMatch(/\.tab-btn\s*\{[^}]*min-height:\s*44px/s);
  });

  it('keeps developer controls hidden unless the existing dev-mode gate removes their classes', () => {
    expect(document.getElementById('dev-toggle-container').classList).toContain('dev-toggle-hidden');
    expect(document.getElementById('ai-dev-controls').classList).toContain('dev-matrix-hidden');
    expect(styleCss).toMatch(/\.dev-toggle-hidden\s*\{\s*display:\s*none\s*!important/);
    expect(styleCss).toMatch(/\.dev-matrix-hidden\s*\{\s*display:\s*none\s*!important/);
  });

  it('uses canonical meta-currency terminology in B4-touched UI', () => {
    expect(indexHtml).toContain('Total Stardust Earned');
    expect(indexHtml).toContain('Spend Pulsar Shards');
    expect(indexHtml).not.toContain('Synaptic Dust');
    expect(indexHtml).not.toContain('Neural Synapse');
    expect(indexHtml).not.toContain('Core Density');
  });
});
