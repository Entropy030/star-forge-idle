/* global Decimal */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getCompressionHeatYield } from '../../core/economy.js';

export function getStellarRates(state) {
  let rates = {
    hydrogenProduction: new Decimal(0),
    hydrogenConsumption: new Decimal(0),
    heliumProduction: new Decimal(0),
    heliumConsumption: new Decimal(0),
    carbonProduction: new Decimal(0),
    carbonConsumption: new Decimal(0),
    ironProduction: new Decimal(0),
    pulsarShardsProduction: new Decimal(0)
  };

  let efficientLvl = state.upgrades.stellar?.efficient?.level || 0;
  let massiveLvl = state.upgrades.stellar?.massive?.level || 0;
  let compactLvl = state.upgrades.stellar?.compact?.level || 0;

  let fuelEfficiency = new Decimal(1.0).plus(efficientLvl * 0.1);
  let speedMult = new Decimal(1.0).plus(massiveLvl * 0.1);

  // Hydrogen
  rates.hydrogenProduction = state.era3.gravity.times(10).times(speedMult);

  // Helium
  if (state.era3.fusersEnabled && state.era3.fusionYield.gt(0)) {
    let costPerYield = new Decimal(10).div(fuelEfficiency);
    let targetFusions = state.era3.fusionYield.times(speedMult);
    rates.hydrogenConsumption = targetFusions.times(costPerYield);
    rates.heliumProduction = targetFusions;
  }

  // Carbon and Iron
  if (state.era3.stage === "Main Sequence Star") {
    if (state.era3.carbonYield.gt(0)) {
      let carbonCost = new Decimal(50).div(fuelEfficiency);
      let targetCarbon = state.era3.carbonYield.times(speedMult);
      rates.heliumConsumption = targetCarbon.times(carbonCost);
      rates.carbonProduction = targetCarbon;
    }

    if (state.era3.ironYield.gt(0) && state.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
      let ironCost = new Decimal(250).div(fuelEfficiency);
      let massiveIronBonus = new Decimal(1.0).plus(massiveLvl * 0.5);
      let targetIron = state.era3.ironYield.times(speedMult).times(massiveIronBonus);
      rates.carbonConsumption = targetIron.times(ironCost);
      rates.ironProduction = targetIron;
    }
  }

  // Pulsar Shards
  if (compactLvl > 0) {
    rates.pulsarShardsProduction = new Decimal(compactLvl).times(0.01);
  }

  return rates;
}
