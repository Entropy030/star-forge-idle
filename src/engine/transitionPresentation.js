/* global Decimal */
import { getInflationEligibility } from '../eras/quantum/inflation.js';
import { getRecombinationEligibility } from '../eras/plasma/eligibility.js';
import { RECOMBINATION_STARTING_HYDROGEN } from '../eras/plasma/constants.js';
import {
  getSupernovaEligibility,
  getSupernovaOutcome,
  getGalacticIgnitionEligibility
} from '../eras/stellar/selectors.js';
import { formatHudNumber } from '../ui/resourceFormatters.js';

const SUPERNOVA_STATUS_LABELS = {
  WRONG_EPOCH: 'Supernova is only available during Era III.',
  INCOMPLETE_STELLAR_STATE: 'Reach the Main Sequence Stellar state.',
  INSUFFICIENT_TEMPERATURE: 'Increase the Stellar core temperature to 100M K.',
  IRON_FUSION_LOCKED: 'Unlock Iron fusion.',
  INSUFFICIENT_IRON: 'Accumulate 1,000 Iron.'
};

/**
 * Returns a pure, read-only preview of the Cosmic Inflation transition (Era I -> Era II).
 * @param {Object} state - The authoritative game state.
 * @returns {Object} Transition presentation model.
 */
export function getInflationTransformationPreview(state) {
  const eligibility = getInflationEligibility(state);

  return {
    type: 'inflation',
    kind: 'forward-era',
    title: 'Cosmic Inflation',
    eyebrow: 'Era Transition · Not a Prestige Reset',
    repeatable: false,
    advancesEra: true,
    targetEra: 2,
    targetEraName: 'Primordial Plasma (Era II)',
    summary: 'The universe expands beyond quantum scales, leaving behind the turbulent foam to enter the Primordial Plasma.',
    changes: [
      'Quantum Foam resolves into hot Primordial Plasma.',
      'Matter synthesis (Quarks, Gluons, Protons) and Plasma Temperature become the active physical system.',
      'Observation yields to operating postures and continuous matter production.'
    ],
    resets: [
      { label: 'None', desc: 'All quantum discoveries, force upgrades, and fundamental currencies persist.' }
    ],
    persists: [
      { label: 'Quantum Upgrades', desc: 'All unlocked fundamental force ranks and modifiers remain active.' },
      { label: 'Discoveries & Chrono', desc: 'Codex entries and cosmic history are preserved.' },
      { label: 'Inflaton Bonus', desc: 'Excess Quantum Fluctuations above 100k grant a permanent Inflaton production multiplier.' }
    ],
    gains: [
      { label: 'Era II Access', desc: 'Unlocks the Primordial Plasma era and new visual star core.' },
      { label: 'Particle Synthesis', desc: 'Unlocks Quark Condensers, Gluon Matrix Synthesis, and Proton Synthesizers.' }
    ],
    next: 'Begin condensing Quarks and Gluons to forge the universe\'s first stable Protons.',
    why: 'Expands the scope of the cosmos from vacuum fluctuations into physical baryonic matter.',
    isEligible: eligibility.isEligible,
    requirements: eligibility.requirements
  };
}

/**
 * Returns a pure, read-only preview of the Cosmic Recombination transition (Era II -> Era III).
 * @param {Object} state - The authoritative game state.
 * @returns {Object} Transition presentation model.
 */
