/* global Decimal */
/* eslint-disable import/no-cycle */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getStardustYield, getCompressionHeatYield, getCompressionScaling, getGravityCostMultiplier } from '../../core/economy.js';
import { createInitialState } from '../../state/createInitialState.js';

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
    if (state.activeEpoch !== 3) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    if (!state.resources.iron || state.resources.iron.amount.lt(1000)) return { ok: false, changed: false, events: [], error: { code: 'INSUFFICIENT_IRON' } };

    const yieldAmt = getStardustYield();
    state.currencies.stardust.amount = state.currencies.stardust.amount.plus(yieldAmt);
    state.stats.totalStardust = state.stats.totalStardust.plus(yieldAmt);
    state.stats.supernovas = state.stats.supernovas.plus(1);
    
    if (!state.achievements.firstSupernova.unlocked) {
      state.achievements.firstSupernova.unlocked = true;
    }
    
    const autoStabilizer = state.prestige.autoStabilizer;
    
    // Create new fresh state
    let fresh = createInitialState();
    fresh.activeEpoch = 3;
    fresh.activeTab = 'core';
    
    if (autoStabilizer) {
      fresh.era1 = JSON.parse(JSON.stringify(state.era1));
      fresh.era2 = JSON.parse(JSON.stringify(state.era2));
    }
    
    // Retain prestige currencies and stats
    fresh.currencies.stardust.amount = state.currencies.stardust.amount;
    fresh.currencies.pulsarShards.amount = state.currencies.pulsarShards.amount;
    fresh.currencies.singularityMass.amount = state.currencies.singularityMass.amount;
    fresh.currencies.bits.amount = state.currencies.bits.amount;
    fresh.stats = JSON.parse(JSON.stringify(state.stats));
    fresh.achievements = JSON.parse(JSON.stringify(state.achievements));
    fresh.artifacts = JSON.parse(JSON.stringify(state.artifacts));
    fresh.settings = JSON.parse(JSON.stringify(state.settings));
    fresh.completedMissions = JSON.parse(JSON.stringify(state.completedMissions));
    fresh.cards = JSON.parse(JSON.stringify(state.cards));
    fresh.prestige.autoStabilizer = autoStabilizer;

    // Mutate state in place to match fresh
    for (const key in fresh) {
      state[key] = fresh[key];
    }
    
    let transitionToEra4 = false;
    if (state.stats.supernovas.gte(1)) {
      if (state.stats.supernovas.gte(1) && !state.era4.act2Notified) {
        transitionToEra4 = true;
      }
    }

    return { 
      ok: true,
      changed: true,
      events: [
        { type: "SUPERNOVA_TRIGGERED", yieldAmt: yieldAmt.toString() },
        { type: "STATE_RESET" },
        ...(transitionToEra4 ? [{ type: "ERA_TRANSITION", targetEra: 4 }] : [])
      ]
    };
  }
};
