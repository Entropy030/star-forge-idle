import Decimal from 'break_infinity.js';
import { getVacuumCoherence } from './coherence.js';

export function getInflationEligibility(state) {
  const qf = state.resources.quantumFluctuations ? state.resources.quantumFluctuations.amount : new Decimal(0);
  const ed = state.resources.energyDensity ? state.resources.energyDensity.amount : new Decimal(0);
  const vacuumCoherence = getVacuumCoherence(state);
  
  const requirements = [
    { id: 'quantumFluctuations', label: 'Quantum Fluctuations', current: qf, target: new Decimal(100000), met: qf.gte(100000) },
    { id: 'energyDensity', label: 'Energy Density', current: ed, target: new Decimal(50000), met: ed.gte(50000) },
    { id: 'coherence', label: 'Vacuum Coherence', current: vacuumCoherence, target: new Decimal(100), unit: '%', met: vacuumCoherence.gte(100) }
  ];

  return {
    isEligible: qf.gte(100000) && ed.gte(50000) && vacuumCoherence.gte(100),
    qf,
    ed,
    vacuumCoherence,
    requirements
  };
}
