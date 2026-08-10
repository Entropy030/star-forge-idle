/* global Decimal */
import { getEnergyDensityRate, getQuantumFluctuationRate } from '../../core/economy.js';
import { getInflationEligibility } from './inflation.js';

export { getInflationEligibility };

export function getQuantumUpgradeEligibility(state, upgradeId) {
  const maxQF = state.stats?.maxQF || new Decimal(0);
  const getLevel = (id) => state.upgrades?.quantum?.[id]?.level || 0;

  switch (upgradeId) {
    case 'gravityForce':
      return { unlocked: true };
    case 'weakForce':
      return { unlocked: maxQF.gte(100) && getLevel('gravityForce') >= 5 };
    case 'electromagneticForce':
      return { unlocked: maxQF.gte(500) && getLevel('weakForce') >= 5 };
    case 'vacuumResonance':
      return { unlocked: maxQF.gte(2500) && getLevel('electromagneticForce') >= 5 };
    case 'strongForce':
      return { unlocked: maxQF.gte(10000) && getLevel('vacuumResonance') >= 5 };
    default:
      return { unlocked: true };
  }
}



export function getQuantumRates(state) {
  let rates = {
    fluctuationsProduction: getQuantumFluctuationRate(state),
    densityProduction: getEnergyDensityRate(state),
    matterGen: new Decimal(0),
    antimatterGen: new Decimal(0),
    annihilationEnergyProduction: new Decimal(0),
    survivingMatterProduction: new Decimal(0)
  };

  let asymmetryBias = state.era1?.asymmetryBias !== undefined ? state.era1.asymmetryBias : 0.5;
  let baseGeneration = state.resources.energyDensity.amount.log10();
  
  if (baseGeneration > 0) {
    let matterGen = new Decimal(baseGeneration).times(asymmetryBias);
    let antimatterGen = new Decimal(baseGeneration).times(1 - asymmetryBias);
    
    let annihilationAmt = Decimal.min(matterGen, antimatterGen);
    let survivingMatter = matterGen.minus(annihilationAmt);
    
    rates.matterGen = matterGen;
    rates.antimatterGen = antimatterGen;
    
    if (annihilationAmt.gt(0)) {
      rates.annihilationEnergyProduction = annihilationAmt.times(10);
    }
    
    if (survivingMatter.gt(0)) {
      rates.survivingMatterProduction = survivingMatter;
    }
  }

  return rates;
}

