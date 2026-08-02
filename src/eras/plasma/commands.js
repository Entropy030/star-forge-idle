/* global Decimal */
/* eslint-disable import/no-cycle */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getBaryonAsymmetryMultiplier } from '../../core/economy.js'; // Will be extracted to selectors

export const plasmaCommandHandlers = {
  CLICK_CORE_ERA2: (state, cmd) => {
    if (state.activeEpoch !== 2) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };

    let asymmetry = getBaryonAsymmetryMultiplier(); // Need to adapt to use state
    let quarkGain = new Decimal(3).times(asymmetry);
    let gluonGain = new Decimal(2).times(asymmetry);

    state.resources.quarks.amount = state.resources.quarks.amount.plus(quarkGain);
    state.resources.gluons.amount = state.resources.gluons.amount.plus(gluonGain);

    return {
      ok: true,
      changed: true,
      events: [
        { type: 'CORE_CLICKED', epoch: 2, quarkGain: quarkGain.toString(), gluonGain: gluonGain.toString() }
      ]
    };
  },

  TOGGLE_FUSER: (state, cmd) => {
    if (state.activeEpoch !== 2) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };
    if (!state.era2) return { ok: false, changed: false, events: [], error: { code: 'INVALID_STATE' } };
    
    state.era2.plasmaFusersEnabled = !state.era2.plasmaFusersEnabled;
    
    return {
      ok: true,
      changed: true,
      events: [{ type: 'FUSER_TOGGLED', enabled: state.era2.plasmaFusersEnabled }]
    };
  },

  TRIGGER_RECOMBINATION: (state, cmd) => {
    if (!state.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) && !state.plasmaTemperature.lte(3000)) {
      return { ok: false, changed: false, events: [], error: { code: 'PREREQUISITES_NOT_MET' } };
    }

    state.activeEpoch = 3;

    let electronBonus = state.resources.electrons.amount;
    let startingHydrogen = state.resources.protons.amount.times(1.5).plus(electronBonus).max(250);
    state.resources.hydrogen.amount = state.resources.hydrogen.amount.plus(startingHydrogen);

    if (state.resources.antimatterResidue) {
      let residueGained = state.resources.protons.amount.div(1000).clampMin(1).round();
      state.resources.antimatterResidue.amount = state.resources.antimatterResidue.amount.plus(residueGained);
    }

    return {
      ok: true,
      changed: true,
      events: [{ type: 'ERA_TRANSITION', targetEra: 3 }]
    };
  },

  BUY_UPGRADE_PLASMA: (state, cmd) => {
    const { category, upgradeId, loops = 1 } = cmd.payload;
    if (category !== 'plasma') return { ok: false, changed: false, events: [], error: { code: 'WRONG_CATEGORY' } };
    
    const registry = COSMIC_REGISTRY.upgrades.plasma;
    if (!registry || !registry[upgradeId]) return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_UPGRADE' } };
    
    const def = registry[upgradeId];
    const upgradeState = state.upgrades.plasma[upgradeId];
    
    let currencyKey = 'protons';
    if (upgradeId === 'quarkCondenser' || upgradeId === 'plasmaAutomation') currencyKey = 'quarks';
    if (upgradeId === 'gluonBinding' || upgradeId === 'leptonHarvest') currencyKey = 'gluons';

    const discount = state.artifacts?.modifiers?.costDiscount || 0.0;
    
    let bought = 0;
    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && upgradeState.level >= def.max) break;
      
      const effectiveCost = discount > 0 ? upgradeState.cost.times(1.0 - discount).floor() : upgradeState.cost;
      if (state.resources[currencyKey].amount.lt(effectiveCost)) break;
      
      state.resources[currencyKey].amount = state.resources[currencyKey].amount.minus(effectiveCost);
      upgradeState.level += 1;
      upgradeState.cost = upgradeState.cost.times(def.costScaling || 2).round();
      bought++;
    }
    
    if (bought === 0) {
      return { ok: false, changed: false, events: [], error: { code: 'CANNOT_AFFORD' } };
    }
    
    return {
      ok: true,
      changed: true,
      events: [{ type: 'UPGRADE_PURCHASED', category, upgradeId, newLevel: upgradeState.level, boughtCount: bought }]
    };
  }
};
