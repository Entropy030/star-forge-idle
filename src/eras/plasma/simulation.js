/* global Decimal */
import { COSMIC_REGISTRY } from '../../config/registry.js';
import { getMilestoneMultiplier } from '../../core/economy.js';

function processRecipe(state, dt, recipe) {
  let { inputs, outputs, capacities, catalysts, conditions } = recipe;
  
  // 1. Check conditions
  if (conditions) {
    for (let c of conditions) {
      if (!c(state)) return false;
    }
  }

  // 2. Determine processing rate based on capacities and catalysts
  let baseRate = new Decimal(1);
  if (capacities) {
    for (const [key, calc] of Object.entries(capacities)) {
      baseRate = baseRate.times(calc(state));
    }
  }

  if (baseRate.lte(0)) return false;
  
  let processingAmount = baseRate.times(dt);

  // 3. Limit by available inputs
  if (inputs) {
    for (const [resKey, amountPerTick] of Object.entries(inputs)) {
      let available = state.resources[resKey]?.amount || new Decimal(0);
      let needed = new Decimal(amountPerTick).times(processingAmount);
      
      if (needed.gt(available)) {
        // Limit processing amount to what's available
        let possibleFactor = available.div(needed);
        processingAmount = processingAmount.times(possibleFactor);
      }
    }
  }
  
  if (processingAmount.lte(0)) return false;

  // 4. Consume inputs
  if (inputs) {
    for (const [resKey, amountPerTick] of Object.entries(inputs)) {
      let consumed = new Decimal(amountPerTick).times(processingAmount);
      state.resources[resKey].amount = state.resources[resKey].amount.minus(consumed);
    }
  }

  // 5. Produce outputs
  if (outputs) {
    for (const [resKey, amountPerTick] of Object.entries(outputs)) {
      let produced = new Decimal(amountPerTick).times(processingAmount);
      if (!state.resources[resKey]) {
         state.resources[resKey] = { amount: new Decimal(0) };
      }
      state.resources[resKey].amount = state.resources[resKey].amount.plus(produced);
    }
  }

  return true;
}

export function simulatePlasmaEra(state, dt) {
  let anyChanged = false;
  
  state.cosmicAge = (state.cosmicAge || new Decimal(0)).plus(dt);

  // Define Recipe: Surviving Matter -> Quarks & Leptons
  let qcLevel = state.upgrades.plasma.quarkCondenser?.level || 0;
  if (qcLevel > 0) {
    let mult = getMilestoneMultiplier(qcLevel);
    let recipe = {
      inputs: { survivingMatter: 2 },
      outputs: { quarks: 2, leptons: 1 }, // simplified output ratios
      capacities: {
        condenser: () => new Decimal(qcLevel).times(mult)
      }
    };
    if (processRecipe(state, dt, recipe)) anyChanged = true;
  }

  // Define Recipe: Quarks -> Protons/Neutrons
  let synthLevel = state.upgrades.plasma.plasmaAutomation?.level || 0;
  if (synthLevel > 0) {
    let mult = getMilestoneMultiplier(synthLevel);
    let recipe = {
      inputs: { quarks: 3 }, // 3 quarks make a baryon
      outputs: { protons: 1 },
      capacities: {
        synthesizer: () => new Decimal(synthLevel).times(mult).times(2)
      }
    };
    if (processRecipe(state, dt, recipe)) anyChanged = true;
  }

  // Define Recipe: Leptons -> Electrons
  let harvestLevel = state.upgrades.plasma.leptonHarvest?.level || 0;
  if (harvestLevel > 0 && state.plasmaTemperature.lt(500000)) {
    let mult = getMilestoneMultiplier(harvestLevel);
    let recipe = {
      inputs: { leptons: 1 },
      outputs: { electrons: 1 },
      capacities: {
        harvester: () => new Decimal(harvestLevel).times(mult).times(5)
      },
      conditions: [
        (s) => s.plasmaTemperature.lt(500000)
      ]
    };
    if (processRecipe(state, dt, recipe)) anyChanged = true;
  }
  
  // Cooling
  let radiatorLevel = state.upgrades.plasma.baryoRadiator?.level || 0;
  if (radiatorLevel > 0) {
    let recipe = {
      inputs: { protons: 2 },
      capacities: {
        radiator: () => new Decimal(radiatorLevel)
      },
      outputs: {} 
    };
    
    let inputsAvailable = state.resources.protons?.amount.gte(new Decimal(2).times(radiatorLevel).times(dt));
    let possibleProcessing = inputsAvailable ? 1.0 : state.resources.protons?.amount.div(new Decimal(2).times(radiatorLevel).times(dt)).toNumber() || 0;
    
    if (possibleProcessing > 0) {
        state.resources.protons.amount = state.resources.protons.amount.minus(new Decimal(2).times(radiatorLevel).times(dt).times(possibleProcessing));
        let coolingRate = new Decimal(7500).times(radiatorLevel).times(dt).times(possibleProcessing);
        state.plasmaTemperature = Decimal.max(300, state.plasmaTemperature.minus(coolingRate));
        anyChanged = true;
    }
  }

  // Recombination: Protons + Electrons -> Hydrogen (happens when temperature < 100,000 K)
  if (state.plasmaTemperature.lt(100000)) {
    // Passive process, no upgrade needed, just depends on temperature drop.
    // The cooler it gets, the faster recombination happens.
    let tempFactor = Decimal.max(1, new Decimal(100000).minus(state.plasmaTemperature).div(10000));
    
    let recipe = {
      inputs: { protons: 1, electrons: 1 },
      outputs: { hydrogen: 1 },
      capacities: {
        recombination: () => tempFactor.times(2)
      },
      conditions: [
        (s) => s.plasmaTemperature.lt(100000)
      ]
    };
    if (processRecipe(state, dt, recipe)) anyChanged = true;
  }

  return { changed: anyChanged };
}
