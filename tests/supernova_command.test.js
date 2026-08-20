import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { stellarCommandHandlers } from '../src/eras/stellar/commands.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';

describe('TRIGGER_SUPERNOVA command', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 3;
    state.era3.stage = 'Main Sequence Star';
    state.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    state.era3.ironYield = new Decimal(5);
    state.resources.iron.amount = new Decimal(1000);
  });

  it('fails if active epoch is not 3', () => {
    state.activeEpoch = 2;
    const res = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe('WRONG_EPOCH');
  });

  it('fails if temperature is insufficient', () => {
    state.era3.temperature = new Decimal(100);
    const res = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe('INSUFFICIENT_TEMPERATURE');
  });

  it('fails if iron is insufficient', () => {
    state.resources.iron.amount = new Decimal(50);
    const res = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe('INSUFFICIENT_IRON');
  });

  it('mutates nothing on failure', () => {
    state.era3.temperature = new Decimal(100);
    const originalTemp = state.era3.temperature.toString();
    const res = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    expect(state.era3.temperature.toString()).toBe(originalTemp);
    expect(res.changed).toBe(false);
  });

  it('grants rewards exactly once and applies legacy modifiers', () => {
    state.upgrades.stellar.efficient = { level: 5 };
    state.currencies.stardust.amount = new Decimal(10); // initial
    
    const res = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    
    expect(res.ok).toBe(true);
    expect(res.events.find(e => e.type === 'STELLAR_RUN_STARTED')).toBeDefined();
    
    // Outcome should be efficient, which grants 1.5x base stardust. Base is 10 + (5*2) = 20. 20 * 1.5 = 30. Plus initial 10 = 40.
    expect(state.currencies.stardust.amount.toNumber()).toBe(40);
    
    // Ensure active epoch remains 3
    expect(state.activeEpoch).toBe(3);
    
    // Ensure persistent fields survived
    expect(state.stats.supernovas.toNumber()).toBe(1);
    expect(state.meta.stellarRunsCompleted).toBe(1);
    expect(state.meta.lastSupernovaOutcome).toBe('white-dwarf');
    expect(state.meta.stellarLegacyModifiers).toBeDefined();
    expect(state.meta.stellarLegacyModifiers.secondRunStabilityMult).toBe(1.2);
    expect(state.meta.stellarLegacyModifiers).not.toHaveProperty('coherenceBonus');
    
    // Ensure Decimal types remained Decimals
    expect(state.currencies.stardust.amount instanceof Decimal).toBe(true);
    
    // Ensure transient fields reset
    expect(state.era3.temperature.toNumber()).toBe(0); // the initial value from createInitialState
  });

  it('does not duplicate rewards when triggered twice (second trigger should fail)', () => {
    // First trigger succeeds
    const res1 = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    expect(res1.ok).toBe(true);
    
    // State is reset, temperature is 1000 K, iron is 0
    const stardustAfterFirst = state.currencies.stardust.amount.toNumber();
    
    // Second trigger should fail
    const res2 = stellarCommandHandlers.TRIGGER_SUPERNOVA(state, {});
    expect(res2.ok).toBe(false);
    expect(res2.error.code).toBe('INCOMPLETE_STELLAR_STATE');
    
    // Rewards shouldn't change
    expect(state.currencies.stardust.amount.toNumber()).toBe(stardustAfterFirst);
  });
});
