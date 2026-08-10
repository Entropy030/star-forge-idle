import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Decimal from 'break_infinity.js';
import { createGameEngine } from '../src/engine/createEngine.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { replaceRuntimeState, gameState } from '../src/core/state.js';
import { createInitialState } from '../src/state/createInitialState.js';
import {
  getPresetFreshEraI,
  getPresetFreshEraII,
  getPresetFreshEraIII
} from '../src/dev/playtestPresets.js';
import {
  getForgeCardState,
  getForgeEffectData,
  getForgeUpgradeEligibility
} from '../src/ui/forgePresentation.js';
import { Viewport } from '../src/ui/viewport.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(testDir, '../index.html'), 'utf8');
const bodyMarkup = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

function installAppMarkup() {
  document.body.innerHTML = bodyMarkup;
  document.body.className = '';
  document.body.dataset.epoch = '1';
  document.body.dataset.tab = 'upgrades';
  Viewport.clearElCache();
}

describe('P3.3B3 Forge decision hierarchy', () => {
  beforeEach(() => {
    installAppMarkup();
    replaceRuntimeState(getPresetFreshEraI());
  });

  it('derives card state and requirements from authoritative quantum eligibility', () => {
    gameState.stats.maxQF = new Decimal(100);
    gameState.upgrades.quantum.gravityForce.level = 3;

    const eligibility = getForgeUpgradeEligibility(gameState, 'quantum', 'weakForce');
    const state = getForgeCardState({ eligibility, level: 0, isMaxed: false, isAffordable: false });

    expect(eligibility.discovered).toBe(true);
    expect(eligibility.unlocked).toBe(false);
    expect(eligibility.requirements.map(item => item.met)).toEqual([true, false]);
    expect(state).toEqual({ id: 'locked', label: 'Locked' });
  });

  it('rejects locked direct Era II purchases even with enough currency', () => {
    const state = createInitialState();
    state.activeEpoch = 2;
    state.resources.gluons.amount = new Decimal(100000);
    const engine = createGameEngine({ initialState: state, commandHandlers: plasmaCommandHandlers });

    const result = engine.dispatch({
      type: 'BUY_UPGRADE_PLASMA',
      payload: { category: 'plasma', upgradeId: 'gluonBinding', loops: 1 }
    });

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('PREREQUISITES_NOT_MET');
    expect(state.upgrades.plasma.gluonBinding.level).toBe(0);
    expect(state.resources.gluons.amount.eq(100000)).toBe(true);
  });

  it('renders every missing condition as persistent structured requirement UI', () => {
    gameState.stats.maxQF = new Decimal(100);
    gameState.upgrades.quantum.gravityForce.level = 3;
    Viewport.renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7');

    const row = document.getElementById('quantum-row-weakForce');
    const requirements = [...row.querySelectorAll('.forge-requirements-list li')];

    expect(row.dataset.forgeState).toBe('locked');
    expect(row.querySelector('.forge-requirements').hidden).toBe(false);
    expect(requirements).toHaveLength(2);
    expect(requirements[0].textContent).toContain('✓ Peak Quantum Fluctuations');
    expect(requirements[1].textContent).toContain('✕ Gravitational Coupling level (3 / 5)');
    expect(row.querySelector('.upgrade-btn').disabled).toBe(true);
  });

  it('bulk-buy controls update the existing authoritative buy mode', () => {
    Viewport.renderForgeBuyControls();
    const ten = document.querySelector('[data-buy-mode="10"]');
    const max = document.querySelector('[data-buy-mode="max"]');

    ten.click();
    expect(gameState.buyMode).toBe(10);
    expect(ten.getAttribute('aria-pressed')).toBe('true');

    max.click();
    expect(gameState.buyMode).toBe('max');
    expect(max.classList.contains('active')).toBe(true);
    expect(document.getElementById('forge-buy-mode-current').textContent).toBe('Max affordable');
  });

  it('renders a maxed card as non-purchasable', () => {
    const state = createInitialState();
    state.activeEpoch = 4;
    state.activeTab = 'upgrades';
    state.upgrades.galaxy.quasarIgnition.level = 1;
    state.resources.darkMatter.amount = new Decimal(1000000);
    replaceRuntimeState(state);

    Viewport.renderGenericTierList('galaxy-upgrades-container', 'galaxy', 'Dark Matter', '#00ecc6');
    const row = document.getElementById('galaxy-row-quasarIgnition');

    expect(row.dataset.forgeState).toBe('maxed');
    expect(row.querySelector('.forge-state-badge').textContent).toBe('Maxed');
    expect(row.querySelector('.upgrade-btn').disabled).toBe(true);
  });

  it('details disclosure changes only DOM disclosure state', () => {
    gameState.stats.maxQF = new Decimal(100);
    Viewport.renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7');
    const details = document.querySelector('#quantum-row-gravityForce details');
    const before = gameState.upgrades.quantum.gravityForce.level;

    details.open = true;

    expect(details.open).toBe(true);
    expect(gameState.upgrades.quantum.gravityForce.level).toBe(before);
  });

  it('exposes accurate representative Era I and Era II mechanical effects', () => {
    const eraI = getPresetFreshEraI();
    const eraII = getPresetFreshEraII();

    expect(getForgeEffectData(eraI, 'quantum', 'electromagneticForce').primary)
      .toBe('+140 QF/s · +30 Energy Density/s');
    expect(getForgeEffectData(eraII, 'plasma', 'plasmaAutomation').primary)
      .toBe('3 Quarks + 1 Gluon → 1 Proton/s per level');
    expect(getForgeEffectData(eraII, 'plasma', 'baryoRadiator').primary)
      .toBe('Consumes 2 Protons/s → −7,500 K/s per level');
  });

  it('renders Era III temperature action data from the live economy selector', () => {
    replaceRuntimeState(getPresetFreshEraIII());
    Viewport.renderStellarNodeButtons();

    expect(document.getElementById('compress-effect').textContent).toMatch(/^\+[\d,.]+(?: [A-Z])? K per compression$/);
    expect(document.getElementById('compress-threshold').textContent).toContain('Main Sequence');
    expect(document.getElementById('era3-card-gateway').previousElementSibling.textContent)
      .toBe('Irreversible era transition');
  });
});
