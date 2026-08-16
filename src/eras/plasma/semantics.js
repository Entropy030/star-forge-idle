import Decimal from 'break_infinity.js';
import { getRecombinationEligibility } from './eligibility.js';

const START_TEMP = 10000000;
const END_TEMP = 3000;

export function getEraTwoVisualSemantics(state) {
  if (!state || state.activeEpoch !== 2) {
    return null;
  }

  const posture = state.era2?.posture || 'BALANCE';

  let tempK = START_TEMP;
  if (state.plasmaTemperature) {
    tempK = typeof state.plasmaTemperature.toNumber === 'function'
      ? state.plasmaTemperature.toNumber()
      : Number(state.plasmaTemperature) || START_TEMP;
  }

  // Bounded cooling progress: 0.0 at 10M K, 1.0 at 3,000 K
  const coolProgress = Math.min(1, Math.max(0, (START_TEMP - tempK) / (START_TEMP - END_TEMP)));

  // Authoritative recombination readiness
  const recombEligibility = getRecombinationEligibility(state);
  const recombinationReady = Boolean(recombEligibility.isEligible);

  let recombinationSatisfiedVia = null;
  if (recombEligibility.protonReady && recombEligibility.temperatureReady) {
    recombinationSatisfiedVia = 'both';
  } else if (recombEligibility.protonReady) {
    recombinationSatisfiedVia = 'protons';
  } else if (recombEligibility.temperatureReady) {
    recombinationSatisfiedVia = 'cooling';
  }

  // Categorical thermal state
  let thermalCategory = 'hot';
  if (recombinationReady) {
    thermalCategory = 'recombination-ready';
  } else if (tempK <= 100000) {
    thermalCategory = 'stabilized';
  } else if (tempK <= 1000000) {
    thermalCategory = 'cooling';
  } else {
    thermalCategory = 'hot';
  }

  // Bounded activity level (0..1) reflecting particle agitation / outward influx
  let baseActivity = 0.65;
  let baseConcentration = 0.6;
  let postureRole = 'Equilibrium';

  if (posture === 'ACCUMULATE') {
    baseActivity = 1.0;
    baseConcentration = 0.3;
    postureRole = 'Matter Influx';
  } else if (posture === 'CONDENSE') {
    baseActivity = 0.35;
    baseConcentration = 1.0;
    postureRole = 'Cooling & Binding';
  }

  // Thermal modulation: hotter = higher agitation; cooler = higher concentration
  const activityLevel = Math.min(1, Math.max(0.1, baseActivity * (0.4 + 0.6 * (1 - coolProgress))));
  const concentrationFactor = Math.min(1, Math.max(0.1, baseConcentration * (0.5 + 0.5 * coolProgress)));

  // Format temperature label for accessible text
  let tempFormatted = `${Math.round(tempK).toLocaleString('en-US')} K`;
  if (tempK >= 1000000) {
    tempFormatted = `${(tempK / 1000000).toFixed(1)}M K`;
  } else if (tempK >= 1000) {
    tempFormatted = `${(tempK / 1000).toFixed(0)}k K`;
  }

  const postureLabel = posture.charAt(0).toUpperCase() + posture.slice(1).toLowerCase();
  const thermalLabel = thermalCategory === 'recombination-ready'
    ? 'Recombination Ready'
    : thermalCategory === 'stabilized'
      ? 'Stabilized'
      : thermalCategory === 'cooling'
        ? 'Cooling'
        : 'High Thermal Activity';

  const semanticLabel = `Primordial Plasma [${posture}] · ${thermalLabel}`;

  let ariaLabel = `Primordial plasma core. ${postureLabel} posture. ${thermalLabel} at ${tempFormatted}. Interact to gather Quarks and Gluons.`;
  if (recombinationReady) {
    const viaText = recombinationSatisfiedVia === 'both'
      ? 'via protons and cooling'
      : recombinationSatisfiedVia === 'protons'
        ? 'via proton accumulation'
        : 'via plasma cooling';
    ariaLabel = `Primordial plasma core. ${postureLabel} posture. Cosmic Recombination is ready (${viaText}). Interact to gather Quarks and Gluons.`;
  }

  return {
    epoch: 2,
    posture,
    postureRole,
    temperatureK: tempK,
    coolProgress,
    thermalCategory,
    activityLevel,
    concentrationFactor,
    recombinationReady,
    recombinationSatisfiedVia,
    semanticLabel,
    ariaLabel
  };
}