export function getRecombinationTransformationPreview(state) {
  const eligibility = getRecombinationEligibility(state);

  return {
    type: 'recombination',
    kind: 'forward-era',
    title: 'Cosmic Recombination',
    eyebrow: 'Era Transition · The Stellar Dawn',
    repeatable: false,
    advancesEra: true,
    targetEra: 3,
    targetEraName: 'The Stellar Dawn (Era III)',
    summary: 'The primordial plasma cools and neutralizes into transparent space, allowing the first stable atomic gas clouds to collapse into stars.',
    changes: [
      'Hot plasma neutralizes into transparent hydrogen gas.',
      'Particle synthesis gives way to Stellar Core construction and gravitic accretion.',
      'Core Temperature becomes the primary physical capability metric.'
    ],
    startingCondition: {
      resource: 'Hydrogen',
      amount: RECOMBINATION_STARTING_HYDROGEN,
      unit: 'H',
      label: `Begins with a stellar seed containing exactly ${RECOMBINATION_STARTING_HYDROGEN} Hydrogen.`
    },
    resets: [
      { label: 'None', desc: 'Plasma era discoveries, upgrades, and unlocks remain recorded.' }
    ],
    persists: [
      { label: 'Plasma Discoveries', desc: 'All unlocked particle technologies and Codex records persist.' },
      { label: 'Lifetime Statistics', desc: 'All lifetime progress and achievements persist.' }
    ],
    gains: [
      { label: 'Era III Access', desc: 'Unlocks the Stellar Dawn and the Hydrostatic Stellar Core.' },
      { label: 'Stellar Construction', desc: 'Unlocks Gravity nodes, Hydrogen Auto-Fusers, and Helium Core Compression.' }
    ],
    next: 'Construct your first stellar object: purchase Gravity to harvest Hydrogen, then ignite the Auto-Fuser.',
    why: 'Forges the universe\'s first stars and unlocks heavy-element nucleosynthesis.',
    isEligible: eligibility.isEligible,
    satisfiedVia: eligibility.temperatureReady ? 'temperature' : (eligibility.protonReady ? 'protons' : null)
  };
}

/**
 * Returns a pure, read-only preview of the Supernova Collapse transformation (Era III repeatable reset).
 * @param {Object} state - The authoritative game state.
 * @returns {Object} Transition presentation model.
 */
export function getSupernovaTransformationPreview(state) {
  const supernovasCount = state.stats?.supernovas ? state.stats.supernovas.toNumber() : 0;
  const isFirstSupernova = supernovasCount === 0;
  const outcome = getSupernovaOutcome(state);
  const eligibility = getSupernovaEligibility(state);

  const rewardItems = [];
  if (outcome.rewards.stardust.gt(0)) {
    rewardItems.push({
      key: 'stardust',
      label: 'Stardust',
      value: `+${formatHudNumber(outcome.rewards.stardust)}`,
      desc: 'Permanent Legacy currency to purchase transformative modifiers in the Stardust Forge.'
    });
  }
  if (outcome.rewards.pulsarShards.gt(0)) {
    rewardItems.push({
      key: 'pulsarShards',
      label: 'Pulsar Shards',
      value: `+${formatHudNumber(outcome.rewards.pulsarShards)}`,
      desc: 'Rare remnant currency forged from compact, high-density stellar collapse.'
    });
  }
  if (outcome.rewards.singularityMass.gt(0)) {
    rewardItems.push({
      key: 'singularityMass',
      label: 'Singularity Mass',
      value: `+${formatHudNumber(outcome.rewards.singularityMass)}`,
      desc: 'Exotic mass harvested from total gravitational collapse.'
    });
  }

  const modifierItems = [];
  // Only secondRunProductionMult is actively consumed by stellar simulation; secondRunStabilityMult is currently unconsumed in runtime.
  if (outcome.modifiers.secondRunProductionMult && outcome.modifiers.secondRunProductionMult !== 1.0) {
    const pct = Math.round((outcome.modifiers.secondRunProductionMult - 1.0) * 100);
    const sign = pct >= 0 ? '+' : '';
    modifierItems.push(`Production Speed: ${sign}${pct}%`);
  }

  const errorText = SUPERNOVA_STATUS_LABELS[eligibility.errorCode] || eligibility.errorCode;
  const statusText = eligibility.canTrigger
    ? 'Ready for Supernova'
    : `Blocked: ${errorText}`;

  return {
    type: 'supernova',
    kind: 'prestige-reset',
    title: 'Supernova Collapse',
    eyebrow: isFirstSupernova ? 'First Supernova Transformation Preview' : 'Repeatable Stellar Transformation',
    isFirstSupernova,
    repeatable: true,
    advancesEra: false,
    targetEra: 3,
    targetEraName: 'Era III (New Stellar Cycle)',
    summary: 'Trigger a cataclysmic core collapse. The current star is consumed, yielding precious remnants that permanently enhance future stellar cycles.',
    outcome: {
      displayName: outcome.displayName,
      archetype: outcome.archetype,
      reasons: outcome.reasons,
      rewards: outcome.rewards,
      modifiers: outcome.modifiers,
      modifierDescriptions: modifierItems
    },
    sections: {
      resets: {
        title: 'Current Run Reset',
        summary: 'The physical stellar body, local stocks, and current run upgrade investments are consumed in the supernova collapse.',
        items: [
          { label: 'Current Stellar Object', desc: 'Star stage, core temperature, and thermal multipliers return to baseline.' },
          { label: 'Run-Local Resources', desc: 'Hydrogen, Helium, Carbon, and Iron stockpiles are reset.' },
          { label: 'Run-Local Construction', desc: 'Gravity, Fusers, Compression, and Core node investments are cleared.' }
        ]
      },
      persists: {
        title: 'Permanent Legacy',
        summary: 'All meta-progression currencies, artifacts, and lifetime accomplishments carry forward into all future runs.',
        items: [
          { label: 'Meta Currencies', desc: 'All Stardust, Pulsar Shards, and Singularity Mass balances persist.' },
          { label: 'Artifacts & Equipment', desc: 'Equipped Artifacts and permanent loadout modifiers persist.' },
          { label: 'Achievements & Records', desc: 'Unlocked Achievements, Lifetime statistics, and Codex discoveries persist.' },
          { label: 'Celestial Cards & Missions', desc: 'Celestial card collections and completed mission history persist.' }
        ]
      },
      gains: {
        title: 'Supernova Yield',
        summary: `Collapse into a ${outcome.displayName} based on your ${outcome.archetype} stellar architecture.`,
        items: rewardItems,
        modifiers: modifierItems
      },
      next: {
        title: 'Next Stellar Cycle',
        summary: 'Supernova begins a new stellar cycle in Era III with permanent remnant modifiers.',
        distinction: 'Supernova does NOT advance to Era IV. Galactic Ignition is the separate permanent advancement.'
      }
    },
    eligibility: {
      canTrigger: eligibility.canTrigger,
      errorCode: eligibility.errorCode,
      errorText,
      statusText
    }
  };
}

