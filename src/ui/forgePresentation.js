import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { getMilestoneMultiplier } from '../core/economy.js';
import { getQuantumUpgradeEligibility } from '../eras/quantum/eligibility.js';
import { getPlasmaUpgradeEligibility } from '../eras/plasma/eligibility.js';

export const FORGE_BUY_MODES = [1, 10, 'max'];

const QUANTUM_DISCOVERY_THRESHOLDS = {
  gravityForce: 1,
  weakForce: 10,
  electromagneticForce: 100,
  vacuumResonance: 500,
  strongForce: 2500
};

function forgeNumber(value) {
  const number = new Decimal(value || 0).toNumber();
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number);
}

export function normalizeForgeBuyMode(value) {
  if (value === 'max') return 'max';
  const numeric = Number(value);
  return numeric === 10 ? 10 : 1;
}

export function getForgeUpgradeEligibility(state, category, upgradeId) {
  if (category === 'quantum') {
    const eligibility = getQuantumUpgradeEligibility(state, upgradeId);
    const peakQF = state.stats?.maxQF || new Decimal(0);
    return {
      ...eligibility,
      discovered: peakQF.gte(QUANTUM_DISCOVERY_THRESHOLDS[upgradeId] || 0)
    };
  }

  if (category === 'plasma') {
    const eligibility = getPlasmaUpgradeEligibility(state, upgradeId);
    return {
      ...eligibility,
      discovered: upgradeId === 'quarkCondenser' || eligibility.unlocked
    };
  }

  return { discovered: true, unlocked: true, requirements: [] };
}

export function getForgeEffectData(state, category, upgradeId) {
  const definition = COSMIC_REGISTRY.upgrades?.[category]?.[upgradeId];
  const level = state.upgrades?.[category]?.[upgradeId]?.level || 0;
  const milestone = getMilestoneMultiplier(level);

  if (!definition) return { role: 'System', primary: '', contribution: '' };

  if (category === 'quantum') {
    const qf = definition.gen || new Decimal(0);
    const density = definition.densityGen || new Decimal(0);
    const contributionQf = qf.times(level).times(milestone);
    const contributionDensity = density.times(level).times(milestone);
    return {
      role: 'Fundamental law',
      primary: `+${forgeNumber(qf)} QF/s · +${forgeNumber(density)} Energy Density/s`,
      contribution: level > 0
        ? `Current base contribution: +${forgeNumber(contributionQf)} QF/s · +${forgeNumber(contributionDensity)} Energy Density/s`
        : `Next level: +${forgeNumber(qf)} QF/s · +${forgeNumber(density)} Energy Density/s`
    };
  }

  const currentMultiplier = new Decimal(level).times(milestone);
  switch (upgradeId) {
    case 'quarkCondenser':
      return {
        role: 'Produces input',
        primary: '+2 Quarks/s per level',
        contribution: level > 0 ? `Current contribution: +${forgeNumber(currentMultiplier.times(2))} Quarks/s` : 'Next level: +2 Quarks/s'
      };
    case 'gluonBinding':
      return {
        role: 'Produces input',
        primary: '+1.5 Gluons/s per level',
        contribution: level > 0 ? `Current contribution: +${forgeNumber(currentMultiplier.times(1.5))} Gluons/s` : 'Next level: +1.5 Gluons/s'
      };
    case 'leptonHarvest':
      return {
        role: 'Produces input',
        primary: '+1 Lepton/s per level',
        contribution: level > 0 ? `Current contribution: +${forgeNumber(currentMultiplier)} Leptons/s` : 'Next level: +1 Lepton/s'
      };
    case 'plasmaAutomation':
      return {
        role: 'Converts inputs',
        primary: '3 Quarks + 1 Gluon → 1 Proton/s per level',
        contribution: level > 0 ? `Maximum throughput: ${forgeNumber(currentMultiplier)} Protons/s` : 'Next level: up to 1 Proton/s'
      };
    case 'baryoRadiator':
      return {
        role: 'Cooling',
        primary: 'Consumes 2 Protons/s → −7,500 K/s per level',
        contribution: level > 0 ? `Maximum cooling: −${forgeNumber(new Decimal(level).times(7500))} K/s` : 'Next level: −7,500 K/s cooling'
      };
    default:
      return { role: 'System', primary: definition.desc, contribution: '' };
  }
}

export function getForgeCardState({ eligibility, level, isMaxed, isAffordable }) {
  if (!eligibility.discovered) return { id: 'undiscovered', label: 'Undiscovered' };
  if (!eligibility.unlocked) return { id: 'locked', label: 'Locked' };
  if (isMaxed) return { id: 'maxed', label: 'Maxed' };
  if (isAffordable) return { id: 'affordable', label: 'Ready' };
  if (level > 0) return { id: 'progressing', label: 'Active · Needs resources' };
  return { id: 'unaffordable', label: 'Needs resources' };
}
