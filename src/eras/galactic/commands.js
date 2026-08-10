/* global Decimal */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getPulsarShardYield, getSingularityMassYield, getGalacticMergeYield } from '../../core/economy.js';
import { createInitialState } from '../../state/createInitialState.js';

export const galacticCommandHandlers = {
  CLICK_CORE_ERA4: (state, cmd) => {
    if (state.activeEpoch !== 4) return { ok: false, changed: false, events: [], error: { code: 'UNHANDLED_EPOCH' } };

    state.resources.hydrogen.amount = state.resources.hydrogen.amount.plus(50);

    return {
      ok: true,
      changed: true,
      events: [{ type: 'CORE_CLICKED', epoch: 4, hydrogenGain: 50 }]
    };
  },

  TRIGGER_BIG_BOUNCE: (state, cmd) => {
    if (state.activeEpoch !== 4) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    if (state.era4.planetaryNodes.lt(5)) return { ok: false, changed: false, events: [], error: { code: 'INSUFFICIENT_NODES' } };
    
    const yieldAmt = getPulsarShardYield(state); // Will be converted to selector
    const bitsYield = getSingularityMassYield(state); // Will be converted to selector
    
    state.currencies.pulsarShards.amount = state.currencies.pulsarShards.amount.plus(yieldAmt);
    state.currencies.bits.amount = state.currencies.bits.amount.plus(bitsYield);
    
    const oldBits = state.currencies.bits.amount;
    const oldStardust = state.currencies.stardust.amount;
    const oldPulsar = state.currencies.pulsarShards.amount;
    const oldSingularity = state.currencies.singularityMass.amount;
    const oldStats = JSON.parse(JSON.stringify(state.stats));
    const oldAch = JSON.parse(JSON.stringify(state.achievements));
    const oldArtifacts = JSON.parse(JSON.stringify(state.artifacts));
    const oldSettings = JSON.parse(JSON.stringify(state.settings));
    const oldMissions = JSON.parse(JSON.stringify(state.completedMissions));
    const oldCards = JSON.parse(JSON.stringify(state.cards));
    
    let fresh = createInitialState();
    fresh.activeEpoch = 4;
    
    // Retain prestige currencies and stats
    fresh.currencies.stardust.amount = oldStardust;
    fresh.currencies.pulsarShards.amount = oldPulsar;
    fresh.currencies.singularityMass.amount = oldSingularity;
    fresh.currencies.bits.amount = oldBits;
    fresh.stats = oldStats;
    fresh.achievements = oldAch;
    fresh.artifacts = oldArtifacts;
    fresh.settings = oldSettings;
    fresh.completedMissions = oldMissions;
    fresh.cards = oldCards;
    
    // Mutate state in place to match fresh
    for (const key in fresh) {
      state[key] = fresh[key];
    }
    
    return {
      ok: true,
      changed: true,
      events: [
        { type: "BIG_BOUNCE_TRIGGERED", pulsarYield: yieldAmt.toString(), bitsYield: bitsYield.toString() },
        { type: "STATE_RESET" }
      ]
    };
  },

  TRIGGER_GALACTIC_MERGE: (state, cmd) => {
    if (state.activeEpoch !== 5) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    
    const cost = new Decimal(1e12); // placeholder
    if (state.resources.planetaryDebris.amount.lt(cost)) {
      return { ok: false, changed: false, events: [], error: { code: 'INSUFFICIENT_DEBRIS' } };
    }
    
    const yieldAmt = getGalacticMergeYield(state);
    state.resources.planetaryDebris.amount = state.resources.planetaryDebris.amount.sub(cost);
    state.currencies.singularityMass.amount = state.currencies.singularityMass.amount.plus(yieldAmt);
    
    return {
      ok: true,
      changed: true,
      events: [
        { type: "GALACTIC_MERGE_TRIGGERED", yieldAmt: yieldAmt.toString() }
      ]
    };
  },

  BUY_UPGRADE_GALAXY: (state, cmd) => {
    const { category, upgradeId, loops = 1 } = cmd.payload;
    if (category !== 'galaxy') return { ok: false, changed: false, events: [], error: { code: 'WRONG_CATEGORY' } };
    
    const registry = COSMIC_REGISTRY.upgrades.galaxy;
    if (!registry || !registry[upgradeId]) return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_UPGRADE' } };
    
    const def = registry[upgradeId];
    const upgradeState = state.upgrades.galaxy[upgradeId];
    
    const currencyKey = 'darkMatter'; // Era 4 upgrades use darkMatter
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
  },

  BUY_UPGRADE_ERA5: (state, cmd) => {
    if (state.activeEpoch !== 5) return { ok: false, changed: false, events: [], error: { code: 'WRONG_EPOCH' } };
    
    const upgradeKey = cmd.payload?.upgradeId;
    const loops = cmd.payload?.loops || 1;
    const registry = COSMIC_REGISTRY.upgrades.era5;
    if (!registry || !registry[upgradeKey]) return { ok: false, changed: false, events: [], error: { code: 'UNKNOWN_UPGRADE' } };
    
    const def = registry[upgradeKey];
    let upState = state.upgrades.era5[upgradeKey];
    if (!upState) {
      upState = { level: 0, cost: new Decimal(def.baseCost) };
      state.upgrades.era5[upgradeKey] = upState;
    }

    if (def.max !== undefined && upState.level >= def.max) {
      return { ok: false, changed: false, events: [], error: { code: 'MAX_LEVEL_REACHED' } };
    }

    const currencyKey = def.currency || 'singularityMass';
    const discount = state.artifacts?.modifiers?.costDiscount || 0.0;
    
    let boughtAny = false;
    for (let i = 0; i < loops; i++) {
      if (def.max !== undefined && upState.level >= def.max) break;
      const effectiveCost = discount > 0 ? upState.cost.times(1.0 - discount).floor() : upState.cost;
      
      let balance = new Decimal(0);
      if (['singularityMass', 'hawkingRadiation', 'bits', 'stardust', 'pulsarShards'].includes(currencyKey)) {
        balance = state.currencies[currencyKey]?.amount || new Decimal(0);
      }
      
      if (balance.lt(effectiveCost)) break;
      
      if (['singularityMass', 'hawkingRadiation', 'bits', 'stardust', 'pulsarShards'].includes(currencyKey)) {
        state.currencies[currencyKey].amount = state.currencies[currencyKey].amount.sub(effectiveCost);
      }
      
      upState.level += 1;
      
      if (def.costScaling) {
        upState.cost = upState.cost.times(def.costScaling).round();
      } else {
        upState.cost = upState.cost.times(1.15).round(); // Default scaling
      }
      boughtAny = true;
    }
    
    if (!boughtAny) {
      return { ok: false, changed: false, events: [], error: { code: 'INSUFFICIENT_FUNDS' } };
    }
    
    return { ok: true, changed: true, events: [{ type: 'UPGRADE_BOUGHT', category: 'era5', upgradeId: upgradeKey }] };
  }
};
