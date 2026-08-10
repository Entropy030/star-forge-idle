import { getInitialGameState } from '../core/state.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import Decimal from 'break_infinity.js';

function setUpgradeLevel(state, category, key, level) {
  const def = COSMIC_REGISTRY.upgrades[category][key];
  const upgrade = state.upgrades[category][key];
  upgrade.level = level;
  upgrade.cost = new Decimal(def.baseCost)
    .times(Decimal.pow(def.costScaling || 2, level))
    .round();
}

export function getPresetFreshEraI() {
  const state = getInitialGameState();
  return state;
}

export function getPresetLateEraI() {
  const state = getInitialGameState();
  state.unfold.introCompleted = true;
  state.resources.quantumFluctuations.amount = new Decimal(50000);
  state.resources.energyDensity.amount = new Decimal(25000);
  state.stats.maxQF = new Decimal(50000);
  state.coherence = new Decimal(80);
  state.discoveries = new Set(['qf_1', 'qf_10', 'qf_100', 'qf_500', 'qf_2500', 'qf_10000']);

  setUpgradeLevel(state, 'quantum', 'gravityForce', 5);
  setUpgradeLevel(state, 'quantum', 'weakForce', 5);
  setUpgradeLevel(state, 'quantum', 'electromagneticForce', 5);
  setUpgradeLevel(state, 'quantum', 'vacuumResonance', 5);
  setUpgradeLevel(state, 'quantum', 'strongForce', 5);
  
  return state;
}

export function getPresetFreshEraII() {
  const state = getPresetLateEraI();
  state.activeEpoch = 2;
  state.resources.quarks.amount = new Decimal(100);
  state.resources.gluons.amount = new Decimal(10);
  state.plasmaTemperature = new Decimal(1000000000);
  return state;
}

export function getPresetEraIIUpgradeChain() {
  const state = getPresetFreshEraII();
  setUpgradeLevel(state, 'plasma', 'quarkCondenser', 3);
  setUpgradeLevel(state, 'plasma', 'gluonBinding', 2);
  setUpgradeLevel(state, 'plasma', 'leptonHarvest', 1);
  setUpgradeLevel(state, 'plasma', 'plasmaAutomation', 1);
  state.resources.quarks.amount = new Decimal(5000);
  state.resources.gluons.amount = new Decimal(5000);
  state.resources.leptons.amount = new Decimal(100);
  state.resources.protons.amount = new Decimal(50);
  return state;
}

export function getPresetEraIIRecombinationReady() {
  const state = getPresetEraIIUpgradeChain();
  state.plasmaTemperature = new Decimal(1000);
  state.resources.protons.amount = new Decimal(10000);
  state.resources.electrons.amount = new Decimal(10000);
  return state;
}

export function getPresetFreshEraIII() {
  const state = getPresetEraIIRecombinationReady();
  state.activeEpoch = 3;
  state.resources.hydrogen.amount = new Decimal(100);
  state.era3.temperature = new Decimal(2000);
  state.era3.stage = "Protostar";
  return state;
}

export function getPresetMidEraIII() {
  const state = getPresetFreshEraIII();
  state.resources.hydrogen.amount = new Decimal(50000);
  state.resources.helium.amount = new Decimal(10000);
  state.era3.temperature = new Decimal(50000000); // 50M K
  state.era3.stage = "Main Sequence Star";
  state.era3.gravity = new Decimal(5);
  state.era3.fusionYield = new Decimal(2);
  return state;
}

export function getPresetEraIIISupernovaReady() {
  const state = getPresetMidEraIII();
  state.resources.hydrogen.amount = new Decimal(1000000);
  state.resources.helium.amount = new Decimal(100000);
  state.resources.carbon.amount = new Decimal(10000);
  state.resources.iron.amount = new Decimal(1000);
  state.era3.temperature = new Decimal(3500000000); // 3.5B K
  state.era3.stage = "Main Sequence Star";
  state.era3.carbonYield = new Decimal(1);
  state.era3.ironYield = new Decimal(1);
  return state;
}
