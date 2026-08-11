import { getInflationEligibility } from '../eras/quantum/inflation.js';
import { getRecombinationEligibility } from '../eras/plasma/eligibility.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility } from '../eras/stellar/selectors.js';

export const OBJECTIVE_DEFINITIONS = [
  {
    id: 'obj_qf_intro',
    epoch: 1,
    title: 'Initialize Core',
    instruction: 'Gather 50 Quantum Fluctuations.',
    explanation: 'The void is unstable. Extract fluctuations to begin.',
    target: 50,
    getCurrent: (state) => state.stats.maxQF ? state.stats.maxQF.toNumber() : 0
  },
  {
    id: 'obj_upgrade_gravity',
    epoch: 1,
    title: 'Establish Gravity',
    instruction: 'Purchase Gravitational Coupling.',
    explanation: 'Generate passive quantum fluctuations to sustain the core.',
    target: 1,
    getCurrent: (state) => state.upgrades.quantum.gravityForce.level
  },
  {
    id: 'obj_density_intro',
    epoch: 1,
    title: 'Synthesize Density',
    instruction: 'Accumulate 10,000 Energy Density.',
    explanation: 'Compress the vacuum to build internal heat and pressure.',
    target: 10000,
    getCurrent: (state) => state.resources.energyDensity.amount.toNumber()
  },
  {
    id: 'obj_era1_complete',
    epoch: 1,
    title: 'Trigger Cosmic Inflation',
    instruction: 'Initiate Cosmic Inflation.',
    target: 1,
    getCurrent: (state) => getInflationEligibility(state).isEligible ? 1 : 0,
    isComplete: (state) => state.activeEpoch > 1
  },
  {
    id: 'obj_era2_quarks',
    epoch: 2,
    title: 'Condense Quarks',
    instruction: 'Purchase a Quark Condenser.',
    target: 1,
    getCurrent: (state) => state.upgrades.plasma.quarkCondenser.level
  },
  {
    id: 'obj_era2_gluons',
    epoch: 2,
    title: 'Bind the Plasma',
    instruction: 'Purchase Gluon Matrix Synthesis.',
    target: 1,
    getCurrent: (state) => state.upgrades.plasma.gluonBinding.level
  },
  {
    id: 'obj_era2_leptons',
    epoch: 2,
    title: 'Collect Leptons',
    instruction: 'Purchase a Lepton Collector.',
    target: 1,
    getCurrent: (state) => state.upgrades.plasma.leptonHarvest.level
  },
  {
    id: 'obj_era2_protons',
    epoch: 2,
    title: 'Synthesize Protons',
    instruction: 'Purchase a Proton Synthesizer.',
    target: 1,
    getCurrent: (state) => state.upgrades.plasma.plasmaAutomation.level
  },
  {
    id: 'obj_era2_cooling',
    epoch: 2,
    title: 'Cool the Plasma',
    instruction: 'Purchase a Baryogenesis Radiator.',
    target: 1,
    getCurrent: (state) => (
      state.upgrades.plasma.baryoRadiator.level > 0 || getRecombinationEligibility(state).isEligible
    ) ? 1 : 0
  },
  {
    id: 'obj_era2_complete',
    epoch: 2,
    title: 'Initiate Recombination',
    instruction: 'Initiate Cosmic Recombination.',
    target: 1,
    getCurrent: (state) => getRecombinationEligibility(state).isEligible ? 1 : 0,
    isComplete: (state) => state.activeEpoch > 2
  },
  {
    id: 'obj_era3_gravity',
    epoch: 3,
    title: 'Strengthen Gravity',
    instruction: 'Strengthen the stellar gravity field.',
    target: 1,
    getCurrent: (state) => state.era3.gravity.gt(1) ? 1 : 0
  },
  {
    id: 'obj_era3_fusion',
    epoch: 3,
    title: 'Ignite Fusion',
    instruction: 'Unlock the Auto-Fuser.',
    target: 1,
    getCurrent: (state) => state.era3.fusionYield.gt(0) ? 1 : 0
  },
  {
    id: 'obj_era3_main_sequence',
    epoch: 3,
    title: 'Reach Main Sequence',
    instruction: 'Raise the Core to Main Sequence.',
    target: 1,
    getCurrent: (state) => state.era3.stage === 'Main Sequence Star' ? 1 : 0
  },
  {
    id: 'obj_era3_carbon',
    epoch: 3,
    title: 'Forge Carbon',
    instruction: 'Unlock Carbon Fusion.',
    target: 1,
    getCurrent: (state) => state.era3.carbonYield.gt(0) ? 1 : 0
  },
  {
    id: 'obj_era3_iron',
    epoch: 3,
    title: 'Forge Iron',
    instruction: 'Unlock Iron Fusion.',
    target: 1,
    getCurrent: (state) => state.era3.ironYield.gt(0) ? 1 : 0
  },
  {
    id: 'obj_era3_supernova',
    epoch: 3,
    title: 'Trigger Supernova',
    instruction: 'Trigger a Supernova collapse.',
    target: 1,
    getCurrent: (state) => getSupernovaEligibility(state).canTrigger ? 1 : 0,
    isComplete: (state) => state.stats.supernovas.gte(1)
  },
  {
    id: 'obj_era3_gateway',
    epoch: 3,
    title: 'Ignite the Galaxy',
    instruction: 'Trigger Galactic Ignition.',
    target: 1,
    getCurrent: (state) => getGalacticIgnitionEligibility(state).isEligible ? 1 : 0,
    isComplete: (state) => state.activeEpoch > 3
  }
];
