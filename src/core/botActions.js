import { gameState } from './state.js';
import { Economy, getAmount } from './economy.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { Viewport } from '../ui/viewport.js';

export const getAIState = function (copyToClipboard = true) {
  const epoch = gameState.activeEpoch;

  const state = {
    meta: {
      activeEpoch: epoch,
      epochName: COSMIC_REGISTRY.universeChronology.epochs[epoch]?.name,
      activeTab: gameState.activeTab,
      coherence: gameState.coherence.toString()
    },
    resources: {},
    availableUpgrades: [],
    specialActions: {}
  };

  if (epoch === 1) {
    state.resources = {
      quantumFluctuations: gameState.resources.quantumFluctuations.amount.toString(),
      energyDensity: gameState.resources.energyDensity.amount.toString()
    };
    state.specialActions.canInflation = gameState.resources.quantumFluctuations.amount.gte(COSMIC_REGISTRY.constants.inflationThreshold);
  } else if (epoch === 2) {
    state.resources = {
      quarks: gameState.resources.quarks.amount.toString(),
      gluons: gameState.resources.gluons.amount.toString(),
      leptons: gameState.resources.leptons.amount.toString(),
      protons: gameState.resources.protons.amount.toString(),
      electrons: gameState.resources.electrons.amount.toString(),
      plasmaTemperature: gameState.plasmaTemperature.toString() + " K"
    };
    state.specialActions.canRecombination = gameState.resources.protons.amount.gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || gameState.plasmaTemperature.lte(3000);
  } else if (epoch === 3) {
    state.resources = {
      hydrogen: gameState.resources.hydrogen.amount.toString(),
      helium: gameState.resources.helium.amount.toString(),
      carbon: gameState.resources.carbon.amount.toString(),
      iron: gameState.resources.iron.amount.toString(),
      stardust: gameState.currencies.stardust.amount.toString(),
      temperature: gameState.era3.temperature.toString() + " K",
      stage: gameState.era3.stage
    };
    state.yieldsActive = {
      hydrogen: true,
      helium: true,
      carbon: gameState.era3.stage === "Main Sequence Star" && gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp),
      iron: gameState.era3.stage === "Main Sequence Star" && gameState.era3.carbonYield.gt(0)
    };
    state.specialActions.canSupernova = gameState.era3.temperature.gte(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    state.specialActions.hasActiveFlare = !!gameState.flares.active;
  } else if (epoch === 4 && gameState.era4) {
    state.resources = {
      planetaryDebris: gameState.resources.planetaryDebris.amount.toString(),
      darkMatter: gameState.resources.darkMatter.amount.toString(),
      darkEnergyResidue: gameState.resources.darkEnergyResidue.amount.toString(),
      stability: gameState.era4.stability.toString() + "%",
      planetaryNodes: gameState.era4.planetaryNodes.toString()
    };
    state.specialActions.canGalacticMerge = gameState.resources.darkMatter.amount.gte(10000);
  }

  const categoryMap = { 1: 'quantum', 2: 'plasma', 4: 'galaxy' };
  const currentCategory = categoryMap[epoch];

  if (currentCategory && COSMIC_REGISTRY.upgrades[currentCategory]) {
    for (let key in COSMIC_REGISTRY.upgrades[currentCategory]) {
      const def = COSMIC_REGISTRY.upgrades[currentCategory][key];
      const upgradeState = gameState.upgrades[currentCategory][key];
      const currencyKey = Economy.resolveCurrencyKey(currentCategory, key, def);
      const balance = getAmount(currencyKey);

      state.availableUpgrades.push({
        category: currentCategory,
        key: key,
        name: def.name,
        level: upgradeState.level,
        cost: upgradeState.cost.toString(),
        canAfford: balance.gte(upgradeState.cost) && (def.max === undefined || upgradeState.level < def.max)
      });
    }
  }

  if (COSMIC_REGISTRY.upgrades.stardust) {
    for (let key in COSMIC_REGISTRY.upgrades.stardust) {
      const def = COSMIC_REGISTRY.upgrades.stardust[key];
      const upgradeState = gameState.upgrades.stardust[key];
      if (def && upgradeState) {
        const balance = gameState.currencies.stardust.amount;
        state.availableUpgrades.push({
          category: 'stardust',
          key: key,
          name: def.name,
          level: upgradeState.level,
          cost: upgradeState.cost.toString(),
          canAfford: balance.gte(upgradeState.cost) && (def.max === undefined || upgradeState.level < def.max)
        });
      }
    }
  }

  if (epoch === 3) {
    state.availableUpgrades.push(
      { category: 'core', key: 'gravity', name: 'Gravity', cost: gameState.era3.gravityCost.toString(), canAfford: gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost) },
      { category: 'core', key: 'compress', name: 'Compress Core', cost: gameState.era3.compressCost.toString(), canAfford: gameState.resources.helium.amount.gte(gameState.era3.compressCost) }
    );
  }

  const output = JSON.stringify(state, null, 2);
  console.log("🤖 AI State:", output);

  if (copyToClipboard) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output)
        .then(() => alert("📋 AI State kopiert!"))
        .catch(() => prompt("Kopieren fehlgeschlagen. Bitte manuell kopieren (Strg+C):", output));
    } else {
      if (typeof prompt !== 'undefined') prompt("Bitte AI State kopieren (Strg+C):", output);
    }
  }

  return state;
};

export const runAIAction = function (cmd) {
  if (!cmd || !cmd.action) return "Invalid Command";

  const safeClick = (id) => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) el.click();
    }
  };

  switch (cmd.action) {
    case "click":
      const count = cmd.count || 1;
      for (let i = 0; i < count; i++) safeClick('btn-core');
      console.log(`🤖 Action: Clicked core ${count}x`);
      break;

    case "clickCore":
      safeClick('btn-core');
      console.log("🤖 Action: clickCore (single)");
      break;

    case "buy":
      Economy.buy(cmd.category, cmd.key);
      console.log(`🤖 Action: Bought ${cmd.category} -> ${cmd.key}`);
      break;

    case "collectFlare":
      safeClick('flare-button');
      console.log("🤖 Action: Collected Solar Flare");
      break;

    case "triggerInflation":
      safeClick('btn-inflation');
      console.log("🤖 Action: Triggered Inflation");
      break;

    case "triggerRecombination":
      safeClick('btn-recombination');
      console.log("🤖 Action: Triggered Recombination");
      break;

    case "triggerSupernova":
      safeClick('btn-supernova');
      console.log("🤖 Action: Triggered Supernova");
      break;

    case "switchTab":
      Viewport.switchTab(cmd.tab);
      console.log(`🤖 Action: Switched tab to ${cmd.tab}`);
      break;

    default:
      console.warn("🤖 Action unknown:", cmd.action);
  }
};
