import Decimal from 'break_infinity.js';

export function getInflationEligibility(state) {
  const qf = state.resources.quantumFluctuations ? state.resources.quantumFluctuations.amount : new Decimal(0);
  const ed = state.resources.energyDensity ? state.resources.energyDensity.amount : new Decimal(0);
  const coherence = state.era1 ? state.era1.vacuumCoherence : 0.0;
  return {
    isEligible: qf.gte(100000) && ed.gte(50000) && coherence >= 1.0,
    qf,
    ed,
    coherence
  };
}
