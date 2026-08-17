import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getVacuumCoherence, isInflationPreparationRelevant, isVacuumCoherenceRelevant } from '../eras/quantum/coherence.js';

const ZERO = new Decimal(0);

function amount(state, key) {
  return state.resources?.[key]?.amount || ZERO;
}

function currencyAmount(state, key) {
  return state.currencies?.[key]?.amount || ZERO;
}

function level(state, category, key) {
  return state.upgrades?.[category]?.[key]?.level || 0;
}

function hasDiscovery(state, id) {
  return Boolean(state.discoveries?.has?.(id));
}

function resource(id, label, value, options = {}) {
  return { id, label, value, ...options };
}

function getMetaResources() {
  // Persistent / meta currencies belong strictly to Legacy (D05, P5.2A),
  // keeping the current-run Resource HUD focused on physical universe state.
  return [];
}

function getEraOnePresentation(state) {
  const qf = amount(state, 'quantumFluctuations');
  const energyDensity = amount(state, 'energyDensity');
  const coherence = getVacuumCoherence(state);
  const densityIntroduced = energyDensity.gt(0) || level(state, 'quantum', 'gravityForce') > 0 || hasDiscovery(state, 'qf_10');
  const coherenceIntroduced = isVacuumCoherenceRelevant(state);
  const inflationIntroduced = isInflationPreparationRelevant(state);

  if (inflationIntroduced) {
    return {
      primary: [resource('quantumFluctuations', 'Quantum Fluctuations', qf, { roleHint: 'Threshold: 100,000' })],
      support: [
        resource('energyDensity', 'Energy Density', energyDensity, { roleHint: 'Threshold: 50,000' }),
        resource('coherence', 'Vacuum Coherence', coherence, {
          unit: '%',
          roleHint: 'Inflation target: 100%'
        })
      ],
      details: []
    };
  }

  return {
    primary: [resource('quantumFluctuations', 'Quantum Fluctuations', qf, { roleHint: 'Foundational currency' })],
    support: densityIntroduced
      ? [
          resource('energyDensity', 'Energy Density', energyDensity, { roleHint: 'Vacuum compression' }),
          ...(coherenceIntroduced ? [resource('coherence', 'Vacuum Coherence', coherence, { unit: '%', roleHint: 'Vacuum stability' })] : [])
        ]
      : [],
    details: []
  };
}

function getEraTwoPresentation(state) {
  const quarks = amount(state, 'quarks');
  const gluons = amount(state, 'gluons');
  const leptons = amount(state, 'leptons');
  const protons = amount(state, 'protons');
  const electrons = amount(state, 'electrons');
  const hydrogen = amount(state, 'hydrogen');
  const temperature = state.plasmaTemperature || ZERO;

  const gluonsIntroduced = level(state, 'plasma', 'gluonBinding') > 0 || level(state, 'plasma', 'quarkCondenser') >= 3;
  const leptonsIntroduced = level(state, 'plasma', 'leptonHarvest') > 0 || leptons.gt(0);
  const protonSynthesis = level(state, 'plasma', 'plasmaAutomation') > 0 || protons.gt(0);
  const coolingActive = level(state, 'plasma', 'baryoRadiator') > 0 || temperature.lte(500000);
  const electronsRelevant = temperature.lte(500000) || electrons.gt(0);

  if (coolingActive) {
    const support = [resource('protons', 'Protons', protons, { roleHint: 'Cooling fuel' })];
    if (electronsRelevant) support.push(resource('electrons', 'Electrons', electrons, { roleHint: 'Recombination input' }));

    const details = [
      resource('quarks', 'Quarks', quarks),
      resource('gluons', 'Gluons', gluons)
    ];
    if (leptonsIntroduced) details.push(resource('leptons', 'Leptons', leptons));
    if (hydrogen.gt(0)) details.push(resource('hydrogen', 'Hydrogen', hydrogen));

    return {
      primary: [resource('plasmaTemperature', 'Plasma Temperature', temperature, {
        unit: 'K',
        roleHint: temperature.lte(3000) ? 'Recombination temperature reached' : 'Cool toward 3,000 K'
      })],
      support,
      details
    };
  }

  if (protonSynthesis) {
    const details = [];
    if (leptonsIntroduced) details.push(resource('leptons', 'Leptons', leptons));
    if (electronsRelevant) details.push(resource('electrons', 'Electrons', electrons));

    return {
      primary: [resource('protons', 'Protons', protons, { roleHint: 'Synthesis output' })],
      support: [
        resource('quarks', 'Quarks', quarks, { roleHint: '3 per Proton' }),
        resource('gluons', 'Gluons', gluons, { roleHint: '1 per Proton' })
      ],
      details
    };
  }

  const details = [];
  if (leptonsIntroduced) details.push(resource('leptons', 'Leptons', leptons));

  return {
    primary: [resource('quarks', 'Quarks', quarks, { roleHint: 'Condensation currency' })],
    support: gluonsIntroduced ? [resource('gluons', 'Gluons', gluons, { roleHint: 'Binding input' })] : [],
    details
  };
}

