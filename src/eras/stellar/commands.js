/* global Decimal */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCompressionHeatYield, getCompressionScaling, getGravityCostMultiplier } from '../../core/economy.js';
import { createInitialState } from '../../state/createInitialState.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility, getSupernovaOutcome } from './selectors.js';
import { appendHistoryEntry } from '../../state/history.js';

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

  BUY_UPGRADE_STELLAR: (state, cmd) => {
    const { category, upgradeId, loops = 1 } = cmd.payload;
    if (!['stellar', 'stardust', 'pulsar', 'singularity'].includes(category)) {
      return { ok: false, changed: false, events: [], error: { code: 'WRONG_CATEGORY' } };
    }
    
    const registry = COSMIC_REGISTRY.upgrades[category];
    const def = registry[upgradeId];
    const upgradeState = state.upgrades[category][upgradeId];
    
    if (!def || !upgradeState) {
      return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_UPGRADE' } };
    }
    
    const currencyKey = def.currency || 'helium';
    const currency = state.resources[currencyKey] || state.currencies[currencyKey];
    if (!currency) {
      return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_CURRENCY' } };
    }

    let currencyAmount = currency.amount;
    const discount = state.artifacts?.modifiers?.costDiscount || 0.0;
    
    let bought = 0;
    let effectiveCost = upgradeState.cost;
    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && upgradeState.level >= def.max) break;
      effectiveCost = discount > 0 ? upgradeState.cost.times(1.0 - discount).floor() : upgradeState.cost;
      
      if (currencyAmount.lt(effectiveCost)) break;
      
      currencyAmount = currencyAmount.minus(effectiveCost);
      upgradeState.level += 1;
      
      if (def.costScaling) {
        upgradeState.cost = upgradeState.cost.times(def.costScaling).round();
      } else {
        upgradeState.cost = upgradeState.cost.times(2).round();
      }
      bought++;
    }
    
    if (bought === 0) {
      const maxed = def.max !== undefined && upgradeState.level >= def.max;
      return {
        ok: false,
        changed: false,
        events: [],
        cost: effectiveCost,
        currency: currencyKey,
        error: { code: maxed ? 'MAX_LEVEL_REACHED' : 'INSUFFICIENT_FUNDS' }
      };
    }
    
    currency.amount = currencyAmount;
    
    return {
      ok: true,
      changed: true,
      events: [{ type: 'UPGRADE_BOUGHT', category, upgradeId, count: bought }]
    };
  },

  BUY_CORE_NODE: (state, cmd) => {
    const { key, loops = 1 } = cmd.payload;
    if (state.activeEpoch !== 3) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };

    let bought = 0;
    const resources = state.resources;
    const era3 = state.era3;
    let attemptedCost = new Decimal(0);
    let attemptedCurrency = '';
    const knownKeys = ['gravity', 'fuser', 'compress', 'carbon', 'iron'];
    if (!knownKeys.includes(key)) {
      return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_CORE_NODE' } };
    }

    const purchaseOnce = () => {
      if (key === 'gravity') {
        attemptedCurrency = 'hydrogen';
        attemptedCost = era3.gravityCost;
        if (resources.hydrogen.amount.lt(attemptedCost)) return false;
        resources.hydrogen.amount = resources.hydrogen.amount.minus(attemptedCost);
        era3.gravity = era3.gravity.plus(1);
        era3.gravityCost = era3.gravityCost.times(getGravityCostMultiplier(state)).floor();
      } else if (key === 'fuser') {
        const isHydrogen = era3.fusionYield.eq(0);
        attemptedCurrency = isHydrogen ? 'hydrogen' : 'helium';
        attemptedCost = isHydrogen ? era3.fuserCostHydrogen : era3.fuserCostHelium;
        if (resources[attemptedCurrency].amount.lt(attemptedCost)) return false;
        resources[attemptedCurrency].amount = resources[attemptedCurrency].amount.minus(attemptedCost);
        if (era3.fusionYield.eq(0)) {
          era3.fusionYield = new Decimal(1);
        } else {
          era3.fusionYield = era3.fusionYield.plus(1);
          era3.fuserCostHelium = era3.fuserCostHelium.times(2.5).round();
        }
      } else if (key === 'compress') {
        attemptedCurrency = 'helium';
        attemptedCost = era3.compressCost;
        if (resources.helium.amount.lt(attemptedCost)) return false;
        resources.helium.amount = resources.helium.amount.minus(attemptedCost);
        era3.temperature = era3.temperature.plus(getCompressionHeatYield(state));
        era3.compressCost = era3.compressCost.times(getCompressionScaling(state)).floor();
        let baseDiv = era3.temperature.div(1000000).plus(1);
        era3.tempMultiplier = new Decimal(1.0 + Math.log10(baseDiv.toNumber()));
        
        if (era3.temperature.gte(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) && era3.stage === "Protostar") {
          era3.stage = "Main Sequence Star";
        }
        if (era3.temperature.gt(state.stats.maxTemp)) {
          state.stats.maxTemp = era3.temperature;
        }
      } else if (key === 'carbon') {
        const isHelium = era3.carbonYield.eq(0);
        attemptedCurrency = isHelium ? 'helium' : 'carbon';
        attemptedCost = isHelium ? era3.carbonCostHelium : era3.carbonCostCarbon;
        if (resources[attemptedCurrency].amount.lt(attemptedCost)) return false;
        resources[attemptedCurrency].amount = resources[attemptedCurrency].amount.minus(attemptedCost);
        if (era3.carbonYield.eq(0)) {
          era3.carbonYield = new Decimal(1);
          appendHistoryEntry(state, { msg: 'Nucleosynthesis Unlocked: Generating Carbon!' });
        } else {
          era3.carbonYield = era3.carbonYield.plus(1);
          era3.carbonCostCarbon = era3.carbonCostCarbon.times(2.5).round();
        }
      } else if (key === 'iron') {
        const isCarbon = era3.ironYield.eq(0);
        attemptedCurrency = isCarbon ? 'carbon' : 'iron';
        attemptedCost = isCarbon ? era3.ironCostCarbon : era3.ironCostIron;
        if (resources[attemptedCurrency].amount.lt(attemptedCost)) return false;
        resources[attemptedCurrency].amount = resources[attemptedCurrency].amount.minus(attemptedCost);
        if (era3.ironYield.eq(0)) {
          era3.ironYield = new Decimal(1);
          appendHistoryEntry(state, { msg: 'Heavy Nucleosynthesis: Synthesizing Iron!' });
        } else {
          era3.ironYield = era3.ironYield.plus(1);
          era3.ironCostIron = era3.ironCostIron.times(2.5).round();
        }
      } else {
        return false;
      }
      bought += 1;
      return true;
    };

    if ((key === 'carbon' && (era3.stage !== 'Main Sequence Star' || era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp))) ||
        (key === 'iron' && (era3.stage !== 'Main Sequence Star' || era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)))) {
      const resource = COSMIC_REGISTRY.resources[key];
      return {
        ok: false,
        changed: false,
        events: [],
        cost: resource.unlockTemp,
        currency: 'K (Main Sequence)',
        error: { code: 'PREREQUISITES_NOT_MET' }
      };
    }

    for (let i = 0; i < loops; i += 1) {
      if (!purchaseOnce()) break;
    }

    if (bought === 0) {
      return {
        ok: false,
        changed: false,
        events: [],
        cost: attemptedCost,
        currency: attemptedCurrency,
        error: { code: 'CANNOT_AFFORD' }
      };
    }

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
    console.log(`[DEBUG] TRIGGER_SUPERNOVA granting stardust. Current: ${persistent.currencies.stardust.amount.toString()}, Reward: ${rewards.stardust.toString()}`);
    persistent.currencies.stardust.amount = persistent.currencies.stardust.amount.plus(rewards.stardust);
    persistent.currencies.pulsarShards.amount = persistent.currencies.pulsarShards.amount.plus(rewards.pulsarShards);
    persistent.currencies.singularityMass.amount = persistent.currencies.singularityMass.amount.plus(rewards.singularityMass);
    console.log(`[DEBUG] TRIGGER_SUPERNOVA granted stardust. New: ${persistent.currencies.stardust.amount.toString()}`);
    
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
    console.log(`[DEBUG] After Object.assign, state.currencies.stardust.amount = ${state.currencies.stardust.amount.toString()}`);
    appendHistoryEntry(state, {
      msg: `Supernova Yield: ${rewards.stardust.toString()} Stardust`
    });

    return { 
      ok: true,
      changed: true,
      events: [
        { type: "SUPERNOVA_TRIGGERED", outcome: outcome.outcome, rewards: { stardust: rewards.stardust.toString(), pulsarShards: rewards.pulsarShards.toString(), singularityMass: rewards.singularityMass.toString() } },
        { type: "STELLAR_RUN_STARTED", runNumber: 2 },
        { type: "STATE_RESET" }
      ]
    };
  },

  TRIGGER_GALACTIC_IGNITION: (state) => {
    const eligibility = getGalacticIgnitionEligibility(state);
    if (!eligibility.isEligible) {
      return { ok: false, changed: false, events: [], error: { code: eligibility.errorCode } };
    }

    state.activeEpoch = 4;
    state.activeTab = 'core';

    return {
      ok: true,
      changed: true,
      events: [{ type: 'ERA_TRANSITION', targetEra: 4 }]
    };
  }
};
