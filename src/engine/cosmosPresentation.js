import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getCompressionHeatYield, getMilestoneMultiplier } from '../core/economy.js';
import { getInflationEligibility } from '../eras/quantum/inflation.js';
import { computePlasmaStep } from '../eras/plasma/evaluator.js';
import { getRecombinationEligibility } from '../eras/plasma/eligibility.js';
import { getGalacticIgnitionEligibility, getSupernovaEligibility } from '../eras/stellar/selectors.js';

const ZERO = new Decimal(0);

function amount(state, key) {
  return state.resources?.[key]?.amount || ZERO;
}

function level(state, category, key) {
  return state.upgrades?.[category]?.[key]?.level || 0;
}

function getEraOnePresentation(state) {
  const qf = amount(state, 'quantumFluctuations');
  const passiveActive = Object.values(state.upgrades?.quantum || {}).some(upgrade => (upgrade?.level || 0) > 0);
  const inflationRelevant = (state.era1?.currentAct || 1) >= 2 || state.discoveries?.has?.('qf_100') || qf.gte(100);
  const eligibility = getInflationEligibility(state);
  const readyCount = eligibility.requirements.filter(requirement => requirement.met).length;
  const bottleneck = eligibility.requirements.find(requirement => !requirement.met) || null;

  return {
    epoch: 1,
    mode: inflationRelevant ? 'inflation' : passiveActive ? 'formation' : 'observation',
    primary: inflationRelevant ? {
      eyebrow: 'Inflation preparation',
      title: eligibility.isEligible ? 'Spacetime is ready to expand' : 'Prepare Cosmic Inflation',
      summary: eligibility.isEligible
        ? 'All three requirements are satisfied. Inflation is now the primary action.'
        : `Current bottleneck: ${bottleneck.label}.`,
      progress: { current: readyCount, target: eligibility.requirements.length, label: `${readyCount} of ${eligibility.requirements.length} requirements ready` },
      checks: eligibility.requirements,
      ready: eligibility.isEligible,
      mode: 'all'
    } : null,
    core: {
      eyebrow: passiveActive ? 'Forming universe' : 'Observation point',
      title: passiveActive ? 'Fundamental laws are taking over' : 'Observe the quantum void',
      instruction: passiveActive
        ? 'The Core now reflects the state of the forming universe. Observation remains optional support.'
        : 'Interact with the Core to collapse a fluctuation into existence.',
      ariaLabel: passiveActive
        ? 'Forming universe core. Interact to add a supporting quantum fluctuation.'
        : 'Observe the quantum core and collect one Quantum Fluctuation.'
    },
    process: passiveActive && !inflationRelevant ? {
      eyebrow: 'Current process',
      title: 'Passive law generation',
      summary: 'Constructed fundamental laws now sustain production without continuous observation.',
      nodes: [
        { role: 'State', label: 'Passive generation', value: 'Active', state: 'active' },
        { role: 'Core role', label: 'Universe state', value: 'Supportive', state: 'support' }
      ]
    } : null,
    transition: {
      type: 'inflation',
      visible: inflationRelevant,
      ready: eligibility.isEligible
    },
    elementFocus: { carbonVisible: false, ironVisible: false }
  };
}

function getProtonBottleneck(state, step) {
  const synthesizerLevel = level(state, 'plasma', 'plasmaAutomation');
  const theoreticalRate = new Decimal(synthesizerLevel).times(getMilestoneMultiplier(synthesizerLevel));
  const actualRate = step.throughput.protonSynthesizer;
  if (synthesizerLevel === 0 || actualRate.gte(theoreticalRate)) {
    return { label: 'Inputs supplied', resource: null, actualRate, theoreticalRate };
  }

  const quarkSupply = amount(state, 'quarks').plus(step.throughput.quarkCondenser);
  const gluonSupply = amount(state, 'gluons').plus(step.throughput.gluonBinding);
  const quarkCapacity = quarkSupply.div(3);
  const gluonCapacity = gluonSupply;
  const resource = quarkCapacity.lte(gluonCapacity) ? 'Quarks' : 'Gluons';

  return { label: `${resource} are limiting Proton synthesis`, resource, actualRate, theoreticalRate };
}

