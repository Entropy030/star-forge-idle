/* global Decimal */
import { getEnergyDensityRate, getQuantumFluctuationRate } from '../../core/economy.js';
import { getInflationEligibility } from './inflation.js';

export { getInflationEligibility };
export { getQuantumUpgradeEligibility } from './eligibility.js';



export function getQuantumRates(state) {
  return {
    fluctuationsProduction: getQuantumFluctuationRate(state),
    densityProduction: getEnergyDensityRate(state)
  };
}
