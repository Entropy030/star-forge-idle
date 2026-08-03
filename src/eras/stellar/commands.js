/* global Decimal */
/* eslint-disable import/no-cycle */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCompressionHeatYield, getCompressionScaling, getGravityCostMultiplier } from '../../core/economy.js';
import { createInitialState } from '../../state/createInitialState.js';
import { getSupernovaEligibility, getSupernovaOutcome } from './selectors.js';

export const stellarCommandHandlers = {
  CLICK_CORE_ERA3: (state, cmd) => {
    if (state.activeEpoch !== 3) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };

    state.era3.temperature = state.era3.temperature.plus(10000);
    // Recalculating temp multiplier directly inline for now, later use a selector/system
    let baseDiv = state.era3.temperature.div(1000000).plus(1);
    let logPrimitive = Math.log10(baseDiv.toNumber());
    state.era3.tempMultiplier = new Decimal(1.0 + logPrimitive);

    if (state.era3.temperature.gt(state.stats.maxTemp)) {
      state.stats.maxTemp = state.era3.temperature;
    }

    return {
      ok: true,
      changed: true,
      events: [{ type: 'CORE_CLICKED', epoch: 3, tempGain: 10000 }]
    };
  },

  BUY_CORE_NODE: (state, cmd) => {
    const { key, loops = 1 } = cmd.payload;
    if (state.activeEpoch !== 3) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };

    let bought = 0;
    const resources = state.resources;
    const era3 = state.era3;

    const tryBuy = (currencyKey, costKey, onBuy) => {
      for (let i = 0; i < loops; i++) {
        if (resources[currencyKey].amount.gte(era3[costKey])) {
          resources[currencyKey].amount = resources[currencyKey].amount.minus(era3[costKey]);
          onBuy();
          bought++;
        } else {
          break;
        }
      }
    };

    if (key === 'gravity') {
      tryBuy('hydrogen', 'gravityCost', () => {
        era3.gravity = era3.gravity.plus(1);
        era3.gravityCost = era3.gravityCost.times(getGravityCostMultiplier()).floor();
      });
    } else if (key === 'fuser') {
      const isHydrogen = era3.fusionYield.eq(0);
      tryBuy(isHydrogen ? 'hydrogen' : 'helium', isHydrogen ? 'fuserCostHydrogen' : 'fuserCostHelium', () => {
        if (era3.fusionYield.eq(0)) {
          era3.fusionYield = new Decimal(1);
        } else {
          era3.fusionYield = era3.fusionYield.plus(1);
          era3.fuserCostHelium = era3.fuserCostHelium.times(2.5).round();
        }
      });
    } else if (key === 'compress') {
      tryBuy('helium', 'compressCost', () => {
        era3.temperature = era3.temperature.plus(getCompressionHeatYield());
        era3.compressCost = era3.compressCost.times(getCompressionScaling()).floor();
        let baseDiv = era3.temperature.div(1000000).plus(1);
        era3.tempMultiplier = new Decimal(1.0 + Math.log10(baseDiv.toNumber()));
        
        if (era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && era3.stage === "Protostar") {
          era3.stage = "Main Sequence Star";
        }
        if (era3.temperature.gt(state.stats.maxTemp)) {
          state.stats.maxTemp = era3.temperature;
        }
      });
    } else if (key === 'carbon') {
      if (era3.stage !== "Main Sequence Star" || era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
        return { ok: false, changed: false, events: [], error: { code: 'PREREQUISITES_NOT_MET' } };
      }
      const isHelium = era3.carbonYield.eq(0);
      tryBuy(isHelium ? 'helium' : 'carbon', isHelium ? 'carbonCostHelium' : 'carbonCostCarbon', () => {
        if (era3.carbonYield.eq(0)) {
          era3.carbonYield = new Decimal(1);
        } else {
          era3.carbonYield = era3.carbonYield.plus(1);
          era3.carbonCostCarbon = era3.carbonCostCarbon.times(2.5).round();
        }
      });
    } else if (key === 'iron') {
      if (era3.stage !== "Main Sequence Star" || era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
        return { ok: false, changed: false, events: [], error: { code: 'PREREQUISITES_NOT_MET' } };
      }
      const isCarbon = era3.ironYield.eq(0);
      tryBuy(isCarbon ? 'carbon' : 'iron', isCarbon ? 'ironCostCarbon' : 'ironCostIron', () => {
        if (era3.ironYield.eq(0)) {
          era3.ironYield = new Decimal(1);
        } else {
          era3.ironYield = era3.ironYield.plus(1);
          era3.ironCostIron = era3.ironCostIron.times(2.5).round();
        }
      });
    }

    if (bought === 0) return { ok: false, changed: false, events: [], error: { code: 'CANNOT_AFFORD' } };

    return {
      ok: true,
      changed: true,
      events: [{ type: 'CORE_NODE_PURCHASED', key, boughtCount: bought }]
    };
  },

  TRIGGER_SUPERNOVA: (state, cmd) => {
    const eligibility = getSupernovaEligibility(state);
    if (!eligibility.canTrigger) {
      return { ok: false, changed: false, events: [], error: { code: eligibility.errorCode } };
    }

    const outcome = getSupernovaOutcome(state);
    const rewards = outcome.rewards;

    // Persist objects by reference
    const persistent = {
      currencies: state.currencies,
      stats: state.stats,
      meta: state.meta,
      achievements: state.achievements,
      artifacts: state.artifacts,
      settings: state.settings,
      completedMissions: state.completedMissions,
      cards: state.cards,
      codex: state.codex
    };

    // Grant rewards exactly once
    persistent.currencies.stardust.amount = persistent.currencies.stardust.amount.plus(rewards.stardust);
    persistent.currencies.pulsarShards.amount = persistent.currencies.pulsarShards.amount.plus(rewards.pulsarShards);
    persistent.currencies.singularityMass.amount = persistent.currencies.singularityMass.amount.plus(rewards.singularityMass);
    
    persistent.stats.totalStardust = persistent.stats.totalStardust.plus(rewards.stardust);
    persistent.stats.supernovas = persistent.stats.supernovas.plus(1);
    
    if (!persistent.achievements.firstSupernova.unlocked) {
      persistent.achievements.firstSupernova.unlocked = true;
    }

    if (!persistent.meta) {
      persistent.meta = {};
    }
    
    // Update persistent meta
    persistent.meta.stellarRunsCompleted = (persistent.meta.stellarRunsCompleted || 0) + 1;
    persistent.meta.lastSupernovaOutcome = outcome.outcome;
    persistent.meta.secondStellarRunUnlocked = true;
    persistent.meta.stellarLegacyModifiers = outcome.modifiers;
    
    // Create fresh state
    const fresh = createInitialState();
    
    // Attach persistent state
    fresh.currencies = persistent.currencies;
    fresh.stats = persistent.stats;
    fresh.meta = persistent.meta;
    fresh.achievements = persistent.achievements;
    fresh.artifacts = persistent.artifacts;
    fresh.settings = persistent.settings;
    fresh.completedMissions = persistent.completedMissions;
    fresh.cards = persistent.cards;
    if (persistent.codex) {
      fresh.codex = persistent.codex;
    }

    // Set post-supernova target
    fresh.activeEpoch = 3;
    fresh.activeTab = 'core';

    // Wipe old state safely
    for (const key of Object.keys(state)) {
      delete state[key];
    }
    
    Object.assign(state, fresh);

    return { 
      ok: true,
      changed: true,
      events: [
        { type: "SUPERNOVA_TRIGGERED", outcome: outcome.outcome, rewards: { stardust: rewards.stardust.toString(), pulsarShards: rewards.pulsarShards.toString(), singularityMass: rewards.singularityMass.toString() } },
        { type: "STELLAR_RUN_STARTED", runNumber: 2 },
        { type: "STATE_RESET" }
      ]
    };
  }
};