/**
 * Returns a pure, read-only preview of the Galactic Ignition transition (Era III -> Era IV).
 * @param {Object} state - The authoritative game state.
 * @returns {Object} Transition presentation model.
 */
export function getGalacticIgnitionTransformationPreview(state) {
  const eligibility = getGalacticIgnitionEligibility(state);

  return {
    type: 'galactic-ignition',
    kind: 'forward-era',
    title: 'Galactic Ignition',
    eyebrow: 'Permanent Era Transition · Era IV',
    repeatable: false,
    advancesEra: true,
    targetEra: 4,
    targetEraName: 'The Galactic Web (Era IV)',
    summary: 'Advances the cosmos permanently into the Galactic Web. Leaves single stellar management behind to govern an entire galactic network.',
    changes: [
      'The cosmos advances permanently from individual stellar objects to a Galactic Web.',
      'Dark Matter, Planetary Debris, and Orbital Stability become the active physical system.',
      'Unlocks galactic scale structures, planetary accretion, and cosmic constant tuning.'
    ],
    resets: [
      { label: 'None', desc: 'Permanent era transition. Does not grant remnant currencies or reset legacy systems.' }
    ],
    distinction: 'Permanent Era advancement. This does not grant a remnant or reset; repeatable Supernova remains available in Legacy.',
    isEligible: eligibility.isEligible,
    requirements: eligibility.requirements
  };
}

/**
 * Central pure dispatcher for transition presentation models.
 * @param {Object} state - Authoritative game state.
 * @param {string} type - 'inflation' | 'recombination' | 'supernova' | 'galactic-ignition'
 * @returns {Object} Transition presentation model.
 */
export function getTransitionPresentation(state, type) {
  switch (type) {
    case 'inflation':
      return getInflationTransformationPreview(state);
    case 'recombination':
      return getRecombinationTransformationPreview(state);
    case 'supernova':
      return getSupernovaTransformationPreview(state);
    case 'galactic-ignition':
      return getGalacticIgnitionTransformationPreview(state);
    default:
      return null;
  }
}
