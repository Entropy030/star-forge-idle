import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { replaceRuntimeState } from '../src/core/state.js';
import {
  getPresetFreshEraI,
  getPresetLateEraI,
  getPresetFreshEraII,
  getPresetEraIIUpgradeChain,
  getPresetFreshEraIII,
  getPresetMidEraIII,
  getPresetEraIIISupernovaReady
} from '../src/dev/playtestPresets.js';
import { getTransitionPresentation } from '../src/engine/selectors.js';
import { CodexEngine } from '../src/ui/codex.js';
import { Viewport } from '../src/ui/viewport.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(testDir, '../index.html'), 'utf8');
const styleCss = fs.readFileSync(path.resolve(testDir, '../style.css'), 'utf8');
const bodyMarkup = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

function installAppMarkup() {
  document.body.innerHTML = bodyMarkup;
  document.body.className = '';
  document.body.dataset.epoch = '1';
  document.body.dataset.tab = 'core';
  document.body.dataset.act = '1';
  Viewport.clearElCache();
}

function expectBefore(first, second) {
  expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
}

describe('P3.3B1 global UI hierarchy', () => {
  beforeEach(() => {
    installAppMarkup();
    replaceRuntimeState(getPresetFreshEraI());
  });

  afterEach(() => {
    CodexEngine.dispose();
  });

  it('orders Cosmos as Objective, Core, economy, progress, Chrono, then transition', () => {
    const cosmos = document.getElementById('tab-content-core');
    const objective = document.getElementById('objective-tracker');
    const core = document.querySelector('.core-canvas');
    const economy = document.querySelector('.dashboard-container');
    const progress = document.querySelector('.progress-context');
    const chrono = document.querySelector('.neural-log-wrapper');
    const transition = document.querySelector('.era-transition-shell');

    for (const element of [objective, core, economy, progress, chrono, transition]) {
      expect(cosmos.contains(element)).toBe(true);
    }

    expectBefore(objective, core);
    expectBefore(core, economy);
    expectBefore(economy, progress);
    expectBefore(progress, chrono);
    expectBefore(chrono, transition);
  });

  it('keeps the Core, Objective, economy, Chrono, and transitions out of non-Cosmos tab structure', () => {
    const cosmos = document.getElementById('tab-content-core');
    const cosmosOnly = [
      '.core-canvas',
      '#objective-tracker',
      '.dashboard-container',
      '.neural-log-wrapper',
      '.era-transition-shell'
    ];

    for (const selector of cosmosOnly) {
      expect(document.querySelector(selector).closest('.tab-content')).toBe(cosmos);
    }

    for (const tabId of ['tab-content-upgrades', 'tab-content-settings', 'tab-content-prestige']) {
      const tab = document.getElementById(tabId);
      expect(tab.querySelector('.core-canvas')).toBeNull();
      expect(tab.querySelector('#objective-tracker')).toBeNull();
      expect(tab.querySelector('.neural-log-wrapper')).toBeNull();
    }

    expect(styleCss).toMatch(/body:not\(\[data-tab="core"\]\) \.core-canvas\s*\{[^}]*display:\s*none/);
  });

  it('keeps Objective guidance current across Era I, II, and III', () => {
    replaceRuntimeState(getPresetFreshEraI());
    Viewport.update();
    expect(document.getElementById('objective-title').textContent).toBe('Initialize Core');

    replaceRuntimeState(getPresetFreshEraII());
    Viewport.update();
    expect(document.getElementById('objective-title').textContent).toBe('Condense Quarks');

    replaceRuntimeState(getPresetFreshEraIII());
    Viewport.update();
    expect(document.getElementById('objective-title').textContent).toBe('Strengthen Gravity');
    expect(document.getElementById('objective-explanation')).toBeNull();
  });

  it('reveals transition presentation only after its mechanics are introduced', () => {
    replaceRuntimeState(getPresetFreshEraI());
    Viewport.update();
    expect(getTransitionPresentation(getPresetFreshEraI()).inflation).toBe(false);
    expect(document.getElementById('era1-transition-container').style.display).toBe('none');

    replaceRuntimeState(getPresetLateEraI());
    Viewport.update();
    expect(document.getElementById('era1-transition-container').style.display).not.toBe('none');

    replaceRuntimeState(getPresetFreshEraII());
    Viewport.update();
    expect(document.getElementById('era2-transition-container').style.display).toBe('none');

    replaceRuntimeState(getPresetEraIIUpgradeChain());
    Viewport.update();
    expect(document.getElementById('era2-transition-container').style.display).not.toBe('none');

    replaceRuntimeState(getPresetFreshEraIII());
    Viewport.update();
    expect(document.getElementById('nav-prestige').disabled).toBe(true);

    replaceRuntimeState(getPresetEraIIISupernovaReady());
    Viewport.update();
    expect(document.getElementById('nav-prestige').disabled).toBe(false);
  });

  it('replaces stale Objective and Chrono content when presets change Era', () => {
    replaceRuntimeState(getPresetFreshEraI());
    Viewport.update();
    const eraINarrative = document.getElementById('chrono-neural-log').dataset.activeText;
    expect(eraINarrative).toContain('void answers observation');

    replaceRuntimeState(getPresetMidEraIII());
    Viewport.update();
    const eraIIINarrative = document.getElementById('chrono-neural-log').dataset.activeText;
    expect(document.getElementById('objective-title').textContent).toBe('Forge Carbon');
    expect(eraIIINarrative).toContain('Primitive gas clouds');
    expect(eraIIINarrative).not.toBe(eraINarrative);

    replaceRuntimeState(getPresetFreshEraII());
    Viewport.update();
    expect(document.getElementById('objective-title').textContent).toBe('Condense Quarks');
    expect(document.getElementById('chrono-neural-log').dataset.activeText).toContain('broth is blindingly hot');
  });

  it('uses normal document scrolling and no fixed Core offsets', () => {
    const bodyBlock = styleCss.match(/body\s*\{([^}]*)\}/)[1];
    const mainBlock = styleCss.match(/main\s*\{([^}]*)\}/)[1];

    expect(bodyBlock).toMatch(/overflow-y:\s*auto/);
    expect(bodyBlock).not.toMatch(/overflow:\s*hidden(?!-)/);
    expect(mainBlock).toMatch(/overflow:\s*visible/);
    expect(styleCss).not.toMatch(/\.core-canvas\s*\{[^}]*\btop:\s*\d+px/);
    expect(styleCss).not.toMatch(/#game-shell[^}]*height:\s*100dvh/);
  });
});