function getEraTwoPresentation(state) {
  const step = computePlasmaStep(state, 1);
  const eligibility = getRecombinationEligibility(state);
  const condenserLevel = level(state, 'plasma', 'quarkCondenser');
  const gluonLevel = level(state, 'plasma', 'gluonBinding');
  const synthesizerLevel = level(state, 'plasma', 'plasmaAutomation');
  const radiatorLevel = level(state, 'plasma', 'baryoRadiator');
  const coolingRelevant = radiatorLevel > 0 || state.plasmaTemperature.lte(500000) || eligibility.isEligible;
  const protonPhase = synthesizerLevel > 0 || amount(state, 'protons').gt(0);
  const gluonPhase = gluonLevel > 0 || condenserLevel >= 3;

  if (coolingRelevant) {
    const checks = [
      { id: 'proton-route', label: 'Proton accumulation', current: eligibility.protons, target: new Decimal(eligibility.protonThreshold), met: eligibility.protonReady },
      { id: 'temperature-route', label: 'Plasma cooling', current: eligibility.temperature, target: new Decimal(eligibility.temperatureThreshold), unit: 'K', met: eligibility.temperatureReady, comparison: 'lte' }
    ];
    let satisfiedVia = null;
    if (eligibility.protonReady && eligibility.temperatureReady) satisfiedVia = 'both routes';
    else if (eligibility.protonReady) satisfiedVia = 'Proton accumulation';
    else if (eligibility.temperatureReady) satisfiedVia = 'Plasma cooling';

    let process;
    if (state.plasmaTemperature.lt(100000)) {
      const protonDelta = step.deltas.protons;
      const electronDelta = step.deltas.electrons;
      const limiting = amount(state, 'protons').lte(amount(state, 'electrons')) ? 'Protons' : 'Electrons';
      process = {
        eyebrow: 'Current process',
        title: 'Atomic recombination',
        summary: 'Protons and Electrons combine in the cooled plasma to form Hydrogen.',
        bottleneck: step.throughput.recombination.gt(0) ? null : `${limiting} are limiting Hydrogen formation.`,
        nodes: [
          { role: 'Input', label: 'Protons', value: protonDelta.lt(0) ? 'Consumed' : 'Available', state: protonDelta.lt(0) ? 'consumed' : 'support' },
          { role: 'Input', label: 'Electrons', value: electronDelta.lt(0) ? 'Consumed' : 'Available', state: electronDelta.lt(0) ? 'consumed' : 'support' },
          { role: 'Process', label: 'Recombination', value: step.throughput.recombination, unit: '/s', state: step.throughput.recombination.gt(0) ? 'active' : 'blocked' },
          { role: 'Output', label: 'Hydrogen', value: step.deltas.hydrogen, unit: '/s', state: step.deltas.hydrogen.gt(0) ? 'active' : 'blocked' }
        ]
      };
    } else if (state.plasmaTemperature.lt(500000)) {
      process = {
        eyebrow: 'Current process',
        title: 'Lepton decay',
        summary: 'Below 500,000 K, collected Leptons convert into Electrons.',
        bottleneck: step.throughput.leptonDecay.gt(0) ? null : 'Leptons are required for Electron formation.',
        nodes: [
          { role: 'Input', label: 'Leptons', value: step.throughput.leptonDecay.gt(0) ? 'Available' : 'Starved', state: step.throughput.leptonDecay.gt(0) ? 'support' : 'blocked' },
          { role: 'Process', label: 'Decay', value: step.throughput.leptonDecay, unit: '/s', state: step.throughput.leptonDecay.gt(0) ? 'active' : 'blocked' },
          { role: 'Output', label: 'Electrons', value: step.deltas.electrons, unit: '/s', state: step.deltas.electrons.gt(0) ? 'active' : 'blocked' }
        ]
      };
    } else {
      process = {
        eyebrow: 'Current process',
        title: 'Radiative plasma cooling',
        summary: 'The Baryogenesis Radiator consumes Protons to lower Plasma Temperature.',
        bottleneck: step.cooling.gt(0) ? null : 'Protons are required to sustain cooling.',
        nodes: [
          { role: 'Input', label: 'Protons', value: step.throughput.baryoRadiator.gt(0) ? '2 per cycle' : 'Starved', state: step.throughput.baryoRadiator.gt(0) ? 'consumed' : 'blocked' },
          { role: 'Process', label: 'Radiator', value: step.throughput.baryoRadiator, unit: ' cycles/s', state: step.throughput.baryoRadiator.gt(0) ? 'active' : 'blocked' },
          { role: 'Result', label: 'Cooling', value: step.cooling.times(-1), unit: ' K/s', state: step.cooling.gt(0) ? 'active' : 'blocked' }
        ]
      };
    }

    return {
      epoch: 2,
      mode: 'recombination',
      primary: {
        eyebrow: 'Recombination readiness',
        title: eligibility.isEligible ? 'Cosmic Recombination is ready' : 'Reach either transition route',
        summary: eligibility.isEligible
          ? `Requirement satisfied via ${satisfiedVia}.`
          : 'Accumulate enough Protons OR cool the Plasma to 3,000 K.',
        progress: { current: checks.filter(check => check.met).length, target: 1, label: eligibility.isEligible ? 'One transition route satisfied' : 'Either route completes readiness' },
        checks,
        ready: eligibility.isEligible,
        mode: 'any'
      },
      core: {
        eyebrow: 'Matter formation',
        title: 'The plasma is resolving into particles',
        instruction: 'The Core represents the active particle network and its thermal state.',
        ariaLabel: 'Primordial plasma core. Interact to gather Quarks and Gluons.'
      },
      process,
      transition: { type: 'recombination', visible: true, ready: eligibility.isEligible, satisfiedVia },
      elementFocus: { carbonVisible: false, ironVisible: false }
    };
  }

  if (protonPhase) {
    const bottleneck = getProtonBottleneck(state, step);
    return {
      epoch: 2,
      mode: 'proton-synthesis',
      primary: {
        eyebrow: 'Matter production',
        title: 'Proton synthesis is active',
        summary: bottleneck.resource ? bottleneck.label : 'Quark and Gluon inputs are sustaining Proton output.',
        value: step.throughput.protonSynthesizer,
        unit: 'Proton/s',
        ready: !bottleneck.resource
      },
      core: {
        eyebrow: 'Particle synthesis',
        title: 'The plasma is assembling stable matter',
        instruction: 'The Core now reflects input supply and Proton throughput.',
        ariaLabel: 'Primordial plasma core. Interact to gather Quarks and Gluons.'
      },
      process: {
        eyebrow: 'Current process',
        title: 'Proton synthesis',
        summary: 'Three Quarks and one Gluon are consumed for each Proton.',
        bottleneck: bottleneck.resource ? bottleneck.label : null,
        nodes: [
          { role: 'Input', label: 'Quarks', value: '3 per Proton', state: bottleneck.resource === 'Quarks' ? 'blocked' : 'support' },
          { role: 'Input', label: 'Gluons', value: '1 per Proton', state: bottleneck.resource === 'Gluons' ? 'blocked' : 'support' },
          { role: 'Process', label: 'Proton Synthesizer', value: step.throughput.protonSynthesizer, unit: '/s', state: step.throughput.protonSynthesizer.gt(0) ? 'active' : 'blocked' },
          { role: 'Output', label: 'Protons', value: step.deltas.protons, unit: '/s net', state: step.deltas.protons.gt(0) ? 'active' : 'blocked' }
        ]
      },
      transition: { type: 'recombination', visible: false, ready: false },
      elementFocus: { carbonVisible: false, ironVisible: false }
    };
  }

  return {
    epoch: 2,
    mode: gluonPhase ? 'matter-production' : 'quark-condensation',
    primary: {
      eyebrow: 'Matter production',
      title: gluonPhase ? 'Quarks and Gluons are forming in parallel' : 'Establish Quark production',
      summary: gluonPhase
        ? 'Build both particle inputs before introducing Proton synthesis.'
        : 'Quark condensation is the first stable production process.',
      ready: condenserLevel > 0
    },
    core: {
      eyebrow: 'Primordial plasma',
      title: 'Matter is emerging from the hot plasma',
      instruction: 'The Core represents particle formation; interaction supplies early Quarks and Gluons.',
      ariaLabel: 'Primordial plasma core. Interact to gather Quarks and Gluons.'
    },
    process: {
      eyebrow: 'Current process',
      title: 'Foundational particle production',
      summary: gluonPhase
        ? 'Quark condensation and Gluon synthesis operate as parallel sources.'
        : 'Quark condensation is active. Gluon synthesis remains hidden until the chain reaches it.',
      nodes: [
        { role: 'Production', label: 'Quark condensation', value: step.throughput.quarkCondenser, unit: '/s', state: step.throughput.quarkCondenser.gt(0) ? 'active' : 'blocked' },
        ...(gluonPhase ? [{ role: 'Production', label: 'Gluon synthesis', value: step.throughput.gluonBinding, unit: '/s', state: step.throughput.gluonBinding.gt(0) ? 'active' : 'blocked' }] : [])
      ]
    },
    transition: { type: 'recombination', visible: false, ready: false },
    elementFocus: { carbonVisible: false, ironVisible: false }
  };
}

