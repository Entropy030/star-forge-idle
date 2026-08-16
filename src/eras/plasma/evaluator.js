/* global Decimal */
import { getMilestoneMultiplier } from '../../core/economy.js';
import { getPostureProfile } from './constants.js';

export function computePlasmaStep(state, dt) {
  let delta = new Decimal(dt);
  const posture = state.era2?.posture || 'BALANCE';
  const profile = getPostureProfile(posture);
  const particleFlux = profile.particleFlux;
  const coolingMult = profile.coolingMult;
  const bindingMult = profile.bindingMult;
  
  let result = {
    deltas: {
      quarks: new Decimal(0),
      gluons: new Decimal(0),
      leptons: new Decimal(0),
      protons: new Decimal(0),
      electrons: new Decimal(0),
      hydrogen: new Decimal(0)
    },
    cooling: new Decimal(0),
    throughput: {
      quarkCondenser: new Decimal(0),
      gluonBinding: new Decimal(0),
      leptonHarvest: new Decimal(0),
      protonSynthesizer: new Decimal(0),
      baryoRadiator: new Decimal(0),
      leptonDecay: new Decimal(0),
      recombination: new Decimal(0)
    }
  };

  // Recipe 1: Quark Condenser (Passive raw Quarks generation, modulated by particleFlux)
  let qcLevel = state.upgrades.plasma.quarkCondenser?.level || 0;
  if (qcLevel > 0) {
    let mult = getMilestoneMultiplier(qcLevel);
    let baseRate = new Decimal(qcLevel).times(mult).times(particleFlux);
    let produced = baseRate.times(2).times(delta);
    result.deltas.quarks = result.deltas.quarks.plus(produced);
    result.throughput.quarkCondenser = baseRate.times(2);
  }

  // Recipe 2: Gluon Matrix Synthesis (Passive raw Gluons generation, modulated by particleFlux)
  let gmLevel = state.upgrades.plasma.gluonBinding?.level || 0;
  if (gmLevel > 0) {
    let mult = getMilestoneMultiplier(gmLevel);
    let baseRate = new Decimal(gmLevel).times(mult).times(particleFlux);
    let produced = baseRate.times(1.5).times(delta);
    result.deltas.gluons = result.deltas.gluons.plus(produced);
    result.throughput.gluonBinding = baseRate.times(1.5);
  }

  // Recipe 3: Lepton Collector (Passive raw Leptons generation, modulated by particleFlux)
  let lcLevel = state.upgrades.plasma.leptonHarvest?.level || 0;
  if (lcLevel > 0) {
    let mult = getMilestoneMultiplier(lcLevel);
    let baseRate = new Decimal(lcLevel).times(mult).times(particleFlux);
    let produced = baseRate.times(1).times(delta);
    result.deltas.leptons = result.deltas.leptons.plus(produced);
    result.throughput.leptonHarvest = baseRate.times(1);
  }

  // Recipe 4: Proton Synthesizer (Hadron binding capacity, modulated by bindingMult)
  let synthLevel = state.upgrades.plasma.plasmaAutomation?.level || 0;
  if (synthLevel > 0) {
    let mult = getMilestoneMultiplier(synthLevel);
    let baseRate = new Decimal(synthLevel).times(mult).times(1).times(bindingMult); // 1 Proton per sec per level baseline * bindingMult
    let maxProtons = baseRate.times(delta);
    
    // Inputs: 3 Quarks, 1 Gluon per 1 Proton
    let quarksAvailable = (state.resources.quarks?.amount || new Decimal(0)).plus(result.deltas.quarks);
    let gluonsAvailable = (state.resources.gluons?.amount || new Decimal(0)).plus(result.deltas.gluons);

    let maxByQuarks = quarksAvailable.div(3);
    let maxByGluons = gluonsAvailable.div(1);
    
    let actualProtons = Decimal.min(maxProtons, Decimal.min(maxByQuarks, maxByGluons));
    
    if (actualProtons.gt(0)) {
      result.deltas.quarks = result.deltas.quarks.minus(actualProtons.times(3));
      result.deltas.gluons = result.deltas.gluons.minus(actualProtons.times(1));
      result.deltas.protons = result.deltas.protons.plus(actualProtons);
      
      // HUD represents actual throughput achieved this tick divided by dt
      result.throughput.protonSynthesizer = actualProtons.div(delta);
    }
  }

  // Recipe 5: Lepton Decay (Lepton decay capacity rate, modulated by bindingMult)
  // Base rule: 1 Lepton -> 1 Electron per sec per Collector Level (or at least 1/s if unlocked)
  if (state.plasmaTemperature && state.plasmaTemperature.lt(500000)) {
    let decayCapacityRate = new Decimal(Decimal.max(1, lcLevel)).times(bindingMult);
    let maxDecay = decayCapacityRate.times(delta);
    let leptonsAvailable = (state.resources.leptons?.amount || new Decimal(0)).plus(result.deltas.leptons);
    
    let actualDecay = Decimal.min(maxDecay, leptonsAvailable);
    
    if (actualDecay.gt(0)) {
      result.deltas.leptons = result.deltas.leptons.minus(actualDecay);
      result.deltas.electrons = result.deltas.electrons.plus(actualDecay);
      result.throughput.leptonDecay = actualDecay.div(delta);
    }
  }

  // Recipe 6: Baryogenesis Radiator (Consumes Protons for Cooling, modulated by coolingMult)
  let radiatorLevel = state.upgrades.plasma.baryoRadiator?.level || 0;
  if (radiatorLevel > 0) {
    let baseRate = new Decimal(radiatorLevel); // 2 protons/s per level
    let maxCycles = baseRate.times(delta);
    
    let protonsAvailable = (state.resources.protons?.amount || new Decimal(0)).plus(result.deltas.protons);
    let maxByProtons = protonsAvailable.div(2);
    
    let actualCycles = Decimal.min(maxCycles, maxByProtons);
    
    if (actualCycles.gt(0)) {
      result.deltas.protons = result.deltas.protons.minus(actualCycles.times(2));
      let coolingDone = actualCycles.times(7500).times(coolingMult);
      result.cooling = coolingDone;
      result.throughput.baryoRadiator = actualCycles.div(delta);
    }
  }

  // Recipe 7: Recombination (Passive Protons + Electrons -> Hydrogen when Temp < 100k, modulated by bindingMult)
  if (state.plasmaTemperature && state.plasmaTemperature.lt(100000)) {
    let tempFactor = Decimal.max(1, new Decimal(100000).minus(state.plasmaTemperature).div(10000));
    let baseRate = tempFactor.times(2).times(bindingMult); // 2 per sec base * bindingMult
    let maxRecomb = baseRate.times(delta);

    let protonsAvailable = (state.resources.protons?.amount || new Decimal(0)).plus(result.deltas.protons);
    let electronsAvailable = (state.resources.electrons?.amount || new Decimal(0)).plus(result.deltas.electrons);

    let actualRecomb = Decimal.min(maxRecomb, Decimal.min(protonsAvailable, electronsAvailable));
    
    if (actualRecomb.gt(0)) {
      result.deltas.protons = result.deltas.protons.minus(actualRecomb);
      result.deltas.electrons = result.deltas.electrons.minus(actualRecomb);
      result.deltas.hydrogen = result.deltas.hydrogen.plus(actualRecomb);
      result.throughput.recombination = actualRecomb.div(delta);
    }
  }

  return result;
}
