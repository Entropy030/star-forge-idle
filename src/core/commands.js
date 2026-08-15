/* global Decimal */
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getCosmicTuningEligibility } from './tuning.js';

export const coreCommandHandlers = {
  BUY_COSMIC_TUNING: (state, command) => {
    const key = command.payload?.key;
    const eligibility = getCosmicTuningEligibility(state, key);
    if (!eligibility) {
      return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_TUNING' } };
    }
    if (!eligibility.canAfford) {
      return {
        ok: false,
        changed: false,
        events: [],
        cost: eligibility.cost,
        currency: 'bits',
        error: { code: eligibility.isMaxed ? 'MAX_LEVEL_REACHED' : 'INSUFFICIENT_FUNDS' }
      };
    }

    state.currencies.bits.amount = state.currencies.bits.amount.minus(eligibility.cost);
    state.cosmicConstants[key] = eligibility.level + 1;
    return {
      ok: true,
      changed: true,
      events: [{ type: 'COSMIC_TUNING_BOUGHT', key, level: eligibility.level + 1 }]
    };
  },

  BUY_CELESTIAL_CARD: (state, command) => {
    const key = command.payload?.key;
    const definition = COSMIC_REGISTRY.celestialCards[key];
    const card = state.cards[key];
    if (!definition || !card) {
      return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_CARD' } };
    }

    const currency = state.resources[definition.currency] || state.currencies[definition.currency];
    const balance = currency?.amount || new Decimal(0);
    if (balance.lt(card.cost)) {
      return {
        ok: false,
        changed: false,
        events: [],
        cost: card.cost,
        currency: definition.currency,
        error: { code: 'INSUFFICIENT_FUNDS' }
      };
    }

    currency.amount = balance.minus(card.cost);
    card.level += 1;
    card.cost = card.cost.times(definition.costScaling).round();

    return {
      ok: true,
      changed: true,
      events: [{ type: 'CARD_BOUGHT', key }]
    };
  }
};
