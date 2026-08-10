import Decimal from 'break_infinity.js';

export function getQuantumUpgradeEligibility(state, upgradeId) {
  const maxQF = state.stats?.maxQF || new Decimal(0);
  const getLevel = (id) => state.upgrades?.quantum?.[id]?.level || 0;

  const requirement = (id, label, current, target) => ({
    id,
    label,
    current,
    target,
    met: new Decimal(current).gte(target)
  });

  const result = (requirements = []) => ({
    unlocked: requirements.every(item => item.met),
    requirements
  });

  switch (upgradeId) {
    case 'gravityForce':
      return result();
    case 'weakForce':
      return result([
        requirement('peak-qf', 'Peak Quantum Fluctuations', maxQF, 100),
        requirement('gravity-level', 'Gravitational Coupling level', getLevel('gravityForce'), 5)
      ]);
    case 'electromagneticForce':
      return result([
        requirement('peak-qf', 'Peak Quantum Fluctuations', maxQF, 500),
        requirement('weak-level', 'Weak Nuclear Vector level', getLevel('weakForce'), 5)
      ]);
    case 'vacuumResonance':
      return result([
        requirement('peak-qf', 'Peak Quantum Fluctuations', maxQF, 2500),
        requirement('electromagnetic-level', 'Electromagnetic Tensor level', getLevel('electromagneticForce'), 5)
      ]);
    case 'strongForce':
      return result([
        requirement('peak-qf', 'Peak Quantum Fluctuations', maxQF, 10000),
        requirement('vacuum-level', 'Vacuum Resonance Field level', getLevel('vacuumResonance'), 5)
      ]);
    default:
      return result();
  }
}
