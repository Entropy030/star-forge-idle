import { getInitialGameState } from '../core/state.js';
import Decimal from '../../break_infinity.js';

export function getPresetFreshEraI() {
  const state = getInitialGameState();
  return state;
}

export function getPresetLateEraI() {
  const state = getInitialGameState();
  state.resources.quantumFluctuations.amount = new Decimal(50000);
  state.resources.energyDensity.amount = new Decimal(25000);
  
  state.upgrades.quantum.gravityForce = { level: 5 };
  state.upgrades.quantum.weakForce = { level: 5 };
  state.upgrades.quantum.electromagneticForce = { level: 5 };
  state.upgrades.quantum.strongForce = { level: 5 };
  
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
  state.upgrades.plasma = {
    quarkCondenser: { level: 3 },
    gluonBinding: { level: 2 },
    leptonHarvest: { level: 1 },
    plasmaAutomation: { level: 1 },
    baryoRadiator: { level: 0 }
  };
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
  state.era3 = {
    temperature: new Decimal(2000),
    gravityCost: new Decimal(100),
    compressCost: new Decimal(500),
    tempMultiplier: new Decimal(1),
    fusionYield: new Decimal(1),
    stellarRank: "Nebula Gas Cloud",
    stage: "Nebula"
  };
  return state;
}

export function getPresetMidEraIII() {
  const state = getPresetFreshEraIII();
  state.resources.hydrogen.amount = new Decimal(50000);
  state.resources.helium.amount = new Decimal(10000);
  state.resources.carbon.amount = new Decimal(50);
  state.era3.temperature = new Decimal(50000000); // 50M K
  state.era3.stellarRank = "Main Sequence Star";
  state.era3.stage = "Main Sequence Star";
  return state;
}

export function getPresetEraIIISupernovaReady() {
  const state = getPresetMidEraIII();
  state.resources.hydrogen.amount = new Decimal(1000000);
  state.resources.helium.amount = new Decimal(100000);
  state.resources.carbon.amount = new Decimal(10000);
  state.resources.iron.amount = new Decimal(1000);
  state.era3.temperature = new Decimal(3500000000); // 3.5B K
  state.era3.stellarRank = "Red Supergiant";
  state.era3.stage = "Red Supergiant";
  return state;
}
