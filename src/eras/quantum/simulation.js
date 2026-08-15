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

  return { changed };
}
