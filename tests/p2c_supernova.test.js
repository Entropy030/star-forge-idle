import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { getSupernovaOutcome } from '../src/eras/stellar/selectors.js';

describe('P2C Supernova Outcome Model', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 3;
    state.era3.ironYield = new Decimal(5);
  });

  it('classifies balanced archetype correctly', () => {
    const result = getSupernovaOutcome(state);
    expect(result.archetype).toBe('balanced');
    expect(result.outcome).toBe('neutron-star');
    expect(result.rewards.stardust.toNumber()).toBe(20); // 10 + 5 * 2
    expect(result.rewards.pulsarShards.toNumber()).toBe(1);
    expect(result.rewards.singularityMass.toNumber()).toBe(0);
  });

  it('classifies efficient archetype correctly', () => {
    state.upgrades.stellar = { efficient: { level: 5 }, massive: { level: 2 }, compact: { level: 3 } };
    const result = getSupernovaOutcome(state);
    expect(result.archetype).toBe('efficient');
    expect(result.outcome).toBe('white-dwarf');
    expect(result.rewards.stardust.toNumber()).toBe(30); // 20 * 1.5
    expect(result.rewards.pulsarShards.toNumber()).toBe(0);
    expect(result.modifiers.coherenceBonus).toBe(15);
  });

  it('classifies massive archetype correctly', () => {
    state.upgrades.stellar = { efficient: { level: 1 }, massive: { level: 6 }, compact: { level: 1 } };
    const result = getSupernovaOutcome(state);
    expect(result.archetype).toBe('massive');
    expect(result.outcome).toBe('black-hole');
    expect(result.rewards.stardust.toNumber()).toBe(60); // 20 * 3
    expect(result.rewards.singularityMass.toNumber()).toBe(4); // 1 + 6 * 0.5
  });

  it('classifies compact archetype correctly', () => {
    state.upgrades.stellar = { efficient: { level: 2 }, massive: { level: 2 }, compact: { level: 5 } };
    const result = getSupernovaOutcome(state);
    expect(result.archetype).toBe('compact');
    expect(result.outcome).toBe('neutron-star');
    expect(result.displayName).toBe('Pulsar');
    expect(result.rewards.stardust.toNumber()).toBe(24); // 20 * 1.2
    expect(result.rewards.pulsarShards.toNumber()).toBe(15); // 5 + 5 * 2
  });

  it('falls back to balanced when archetypes tie', () => {
    state.upgrades.stellar = { efficient: { level: 4 }, massive: { level: 4 }, compact: { level: 4 } };
    const result = getSupernovaOutcome(state);
    expect(result.archetype).toBe('balanced');
  });
});
