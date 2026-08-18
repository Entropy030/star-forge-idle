/* global Decimal */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCardMultiplier } from '../../core/economy.js'; // Will be extracted to selectors later
import { getQuantumUpgradeEligibility } from './eligibility.js';
import { getInflationEligibility } from './inflation.js';
import { getVacuumCoherence, getVacuumCoherenceRates, setVacuumCoherence, getVacuumAllocation, isVacuumFieldAllocationUnlocked, VACUUM_ALLOCATION_MODES } from './coherence.js';

export const quantumCommandHandlers = {
  CLICK_CORE: (state, cmd) => {
    // Basic atomicity check
    if (!state.resources) return { ok: false, changed: false, events: [], error: { code: 'INVALID_STATE' } };
    
    // In era 1, clicking does quantum fluctuation gathering
    if (state.activeEpoch === 1) {
      if (!state.era1) state.era1 = { currentAct: 1, quantumFoam: 0, unfoldCount: 0 };
      state.era1.unfoldCount = (state.era1.unfoldCount || 0) + 1;
      const coherenceRates = getVacuumCoherenceRates(state);
      const vacuumCoherence = getVacuumCoherence(state);
      let coherenceGain = new Decimal(0);
      
      if (vacuumCoherence.lt(100)) {
        coherenceGain = Decimal.min(coherenceRates.observationGain, new Decimal(100).minus(vacuumCoherence));
        setVacuumCoherence(state, vacuumCoherence.plus(coherenceGain));
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
          { type: 'CORE_CLICKED', epoch: 1, gain: gain.toString(), coherenceGain: coherenceGain.toString(), resource: 'quantumFluctuations' }
        ]
      };
    }
    
    return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };
  },

  TRIGGER_INFLATION: (state, cmd) => {
    if (state.activeEpoch !== 1) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    
    const eligibility = getInflationEligibility(state);
    if (!eligibility.isEligible) {
      return { ok: false, changed: false, events: [], error: { code: 'PREREQUISITES_NOT_MET' } };
    }
    
    let leftover = state.resources.quantumFluctuations.amount.minus(100000);
    let bonusFactor = new Decimal(1).plus(leftover.div(100000).times(0.1));
    state.inflatonMultiplier = (state.inflatonMultiplier || new Decimal(1)).times(bonusFactor);
    
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(10000000);
    state.cosmicAge = new Decimal(0);
    if (!state.era1) state.era1 = {};
    state.era1.currentAct = 4;
    return {
      ok: true,
      changed: true,
      events: [{ type: 'ERA_TRANSITION', targetEra: 2 }]
    };
  },

  SET_VACUUM_ALLOCATION: (state, cmd) => {
    if (state.activeEpoch !== 1) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    if (!state.era1) return { ok: false, changed: false, events: [], error: { code: 'INVALID_STATE' } };
    if (!isVacuumFieldAllocationUnlocked(state)) {
      return { ok: false, changed: false, events: [], error: { code: 'LOCKED' } };
    }
    const { allocation } = cmd.payload || {};
    if (!VACUUM_ALLOCATION_MODES.includes(allocation)) {
      return { ok: false, changed: false, events: [], error: { code: 'INVALID_MODE' } };
    }
    const previousAllocation = getVacuumAllocation(state);
    if (previousAllocation === allocation) {
      return { ok: true, changed: false, events: [] };
    }
    state.era1.vacuumAllocation = allocation;
    return {
      ok: true,
      changed: true,
      events: [
        {
          type: 'VACUUM_ALLOCATION_CHANGED',
          allocation,
          previousAllocation
        }
      ]
    };
  },

  BUY_UPGRADE: (state, cmd) => {
    // Expected payload: { category: 'quantum', upgradeId: 'vacuumEnergy', loops: 1 }
    const { category, upgradeId, loops = 1 } = cmd.payload;
    if (category !== 'quantum') return { ok: false, changed: false, events: [], error: { code: 'WRONG_CATEGORY' } };
    
    const registry = COSMIC_REGISTRY.upgrades.quantum;
    if (!registry || !registry[upgradeId]) return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_UPGRADE' } };
    
    const def = registry[upgradeId];
    
    const eligibility = getQuantumUpgradeEligibility(state, upgradeId);
    if (!eligibility.unlocked) {
      return { ok: false, changed: false, events: [], error: { code: 'LOCKED_UPGRADE' } };
    }
    
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
