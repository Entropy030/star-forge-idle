import { computePlasmaStep } from './evaluator.js';
export { getRecombinationEligibility } from './eligibility.js';

export function getPlasmaRates(state) {
  // Use the shared evaluator with dt = 1 to get the exact real rates per second
  const step = computePlasmaStep(state, 1);
  
  // Backwards compatibility for UI bindings: map the deltas back to the rate names expected by the UI
  // Note: For negative deltas (consumption), we extract the magnitude for display.
  let rates = {
    quarksProduction: Decimal.max(0, step.deltas.quarks),
    quarksConsumption: Decimal.min(0, step.deltas.quarks).abs(),
    gluonsProduction: Decimal.max(0, step.deltas.gluons),
    gluonsConsumption: Decimal.min(0, step.deltas.gluons).abs(),
    leptonsProduction: Decimal.max(0, step.deltas.leptons),
    leptonsConsumption: Decimal.min(0, step.deltas.leptons).abs(),
    protonsProduction: Decimal.max(0, step.deltas.protons),
    protonsConsumption: Decimal.min(0, step.deltas.protons).abs(),
    electronsProduction: Decimal.max(0, step.deltas.electrons),
    electronsConsumption: Decimal.min(0, step.deltas.electrons).abs(),
    hydrogenProduction: Decimal.max(0, step.deltas.hydrogen),
    coolingRate: step.cooling
  };

  return rates;
}

export function getPlasmaUpgradeVisibility(state) {
  const qcLevel = state.upgrades?.plasma?.quarkCondenser?.level || 0;
  const gmLevel = state.upgrades?.plasma?.gluonBinding?.level || 0;
  const lcLevel = state.upgrades?.plasma?.leptonHarvest?.level || 0;
  const psLevel = state.upgrades?.plasma?.plasmaAutomation?.level || 0;
  
  // Return a complete map of display styles based on unlock logic
  return {
    quarkCondenser: 'flex', // Always visible in Era II
    gluonBinding: qcLevel >= 3 ? 'flex' : 'none',
    leptonHarvest: gmLevel >= 2 ? 'flex' : 'none',
    plasmaAutomation: lcLevel >= 1 ? 'flex' : 'none',
    baryoRadiator: psLevel >= 1 ? 'flex' : 'none'
  };
}
