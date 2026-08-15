/* global Decimal */
import { COSMIC_REGISTRY } from '../config/registry.js';

export function getCosmicTuningEligibility(state, key) {
  const definition = COSMIC_REGISTRY.upgrades.tuning[key];
  if (!definition) return null;

  const level = state.cosmicConstants[key] || 0;
  const maxLevel = definition.max || definition.maxLevel || 5;
  const scalingFactor = definition.costScaling || definition.costMult || 2;
  const cost = typeof definition.baseCost === 'function'
    ? definition.baseCost(level)
    : new Decimal(definition.baseCost).times(Decimal.pow(scalingFactor, level));

  return {
    definition,
    level,
    maxLevel,
    cost,
    isMaxed: level >= maxLevel,
    canAfford: level < maxLevel && state.currencies.bits.amount.gte(cost)
  };
}
