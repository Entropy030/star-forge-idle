/* global Decimal */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getEnergyDensityRate, getQuantumFluctuationRate } from '../../core/economy.js';

export function simulateQuantumEra(state, dt) {
  let changed = false;

  // Passive Fluctuations
  let passiveFluctuations = getQuantumFluctuationRate(state).times(dt);
  if (passiveFluctuations.gt(0)) {
    state.resources.quantumFluctuations.amount = state.resources.quantumFluctuations.amount.plus(passiveFluctuations);
    changed = true;
  }

  // Energy Density
  let passiveDensity = getEnergyDensityRate(state).times(dt);
  if (passiveDensity.gt(0)) {
    state.resources.energyDensity.amount = state.resources.energyDensity.amount.plus(passiveDensity);
    changed = true;
  }

  // Era 1 Temperature Cooling
  if (state.resources.energyDensity.amount.gt(0)) {
    let densityLogPrimitive = state.resources.energyDensity.amount.plus(1).log10();
    let coolingFactor = new Decimal(densityLogPrimitive).times(1e24).times(dt);
    state.eraITemperature = Decimal.max(COSMIC_REGISTRY.constants.eraIInflationTemp, state.eraITemperature.minus(coolingFactor));
    changed = true;
  }

  // Baryon Asymmetry Trade-off (Annihilation Energy vs Surviving Matter)
  // Let's assume the player configures an asymmetry bias (0 to 1). 0.5 is perfectly symmetric.
  let asymmetryBias = state.era1?.asymmetryBias !== undefined ? state.era1.asymmetryBias : 0.5;
  
  // Calculate matter and antimatter generation based on energy density
  let baseGeneration = state.resources.energyDensity.amount.log10() * dt;
  if (baseGeneration > 0) {
    let matterGen = new Decimal(baseGeneration).times(asymmetryBias);
    let antimatterGen = new Decimal(baseGeneration).times(1 - asymmetryBias);
    
    // Annihilation happens for the overlapping amount
    let annihilationAmt = Decimal.min(matterGen, antimatterGen);
    let survivingMatter = matterGen.minus(annihilationAmt);
    
    // Annihilation yields Annihilation Energy
    if (annihilationAmt.gt(0)) {
      if (!state.resources.annihilationEnergy) {
        state.resources.annihilationEnergy = { amount: new Decimal(0) };
      }
      state.resources.annihilationEnergy.amount = state.resources.annihilationEnergy.amount.plus(annihilationAmt.times(10));
      changed = true;
    }
    
    // Surviving matter is kept for Era II
    if (survivingMatter.gt(0)) {
      if (!state.resources.survivingMatter) {
        state.resources.survivingMatter = { amount: new Decimal(0) };
      }
      state.resources.survivingMatter.amount = state.resources.survivingMatter.amount.plus(survivingMatter);
      changed = true;
    }
  }

  return { changed };
}
