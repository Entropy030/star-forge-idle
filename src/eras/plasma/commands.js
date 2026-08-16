import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getQuarkGluonImbalanceMultiplier } from './imbalance.js';
import {
  getPlasmaUpgradeEligibility,
  getPlasmaUpgradePurchaseDetails,
  getRecombinationEligibility
} from './eligibility.js';
import { PLASMA_POSTURES } from './constants.js';

export const plasmaCommandHandlers = {
  SET_PLASMA_POSTURE: (state, cmd) => {
    if (state.activeEpoch !== 2) {
      return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };
    }
    if (!state.era2 || typeof state.era2 !== 'object') {
      return { ok: false, changed: false, events: [], error: { code: 'INVALID_STATE' } };
    }

    const posture = cmd.payload?.posture;
    if (!PLASMA_POSTURES.includes(posture)) {
      return { ok: false, changed: false, events: [], error: { code: 'INVALID_POSTURE' } };
    }

    if (state.era2.posture === posture) {
      return { ok: true, changed: false, events: [] };
    }

    const previousPosture = state.era2.posture || 'BALANCE';
    state.era2.posture = posture;

    return {
      ok: true,
      changed: true,
      events: [
        {
          type: 'PLASMA_POSTURE_CHANGED',
          epoch: 2,
          posture,
          previousPosture
        }
      ]
    };
  },

  CLICK_CORE_ERA2: (state, cmd) => {
    if (state.activeEpoch !== 2) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };

    const imbalanceMultiplier = getQuarkGluonImbalanceMultiplier(state);
    let quarkGain = new Decimal(3).times(imbalanceMultiplier);
    let gluonGain = new Decimal(2).times(imbalanceMultiplier);

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
    const eligibility = getRecombinationEligibility(state);
    if (!eligibility.isEligible) {
      return { ok: false, changed: false, events: [], error: { code: eligibility.errorCode } };
    }

    state.activeEpoch = 3;

    // Handoff A (D25): Era III Starting Hydrogen is strictly and deterministically constant 250 H.
    state.resources.hydrogen.amount = new Decimal(250);

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

    const initialDetails = getPlasmaUpgradePurchaseDetails(state, upgradeId);
    if (!initialDetails.isEligible) {
      return { ok: false, changed: false, events: [], error: { code: 'PREREQUISITES_NOT_MET' } };
    }
    
    let bought = 0;
    for (let i = 0; i < loops; i++) {
      const details = i === 0 ? initialDetails : getPlasmaUpgradePurchaseDetails(state, upgradeId);
      if (details.isMaxed) break;
      if (!details.isAffordable) break;
      
      state.resources[details.currencyKey].amount = state.resources[details.currencyKey].amount.minus(details.cost);
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
