/* eslint-disable import/no-cycle */
import { getSupernovaOutcome, getSupernovaEligibility } from '../eras/stellar/selectors.js';
import { format } from './viewport.js';
import { engine } from '../engine/instance.js';

const SUPERNOVA_STATUS_LABELS = {
  WRONG_EPOCH: 'Supernova is only available during Era III.',
  INCOMPLETE_STELLAR_STATE: 'Reach the Main Sequence Stellar state.',
  INSUFFICIENT_TEMPERATURE: 'Increase the Stellar core temperature to 100M K.',
  IRON_FUSION_LOCKED: 'Unlock Iron fusion.',
  INSUFFICIENT_IRON: 'Accumulate 1,000 Iron.'
};

export function updateSupernovaOutcome() {
  const typeEl = document.getElementById('supernova-outcome-type');
  const yieldsEl = document.getElementById('supernova-outcome-yields');
  const archEl = document.getElementById('supernova-outcome-archetype');
  const reasonsEl = document.getElementById('supernova-outcome-reasons');
  const statusEl = document.getElementById('supernova-outcome-status');
  const supernovaBtn = document.getElementById('btn-supernova');
  
  if (!typeEl || !yieldsEl) return;

  const gameState = engine.getStateUnsafe();
  const outcome = getSupernovaOutcome(gameState);
  const eligibility = getSupernovaEligibility(gameState);

  let outcomeColor = '#ffffff';
  if (outcome.outcome === 'neutron-star') outcomeColor = '#00cec9';
  if (outcome.outcome === 'black-hole') outcomeColor = '#a29bfe';

  // Update Text/HTML
  typeEl.textContent = outcome.displayName;
  typeEl.style.color = outcomeColor;

  if (archEl) {
    archEl.textContent = outcome.archetype.charAt(0).toUpperCase() + outcome.archetype.slice(1);
  }

  if (reasonsEl) {
    reasonsEl.innerHTML = outcome.reasons.map(r => `• ${r}`).join('<br>');
  }

  let yields = [];
  if (outcome.rewards.stardust.gt(0)) yields.push(`+${format(outcome.rewards.stardust)} ✨ Synaptic Dust`);
  if (outcome.rewards.pulsarShards.gt(0)) yields.push(`+${format(outcome.rewards.pulsarShards)} 🌀 Neural Synapse`);
  if (outcome.rewards.singularityMass.gt(0)) yields.push(`+${format(outcome.rewards.singularityMass)} 🌌 Core Density`);
  yieldsEl.innerHTML = yields.join('<br>');

  if (statusEl) {
    if (eligibility.canTrigger) {
      statusEl.textContent = "Ready for Supernova";
      statusEl.style.color = "#00cec9";
    } else {
      const errorText = SUPERNOVA_STATUS_LABELS[eligibility.errorCode] || `Blocked: ${eligibility.errorCode}`;
      statusEl.textContent = `Blocked: ${errorText}`;
      statusEl.style.color = "#ff7675";
    }
  }

  if (supernovaBtn) {
    if (eligibility.canTrigger) {
      supernovaBtn.disabled = false;
      supernovaBtn.style.background = "#d63031";
      supernovaBtn.style.color = "#fff";
      supernovaBtn.textContent = "TRIGGER SUPERNOVA RESET SEQUENCE";
      supernovaBtn.classList.add('upgrade-affordable');
    } else {
      supernovaBtn.disabled = true;
      supernovaBtn.style.background = "rgba(255,255,255,0.03)";
      supernovaBtn.style.color = "#4b4b4b";
      const errorText = SUPERNOVA_STATUS_LABELS[eligibility.errorCode] || "Prerequisites not met";
      supernovaBtn.textContent = `Requires: ${errorText}`;
      supernovaBtn.classList.remove('upgrade-affordable');
    }
  }
}