function getCoreTemperatureRoleHint(temperature) {
  if (temperature.lt(COSMIC_REGISTRY.constants.mainSequenceTempThreshold)) {
    return 'Heat toward Main Sequence';
  }
  if (temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
    return 'Heat toward Carbon (500M K)';
  }
  if (temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
    return 'Heat toward Iron (2.00B K)';
  }
  return 'Collapse readiness';
}

function getEraThreePresentation(state) {
  const temperature = state.era3?.temperature || ZERO;
  const hydrogen = amount(state, 'hydrogen');
  const helium = amount(state, 'helium');
  const carbon = amount(state, 'carbon');
  const iron = amount(state, 'iron');
  const carbonRelevant = temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp) || (state.era3?.carbonYield || ZERO).gt(0) || carbon.gt(0);
  const ironRelevant = temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) || (state.era3?.ironYield || ZERO).gt(0) || iron.gt(0);

  const primary = [
    resource('coreTemperature', 'Core Temperature', temperature, {
      unit: 'K',
      roleHint: getCoreTemperatureRoleHint(temperature)
    })
  ];

  if (ironRelevant) {
    return {
      primary,
      support: [
        resource('iron', 'Iron', iron, { roleHint: 'Collapse material' }),
        resource('carbon', 'Carbon', carbon, { roleHint: 'Iron synthesis fuel' }),
        resource('helium', 'Helium', helium, { roleHint: 'Carbon synthesis fuel' })
      ],
      details: [resource('hydrogen', 'Hydrogen', hydrogen, { roleHint: 'Stellar fuel' })]
    };
  }

  const support = [
    resource('hydrogen', 'Hydrogen', hydrogen, { roleHint: 'Stellar fuel' }),
    resource('helium', 'Helium', helium, { roleHint: 'Fusion product' })
  ];
  if (carbonRelevant) support.push(resource('carbon', 'Carbon', carbon, { roleHint: 'Heavy-element target' }));

  return {
    primary,
    support,
    details: []
  };
}

function getLaterEraPresentation(state) {
  if (state.activeEpoch === 4) {
    return {
      primary: [resource('darkMatter', 'Dark Matter', amount(state, 'darkMatter'), { roleHint: 'Galactic progression' })],
      support: [resource('planetaryDebris', 'Planetary Debris', amount(state, 'planetaryDebris'))],
      details: [resource('hydrogen', 'Stellar Mass', amount(state, 'hydrogen'))]
    };
  }

  return {
    primary: [resource('hawkingRadiation', 'Hawking Radiation', currencyAmount(state, 'hawkingRadiation'), { roleHint: 'Deep-future progression' })],
    support: [resource('bits', 'Information Bits', currencyAmount(state, 'bits'))],
    details: []
  };
}

export function getEraResourcePresentation(state) {
  if (!state) return { primary: [], support: [], details: [], meta: [] };

  let presentation;
  if (state.activeEpoch === 1) presentation = getEraOnePresentation(state);
  else if (state.activeEpoch === 2) presentation = getEraTwoPresentation(state);
  else if (state.activeEpoch === 3) presentation = getEraThreePresentation(state);
  else presentation = getLaterEraPresentation(state);

  return { ...presentation, meta: getMetaResources(state) };
}
