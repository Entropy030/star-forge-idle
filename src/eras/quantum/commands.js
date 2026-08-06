/* global Decimal */
/* eslint-disable import/no-cycle */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCardMultiplier } from '../../core/economy.js'; // Will be extracted to selectors later

export const quantumCommandHandlers = {
  CLICK_CORE: (state, cmd) => {
    // Basic atomicity check
    if (!state.resources) return { ok: false, changed: false, events: [], error: { code: 'INVALID_STATE' } };
    
    // In era 1, clicking does quantum fluctuation gathering
    if (state.activeEpoch === 1) {
      if (!state.era1) state.era1 = { currentAct: 1, quantumFoam: 0, vacuumCoherence: 0.0, unfoldCount: 0 };
      state.era1.unfoldCount = (state.era1.unfoldCount || 0) + 1;
      
      if (state.era1.vacuumCoherence < 1.0) {
        let cMod = 1.0 - (0.08 * (state.cosmicConstants?.c || 0));
        state.era1.vacuumCoherence = Math.min(1.0, (state.era1.vacuumCoherence || 0) + (0.10 * cMod));
      }
      
      let mult = getCardMultiplier("hydrogenGen"); // Use actual selector later
      let gain = new Decimal(1).times(mult);
      
      state.resources.quantumFluctuations.amount = state.resources.quantumFluctuations.amount.plus(gain);
      state.era1.quantumFoam = state.resources.quantumFluctuations.amount.toNumber();
      
      if (!state.discoveries) state.discoveries = new Set();
      if (state.resources.quantumFluctuations.amount.gte(1)) state.discoveries.add('qf_1');
      if (state.resources.quantumFluctuations.amount.gte(10)) state.discoveries.add('qf_10');
      if (state.resources.quantumFluctuations.amount.gte(100)) state.discoveries.add('qf_100');

      if (!state.stats.maxQF) state.stats.maxQF = new Decimal(0);
      if (state.resources.quantumFluctuations.amount.gt(state.stats.maxQF)) {
        state.stats.maxQF = state.resources.quantumFluctuations.amount;
      }

      // Handle active click boost
      if (state.artifacts?.modifiers?.clickPassiveBoost > 0) {
        state.artifacts.modifiers.activeClickBoostSec = 3.0;
      }

      return {
        ok: true,
        changed: true,
        events: [
          { type: 'CORE_CLICKED', epoch: 1, gain: gain.toString(), resource: 'quantumFluctuations' }
        ]
      };
    }
    
    return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };
  },

  TRIGGER_INFLATION: (state, cmd) => {
    if (state.activeEpoch !== 1) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    if (state.resources.quantumFluctuations.amount.lt(COSMIC_REGISTRY.constants.inflationThreshold)) {
      return { ok: false, changed: false, events: [], error: { code: 'INSUFFICIENT_QF' } };
    }
    
    state.activeEpoch = 2;
    state.era1.currentAct = 4;
    return {
      ok: true,
      changed: true,
      events: [{ type: 'ERA_TRANSITION', targetEra: 2 }]
    };
  },

  BUY_UPGRADE: (state, cmd) => {
    // Expected payload: { category: 'quantum', upgradeId: 'vacuumEnergy', loops: 1 }
    const { category, upgradeId, loops = 1 } = cmd.payload;
    if (category !== 'quantum') return { ok: false, changed: false, events: [], error: { code: 'WRONG_CATEGORY' } };
    
    const registry = COSMIC_REGISTRY.upgrades.quantum;
    if (!registry || !registry[upgradeId]) return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_UPGRADE' } };
    
    const def = registry[upgradeId];
    const upgradeState = state.upgrades.quantum[upgradeId];
    
    const discount = state.artifacts?.modifiers?.costDiscount || 0.0;
    let currencyAmount = state.resources.quantumFluctuations.amount;
    
    let bought = 0;
    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && upgradeState.level >= def.max) break;
      
      const effectiveCost = discount > 0 ? upgradeState.cost.times(1.0 - discount).floor() : upgradeState.cost;
      if (currencyAmount.lt(effectiveCost)) break;
      
      currencyAmount = currencyAmount.minus(effectiveCost);
      upgradeState.level += 1;
      upgradeState.cost = upgradeState.cost.times(def.costScaling || 2).round();
      bought++;
    }
    
    if (bought === 0) {
      return { ok: false, changed: false, events: [], error: { code: 'CANNOT_AFFORD' } };
    }
    
    state.resources.quantumFluctuations.amount = currencyAmount;
    
    return {
      ok: true,
      changed: true,
      events: [{ type: 'UPGRADE_PURCHASED', category, upgradeId, newLevel: upgradeState.level, boughtCount: bought }]
    };
  }


};