export function getNextStellarThreshold(state) {
  const temperature = state.era3?.temperature || ZERO;
  const thresholds = [
    { id: 'main-sequence', label: 'Main Sequence', value: new Decimal(COSMIC_REGISTRY.constants.mainSequenceTempThreshold) },
    { id: 'carbon', label: 'Carbon synthesis', value: new Decimal(COSMIC_REGISTRY.resources.carbon.unlockTemp) },
    { id: 'iron', label: 'Iron synthesis', value: new Decimal(COSMIC_REGISTRY.resources.iron.unlockTemp) }
  ];
  if ((state.era3?.ironYield || ZERO).gt(0)) {
    thresholds.push({ id: 'supernova', label: 'Supernova threshold', value: new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold) });
    thresholds.sort((a, b) => a.value.cmp(b.value));
  }
  return thresholds.find(threshold => temperature.lt(threshold.value)) || null;
}

function getEraThreeAction(state, supernovaEligibility) {
  if (supernovaEligibility.canTrigger) {
    return {
      kind: 'view',
      id: 'prestige',
      label: 'Review repeatable Supernova in Legacy',
      effect: 'Reset this stellar run and claim remnant rewards.',
      enabled: true
    };
  }
  if (state.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) && state.era3.ironYield.eq(0)) {
    return { kind: 'view', id: 'upgrades', label: 'Open Forge · Unlock Iron Fusion', effect: 'Turn Carbon into the final stellar element.', enabled: true };
  }
  if (state.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp) && state.era3.carbonYield.eq(0)) {
    return { kind: 'view', id: 'upgrades', label: 'Open Forge · Unlock Carbon Fusion', effect: 'Turn Helium into a heavy-element pathway.', enabled: true };
  }
  if (state.era3.gravity.lte(1)) {
    return {
      kind: 'core-node',
      id: 'gravity',
      label: 'Strengthen Gravity',
      cost: state.era3.gravityCost,
      currency: 'Hydrogen',
      effect: 'Increase stellar gravity and Hydrogen generation.',
      enabled: amount(state, 'hydrogen').gte(state.era3.gravityCost)
    };
  }
  if (state.era3.fusionYield.eq(0)) {
    return {
      kind: 'core-node',
      id: 'fuser',
      label: 'Ignite Fusion',
      cost: state.era3.fuserCostHydrogen,
      currency: 'Hydrogen',
      effect: 'Unlock Hydrogen-to-Helium fusion.',
      enabled: amount(state, 'hydrogen').gte(state.era3.fuserCostHydrogen)
    };
  }
  return {
    kind: 'core-node',
    id: 'compress',
    label: 'Compress Core',
    cost: state.era3.compressCost,
    currency: 'Helium',
    effect: `Raise Core Temperature by ${getCompressionHeatYield(state).toString()} K.`,
    enabled: amount(state, 'helium').gte(state.era3.compressCost)
  };
}

