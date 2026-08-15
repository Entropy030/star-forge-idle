/* global Decimal */
import { CODEX_ENTRIES } from '../content/codex.js';
import { getVacuumCoherence } from '../eras/quantum/coherence.js';
import { reconcileCodexUnlocks } from '../core/codexProgression.js';

let typewriterInterval = null;
let activeNarrativeId = null;

function corruptText(cleanText, coherenceValue, gameState) {
  if (!cleanText) return "";

  if (gameState.prestige && gameState.prestige.autoStabilizer === true) {
    return cleanText;
  }
  
  let coh = 0.0;
  if (typeof coherenceValue === 'number') {
    coh = coherenceValue;
  } else if (coherenceValue instanceof Decimal) {
    coh = coherenceValue.toNumber();
  } else if (gameState.activeEpoch === 1) {
    coh = getVacuumCoherence(gameState).toNumber();
  } else {
    coh = 100;
  }

  // Ensure coh is scaled 0-1 for corruption chance math
  if (coh > 1.0) coh = coh / 100.0;
  coh = Math.max(0.0, Math.min(1.0, coh));

  if (coh >= 1.0) return cleanText;

  let corruptionChance = (1.0 - coh) * 0.06;
  if (corruptionChance <= 0) return cleanText;

  const pool = ['#', '%', '░', '█', 'Ø', '§', 'Δ', 'X', '0'];
  let result = "";
  for (let idx = 0; idx < cleanText.length; idx++) {
    let char = cleanText.charAt(idx);
    if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
      result += char;
    } else {
      if (Math.random() < corruptionChance) {
        let randChar = pool[Math.floor(Math.random() * pool.length)];
        result += randChar;
      } else {
        result += char;
      }
    }
  }
  return result;
}

export const CodexEngine = {
  _renderedList: [],

  update(gameState, options = {}) {
    this.unlockAvailableEntries(gameState);
    this.render(gameState);

    // Narrative typewriter
    const logNode = document.getElementById('chrono-neural-log');
    if (!logNode) return;

    let activeEntry = this.getActiveNarrative(gameState);
    let narrativeText = "";
    let nextNarrativeId = null;

    if (activeEntry) {
      narrativeText = activeEntry.narrativeText;
      nextNarrativeId = activeEntry.id;
    } else if (options.legacyNarrative) {
      narrativeText = options.legacyNarrative;
      nextNarrativeId = 'legacy';
    }

    if (activeNarrativeId !== nextNarrativeId) {
      activeNarrativeId = nextNarrativeId;
      logNode.setAttribute('data-active-text', narrativeText);
      logNode.title = narrativeText;

      const vacCoh = gameState.activeEpoch === 1 ? getVacuumCoherence(gameState) : new Decimal(100);
      const corrupted = corruptText(narrativeText, vacCoh, gameState);
      
      this._typeWriter(logNode, corrupted, 12);
    }
  },

  _typeWriter(element, text, speed) {
    element.textContent = "";
    let i = 0;
    if (typewriterInterval) clearInterval(typewriterInterval);
    
    // Test fake timers safe check (if 0 speed)
    if (speed === 0 || !text) {
        element.textContent = text;
        return;
    }

    typewriterInterval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
      }
    }, speed);
  },

  unlockAvailableEntries(gameState) {
    const unlockedEntryIds = reconcileCodexUnlocks(gameState);
    if (unlockedEntryIds.length > 0) {
      this._renderedList = []; // force re-render
    }
  },

  getActiveNarrative(gameState) {
    let bestEntry = null;
    let maxSort = -1;

    const unlocked = this.getUnlockedEntries(gameState);
    for (const entry of unlocked) {
      if (!entry.narrativeText) continue;
      if (entry.sortOrder > maxSort) {
        maxSort = entry.sortOrder;
        bestEntry = entry;
      }
    }
    return bestEntry;
  },

  getUnlockedEntries(gameState) {
    if (!gameState.codex) return [];
    const set = new Set(gameState.codex.unlockedEntryIds || []);
    return CODEX_ENTRIES.filter(e => set.has(e.id)).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  render(gameState) {
    const listEl = document.getElementById('codex-entry-list');
    const titleEl = document.getElementById('codex-detail-title');
    const bodyEl = document.getElementById('codex-detail-body');
    if (!listEl || !titleEl || !bodyEl) return;

    const unlocked = this.getUnlockedEntries(gameState);
    
    // Check if list has changed
    const currentIds = unlocked.map(e => e.id).join(',');
    if (this._renderedList === currentIds) return;

    listEl.innerHTML = '';
    
    if (unlocked.length === 0) {
      listEl.innerHTML = '<div style="color: #b2bec3; font-size: 0.9em; padding: 10px;">No entries discovered yet.</div>';
    }

    unlocked.forEach(entry => {
      const btn = document.createElement('button');
      btn.className = 'btn-macro-shift';
      
      let titleText = entry.title;
      // Remnant dynamic text
      if (entry.id === 'remnant-outcome' && gameState.meta && gameState.meta.lastSupernovaOutcome) {
         if (gameState.meta.lastSupernovaOutcome === 'neutron-star') titleText = 'Neutron Star';
         else if (gameState.meta.lastSupernovaOutcome === 'black-hole') titleText = 'Black Hole';
         else titleText = 'White Dwarf';
      }

      btn.textContent = titleText;
      btn.addEventListener('click', () => {
        titleEl.textContent = titleText;
        let bodyText = entry.body;
        if (entry.id === 'remnant-outcome' && gameState.meta && gameState.meta.lastSupernovaOutcome) {
            bodyText = 'A ' + titleText + ' formed from the collapse of the prior stellar generation, serving as an anchor in the void.';
        }
        bodyEl.textContent = bodyText;
      });
      listEl.appendChild(btn);
    });

    this._renderedList = currentIds;
  },

  dispose() {
    if (typewriterInterval) clearInterval(typewriterInterval);
    typewriterInterval = null;
    activeNarrativeId = null;
    this._renderedList = [];
  }
};
