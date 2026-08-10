import Decimal from 'break_infinity.js';

export function getQuantumUpgradeEligibility(state, upgradeId) {
  const maxQF = state.stats?.maxQF || new Decimal(0);
  const getLevel = (id) => state.upgrades?.quantum?.[id]?.level || 0;

  switch (upgradeId) {
    case 'gravityForce':
      return { unlocked: true };
    case 'weakForce':
      return { unlocked: maxQF.gte(100) && getLevel('gravityForce') >= 5 };
    case 'electromagneticForce':
      return { unlocked: maxQF.gte(500) && getLevel('weakForce') >= 5 };
    case 'vacuumResonance':
      return { unlocked: maxQF.gte(2500) && getLevel('electromagneticForce') >= 5 };
    case 'strongForce':
      return { unlocked: maxQF.gte(10000) && getLevel('vacuumResonance') >= 5 };
    default:
      return { unlocked: true };
  }
}
