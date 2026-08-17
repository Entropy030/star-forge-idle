export const PLASMA_POSTURES = Object.freeze(['ACCUMULATE', 'BALANCE', 'CONDENSE']);

export const DEFAULT_PLASMA_POSTURE = 'BALANCE';

export const RECOMBINATION_STARTING_HYDROGEN = 250;

// Initial Phase-1 calibration baseline derived from PRE-P4.4 prototype evidence.
// These are tunable production parameters subject to future balance refinement.
export const PLASMA_POSTURE_CONFIG = Object.freeze({
  ACCUMULATE: Object.freeze({
    particleFlux: 1.50,
    coolingMult: 0.50,
    bindingMult: 0.70,
    label: 'Accumulate'
  }),
  BALANCE: Object.freeze({
    particleFlux: 1.00,
    coolingMult: 1.00,
    bindingMult: 1.00,
    label: 'Balance'
  }),
  CONDENSE: Object.freeze({
    particleFlux: 0.50,
    coolingMult: 1.50,
    bindingMult: 1.30,
    label: 'Condense'
  })
});

export function getPostureProfile(posture = DEFAULT_PLASMA_POSTURE) {
  return PLASMA_POSTURE_CONFIG[posture] || PLASMA_POSTURE_CONFIG[DEFAULT_PLASMA_POSTURE];
}
