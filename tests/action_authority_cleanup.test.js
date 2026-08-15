import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';
import { engine } from '../src/engine/instance.js';
import { Economy } from '../src/core/economy.js';
import { buyCelestialCardAction } from '../src/core/actions.js';
import { buildAIState } from '../src/dev/aiState.js';
import { getCosmicTuningEligibility } from '../src/core/tuning.js';

describe('legacy action authority consolidation', () => {
  beforeEach(() => {
    replaceRuntimeState(createInitialState());
    window.initAudio = vi.fn();
    window.Viewport = { renderShop: vi.fn() };
    gameState.activeTab = 'core';
  });

  it.each([
    [1, 1, 99],
    [10, 5, 69],
    ['max', 5, 69]
  ])('routes Stardust Buy %s through one command and one mutation sequence', (mode, expectedLevel, expectedBalance) => {
    gameState.buyMode = mode;
    gameState.currencies.stardust.amount = new Decimal(100);

    const result = Economy.buy('stardust', 'fusionDiscount');

    expect(result.ok).toBe(true);
    expect(result.events).toEqual([expect.objectContaining({
      type: 'UPGRADE_BOUGHT',
      category: 'stardust',
      upgradeId: 'fusionDiscount',
      count: expectedLevel
    })]);
    expect(gameState.upgrades.stardust.fusionDiscount.level).toBe(expectedLevel);
    expect(gameState.currencies.stardust.amount.eq(expectedBalance)).toBe(true);
  });

  it.each([
    ['stellar', 'efficient', 'helium'],
    ['pulsar', 'autoCompress', 'pulsarShards'],
    ['singularity', 'darkGravity', 'singularityMass']
  ])('routes %s purchases through the authoritative stellar/legacy command', (category, key, currencyKey) => {
    const currency = gameState.resources[currencyKey] || gameState.currencies[currencyKey];
    currency.amount = new Decimal(1000);

    const result = Economy.buy(category, key);

    expect(result.ok).toBe(true);
    expect(result.events).toHaveLength(1);
    expect(gameState.upgrades[category][key].level).toBe(1);
    expect(currency.amount.lt(1000)).toBe(true);
  });

  it.each([1, 10, 'max'])('routes Core Buy %s through exactly one BUY_CORE_NODE command', mode => {
    gameState.activeEpoch = 3;
    gameState.buyMode = mode;
    gameState.resources.hydrogen.amount = new Decimal('1e30');
    const expectedCount = mode === 1 ? 1 : mode === 10 ? 10 : 163;

    const result = Economy.buy('core', 'gravity');

    expect(result.ok).toBe(true);
    expect(result.events).toEqual([expect.objectContaining({
      type: 'CORE_NODE_PURCHASED',
      key: 'gravity',
      boughtCount: expectedCount
    })]);
    expect(gameState.era3.gravity.eq(1 + expectedCount)).toBe(true);
  });

  it('switches Fuser currency after the first purchase during a multi-buy', () => {
    gameState.activeEpoch = 3;
    gameState.resources.hydrogen.amount = new Decimal(1000);
    gameState.resources.helium.amount = new Decimal(1000);

    const result = Economy.buyCoreNodes('fuser', 3);

    expect(result.ok).toBe(true);
    expect(result.events[0].boughtCount).toBe(3);
    expect(gameState.resources.hydrogen.amount.eq(900)).toBe(true);
    expect(gameState.resources.helium.amount.eq(982)).toBe(true);
    expect(gameState.era3.fusionYield.eq(3)).toBe(true);
  });

  it('returns authoritative Core failure metadata without mutating state', () => {
    gameState.activeEpoch = 3;

    const result = Economy.buyCoreNodes('gravity', 1);

    expect(result).toMatchObject({ ok: false, changed: false, currency: 'hydrogen' });
    expect(result.cost.eq(10)).toBe(true);
    expect(gameState.era3.gravity.eq(1)).toBe(true);
  });

  it('records first Carbon synthesis once inside the Core command', () => {
    gameState.activeEpoch = 3;
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal('5e8');
    gameState.resources.helium.amount = new Decimal(500);

    const result = Economy.buyCoreNodes('carbon', 1);

    expect(result.ok).toBe(true);
    expect(gameState.era3.carbonYield.eq(1)).toBe(true);
    expect(gameState.resources.helium.amount.eq(0)).toBe(true);
    expect(gameState.history.filter(entry => entry.msg.includes('Carbon'))).toHaveLength(1);
  });

  it('buys a Celestial Card with one command and one resource deduction', () => {
    gameState.resources.hydrogen.amount = new Decimal(500);

    const result = buyCelestialCardAction('quantum_stabilizer');

    expect(result.ok).toBe(true);
    expect(result.events).toEqual([{ type: 'CARD_BOUGHT', key: 'quantum_stabilizer' }]);
    expect(gameState.resources.hydrogen.amount.eq(0)).toBe(true);
    expect(gameState.cards.quantum_stabilizer.level).toBe(1);
    expect(gameState.cards.quantum_stabilizer.cost.eq(750)).toBe(true);
  });

  it('routes Legacy cosmic tuning through one authoritative command', () => {
    gameState.currencies.bits.amount = new Decimal(50);
    expect(getCosmicTuningEligibility(gameState, 'G')).toMatchObject({
      level: 0,
      maxLevel: 5,
      canAfford: true
    });

    const result = engine.dispatch({ type: 'BUY_COSMIC_TUNING', payload: { key: 'G' } });

    expect(result.ok).toBe(true);
    expect(result.events).toEqual([{ type: 'COSMIC_TUNING_BOUGHT', key: 'G', level: 1 }]);
    expect(gameState.currencies.bits.amount.eq(0)).toBe(true);
    expect(gameState.cosmicConstants.G).toBe(1);
    expect(engine.dispatch({ type: 'BUY_COSMIC_TUNING', payload: { key: 'G' } }).ok).toBe(false);
    expect(gameState.cosmicConstants.G).toBe(1);
  });

  it('reports transition readiness from authoritative selectors in the dev snapshot', () => {
    gameState.activeEpoch = 1;
    gameState.resources.quantumFluctuations.amount = new Decimal(100000);
    expect(buildAIState(gameState).specialActions.canInflation).toBe(false);

    gameState.activeEpoch = 3;
    gameState.era3.temperature = new Decimal('1e8');
    expect(buildAIState(gameState).specialActions.canSupernova).toBe(false);

    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.ironYield = new Decimal(1);
    gameState.resources.iron.amount = new Decimal(1000);
    expect(buildAIState(gameState).specialActions.canSupernova).toBe(true);
  });

  it('does not expose a second affordability authority in the dev snapshot', () => {
    const snapshot = buildAIState(gameState);
    expect(snapshot).not.toHaveProperty('availableUpgrades');
    expect(snapshot.upgrades.every(upgrade => !Object.hasOwn(upgrade, 'canAfford'))).toBe(true);
  });

  it('keeps the engine and canonical runtime on the same object after adapter actions', () => {
    gameState.currencies.stardust.amount = new Decimal(10);
    Economy.buy('stardust', 'fusionDiscount');
    expect(engine.getStateUnsafe()).toBe(gameState);
  });
});