function getEraThreePresentation(state) {
  const temperature = state.era3?.temperature || ZERO;
  const nextThreshold = getNextStellarThreshold(state);
  const supernovaEligibility = getSupernovaEligibility(state);
  const ignitionEligibility = getGalacticIgnitionEligibility(state);
  const action = getEraThreeAction(state, supernovaEligibility);
  const carbonVisible = temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp) || state.era3.carbonYield.gt(0) || amount(state, 'carbon').gt(0);
  const ironVisible = temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) || state.era3.ironYield.gt(0) || amount(state, 'iron').gt(0);
  const gatewayVisible = state.era3.stage === 'Main Sequence Star' && ironVisible;

  return {
    epoch: 3,
    mode: supernovaEligibility.canTrigger ? 'supernova-ready' : state.era3.stage === 'Main Sequence Star' ? 'stellar-progression' : 'protostar',
    primary: {
      eyebrow: 'Primary progression',
      title: 'Core Temperature',
      value: temperature,
      unit: 'K',
      summary: nextThreshold
        ? `Next: ${nextThreshold.label}. Temperature is stable between direct actions.`
        : 'All known thermal thresholds have been reached.',
      progress: nextThreshold ? { current: temperature, target: nextThreshold.value, label: `Progress toward ${nextThreshold.label}` } : null,
      threshold: nextThreshold,
      ready: !nextThreshold
    },
    core: {
      eyebrow: state.era3.stage,
      title: state.era3.stage === 'Main Sequence Star' ? 'A sustained stellar object' : 'A protostar under construction',
      instruction: 'The Core represents stellar state, temperature, and compression response.',
      ariaLabel: `Stellar Core at ${temperature.toString()} Kelvin. Interact to add direct heat.`
    },
    process: {
      eyebrow: supernovaEligibility.canTrigger ? 'Current stellar decision' : 'Current stellar action',
      title: action.label,
      summary: action.effect,
      nodes: [
        { role: 'State', label: state.era3.stage, value: nextThreshold ? `Toward ${nextThreshold.label}` : 'Thermally complete', state: 'support' }
      ],
      action
    },
    transition: {
      type: 'galactic-ignition',
      visible: gatewayVisible,
      ready: ignitionEligibility.isEligible,
      requirements: ignitionEligibility.requirements
    },
    resetSemantics: {
      supernova: {
        available: supernovaEligibility.canTrigger,
        repeatable: true,
        location: 'Legacy',
        resets: 'Current stellar run',
        gains: 'Remnant and meta rewards',
        advancesEra: false
      },
      galacticIgnition: {
        available: ignitionEligibility.isEligible,
        repeatable: false,
        location: 'Cosmos',
        resets: 'No repeatable remnant reset',
        gains: 'Permanent access to Era IV',
        advancesEra: true
      }
    },
    elementFocus: { carbonVisible, ironVisible }
  };
}

export function getCosmosPresentation(state) {
  if (!state) return { epoch: 0, mode: 'empty', primary: null, core: null, process: null, transition: { visible: false } };
  if (state.activeEpoch === 1) return getEraOnePresentation(state);
  if (state.activeEpoch === 2) return getEraTwoPresentation(state);
  if (state.activeEpoch === 3) return getEraThreePresentation(state);
  return {
    epoch: state.activeEpoch,
    mode: 'later-era',
    primary: null,
    core: null,
    process: null,
    transition: { visible: false },
    elementFocus: { carbonVisible: false, ironVisible: false }
  };
}
