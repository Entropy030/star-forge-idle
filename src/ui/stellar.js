/* eslint-disable import/no-cycle */
import { getSupernovaTransformationPreview } from '../engine/transitionPresentation.js';
import { format } from './viewport.js';
import { getRuntimeState } from '../core/state.js';

export function updateSupernovaOutcome() {
  const typeEl = document.getElementById('supernova-outcome-type');
  const yieldsEl = document.getElementById('supernova-outcome-yields');
  const archEl = document.getElementById('supernova-outcome-archetype');
  const reasonsEl = document.getElementById('supernova-outcome-reasons');
  const statusEl = document.getElementById('supernova-outcome-status');
  const supernovaBtn = document.getElementById('btn-supernova');

  if (!typeEl || !yieldsEl) return;

  const gameState = getRuntimeState();
  const preview = getSupernovaTransformationPreview(gameState);
  const outcome = preview.outcome;
  const eligibility = preview.eligibility;

  let outcomeColor = '#ffffff';
  if (outcome.displayName === 'Neutron Star') outcomeColor = '#00cec9';
  else if (outcome.displayName === 'Pulsar') outcomeColor = '#00ecc6';
  else if (outcome.displayName === 'Black Hole') outcomeColor = '#a29bfe';
  else if (outcome.displayName === 'White Dwarf') outcomeColor = '#ffeaa7';

  // Update Remnant Header & Factors
  typeEl.textContent = outcome.displayName;
  typeEl.style.color = outcomeColor;

  if (archEl) {
    archEl.textContent = outcome.archetype.charAt(0).toUpperCase() + outcome.archetype.slice(1);
  }

  if (reasonsEl) {
    reasonsEl.innerHTML = outcome.reasons.map(r => `• ${r}`).join('<br>');
  }

  // Update Expected Rewards & Modifiers
  const yields = [];
  if (outcome.rewards.stardust.gt(0)) yields.push(`+${format(outcome.rewards.stardust)} ✨ Stardust`);
  if (outcome.rewards.pulsarShards.gt(0)) yields.push(`+${format(outcome.rewards.pulsarShards)} 🌀 Pulsar Shards`);
  if (outcome.rewards.singularityMass.gt(0)) yields.push(`+${format(outcome.rewards.singularityMass)} 🌌 Singularity Mass`);
  if (outcome.modifierDescriptions?.length) {
    for (const modDesc of outcome.modifierDescriptions) {
      yields.push(`⚡ Next-Run Bonus: ${modDesc}`);
    }
  }
  yieldsEl.innerHTML = yields.join('<br>');

  // Transformation Preview Matrix (RESET / PERSISTS / NEXT)
  const displayBox = document.getElementById('supernova-outcome-display') || typeEl.parentElement;
  if (displayBox) {
    let previewContainer = document.getElementById('supernova-transformation-preview');
    if (!previewContainer) {
      previewContainer = document.createElement('div');
      previewContainer.id = 'supernova-transformation-preview';
      previewContainer.className = 'supernova-transformation-preview';

      // Insert before the Status heading if present, otherwise append
      if (statusEl && statusEl.previousElementSibling) {
        displayBox.insertBefore(previewContainer, statusEl.previousElementSibling);
      } else {
        displayBox.appendChild(previewContainer);
      }
    }

    const { resets, persists, next } = preview.sections;

    previewContainer.innerHTML = `
      <div class="supernova-preview-header">
        <span class="supernova-preview-badge">${preview.eyebrow}</span>
      </div>
      <div class="supernova-preview-group supernova-preview-group--reset">
        <div class="supernova-preview-group-title"><span aria-hidden="true">✕</span> ${resets.title}</div>
        <ul class="supernova-preview-list">
          ${resets.items.map(item => `<li class="supernova-preview-item"><strong>${item.label}:</strong> ${item.desc}</li>`).join('')}
        </ul>
      </div>
      <div class="supernova-preview-group supernova-preview-group--persists">
        <div class="supernova-preview-group-title"><span aria-hidden="true">✓</span> ${persists.title}</div>
        <ul class="supernova-preview-list">
          ${persists.items.map(item => `<li class="supernova-preview-item"><strong>${item.label}:</strong> ${item.desc}</li>`).join('')}
        </ul>
      </div>
      <div class="supernova-preview-group supernova-preview-group--next">
        <div class="supernova-preview-group-title"><span aria-hidden="true">→</span> ${next.title}</div>
        <div class="supernova-preview-item">${next.summary}</div>
        <div class="supernova-preview-distinction">${next.distinction}</div>
      </div>
    `;
  }

  // Status text
  if (statusEl) {
    statusEl.textContent = eligibility.statusText;
    statusEl.style.color = eligibility.canTrigger ? '#00cec9' : '#ff7675';
  }

  // Trigger Button
  if (supernovaBtn) {
    if (eligibility.canTrigger) {
      supernovaBtn.disabled = false;
      supernovaBtn.style.background = '#d63031';
      supernovaBtn.style.color = '#fff';
      supernovaBtn.textContent = 'TRIGGER SUPERNOVA RESET SEQUENCE';
      supernovaBtn.setAttribute('aria-label', 'Trigger Supernova Reset Sequence');
      supernovaBtn.classList.add('upgrade-affordable');
    } else {
      supernovaBtn.disabled = true;
      supernovaBtn.style.background = 'rgba(255,255,255,0.03)';
      supernovaBtn.style.color = '#4b4b4b';
      supernovaBtn.textContent = `Requires: ${eligibility.errorText || 'Prerequisites not met'}`;
      supernovaBtn.setAttribute('aria-label', `Supernova locked: ${eligibility.statusText}`);
      supernovaBtn.classList.remove('upgrade-affordable');
    }
  }
}
