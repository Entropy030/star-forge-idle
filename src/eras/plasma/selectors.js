/* global Decimal */
import { getMilestoneMultiplier } from '../../core/economy.js';

export function getPlasmaRates(state) {
  let rates = {
    survivingMatterConsumption: new Decimal(0),
    quarksProduction: new Decimal(0),
    leptonsProduction: new Decimal(0),
    quarksConsumption: new Decimal(0),
    protonsProduction: new Decimal(0),
    leptonsConsumption: new Decimal(0),
    electronsProduction: new Decimal(0),
    electronsConsumption: new Decimal(0),
    protonsConsumption: new Decimal(0),
    hydrogenProduction: new Decimal(0),
    coolingRate: new Decimal(0)
  };

  // Recipe 1: Surviving Matter -> Quarks & Leptons
  let qcLevel = state.upgrades.plasma.quarkCondenser?.level || 0;
  if (qcLevel > 0) {
    let mult = getMilestoneMultiplier(qcLevel);
    let baseRate = new Decimal(qcLevel).times(mult);
    
    // Check if input available (for UI we just show the capacity limit as rate)
    // Actually, showing max rate is better for UI.
    rates.survivingMatterConsumption = rates.survivingMatterConsumption.plus(baseRate.times(2));
    rates.quarksProduction = rates.quarksProduction.plus(baseRate.times(2));
    rates.leptonsProduction = rates.leptonsProduction.plus(baseRate.times(1));
  }

  // Recipe 2: Quarks -> Protons
  let synthLevel = state.upgrades.plasma.plasmaAutomation?.level || 0;
  if (synthLevel > 0) {
    let mult = getMilestoneMultiplier(synthLevel);
    let baseRate = new Decimal(synthLevel).times(mult).times(2);
    rates.quarksConsumption = rates.quarksConsumption.plus(baseRate.times(3));
    rates.protonsProduction = rates.protonsProduction.plus(baseRate.times(1));
  }

  // Recipe 3: Leptons -> Electrons
  let harvestLevel = state.upgrades.plasma.leptonHarvest?.level || 0;
  if (harvestLevel > 0 && state.plasmaTemperature.lt(500000)) {
    let mult = getMilestoneMultiplier(harvestLevel);
    let baseRate = new Decimal(harvestLevel).times(mult).times(5);
    rates.leptonsConsumption = rates.leptonsConsumption.plus(baseRate.times(1));
    rates.electronsProduction = rates.electronsProduction.plus(baseRate.times(1));
  }

  // Cooling
  let radiatorLevel = state.upgrades.plasma.baryoRadiator?.level || 0;
  if (radiatorLevel > 0) {
    let baseRate = new Decimal(radiatorLevel);
    rates.protonsConsumption = rates.protonsConsumption.plus(baseRate.times(2));
    rates.coolingRate = rates.coolingRate.plus(baseRate.times(7500));
  }

  // Recombination
  if (state.plasmaTemperature.lt(100000)) {
    let tempFactor = Decimal.max(1, new Decimal(100000).minus(state.plasmaTemperature).div(10000));
    let baseRate = tempFactor.times(2);
    rates.protonsConsumption = rates.protonsConsumption.plus(baseRate.times(1));
    rates.electronsConsumption = rates.electronsConsumption?.plus(baseRate.times(1)) || baseRate.times(1);
    rates.hydrogenProduction = rates.hydrogenProduction?.plus(baseRate.times(1)) || baseRate.times(1);
  }

  return rates;
}
