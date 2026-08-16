/* eslint-disable import/no-cycle */


// [SEC-05] VISUAL FORMATTING & AUDIO HELPER ENGINES
import { getInitialEra2State } from '../state/createInitialState.js';
import { getProtonFusionCap, getCarbonGravityMultiplier, getGalacticDebrisRate, getGalacticDarkMatterRate, getGalacticMergeYield, getCompressionsCompleted } from '../core/economy.js';
import { getCurrentObjective, updateObjectiveProgress } from './objectives.js';
import { getPlasmaRates, getPlasmaUpgradeVisibility, getRecombinationEligibility } from '../eras/plasma/selectors.js';
import { getCurrentPhase } from '../engine/selectors.js';
import { getCosmosPresentation } from '../engine/cosmosPresentation.js';
import { getEraResourcePresentation } from '../engine/resourcePresentation.js';
import { getInflationEligibility, getQuantumUpgradeEligibility } from '../eras/quantum/selectors.js';
import { getVacuumCoherence } from '../eras/quantum/coherence.js';
import { getGalacticIgnitionEligibility, getStellarRates, getSupernovaOutcome, getSupernovaEligibility } from '../eras/stellar/selectors.js';
import { updateSupernovaOutcome } from './stellar.js';
import { CodexEngine } from './codex.js';
import { renderResourceHud } from './resourceHud.js';
import { renderCosmosExperience } from './cosmosExperience.js';
import { formatHudNumber } from './resourceFormatters.js';
import { getActionFailureMessage, isActionSuccessful } from './actionFeedback.js';
import { getCosmicTuningEligibility } from '../core/tuning.js';
import { buyCelestialCardAction as buyCelestialCard } from '../core/actions.js';
import { dispatchEngineCommand } from '../engine/dispatch.js';
// ==========================================================================
import { COSMIC_REGISTRY, ICONS, ARTIFACT_DEFINITIONS, SHOP_CONFIGS, t, i18n } from '../config/registry.js';
import { gameState, subscribeRuntimeState } from '../core/state.js';
import { saveGame, exportSave, importSave, wipeSave } from '../core/persistence.js';
import { Economy, getAmount, getHydrogenGenRate, getQuantumFluctuationRate, getEnergyDensityRate, getStardustYield, getPulsarShardYield, getSingularityMassYield, getBuyMultiplierCount, getCumulativeCost, getFusionSurgeMultiplier, getCompressionHeatYield } from '../core/economy.js';
import { Templates } from './templates.js';
import {
  FORGE_BUY_MODES,
  getForgeCardState,
  getForgeEffectData,
  getForgeUpgradeEligibility,
  normalizeForgeBuyMode
} from './forgePresentation.js';
import { getPrimaryNavigation, hasArtifactAccess, normalizeViewId } from './navigation.js';

let audioCtx;
let transTypewriterInterval;

async function playIntroNarrative() {
  const target = document.getElementById('intro-narrative-text');
  const btn = document.getElementById('btn-intro-complete');
  if (!target || target.dataset.playing === "true") return;
  target.dataset.playing = "true";

  const lines = [
    "t = -0.00000000001s :: PRE-COSMIC VACUUM STATE",
    "No space. No time. Only infinite probability density dormant in pure nothingness.",
    "A single observer awakens. Your first glance collapses the void and ignites the Star Forge."
  ];

  target.innerHTML = "";
  for (const line of lines) {
    if (target.dataset.skipped === "true") break;
    const p = document.createElement('p');
    p.className = 'intro-line';
    p.style.margin = "0 0 12px 0";
    target.appendChild(p);
    for (let i = 0; i < line.length; i++) {
      if (target.dataset.skipped === "true") break;
      p.textContent += line[i];
      await new Promise(r => setTimeout(r, 25));
    }
    if (target.dataset.skipped === "true") break;
    await new Promise(r => setTimeout(r, 300));
  }

  if (target.dataset.skipped === "true") {
    target.innerHTML = "";
    lines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'intro-line';
      p.style.margin = "0 0 12px 0";
      p.textContent = line;
      target.appendChild(p);
    });
  }

  if (btn) {
    btn.style.display = 'inline-block';
    btn.classList.remove('hidden');
    btn.style.opacity = '1';
  }
}

export function showIntroScreenCinematic(onComplete) {
  const overlay = document.getElementById('intro-screen-overlay');
  const storyCard = document.getElementById('intro-story-card');
  const textEl = document.getElementById('intro-narrative-text');
  const completeBtn = document.getElementById('btn-intro-complete');
  if (!overlay || !textEl) {
    if (onComplete) onComplete();
    return;
  }
  if (overlay.dataset.initialized === "true") return;
  overlay.dataset.initialized = "true";

  if (window.playtestHarness && window.playtestHarness.isRunning) {
    if (onComplete) onComplete();
    return;
  }

  let isDone = false;

  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  if (storyCard) {
    storyCard.style.display = 'flex';
    storyCard.style.opacity = '1';
    storyCard.style.filter = 'none';
  }
  if (completeBtn) completeBtn.style.display = 'none';

  function finishIntro() {
    if (isDone) return;
    isDone = true;
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      if (gameState.unfold) gameState.unfold.introCompleted = true;
      if (onComplete) onComplete();
    }, 1200);
  }

  if (completeBtn) {
    completeBtn.onclick = (e) => {
      e.stopPropagation();
      finishIntro();
    };
  }

  if (storyCard) {
    storyCard.onclick = () => {
      textEl.dataset.skipped = "true";
      playIntroNarrative();
    };
  }

  playIntroNarrative();
}

export function startEraTransition(targetEpoch, transitionText, onConfirm) {
  const overlay = document.getElementById('era-transition-overlay');
  const titleEl = document.getElementById('trans-title');
  const descEl = document.getElementById('trans-desc');
  const confirmBtn = document.getElementById('btn-trans-confirm');

  if (!overlay || !titleEl || !descEl || !confirmBtn) {
    onConfirm();
    return;
  }

  if (window.playtestHarness && window.playtestHarness.isRunning) {
    onConfirm();
    return;
  }

  overlay.style.display = 'flex';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease-in-out';
  setTimeout(() => overlay.style.opacity = '1', 10);

  titleEl.textContent = `Era ${targetEpoch === 2 ? 'II' : targetEpoch === 3 ? 'III' : 'IV'} Cosmic Transition`;
  confirmBtn.style.display = 'none';

  let i = 0;
  descEl.textContent = "";
  clearInterval(transTypewriterInterval);
  transTypewriterInterval = setInterval(() => {
    if (i < transitionText.length) {
      descEl.textContent += transitionText.charAt(i);
      i++;
    } else {
      clearInterval(transTypewriterInterval);
      confirmBtn.style.display = 'block';
      confirmBtn.style.opacity = '0';
      confirmBtn.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => confirmBtn.style.opacity = '1', 10);
    }
  }, 25);

  confirmBtn.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      onConfirm();
    }, 500);
  };
}



export const ActManager = {
  evaluate() {
    if (!gameState) return;

    if (gameState.activeEpoch === 1) {
      if (!gameState.era1) {
        gameState.era1 = { currentAct: 1, quantumFoam: 0, unfoldCount: 0 };
      }
      const qf = gameState.resources.quantumFluctuations ? gameState.resources.quantumFluctuations.amount : new Decimal(0);
      gameState.era1.quantumFoam = qf.toNumber();

      let targetAct = 1;
      const eligibility = getInflationEligibility(gameState);
      if (eligibility.isEligible) {
        targetAct = 3;
      } else if (eligibility.qf.gte(100) && eligibility.vacuumCoherence.gte(1)) {
        targetAct = 2;
      } else if (gameState.discoveries && gameState.discoveries.has('qf_100') && eligibility.vacuumCoherence.gte(1)) {
        targetAct = 2;
      }

      if (targetAct !== gameState.era1.currentAct) {
        gameState.era1.currentAct = targetAct;
        if (targetAct === 2 && gameState.discoveries) {
          gameState.discoveries.add('qf_10');
        }
        this.triggerActPunctuation(1, targetAct);
      }
      this.syncActAttribute(gameState.era1.currentAct);

    } else if (gameState.activeEpoch === 2) {
      if (!gameState.era2) {
        gameState.era2 = getInitialEra2State();
      }
      let targetAct = 1;
      const protons = gameState.resources.protons ? gameState.resources.protons.amount : new Decimal(0);
      
      const hasGluonUnlocked = gameState.upgrades.plasma && gameState.upgrades.plasma.gluonBinding && 
        (gameState.upgrades.plasma.gluonBinding.level > 0 || (gameState.upgrades.plasma.quarkCondenser && gameState.upgrades.plasma.quarkCondenser.level >= 3));
        
      const hasProtonSynthesizer = gameState.upgrades.plasma && gameState.upgrades.plasma.plasmaAutomation && gameState.upgrades.plasma.plasmaAutomation.level > 0;
      
      if (hasProtonSynthesizer || protons.gte(800000) || (gameState.plasmaTemperature && gameState.plasmaTemperature.lte(3000))) {
        targetAct = 3;
      } else if (hasGluonUnlocked) {
        targetAct = 2;
      }

      if (targetAct !== gameState.era2.currentAct) {
        gameState.era2.currentAct = targetAct;
        this.triggerActPunctuation(2, targetAct);
      }
      this.syncActAttribute(gameState.era2.currentAct);
    } else {
      this.syncActAttribute(1);
    }
  },

  triggerActPunctuation(epochNum, actNum) {
    const actTitles = {
      1: { 1: "ACT I: QUANTUM INITIATION", 2: "ACT II: FLUCTUATION HARVEST", 3: "ACT III: INFLATION SINGULARITY" },
      2: { 1: "ACT I: PRIMORDIAL SOUP", 2: "ACT II: HADRON SYNTHESIS", 3: "ACT III: PLASMA RECOMBINATION" }
    };
    const title = actTitles[epochNum]?.[actNum] || `ACT ${actNum}: PHASE SHIFT`;
    if (typeof Viewport !== 'undefined' && Viewport.log) {
      Viewport.log(`✨ [STORY EVENT] ${title}`);
    }
    const logWrapper = document.querySelector('.neural-log-wrapper') || document.getElementById('chrono-neural-log');
    if (logWrapper) {
      logWrapper.classList.remove('log-pulse-active');
      requestAnimationFrame(() => {
        logWrapper.classList.add('log-pulse-active');
      });
    }
  },

  syncActAttribute(actNum) {
    const actStr = String(actNum || 1);
    if (document.body && document.body.getAttribute('data-act') !== actStr) {
      document.body.setAttribute('data-act', actStr);
    }
    const appRoot = document.getElementById('app-root');
    if (appRoot && appRoot.getAttribute('data-act') !== actStr) {
      appRoot.setAttribute('data-act', actStr);
    }
  }
};

export const ArtifactManager = {
  activeSlotForPicker: null,

  recalculateArtifactModifiers() {
    if (!gameState) return;
    if (!gameState.artifacts) {
      gameState.artifacts = {
        equipped: [null, null, null],
        unlocked: ["quantum_lens", "density_compressor", "pulse_coupler", "singularity_core", "vacuum_stabilizer", "big_bang_catalyst"],
        modifiers: { productionMult: 1.0, costDiscount: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0, activeClickBoostSec: 0 }
      };
    }

    const mods = {
      productionMult: 1.0,
      costDiscount: 0.0,
      clickPassiveBoost: 0.0,
      act3Multiplier: 1.0,
      extraPrestige: 0,
      activeClickBoostSec: gameState.artifacts.modifiers ? (gameState.artifacts.modifiers.activeClickBoostSec || 0) : 0
    };

    const equipped = gameState.artifacts.equipped || [null, null, null];
    for (let i = 0; i < 3; i++) {
      const id = equipped[i];
      if (!id) continue;
      const def = ARTIFACT_DEFINITIONS[id];
      if (!def || !def.effect) continue;

      const eff = def.effect;
      if (eff.type === 'productionMult') mods.productionMult *= eff.value;
      if (eff.type === 'costDiscount') mods.costDiscount = Math.min(0.9, mods.costDiscount + eff.value);
      if (eff.type === 'clickPassiveBoost') mods.clickPassiveBoost += eff.value;
      if (eff.type === 'act3Multiplier') mods.act3Multiplier *= eff.value;
      if (eff.type === 'extraPrestige') mods.extraPrestige += eff.value;
    }

    gameState.artifacts.modifiers = mods;
    this.renderBar();
  },

  equip(slotIndex, artifactId) {
    if (slotIndex < 0 || slotIndex > 2) return;
    if (!gameState.artifacts) this.recalculateArtifactModifiers();

    const equipped = gameState.artifacts.equipped;
    const existingIndex = equipped.indexOf(artifactId);
    if (existingIndex !== -1) {
      equipped[existingIndex] = null;
    }

    equipped[slotIndex] = artifactId;
    this.recalculateArtifactModifiers();
    this.closePicker();
  },

  unequip(slotIndex) {
    if (slotIndex < 0 || slotIndex > 2) return;
    if (!gameState.artifacts) this.recalculateArtifactModifiers();

    gameState.artifacts.equipped[slotIndex] = null;
    this.recalculateArtifactModifiers();
    this.closePicker();
  },

  unlock(artifactId) {
    if (!gameState.artifacts) this.recalculateArtifactModifiers();
    if (!gameState.artifacts.unlocked.includes(artifactId)) {
      gameState.artifacts.unlocked.push(artifactId);
    }
  },

  isSlotUnlocked(slotIndex) {
    if (slotIndex === 0) return true;
    if (slotIndex === 1) return gameState.activeEpoch >= 2 || (gameState.era1 && gameState.era1.currentAct >= 3);
    if (slotIndex === 2) return gameState.activeEpoch >= 3;
    return false;
  },

  openPicker(slotIndex) {
    if (!this.isSlotUnlocked(slotIndex)) {
      console.warn(`Slot ${slotIndex + 1} is locked! Advance to Era ${slotIndex + 1} to unlock.`);
      return;
    }
    this.activeSlotForPicker = slotIndex;
    const modal = document.getElementById('artifact-picker-modal');
    const slotNum = document.getElementById('picker-slot-num');
    if (slotNum) slotNum.textContent = String(slotIndex + 1);

    this.renderPicker();
    if (modal) modal.style.display = 'flex';
  },

  closePicker() {
    this.activeSlotForPicker = null;
    const modal = document.getElementById('artifact-picker-modal');
    if (modal) modal.style.display = 'none';
  },

  _lastRenderSignature: "",

  renderBar() {
    const bar = document.getElementById('artifact-bar');
    if (!bar) return;

    const equipped = gameState.artifacts ? (gameState.artifacts.equipped || [null, null, null]) : [null, null, null];
    const unlocked = gameState.artifacts ? (gameState.artifacts.unlocked || []) : [];
    const signature = `${gameState.activeEpoch}|${equipped.join(',')}|${unlocked.join(',')}`;

    if (this._lastRenderSignature === signature) return;
    this._lastRenderSignature = signature;

    bar.style.display = 'flex';

    for (let i = 0; i < 3; i++) {
      const slotEl = document.querySelector(`.artifact-slot[data-slot="${i}"]`);
      if (!slotEl) continue;

      const isUnlocked = this.isSlotUnlocked(i);
      if (!isUnlocked) {
        slotEl.removeAttribute('data-type');
        slotEl.style.opacity = '0.5';
        slotEl.style.cursor = 'not-allowed';
        slotEl.innerHTML = `<span class="artifact-slot-empty" style="color:#64748b;">${ICONS.lock} SLOT ${i + 1} (ERA ${i + 1})</span>`;
        continue;
      }

      slotEl.style.opacity = '1';
      slotEl.style.cursor = 'pointer';
      const artId = equipped[i];
      if (!artId) {
        slotEl.removeAttribute('data-type');
        slotEl.innerHTML = `<span class="artifact-slot-empty">+ SLOT ${i + 1}</span>`;
      } else {
        const def = ARTIFACT_DEFINITIONS[artId];
        if (def) {
          slotEl.setAttribute('data-type', def.type);
          slotEl.innerHTML = Templates.artifactCard(def);
        }
      }
    }

    this.renderInventory();
  },

  renderInventory() {
    const invEl = document.getElementById('artifact-inventory-list');
    if (!invEl) return;

    invEl.innerHTML = '';
    const unlocked = gameState.artifacts ? (gameState.artifacts.unlocked || []) : [];
    const equipped = gameState.artifacts ? (gameState.artifacts.equipped || [null, null, null]) : [null, null, null];

    for (let id of unlocked) {
      const def = ARTIFACT_DEFINITIONS[id];
      if (!def) continue;

      const equippedSlot = equipped.indexOf(id);
      const isEquipped = equippedSlot !== -1;

      const item = document.createElement('div');
      item.className = 'artifact-picker-item';
      item.innerHTML = Templates.artifactInventoryItem(def, isEquipped, equippedSlot);
      invEl.appendChild(item);
    }
  },

  renderPicker() {
    const listEl = document.getElementById('artifact-picker-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const unlocked = gameState.artifacts ? (gameState.artifacts.unlocked || []) : [];
    const equipped = gameState.artifacts ? (gameState.artifacts.equipped || [null, null, null]) : [null, null, null];
    const currentSlot = this.activeSlotForPicker;

    if (equipped[currentSlot]) {
      const currentId = equipped[currentSlot];
      const def = ARTIFACT_DEFINITIONS[currentId];
      if (def) {
        const item = document.createElement('div');
        item.className = 'artifact-picker-item';
        item.innerHTML = Templates.artifactPickerEquippedItem(def, currentSlot);
        listEl.appendChild(item);
      }
    }

    for (let id of unlocked) {
      if (equipped[currentSlot] === id) continue;
      const def = ARTIFACT_DEFINITIONS[id];
      if (!def) continue;

      const isEquippedElsewhere = equipped.includes(id);
      const item = document.createElement('div');
      item.className = 'artifact-picker-item';
      item.innerHTML = Templates.artifactPickerAvailableItem(def, id, currentSlot, isEquippedElsewhere);
      listEl.appendChild(item);
    }
  }
};


export const format = formatHudNumber;

function updateComparisonValue(node, current, target, unit = '', separator = '/') {
  if (!node) return;
  let currentNode = node.querySelector('.metric-comparison-current');
  let separatorNode = node.querySelector('.metric-comparison-separator');
  let targetNode = node.querySelector('.metric-comparison-target');
  if (!currentNode || !separatorNode || !targetNode) {
    currentNode = node.ownerDocument.createElement('span');
    currentNode.className = 'metric-comparison-current';
    separatorNode = node.ownerDocument.createElement('span');
    separatorNode.className = 'metric-comparison-separator';
    targetNode = node.ownerDocument.createElement('span');
    targetNode.className = 'metric-comparison-target';
    node.replaceChildren(currentNode, separatorNode, targetNode);
  }
  currentNode.textContent = String(current ?? '');
  separatorNode.textContent = ` ${separator} `;
  targetNode.textContent = `${target ?? ''}${unit ? ` ${unit}` : ''}`;
}

function syncChildren(container, children) {
  const current = [...container.children];
  if (current.length === children.length && current.every((child, index) => child === children[index])) return;
  container.replaceChildren(...children);
}

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function playSupernovaSound() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) { console.log("Audio contexts unavailable."); }
}

// ==========================================================================
// [SEC-07] DOM MUTATION INTERFACE ADAPTER (DEEP VIEWPORT MODULE)
// ==========================================================================
export const Viewport = {
  elCache: {},
  diffCache: {},
  getEl(id) {
    if (!this.elCache[id]) {
      this.elCache[id] = document.getElementById(id);
    }
    return this.elCache[id];
  },
  clearElCache() {
    this.elCache = {};
    this.diffCache = {};
  },

  setTextContent(idOrEl, text) {
    const el = typeof idOrEl === 'string' ? this.getEl(idOrEl) : idOrEl;
    if (!el) return;
    const cacheKey = el.id ? `text_${el.id}` : null;
    const str = String(text);
    if (cacheKey) {
      if (this.diffCache[cacheKey] === str) return;
      this.diffCache[cacheKey] = str;
    }
    if (el.textContent !== str) {
      el.textContent = str;
    }
  },

  setInnerHTML(idOrEl, html) {
    const el = typeof idOrEl === 'string' ? this.getEl(idOrEl) : idOrEl;
    if (!el) return;

    const cacheKey = el.id ? `html_${el.id}` : null;
    const str = String(html);

    if (cacheKey) {
      if (this.diffCache[cacheKey] === str) return;
      this.diffCache[cacheKey] = str;
    }

    if (!str.includes('<')) {
      if (el.textContent !== str) {
        el.textContent = str;
      }
    } else if (el.innerHTML !== str) {
      el.innerHTML = str;
    }
  },

  showElement(idOrEl) {
    const el = typeof idOrEl === 'string'
      ? this.getEl(idOrEl)
      : idOrEl;

    if (!el) return;

    el.style.display = '';
  },

  hideElement(idOrEl) {
    const el = typeof idOrEl === 'string'
      ? this.getEl(idOrEl)
      : idOrEl;

    if (!el) return;

    el.style.display = 'none';
  },

  _coreAnchorCache: null,


  syncAnchor(force = false) {
    const canvasContainer = document.querySelector('.core-canvas');
    if (!canvasContainer) return;
    if (!force && this._coreAnchorCache && (Date.now() - this._coreAnchorCache.time < 500)) {
      return;
    }
    const rect = canvasContainer.getBoundingClientRect();
    const centerY = rect.top + (rect.height / 2);
    const centerX = rect.left + (rect.width / 2);
    this._coreAnchorCache = { x: centerX, y: centerY, time: Date.now() };
    document.documentElement.style.setProperty('--core-anchor-y', `${centerY}px`);
    document.documentElement.style.setProperty('--core-anchor-x', `${centerX}px`);

    let totalProgress = 0;
    if (gameState.upgrades) {
      for (let cat of ['quantum', 'plasma']) {
        if (gameState.upgrades[cat]) {
          for (let key in gameState.upgrades[cat]) {
            totalProgress += (gameState.upgrades[cat][key].level || 0);
          }
        }
      }
    }
    document.documentElement.style.setProperty('--cosmic-progress', totalProgress);
  },

  setSystemStatus(message, type = 'info') {
    const el = document.getElementById('system-status');
    if (!el) return;
    el.textContent = `[System] ${message}`;
    el.style.color = type === 'error' ? '#ff7675' : type === 'success' ? '#55efc4' : '#b2bec3';
  },

  setPlaytestStatus(msg, type = 'info') {
    const el = document.getElementById('playtest-inline-status');
    if (!el) return;
    el.textContent = `[Playtest] ${msg}`;
    el.style.color = type === 'error' ? '#ff7675' : type === 'success' ? '#55efc4' : '#b2bec3';
  },

  setInlineActionFeedback(elementId, message) {
    let feedbackEl = document.getElementById(elementId + '-feedback');
    if (!feedbackEl) {
      const targetEl = document.getElementById(elementId);
      if (!targetEl) return;
      const parent = targetEl.matches('.forge-card, .cosmic-card')
        ? targetEl
        : targetEl.closest('.forge-card, .cosmic-card') || targetEl.parentElement;
      feedbackEl = document.createElement('div');
      feedbackEl.id = elementId + '-feedback';
      feedbackEl.className = 'inline-feedback-text';
      feedbackEl.setAttribute('role', 'status');
      feedbackEl.setAttribute('aria-live', 'polite');
      parent.appendChild(feedbackEl);
    }
    feedbackEl.textContent = message;
  },

  clearInlineActionFeedback(elementId) {
    if (elementId) {
      document.getElementById(`${elementId}-feedback`)?.remove();
      return;
    }
    document.querySelectorAll('.inline-feedback-text').forEach(element => element.remove());
  },

  showTheatrical(outcome, titleColor, tempText, elementsText, rewardHTML) {
    const overlay = document.getElementById('theatrical-overlay');
    const title = document.getElementById('theatrical-title');
    const core = document.getElementById('theatrical-core');
    const statsPanel = document.getElementById('theatrical-stats');

    title.textContent = `${outcome} Formation`;
    title.style.color = titleColor;
    document.getElementById('theatrical-temp').textContent = tempText;
    document.getElementById('theatrical-elements').textContent = elementsText;
    document.getElementById('theatrical-reward').innerHTML = rewardHTML;

    overlay.classList.add('theatrical-active');
    setTimeout(() => {
      if (outcome === "Black Hole") {
        core.style.background = "#030208";
        core.style.boxShadow = "0 0 50px 20px #6c5ce7";
        core.style.transform = "scale(0)";
      } else if (outcome === "Neutron Star") {
        core.style.background = "#00cec9";
        core.style.boxShadow = "0 0 50px 20px #00cec9";
        core.style.transform = "scale(0.5)";
      } else {
        core.style.transform = "scale(0.2)";
      }
    }, 1500);
    setTimeout(() => { statsPanel.style.opacity = "1"; }, 3500);
  },

  switchTab(tabId) {
    const targetTabId = normalizeViewId(gameState, tabId);

    gameState.activeTab = targetTabId;
    document.body.setAttribute('data-tab', targetTabId);

    document.querySelectorAll('.tab-btn, .rail-btn').forEach(el => el.classList.remove('active'));

    const targetNav = document.getElementById(`nav-${targetTabId}`);
    if (targetNav) targetNav.classList.add('active');

    if (targetTabId === 'prestige' && hasArtifactAccess(gameState)) {
      ArtifactManager.renderBar();
      ArtifactManager.renderInventory();
    }
    if (targetTabId === 'prestige') {
      this.renderShop('stardust');
      this.renderShop('pulsar');
      this.renderShop('singularity');
      this.renderPrestigeVisibility();
      this.renderStats();
      this.renderSystemTab();
      if (gameState.activeEpoch === 3) updateSupernovaOutcome();
    }
  },

  renderStats() {
    document.getElementById('stat-supernovas').textContent = format(gameState.stats.supernovas);
    document.getElementById('stat-stardust').textContent = format(gameState.stats.totalStardust);
    document.getElementById('stat-max-temp').textContent = format(gameState.stats.maxTemp) + " K";

    const achList = document.getElementById('achievements-list');
    if (!achList) return;
    achList.innerHTML = '';

    for (let key in COSMIC_REGISTRY.achievements) {
      let def = COSMIC_REGISTRY.achievements[key];
      let state = gameState.achievements[key];
      const row = document.createElement('div');
      row.style.cssText = `background: rgba(255,255,255,0.02); border: 1px solid ${state.unlocked ? '#f1c40f' : 'rgba(255,255,255,0.05)'}; padding: 14px 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; width:100%;`;
      row.innerHTML = `
        <div style="text-align: left; opacity: ${state.unlocked ? '1' : '0.4'};">
          <div style="font-weight: 500; color: ${state.unlocked ? '#f1c40f' : '#fff'}; font-size:0.95rem;">${def.name}</div>
          <small style="color: #b2bec3; font-size:0.75rem;">${def.desc}</small>
        </div>
        <div style="font-size: 1.3rem; opacity: ${state.unlocked ? '1' : '0.15'};">🏆</div>
      `;
      achList.appendChild(row);
    }
  },

  renderShop(shopId) {
    const config = SHOP_CONFIGS[shopId];
    if (!config) return;
    const shopList = document.getElementById(config.containerId);
    if (!shopList) return;

    const upgradesObj = COSMIC_REGISTRY.upgrades[shopId];

    // Build rows if container is empty
    if (shopList.children.length === 0) {
      for (let key in upgradesObj) {
        let def = upgradesObj[key];
        const row = document.createElement('div');
        row.id = `${shopId}-row-${key}`;
        row.className = 'cosmic-card';
        row.innerHTML = Templates.genericTierListRow(config.btnColor, def.rarity || 'common');
        row.querySelector('.upgrade-btn').addEventListener('click', () => Economy.buy(shopId, key));
        shopList.appendChild(row);
      }
    }

    // Update rows in place
    for (let key in upgradesObj) {
      let def = upgradesObj[key];
      let state = gameState.upgrades[shopId][key];
      let isMaxed = state.level >= def.max;
      let canAfford = getAmount(config.currency).gte(state.cost) && !isMaxed;

      const row = document.getElementById(`${shopId}-row-${key}`);
      if (row) {
        if (canAfford) {
          row.classList.add('upgrade-affordable');
        } else {
          row.classList.remove('upgrade-affordable');
        }

        const lvlSpan = row.querySelector('.lvl-display');
        if (lvlSpan) lvlSpan.textContent = ` (Lvl ${state.level}/${def.max})`;

        const btn = row.querySelector('.upgrade-btn');
        if (btn) {
          btn.textContent = isMaxed ? 'MAXED' : 'Cost: ' + format(state.cost) + ' ' + config.label;
          btn.disabled = !canAfford;
          btn.style.background = canAfford ? config.btnColor : 'rgba(255,255,255,0.04)';
          btn.style.color = canAfford ? '#ffffff' : '#636e72';
          btn.style.borderColor = canAfford ? 'transparent' : 'rgba(255,255,255,0.05)';
        }
      }
    }
  },

  renderSystemTab() {
    const rankInfo = document.getElementById('system-rank-info');
    if (rankInfo) {
      if (COSMIC_REGISTRY.systemRanks && COSMIC_REGISTRY.systemRanks[gameState.systemRank]) {
        let currentRankDef = COSMIC_REGISTRY.systemRanks[gameState.systemRank];
        let html = `<h3 style="margin-top:0; color:#fdcb6e; font-weight:400; font-size:1.1rem; letter-spacing:1px;">Rank ${gameState.systemRank}: ${currentRankDef.name}</h3>`;
        html += `<ul style="text-align: left; list-style-type: none; padding-left: 0; margin-bottom: 0; display:flex; flex-direction:column; gap:8px;">`;
        for (let mission of currentRankDef.missions) {
          let isDone = gameState.completedMissions.includes(mission.id);
          let statusText = isDone ? "<span style='color:#2ed573;'>[COMPLETED]</span>" : "<span style='color:#ff7675;'>[IN PROGRESS]</span>";
          html += `<li style="padding: 10px 14px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); font-size:0.85rem; display:flex; justify-content:between; align-items:center;">
            <span style="flex:1; color:#e1e4ea;">${mission.desc}</span> <strong>${statusText}</strong>
          </li>`;
        }
        html += `</ul>`;

        if (rankInfo.getAttribute('data-current-rank') !== String(gameState.systemRank)) {
          rankInfo.innerHTML = html;
          rankInfo.setAttribute('data-current-rank', String(gameState.systemRank));
        }
      } else {
        rankInfo.innerHTML = `<h3 style="margin-top:0; color:#f1c40f; text-align:center;">✨ Cosmic Overlord Authority Achieved ✨</h3>`;
      }
    }

    const cardsList = document.getElementById('celestial-cards-list');
    if (!cardsList) return;

    if (cardsList.children.length === 0) {
      for (let key in COSMIC_REGISTRY.celestialCards) {
        let def = COSMIC_REGISTRY.celestialCards[key];
        const row = document.createElement('div');
        row.id = `card-row-${key}`;
        row.className = 'cosmic-card';
        row.innerHTML = Templates.genericTierListRow('#74b9ff', def.rarity || 'common');
        row.querySelector('.upgrade-btn').addEventListener('click', () => {
          const res = buyCelestialCard(key);
          if (res && !isActionSuccessful(res)) {
            Viewport.setInlineActionFeedback(`card-row-${key}`, getActionFailureMessage(res));
          } else {
            Viewport.clearInlineActionFeedback(`card-row-${key}`);
          }
        });
        cardsList.appendChild(row);
      }
    }

    for (let key in COSMIC_REGISTRY.celestialCards) {
      let def = COSMIC_REGISTRY.celestialCards[key];
      let state = gameState.cards[key];
      if (!def || !state) continue;

      let canAfford = getAmount(def.currency).gte(state.cost);
      const row = document.getElementById(`card-row-${key}`);
      if (row) {
        const lvlSpan = row.querySelector('.lvl-display');
        if (lvlSpan) lvlSpan.textContent = `(Lvl ${state.level})`;

        const btn = row.querySelector('.upgrade-btn');
        if (btn) {
          let currencyLabel = def.currency === 'hydrogen' ? 'H' : def.currency === 'helium' ? 'He' : def.currency;
          btn.textContent = `Cost: ${format(state.cost)} ${currencyLabel}`;
          // Removed btn.disabled to allow clicks to show inline feedback
          btn.style.background = canAfford ? '#74b9ff' : 'rgba(255,255,255,0.04)';
          btn.style.color = canAfford ? '#fff' : '#636e72';
          btn.style.borderColor = canAfford ? 'transparent' : 'rgba(255,255,255,0.05)';
        }
      }
    }
  },

  renderPrestigeVisibility() {
    const sdSection = document.getElementById('prestige-stardust-section');
    const plSection = document.getElementById('prestige-pulsar-section');
    const sgSection = document.getElementById('prestige-singularity-section');
    if (sdSection) sdSection.style.display = gameState.currencies.stardust.amount.gt(0) ? '' : 'none';
    if (plSection) plSection.style.display = (gameState.currencies.pulsarShards.amount.gt(0) || gameState.upgrades.pulsar.autoCompress.level > 0) ? '' : 'none';
    if (sgSection) sgSection.style.display = (gameState.currencies.singularityMass.amount.gt(0) || gameState.upgrades.singularity.darkGravity.level > 0) ? '' : 'none';

    const tuningBtn = document.getElementById('btn-open-tuning');
    if (tuningBtn) {
      tuningBtn.style.display = (gameState.activeEpoch === 5 || gameState.currencies.bits.amount.gt(0)) ? 'block' : 'none';
    }
  },



  renderGenericTierList(containerId, category, costLabelText, displayColor, activeCurrencyField) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.renderForgeBuyControls();

    if (!container.dataset.initialized || container.dataset.category !== category) {
      let headerText = category === 'quantum' ? 'FUNDAMENTAL LAWS' :
        (category === 'plasma' ? 'PRIMORDIAL PRODUCTION CHAIN' : 'MACRO GALACTIC ACCRETION NETWORK');
      container.innerHTML = `<div class="section-title" style="color: ${displayColor}; font-size: 1.0rem; letter-spacing: 2px; margin-bottom: 15px; font-weight: bold;">${headerText}</div>`;
      for (let key in COSMIC_REGISTRY.upgrades[category]) {
        const def = COSMIC_REGISTRY.upgrades[category][key];
        const row = document.createElement('div');
        row.id = `${category}-row-${key}`;
        row.className = 'cosmic-card forge-card';
        row.style.display = 'none'; // start hidden
        row.innerHTML = Templates.forgeUpgradeCard(def.rarity || 'common');
        const btn = row.querySelector('.upgrade-btn');
        btn.addEventListener('click', () => {
          const res = Economy.buy(category, key);
          if (res && !isActionSuccessful(res)) {
            Viewport.setInlineActionFeedback(`${category}-row-${key}`, getActionFailureMessage(res));
          } else {
            Viewport.clearInlineActionFeedback(`${category}-row-${key}`);
          }
        });
        row._cache = {
          name: row.querySelector('.name-display'),
          lvl: row.querySelector('.lvl-display'),
          desc: row.querySelector('.desc-display'),
          btn,
          role: row.querySelector('.forge-role-display'),
          effect: row.querySelector('.forge-effect-display'),
          contribution: row.querySelector('.forge-contribution-display'),
          stateBadge: row.querySelector('.forge-state-badge'),
          cost: row.querySelector('.forge-cost-display'),
          requirements: row.querySelector('.forge-requirements'),
          requirementsList: row.querySelector('.forge-requirements-list'),
          milestone: row.querySelector('.forge-milestone-display')
        };
        container.appendChild(row);
      }
      container.dataset.initialized = 'true';
      container.dataset.category = category;
    }

    for (let key in COSMIC_REGISTRY.upgrades[category]) {
      let def = COSMIC_REGISTRY.upgrades[category][key];
      let state = gameState.upgrades[category][key];
      if (!state) continue;

      const row = document.getElementById(`${category}-row-${key}`);
      if (!row) continue;
      if (!row._cache) {
        row._cache = {
          name: row.querySelector('.name-display'),
          lvl: row.querySelector('.lvl-display'),
          desc: row.querySelector('.desc-display'),
          btn: row.querySelector('.upgrade-btn'),
          role: row.querySelector('.forge-role-display'),
          effect: row.querySelector('.forge-effect-display'),
          contribution: row.querySelector('.forge-contribution-display'),
          stateBadge: row.querySelector('.forge-state-badge'),
          cost: row.querySelector('.forge-cost-display'),
          requirements: row.querySelector('.forge-requirements'),
          requirementsList: row.querySelector('.forge-requirements-list'),
          milestone: row.querySelector('.forge-milestone-display')
        };
      }

      const eligibility = getForgeUpgradeEligibility(gameState, category, key);
      const isVisible = eligibility.discovered;

      if (!isVisible) {
        row.style.display = 'none';
        row.dataset.forgeState = 'undiscovered';
        this.clearInlineActionFeedback(`${category}-row-${key}`);
        continue;
      } else {
        row.style.display = 'flex';
      }

      const btn = row._cache.btn;

      let currentCostLabel = typeof costLabelText === 'function' ? costLabelText(key) : costLabelText;
      const currencyKey = Economy.resolveCurrencyKey(category, key, def);
      let actualFunding = getAmount(currencyKey);

      const discount = gameState.artifacts?.modifiers?.costDiscount || 0.0;
      const discountedCost = discount > 0 ? state.cost.times(1.0 - discount).floor() : state.cost;

      const loops = getBuyMultiplierCount(category, key, def, state, currencyKey);
      const displayCost = getCumulativeCost(discountedCost, def.costScaling, loops);

      let isMaxed = def.max !== undefined && state.level >= def.max;
      let isAffordable = eligibility.unlocked && !isMaxed && actualFunding.gte(displayCost);
      const cardState = getForgeCardState({ eligibility, level: state.level, isMaxed, isAffordable });
      const effect = getForgeEffectData(gameState, category, key);

      row._cache.name.textContent = def.name;
      row._cache.lvl.textContent = isMaxed ? 'MAX' : `Lv ${state.level}`;
      row._cache.role.textContent = effect.role;
      row._cache.effect.textContent = effect.primary;
      row._cache.contribution.textContent = effect.contribution;
      row._cache.stateBadge.textContent = cardState.label;
      row._cache.cost.textContent = isMaxed ? 'Complete' : `${format(displayCost)} ${currentCostLabel}`;
      row.dataset.forgeState = cardState.id;

      let nextMilestoneLvl = (Math.floor(state.level / 10) + 1) * 10;
      row._cache.desc.textContent = def.desc;
      row._cache.milestone.textContent = def.max !== undefined ? '' : t('milestone_tooltip', { lvl: nextMilestoneLvl });

      row._cache.requirements.hidden = eligibility.unlocked || eligibility.requirements.length === 0;
      const existingRequirements = new Map(
        [...row._cache.requirementsList.children].map(item => [item.dataset.requirementId, item])
      );
      const requirementRows = eligibility.requirements.map(requirement => {
        const item = existingRequirements.get(requirement.id) || document.createElement('li');
        item.dataset.requirementId = requirement.id;
        item.className = requirement.met ? 'requirement-met' : 'requirement-missing';
        let icon = item.querySelector('.forge-requirement-icon');
        let label = item.querySelector('.forge-requirement-label');
        let value = item.querySelector('.forge-requirement-value');
        if (!icon || !label || !value) {
          icon = document.createElement('span');
          icon.className = 'forge-requirement-icon';
          label = document.createElement('span');
          label.className = 'forge-requirement-label';
          value = document.createElement('span');
          value.className = 'forge-requirement-value';
          item.replaceChildren(icon, label, value);
        }
        icon.textContent = requirement.met ? '✓' : '✕';
        icon.setAttribute('aria-label', requirement.met ? 'Requirement met' : 'Requirement not met');
        label.textContent = requirement.label;
        updateComparisonValue(value, format(requirement.current), format(requirement.target));
        return item;
      });
      syncChildren(row._cache.requirementsList, requirementRows);

      if (isAffordable) row.classList.add('upgrade-affordable');
      else row.classList.remove('upgrade-affordable');

      btn.textContent = isMaxed ? 'Maxed' : eligibility.unlocked ? `Buy ×${loops}` : 'Locked';
      btn.disabled = !isAffordable;
      btn.setAttribute('aria-disabled', String(!isAffordable));
      btn.setAttribute('aria-label', `${btn.textContent} ${def.name}`);
      btn.style.background = isAffordable ? displayColor : '';
      btn.style.color = isAffordable ? '#030208' : '';
      btn.style.borderColor = isAffordable ? 'transparent' : '';
    }
  },

  setForgeBuyMode(mode) {
    gameState.buyMode = normalizeForgeBuyMode(mode);
    this.renderForgeBuyControls();
  },

  renderForgeBuyControls() {
    const control = document.getElementById('forge-buy-mode');
    if (!control) return;

    if (control.dataset.bound !== 'true') {
      control.querySelectorAll('[data-buy-mode]').forEach(button => {
        button.addEventListener('click', () => this.setForgeBuyMode(button.dataset.buyMode));
      });
      control.dataset.bound = 'true';
    }

    const currentMode = normalizeForgeBuyMode(gameState.buyMode);
    control.querySelectorAll('[data-buy-mode]').forEach(button => {
      const value = normalizeForgeBuyMode(button.dataset.buyMode);
      const active = value === currentMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const modeLabel = document.getElementById('forge-buy-mode-current');
    if (modeLabel) modeLabel.textContent = currentMode === 'max' ? 'Max affordable' : `${currentMode} level${currentMode === 1 ? '' : 's'}`;

    control.dataset.availableModes = FORGE_BUY_MODES.join(',');
  },

  updateStardustDisplays() {
    const prestigeBar = document.getElementById('prestige-bar');
    if (prestigeBar) {
      let hasPrestigeWealth = gameState.currencies.stardust.amount.gt(0) ||
        gameState.currencies.pulsarShards.amount.gt(0) ||
        gameState.currencies.singularityMass.amount.gt(0);
      if (!hasPrestigeWealth && gameState.activeEpoch < 3) {
        prestigeBar.style.display = 'none';
      } else {
        prestigeBar.style.display = 'block';
      }
    }

    this.setTextContent('stardust-count', format(gameState.currencies.stardust.amount));
    this.setTextContent('stardust-boost', format(gameState.currencies.stardust.amount.times(50)));

    let estStardust = getStardustYield();
    let estPulsar = gameState.resources.carbon.amount.gt(0) ? getPulsarShardYield() : new Decimal(0);
    let estSingularity = gameState.resources.iron.amount.gt(0) ? getSingularityMassYield() : new Decimal(0);
    let estText = `+${format(estStardust)} ${ICONS.starlight}`;

    if (estPulsar.gt(0)) estText += ` | +${format(estPulsar)} ${ICONS.pulsar}`;
    if (estSingularity.gt(0)) estText += ` | +${format(estSingularity)} ${ICONS.singularity}`;

    this.setInnerHTML('supernova-gain-estimate', estText);

    if (gameState.currencies.pulsarShards.amount.gt(0) || gameState.currencies.singularityMass.amount.gt(0)) {
      const tier2 = this.getEl('tier2-currencies');
      if (tier2) tier2.classList.remove('tier2-hidden');
      this.setTextContent('pulsar-count', format(gameState.currencies.pulsarShards.amount));
      this.setTextContent('singularity-count', format(gameState.currencies.singularityMass.amount));
    }
  },

  renderStellarNodeButtons() {
    this.renderForgeBuyControls();
    const buyMode = normalizeForgeBuyMode(gameState.buyMode);
    const buyLabel = buyMode === 'max' ? 'Max' : buyMode;
    const updateRequirement = (row, met, label, current, target, unit = '') => {
      if (!row) return;
      row.className = met ? 'requirement-met' : 'requirement-missing';
      const icon = row.querySelector('.forge-requirement-icon');
      const labelNode = row.querySelector('.forge-requirement-label');
      const valueNode = row.querySelector('.forge-requirement-value');
      if (icon) icon.textContent = met ? '✓' : '✕';
      if (labelNode) labelNode.textContent = label;
      updateComparisonValue(valueNode, format(current), format(target), unit);
    };

    const updateCard = (cardId, btnId, canAfford, { locked = false } = {}) => {
      const card = this.getEl(cardId);
      const btn = this.getEl(btnId);
      if (card) {
        if (canAfford) card.classList.add('upgrade-affordable');
        else card.classList.remove('upgrade-affordable');
        card.dataset.forgeState = locked ? 'locked' : canAfford ? 'affordable' : 'progressing';
        const badge = card.querySelector('.forge-state-badge');
        if (badge) badge.textContent = locked ? 'Locked' : canAfford ? 'Ready' : 'Needs resources';
      }
      if (btn) {
        btn.disabled = locked || !canAfford;
        btn.setAttribute('aria-disabled', String(locked || !canAfford));
        btn.textContent = locked ? 'Locked' : `Buy ×${buyLabel}`;
        if (canAfford) {
          btn.style.background = '#fdcb6e';
          btn.style.color = '#030208';
          btn.style.borderColor = 'transparent';
        } else {
          btn.style.background = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        }
      }
    };

    let gravityAfford = gameState.resources.hydrogen.amount.gte(gameState.era3.gravityCost);
    updateCard('era3-card-gravity', 'btn-gravity', gravityAfford);
    const gravLvl = this.getEl('gravity-lvl');
    const gravLvlVal = gameState.era3.gravity ? gameState.era3.gravity.toNumber() : 0;
    if (gravLvl) gravLvl.textContent = format(gameState.era3.gravity);
    this.setTextContent('gravity-contribution', `Current gravity: ${format(gameState.era3.gravity)} · Hydrogen rate ${format(getHydrogenGenRate())}/s`);

    const gravDesc = this.getEl('gravity-desc');
    if (gravDesc) {
      let nextMilestoneLvl = (Math.floor(gravLvlVal / 10) + 1) * 10;
      gravDesc.textContent = `Increases base atomic drift • ${t("milestone_tooltip", { lvl: nextMilestoneLvl })}`;
    }

    const btnAutoBuyH = this.getEl('btn-autobuy-hydrogen');
    if (btnAutoBuyH) {
      const isUnlocked = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.carbon.unlockTemp);
      btnAutoBuyH.style.display = isUnlocked ? 'block' : 'none';
      const isActive = gameState.autoBuyer && gameState.autoBuyer.hydrogen && gameState.autoBuyer.hydrogen.active;
      btnAutoBuyH.textContent = t("autobuy_hydrogen", { state: isActive ? 'ON' : 'OFF' });
      if (isActive) {
        btnAutoBuyH.style.background = 'rgba(0, 236, 198, 0.2)';
        btnAutoBuyH.style.borderColor = 'var(--neon-teal)';
        btnAutoBuyH.style.color = '#fff';
      } else {
        btnAutoBuyH.style.background = 'rgba(255,255,255,0.05)';
        btnAutoBuyH.style.borderColor = 'rgba(255,255,255,0.1)';
        btnAutoBuyH.style.color = '#b2bec3';
      }
    }

    let compressAfford = gameState.resources.helium.amount.gte(gameState.era3.compressCost);
    updateCard('era3-card-compress', 'btn-compress', compressAfford);
    const compLvl = this.getEl('compress-lvl');
    if (compLvl) compLvl.textContent = getCompressionsCompleted();
    this.setTextContent('compress-effect', `+${format(getCompressionHeatYield())} K per compression`);
    let thresholdText = 'Iron threshold reached';
    if (gameState.era3.temperature.lt(COSMIC_REGISTRY.constants.mainSequenceTempThreshold)) {
      thresholdText = `Next threshold: ${format(COSMIC_REGISTRY.constants.mainSequenceTempThreshold)} K · Main Sequence`;
    } else if (gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp)) {
      thresholdText = `Next threshold: ${format(COSMIC_REGISTRY.resources.carbon.unlockTemp)} K · Carbon`;
    } else if (gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp)) {
      thresholdText = `Next threshold: ${format(COSMIC_REGISTRY.resources.iron.unlockTemp)} K · Iron`;
    }
    this.setTextContent('compress-threshold', thresholdText);

    const fuserBtnText = this.getEl('fuser-text');
    const fuserCostLabel = this.getEl('fuser-cost-label');
    let fuserAfford = false;
    if (fuserBtnText && fuserCostLabel) {
      if (gameState.era3.fusionYield.eq(0)) {
        fuserBtnText.textContent = "Unlock Auto-Fuser";
        fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHydrogen)} Hydrogen`;
        fuserAfford = gameState.resources.hydrogen.amount.gte(gameState.era3.fuserCostHydrogen);
      } else {
        fuserBtnText.textContent = 'Upgrade Fusion Yield';
        fuserCostLabel.textContent = `${format(gameState.era3.fuserCostHelium)} Helium`;
        fuserAfford = gameState.resources.helium.amount.gte(gameState.era3.fuserCostHelium);
      }
    }
    this.setTextContent('fuser-level', gameState.era3.fusionYield.eq(0) ? 'Locked' : `Yield ${format(gameState.era3.fusionYield)}`);
    this.setTextContent('fuser-contribution', gameState.era3.fusionYield.eq(0)
      ? 'Next level: unlocks 1 Helium yield'
      : `Current yield: ${format(gameState.era3.fusionYield)} Helium per fusion cycle`);
    updateCard('era3-card-fuser', 'btn-fuser', fuserAfford);

    const carbonCostLabel = this.getEl('carbon-cost-label');
    const carbonText = this.getEl('carbon-text');
    let carbonAfford = false;
    if (carbonCostLabel) {
      const carbonLocked = gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.carbon.unlockTemp);
      if (carbonLocked) {
        carbonCostLabel.textContent = 'Locked';
        if (carbonText) carbonText.textContent = "Unlock Carbon Fusion";
      } else {
        if (gameState.era3.carbonYield.eq(0)) {
          carbonAfford = gameState.resources.helium.amount.gte(gameState.era3.carbonCostHelium);
          carbonCostLabel.textContent = `${format(gameState.era3.carbonCostHelium)} He`;
          if (carbonText) carbonText.textContent = "Unlock Carbon Fusion";
        } else {
          carbonAfford = gameState.resources.carbon.amount.gte(gameState.era3.carbonCostCarbon);
          carbonCostLabel.textContent = `${format(gameState.era3.carbonCostCarbon)} C`;
          if (carbonText) carbonText.textContent = `Upgrade Carbon Yield (+${format(gameState.era3.carbonYield.plus(1))})`;
        }
      }
      const carbonRequirements = this.getEl('carbon-requirements');
      if (carbonRequirements) {
        carbonRequirements.hidden = !carbonLocked;
        const requirement = carbonRequirements.querySelector('li');
        updateRequirement(requirement, !carbonLocked, 'Main Sequence', gameState.era3.temperature, COSMIC_REGISTRY.resources.carbon.unlockTemp, 'K');
      }
      this.setTextContent('carbon-level', gameState.era3.carbonYield.eq(0) ? 'Locked' : `Yield ${format(gameState.era3.carbonYield)}`);
      updateCard('era3-card-carbon', 'btn-carbon', carbonAfford, { locked: carbonLocked });
    }

    const ironCostLabel = this.getEl('iron-cost-label');
    const ironText = this.getEl('iron-text');
    let ironAfford = false;
    if (ironCostLabel) {
      const ironLocked = gameState.era3.stage !== "Main Sequence Star" || gameState.era3.temperature.lt(COSMIC_REGISTRY.resources.iron.unlockTemp);
      if (ironLocked) {
        ironCostLabel.textContent = 'Locked';
        if (ironText) ironText.textContent = "Unlock Iron Fusion";
      } else {
        if (gameState.era3.ironYield.eq(0)) {
          ironAfford = gameState.resources.carbon.amount.gte(gameState.era3.ironCostCarbon);
          ironCostLabel.textContent = `${format(gameState.era3.ironCostCarbon)} C`;
          if (ironText) ironText.textContent = "Unlock Iron Fusion";
        } else {
          ironAfford = gameState.resources.iron.amount.gte(gameState.era3.ironCostIron);
          ironCostLabel.textContent = `${format(gameState.era3.ironCostIron)} Fe`;
          if (ironText) ironText.textContent = `Upgrade Iron Yield (+${format(gameState.era3.ironYield.plus(1))})`;
        }
      }
      const ironRequirements = this.getEl('iron-requirements');
      if (ironRequirements) {
        ironRequirements.hidden = !ironLocked;
        const requirement = ironRequirements.querySelector('li');
        updateRequirement(requirement, !ironLocked, 'Main Sequence', gameState.era3.temperature, COSMIC_REGISTRY.resources.iron.unlockTemp, 'K');
      }
      this.setTextContent('iron-level', gameState.era3.ironYield.eq(0) ? 'Locked' : `Yield ${format(gameState.era3.ironYield)}`);
      updateCard('era3-card-iron', 'btn-iron', ironAfford, { locked: ironLocked });
    }

    const gatewayTempStatus = document.getElementById('gateway-temp-status');
    const gatewayIronStatus = document.getElementById('gateway-iron-status');
    const btnHypernova = document.getElementById('btn-trigger-hypernova');
    if (gatewayTempStatus && gatewayIronStatus && btnHypernova) {
      const ignition = getGalacticIgnitionEligibility(gameState);
      const [temperatureRequirement, ironRequirement] = ignition.requirements;
      const tempOk = temperatureRequirement.met;
      const ironOk = ironRequirement.met;

      gatewayTempStatus.className = `cosmos-check cosmos-check--${tempOk ? 'met' : 'missing'}`;
      const temperatureIcon = gatewayTempStatus.querySelector('.cosmos-check-icon');
      temperatureIcon.textContent = tempOk ? '✓' : '○';
      temperatureIcon.setAttribute('aria-label', tempOk ? 'Requirement met' : 'Requirement not met');
      updateComparisonValue(gatewayTempStatus.querySelector('.cosmos-check-value'), format(temperatureRequirement.current), format(temperatureRequirement.target), 'K');

      gatewayIronStatus.className = `cosmos-check cosmos-check--${ironOk ? 'met' : 'missing'}`;
      const ironIcon = gatewayIronStatus.querySelector('.cosmos-check-icon');
      ironIcon.textContent = ironOk ? '✓' : '○';
      ironIcon.setAttribute('aria-label', ironOk ? 'Requirement met' : 'Requirement not met');
      updateComparisonValue(gatewayIronStatus.querySelector('.cosmos-check-value'), format(ironRequirement.current), format(ironRequirement.target));

      btnHypernova.disabled = !ignition.isEligible;
      if (ignition.isEligible) {
        btnHypernova.style.opacity = "1";
        btnHypernova.style.cursor = "pointer";
      } else {
        btnHypernova.style.opacity = "0.4";
        btnHypernova.style.cursor = "not-allowed";
      }
    }

    if (gameState.activeTab === 'prestige') {
      this.renderPrestigeVisibility();
      updateSupernovaOutcome();
    }

    const core = document.getElementById('star-core');
    if (core) {
      let coreTempNum = gameState.era3.temperature.lt(1e12) ? gameState.era3.temperature.toNumber() : 1e12;
      let newSize = Math.min(100 + (coreTempNum / 1500000) * 15, 220);
      core.style.width = newSize + 'px';
      core.style.height = newSize + 'px';
    }

    let coreTempNum = gameState.era3.temperature.lt(1e12) ? gameState.era3.temperature.toNumber() : 1e12;
    let heatFactor = Math.min(coreTempNum / 100000000, 1);
    document.documentElement.style.setProperty('--stellar-heat-factor', heatFactor);

    this.syncAnchor();
  },

  renderFlare() {
    const btn = document.getElementById('flare-button');
    if (!btn) return;
    if (gameState.flares.active) {
      btn.style.setProperty('display', 'block', 'important');
      btn.innerHTML = `${ICONS.starlight} PROMINENCE ACTIVE! (${Math.ceil(gameState.flares.active.expiresInSec.toNumber())}s)`;
      document.body.classList.add('flare-active');    // screen-edge glow (Prio 4)
    } else {
      btn.style.setProperty('display', 'none', 'important');
      document.body.classList.remove('flare-active');
    }
  },

  updateResourceDelta(resourceKey, rate) {
    const deltaEl = document.getElementById(`delta-${resourceKey}`);
    if (!deltaEl) return;

    let rateNum = 0;
    if (rate && rate.toNumber) rateNum = rate.toNumber();
    else if (typeof rate === 'number') rateNum = rate;

    if (rateNum > 0) {
      deltaEl.textContent = `▲ ${format(rate)}/s`;
      deltaEl.className = 'resource-delta delta-positive delta-pulse';
    } else if (rateNum < 0) {
      const absRate = rate.abs ? rate.abs() : Math.abs(rate);
      deltaEl.textContent = `▼ ${format(absRate)}/s`;
      deltaEl.className = 'resource-delta delta-negative delta-pulse';
    } else {
      deltaEl.textContent = '—';
      deltaEl.className = 'resource-delta';
    }

    setTimeout(() => {
      deltaEl.classList.remove('delta-pulse');
    }, 400);
  },

  updateResourceHud() {
    const container = document.getElementById('resource-hud');
    if (!container) return;

    const presentation = getEraResourcePresentation(gameState);
    const rates = {};

    if (gameState.activeEpoch === 1) {
      rates.quantumFluctuations = getQuantumFluctuationRate(gameState);
      rates.energyDensity = getEnergyDensityRate(gameState);
    } else if (gameState.activeEpoch === 2) {
      const plasmaRates = getPlasmaRates(gameState);
      rates.quarks = plasmaRates.quarksProduction.minus(plasmaRates.quarksConsumption);
      rates.gluons = plasmaRates.gluonsProduction.minus(plasmaRates.gluonsConsumption);
      rates.leptons = plasmaRates.leptonsProduction.minus(plasmaRates.leptonsConsumption);
      rates.protons = plasmaRates.protonsProduction.minus(plasmaRates.protonsConsumption);
      rates.electrons = plasmaRates.electronsProduction.minus(plasmaRates.electronsConsumption);
      rates.hydrogen = plasmaRates.hydrogenProduction;
      rates.plasmaTemperature = plasmaRates.coolingRate.times(-1);
    } else if (gameState.activeEpoch === 3) {
      const stellarRates = getStellarRates(gameState);
      rates.hydrogen = stellarRates.hydrogenProduction.minus(stellarRates.hydrogenConsumption);
      rates.helium = stellarRates.heliumProduction.minus(stellarRates.heliumConsumption);
      rates.carbon = stellarRates.carbonProduction.minus(stellarRates.carbonConsumption);
      rates.iron = stellarRates.ironProduction;
    } else if (gameState.activeEpoch === 4) {
      rates.planetaryDebris = getGalacticDebrisRate();
      rates.darkMatter = getGalacticDarkMatterRate();
    }

    const coherenceVisible = [...presentation.primary, ...presentation.support, ...presentation.details]
      .some((item) => item.id === 'coherence');
    document.body.dataset.coherenceRelevant = String(coherenceVisible);
    renderResourceHud(container, presentation, rates);
  },

  updateEraProgressBar() {
    const container = document.getElementById('era-progress-container');
    const bar = document.getElementById('era-progress-bar');
    if (!container || !bar) return;

    const epoch = gameState.activeEpoch;
    let pct = 0;

    if (epoch === 1) {
      pct = gameState.resources.quantumFluctuations.amount.div(COSMIC_REGISTRY.constants.inflationThreshold).times(100).toNumber();
    } else if (epoch === 2) {
      let pProgress = gameState.resources.protons.amount.div(COSMIC_REGISTRY.constants.recombinationProtonThreshold).times(100).toNumber();
      let tStart = 10000000;
      let tTarget = 3000;
      let tProgress = (tStart - gameState.plasmaTemperature.toNumber()) / (tStart - tTarget) * 100;
      pct = Math.max(pProgress, tProgress);
    } else if (epoch === 3) {
      let t = gameState.era3.temperature.toNumber();
      // Segment 1: 0 to 100M K (0% to 33.33%)
      // Segment 2: 100M K to 500M K (33.33% to 66.66%)
      // Segment 3: 500M K to 2,000M K (66.66% to 100%)
      if (t <= 100000000) {
        pct = (t / 100000000) * 33.33;
      } else if (t <= 500000000) {
        pct = 33.33 + ((t - 100000000) / 400000000) * 33.33;
      } else {
        pct = 66.66 + Math.min(1.0, (t - 500000000) / 1500000000) * 33.34;
      }
    } else if (epoch === 4) {
      pct = gameState.resources.darkMatter.amount.div(10000).times(100).toNumber();
    }

    pct = Math.max(0, Math.min(100, pct));

    const era3Nodes = document.getElementById('era3-progress-nodes');
    if (era3Nodes) era3Nodes.style.display = epoch === 3 ? 'block' : 'none';

    container.style.display = 'block';
    bar.style.width = `${pct}%`;
    bar.style.background = epoch === 1 ? 'linear-gradient(90deg, var(--neon-teal), #a29bfe)' :
      (epoch === 2 ? 'linear-gradient(90deg, #ff7675, #ffeaa7)' :
        (epoch === 3 ? 'linear-gradient(90deg, #fdcb6e, #e17055)' :
          'linear-gradient(90deg, #00ecc6, #0984e3)'));
    bar.style.boxShadow = `0 0 8px ${epoch === 1 ? 'var(--neon-teal)' : (epoch === 2 ? '#ff7675' : (epoch === 3 ? '#fdcb6e' : '#00ecc6'))}`;
  },

  updateVisualProgression() {
    const core = this.getEl('star-core');
    if (!core) return;

    const epoch = gameState.activeEpoch;

    if (epoch === 1) {
      let gLvl = gameState.upgrades.quantum.gravityForce?.level || 0;
      let wLvl = gameState.upgrades.quantum.weakForce?.level || 0;
      let eLvl = gameState.upgrades.quantum.electromagneticForce?.level || 0;
      let vLvl = gameState.upgrades.quantum.vacuumResonance?.level || 0;
      let sLvl = gameState.upgrades.quantum.strongForce?.level || 0;
      let totalLvl = gLvl + wLvl + eLvl + vLvl + sLvl;

      // Core size grows from 8px to 30px
      let coreSize = Math.min(8 + totalLvl * 0.8, 30);
      core.style.width = `${coreSize}px`;
      core.style.height = `${coreSize}px`;

      // Core glow spreads wider
      let glowSize = Math.min(16 + totalLvl * 1.5, 55);
      let glowSpread = Math.min(6 + totalLvl * 0.4, 20);
      core.style.boxShadow = `0 0 ${glowSize}px ${glowSpread}px #ffffff`;

      // Orbits fade in based on respective forces purchased
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');

      if (orbit1) orbit1.style.opacity = Math.min(gLvl * 0.15, 0.7);
      if (orbit2) orbit2.style.opacity = Math.min(eLvl * 0.15, 0.7);
      if (orbit3) orbit3.style.opacity = Math.min((vLvl + sLvl) * 0.15, 0.7);
    }
    else if (epoch === 2) {
      let qLvl = gameState.upgrades.plasma.quarkCondenser?.level || 0;
      let gLvl = gameState.upgrades.plasma.gluonBinding?.level || 0;
      let lLvl = gameState.upgrades.plasma.leptonHarvest?.level || 0;
      let aLvl = gameState.upgrades.plasma.plasmaAutomation?.level || 0;
      let rLvl = gameState.upgrades.plasma.baryoRadiator?.level || 0;
      let totalLvl = qLvl + gLvl + lLvl + aLvl + rLvl;

      // Core size grows from 84px to 140px
      let coreSize = Math.min(84 + totalLvl * 1.2, 140);
      core.style.width = `${coreSize}px`;
      core.style.height = `${coreSize}px`;

      // Glow intensifies
      let glowSize = Math.min(45 + totalLvl * 1.8, 100);
      let opacity = Math.min(0.45 + totalLvl * 0.015, 0.9);
      core.style.boxShadow = `0 0 ${glowSize}px 15px rgba(255, 107, 107, ${opacity}), inset 0 0 15px rgba(255,255,255,0.6)`;

      // Orbits show as force fields
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');
      if (orbit1) orbit1.style.opacity = Math.min(0.1 + qLvl * 0.04, 0.6);
      if (orbit2) orbit2.style.opacity = Math.min(0.1 + gLvl * 0.04, 0.6);
      if (orbit3) orbit3.style.opacity = Math.min(0.1 + lLvl * 0.04, 0.6);
    } else {
      // Reset inline overrides for other eras so they use CSS defaults
      core.style.width = '';
      core.style.height = '';
      core.style.boxShadow = '';
      const orbit1 = document.querySelector('.orbit-1');
      const orbit2 = document.querySelector('.orbit-2');
      const orbit3 = document.querySelector('.orbit-3');
      if (orbit1) orbit1.style.opacity = '';
      if (orbit2) orbit2.style.opacity = '';
      if (orbit3) orbit3.style.opacity = '';
    }
  },

  update() {
    const targetEpoch = String(gameState.activeEpoch);
    if (document.body.dataset.epoch !== targetEpoch) {
      this.clearInlineActionFeedback();
      document.body.dataset.epoch = targetEpoch;
    }
    const overlay = document.getElementById('intro-screen-overlay');
    if (!gameState.unfold?.introCompleted && overlay && overlay.style.display !== 'none') {
      return;
    }
    ActManager.evaluate();
    updateObjectiveProgress(gameState);
    if (gameState.activeTab === 'prestige' && hasArtifactAccess(gameState)) {
      ArtifactManager.renderBar();
    }
    this.updateStardustDisplays();
    const currentEpoch = COSMIC_REGISTRY.universeChronology.epochs[gameState.activeEpoch] || COSMIC_REGISTRY.universeChronology.epochs[3];

    const targetEra1Act = String(gameState.era1?.currentAct || 1);
    if (document.body.getAttribute('data-era1-act') !== targetEra1Act) {
      document.body.setAttribute('data-era1-act', targetEra1Act);
    }
    const targetEra2Act = String(gameState.era2?.currentAct || 1);
    if (document.body.getAttribute('data-era2-act') !== targetEra2Act) {
      document.body.setAttribute('data-era2-act', targetEra2Act);
    }
    const targetTab = normalizeViewId(gameState, gameState.activeTab);
    if (gameState.activeTab !== targetTab) gameState.activeTab = targetTab;
    if (document.body.getAttribute('data-tab') !== targetTab) {
      document.body.setAttribute('data-tab', targetTab);
    }

    this.setTextContent('active-epoch-name', currentEpoch.name);
    this.setTextContent('stage', getCurrentPhase(gameState));
    const coherenceBanner = document.querySelector('.header-context .coherence-banner');
    if (coherenceBanner) {
      coherenceBanner.style.display = gameState.activeEpoch === 1 ? '' : 'none';
    }
    if (gameState.activeEpoch === 1) {
      this.setTextContent('coherence-label', 'Vacuum Coherence');
      this.setTextContent('coherence-display', `${format(getVacuumCoherence(gameState))}%`);
    }
    this.updateResourceHud();

    const cosmosPresentation = getCosmosPresentation(gameState);
    renderCosmosExperience(
      document,
      cosmosPresentation,
      (action) => {
        if (action.kind === 'core-node') Economy.buyCoreNodes(action.id, 1);
        else if (action.kind === 'view') this.switchTab(action.id);
        else if (action.kind === 'upgrade-plasma') {
          dispatchEngineCommand({
            type: 'BUY_UPGRADE_PLASMA',
            payload: { category: 'plasma', upgradeId: action.id, loops: 1 }
          });
        }
      },
      (posture) => {
        dispatchEngineCommand({
          type: 'SET_PLASMA_POSTURE',
          payload: { posture }
        });
      }
    );
    document.body.dataset.cosmosTransitionReady = String(Boolean(cosmosPresentation.transition.ready));

    const inflationContainer = this.getEl('era1-transition-container');
    const recombinationContainer = this.getEl('era2-transition-container');
    const stellarContainer = this.getEl('era3-card-gateway');
    if (inflationContainer) inflationContainer.style.display = cosmosPresentation.transition.type === 'inflation' && cosmosPresentation.transition.visible ? '' : 'none';
    if (recombinationContainer) recombinationContainer.style.display = cosmosPresentation.transition.type === 'recombination' && cosmosPresentation.transition.visible ? '' : 'none';
    if (stellarContainer) stellarContainer.hidden = !(cosmosPresentation.transition.type === 'galactic-ignition' && cosmosPresentation.transition.visible);


    const tracker = document.getElementById('objective-tracker');
    if (tracker) {
      const currentObj = getCurrentObjective(gameState);
      if (currentObj) {
        tracker.style.display = 'flex';
        this.setTextContent('objective-title', currentObj.title);
        this.setTextContent('objective-instruction', currentObj.instruction);
        this.setTextContent('objective-explanation', currentObj.explanation || '');
        
        const progressBar = document.getElementById('objective-progress-bar');
        if (progressBar) progressBar.style.width = `${currentObj.progress}%`;
        
        const progressText = document.getElementById('objective-progress-text');
        updateComparisonValue(progressText, format(currentObj.current), format(currentObj.target));
        progressText?.setAttribute('aria-label', `${format(currentObj.current)} of ${format(currentObj.target)}`);
      } else {
        tracker.style.display = 'none';
        this.setTextContent('objective-title', '');
        this.setTextContent('objective-instruction', '');
        this.setTextContent('objective-explanation', '');
        const progressBar = document.getElementById('objective-progress-bar');
        if (progressBar) progressBar.style.width = '0%';
        const progressText = document.getElementById('objective-progress-text');
        if (progressText) {
          updateComparisonValue(progressText, '', '');
          progressText.querySelector('.metric-comparison-separator').textContent = '';
          progressText.removeAttribute('aria-label');
        }
      }
    }

    if (gameState.activeEpoch !== 1) {
      const inflationBtn = this.getEl('btn-inflation');
      const inflationCard = this.getEl('era1-locked-card');
      if (inflationBtn) {
        inflationBtn.style.display = 'none';
        inflationBtn.disabled = true;
      }
      if (inflationCard) {
        inflationCard.style.display = 'none';
        const reqText = inflationCard.querySelector('.req-text');
        if (reqText) reqText.textContent = '';
      }
    }

    if (gameState.activeEpoch !== 2) {
      const recombinationBtn = this.getEl('btn-recombination');
      const recombinationCard = this.getEl('era2-locked-card');
      if (recombinationBtn) {
        recombinationBtn.style.display = 'none';
        recombinationBtn.disabled = true;
      }
      if (recombinationCard) recombinationCard.style.display = 'none';
    }

    // Progressive primary navigation: Cosmos, Forge, Legacy, More.
    const navigation = getPrimaryNavigation(gameState);
    const visibleNavigationIds = new Set(navigation.map(destination => destination.id));
    const navMenu = document.querySelector('.tab-menu');
    if (navMenu) {
      navMenu.style.display = navigation.length > 1 ? 'flex' : 'none';
      navMenu.dataset.destinationCount = String(navigation.length);
    }

    ['core', 'upgrades', 'prestige', 'settings'].forEach(tabId => {
      const navBtn = document.getElementById(`nav-${tabId}`);
      if (navBtn) {
        navBtn.style.display = visibleNavigationIds.has(tabId) ? '' : 'none';
        const isActive = targetTab === tabId;
        navBtn.classList.toggle('active', isActive);
        if (isActive) navBtn.setAttribute('aria-current', 'page');
        else navBtn.removeAttribute('aria-current');
      }
    });

    const legacyLoadout = document.getElementById('legacy-loadout-section');
    if (legacyLoadout) legacyLoadout.hidden = !hasArtifactAccess(gameState);

    const coreCanvasElement = document.getElementById('star-core');
    if (coreCanvasElement) coreCanvasElement.setAttribute('data-canvas-style', currentEpoch.canvasStyle);

    const logNode = document.getElementById('chrono-neural-log');
    if (logNode) {
      // P2 Codex Integration
      const legacyNarrative = gameState.activeEpoch === 4 ? COSMIC_REGISTRY.narrativeLogs.era4.initial : null;
      CodexEngine.update(gameState, { legacyNarrative });
    }

    if (gameState.activeEpoch === 1) {
      this.setTextContent('label-hydrogen', t('label_quantum_fluctuations'));
      this.setTextContent('count', format(gameState.resources.quantumFluctuations.amount));
      this.updateResourceDelta('hydrogen', getQuantumFluctuationRate());

      this.setTextContent('label-helium', t('label_energy_density'));
      this.setTextContent('helium-count', format(gameState.resources.energyDensity.amount));
      // Energy density doesn't have a direct rate right now, but temperature determines it.
      // We can just show zero or omit rate.
      this.updateResourceDelta('helium', getEnergyDensityRate(gameState));
      // We can still display the temperature info somewhere else, or keep it in the name/label?
      // The plan replaced the helium-yield span with a delta indicator. Let's append the temp to the label instead.
      this.setTextContent('label-helium', t('label_energy_density') + ` (Temp: ${format(gameState.eraITemperature)} K)`);

      const inflationBtn = this.getEl('btn-inflation');
      const inflationCard = this.getEl('era1-locked-card');
      const eligibility = getInflationEligibility(gameState);
      
      if (inflationBtn && inflationCard) {
        if (eligibility.isEligible) {
          inflationBtn.style.display = 'block';
          inflationBtn.disabled = false;
          inflationCard.style.display = 'none';
          const reqText = inflationCard.querySelector('.req-text');
          if (reqText) reqText.textContent = '';
        } else {
          inflationBtn.style.display = 'none';
          inflationBtn.disabled = true;
          inflationCard.style.display = 'block';
          const reqText = 'Complete the preparation requirements above.';
          let reqDiv = inflationCard.querySelector('.req-text');
          if (!reqDiv) {
            reqDiv = document.createElement('div');
            reqDiv.className = 'req-text';
            reqDiv.style.fontSize = '0.75rem';
            reqDiv.style.marginTop = '8px';
            reqDiv.style.color = '#ff7675';
            inflationCard.appendChild(reqDiv);
          }
          reqDiv.textContent = reqText;
        }
      }

      if (gameState.activeTab === 'upgrades') {
        this.renderGenericTierList('quantum-upgrades-container', 'quantum', 'QF', '#6c5ce7', 'quantumFluctuations');
      }
    }
    else if (gameState.activeEpoch === 2) {
      let pRates = getPlasmaRates(gameState);

      this.setTextContent('label-hydrogen', t('label_primordial_quarks'));
      this.setTextContent('count', format(gameState.resources.quarks.amount));
      this.updateResourceDelta('hydrogen', pRates.quarksProduction.minus(pRates.quarksConsumption));

      this.setTextContent('label-helium', t('label_primordial_gluons'));
      this.setTextContent('helium-count', format(gameState.resources.gluons.amount));
      this.updateResourceDelta('helium', pRates.gluonsProduction.minus(pRates.gluonsConsumption));

      // Asymmetry Bonus indicator (Prio 2)
      // The asymmetry bonus is now replaced with a trade-off, hiding for now
      // this.hideElement('priority2');
      // this.setTextContent('label-hydrogen', t('label_primordial_quarks') + ` (Asym: +${asymBonusPct}%)`);

      // Update dedicated Era II elements
      this.setTextContent('lepton-count', format(gameState.resources.leptons.amount));
      this.updateResourceDelta('leptons', pRates.leptonsProduction.minus(pRates.leptonsConsumption));

      this.setTextContent('proton-count', format(gameState.resources.protons.amount));
      this.updateResourceDelta('protons', pRates.protonsProduction.minus(pRates.protonsConsumption));

      this.setTextContent('electron-count', format(gameState.resources.electrons.amount));
      this.updateResourceDelta('electrons', pRates.electronsProduction.minus(pRates.electronsConsumption));

      if (gameState.resources.hydrogen.amount.gt(0)) {
        // Just show hydrogen in the generic slots if needed, or if Era II has a slot
        this.setTextContent('carbon-count', format(gameState.resources.hydrogen.amount));
        this.setTextContent('label-carbon', 'Hydrogen');
        this.updateResourceDelta('carbon', pRates.hydrogenProduction);
        this.showElement('resource-carbon');
      } else {
        this.hideElement('resource-carbon');
      }

      this.hideElement('resource-iron');

      this.hideElement('priority2');

      this.setTextContent('plasma-temp-count', `${format(gameState.plasmaTemperature)} K`);
      this.updateResourceDelta('temperature', pRates.coolingRate.times(-1));

      const recombBtn = this.getEl('btn-recombination');
      const recombCard = this.getEl('era2-locked-card');
      const isRecombReady = getRecombinationEligibility(gameState).isEligible;
      if (recombBtn && recombCard) {
        const transitionVisible = cosmosPresentation.transition.type === 'recombination' && cosmosPresentation.transition.visible;
        recombBtn.style.display = transitionVisible && isRecombReady ? 'block' : 'none';
        recombCard.style.display = transitionVisible && !isRecombReady ? 'block' : 'none';
        recombBtn.disabled = !isRecombReady;
      }

      if (gameState.activeTab === 'upgrades') {
        this.renderGenericTierList('plasma-upgrades-container', 'plasma', (k) => (k === 'quarkCondenser' || k === 'plasmaAutomation') ? 'Quarks' : (k === 'gluonBinding' || k === 'leptonHarvest') ? 'Gluons' : 'Protons', '#e17055');
      }
    }
    else if (gameState.activeEpoch === 3) {
      this.setTextContent('label-carbon', t('label_carbon'));
      this.setTextContent('label-iron', t('label_iron'));

      this.setTextContent('label-hydrogen', t('label_hydrogen'));
      this.setTextContent('label-helium', t('label_helium'));

      this.setTextContent('count', format(gameState.resources.hydrogen.amount));
      this.updateResourceDelta('hydrogen', getHydrogenGenRate());
      this.setTextContent('cost', format(gameState.era3.gravityCost));
      this.setTextContent('helium-count', format(gameState.resources.helium.amount));

      const stardustBoost = gameState.currencies.stardust.amount.times(0.25).plus(1);
      const baseYieldPerFusion = gameState.era3.fusionYield.times(getFusionSurgeMultiplier());
      const effectiveYieldPerFusion = baseYieldPerFusion.times(stardustBoost);
      this.updateResourceDelta('helium', new Decimal(0));
      this.setTextContent('label-helium', t('label_helium') + ` (Yield: ${format(effectiveYieldPerFusion)}/f)`);

      this.setTextContent('temp', format(gameState.era3.temperature));
      this.setTextContent('multiplier', format(gameState.era3.tempMultiplier) + "x");
      this.setTextContent('compress-cost', format(gameState.era3.compressCost));
      this.setTextContent('carbon-count', format(gameState.resources.carbon.amount));
      const cBox = this.getEl('carbon-box');
      if (cBox) cBox.style.opacity = gameState.era3.stage === "Main Sequence Star" ? "1" : "0.3";

      const carbonMult = getCarbonGravityMultiplier();
      this.updateResourceDelta('carbon', new Decimal(0));
      this.setTextContent('label-carbon', t('label_carbon') + ` (Grav: +${format(carbonMult.minus(1).times(100))}%)`);

      let ironMultiplier = gameState.resources.iron.amount.times(COSMIC_REGISTRY.constants.ironHeatCoefficient).plus(1);
      this.setTextContent('iron-count', format(gameState.resources.iron.amount));
      const iBox = this.getEl('iron-box');
      if (iBox) iBox.style.opacity = gameState.era3.temperature.gte(COSMIC_REGISTRY.resources.iron.unlockTemp) ? "1" : "0.3";

      this.updateResourceDelta('iron', new Decimal(0));
      this.setTextContent('label-iron', t('label_iron') + ` (Heat: +${format(ironMultiplier.minus(1).times(100))}%)`);

      this.updateStardustDisplays();
      this.renderStellarNodeButtons();
    }
    else if (gameState.activeEpoch === 4) {
      let dRate = getGalacticDebrisRate();
      let dmRate = getGalacticDarkMatterRate();

      this.setTextContent('label-hydrogen', t('label_accumulated_hydrogen'));
      this.setTextContent('count', format(gameState.resources.hydrogen.amount));
      this.updateResourceDelta('hydrogen', new Decimal(0));

      this.setTextContent('label-helium', t('label_stellar_mass_index'));
      this.setTextContent('helium-count', format(gameState.era4.stellarMassPassiveCount));
      this.updateResourceDelta('helium', new Decimal(0));

      this.setTextContent('debris-count', format(gameState.resources.planetaryDebris.amount));
      this.updateResourceDelta('debris', dRate);

      this.setTextContent('darkmatter-count', format(gameState.resources.darkMatter.amount));
      this.updateResourceDelta('darkmatter', dmRate);

      this.setTextContent('galaxy-stability-val', format(gameState.era4.stability) + "%");
      const barFill = this.getEl('stability-bar-fill');
      if (barFill) barFill.style.width = gameState.era4.stability.toString() + "%";

      this.setTextContent('planetary-count-label', format(gameState.era4.planetaryNodes));

      const mergeBtn = document.getElementById('btn-galactic-merge');
      if (mergeBtn) {
        let ready = gameState.resources.darkMatter.amount.gte(10000);
        mergeBtn.disabled = !ready;
        mergeBtn.textContent = ready ? `COLLIDE GALAXY MATRIX (Yield: +${format(getGalacticMergeYield())} Dark Energy)` : `Merge Requires 10,000 Dark Matter (Current: ${format(gameState.resources.darkMatter.amount)})`;
      }

      const entropyBtn = document.getElementById('btn-embrace-entropy');
      if (entropyBtn) {
        let entropyReady = gameState.resources.darkMatter.amount.gte(100000) && gameState.era4.stability.lte(20);
        if (gameState.resources.darkMatter.amount.gte(50000)) {
          entropyBtn.style.display = 'block';
        }
        entropyBtn.disabled = !entropyReady;
        entropyBtn.textContent = entropyReady ? `EMBRACE ENTROPY (Initiate Era V)` : `Embrace Entropy Requires 100k DM & <20% Stability (Current DM: ${format(gameState.resources.darkMatter.amount)}, Stab: ${format(gameState.era4.stability)}%)`;
      }

      if (gameState.activeTab === 'core') {
        this.renderGenericTierList('galaxy-upgrades-container', 'galaxy', 'DM', '#00ecc6', 'darkMatter');
      }
    }
    else if (gameState.activeEpoch === 5) {
      const container = this.getEl('era5-dashboard-container');
      if (container) {
        if (!container.innerHTML.trim()) {
          container.innerHTML = Templates.era5Dashboard;
        }

        const entropyFill = this.getEl('entropy-bar-fill');
        const entropyText = this.getEl('entropy-bar-text');
        if (entropyFill) entropyFill.style.width = `${gameState.era5.entropy}%`;
        if (entropyText) entropyText.textContent = `${gameState.era5.entropy.toFixed(2)}% ENTROPY`;

        this.setTextContent('hawking-radiation-count', format(gameState.resources.hawkingRadiation.amount));
        this.setTextContent('bits-count', format(gameState.currencies.bits.amount));
      }

      if (gameState.era5.isHeatDeath) {
        let overlay = this.getEl('heat-death-overlay');
        if (!overlay) {
          document.body.insertAdjacentHTML('beforeend', Templates.heatDeathOverlay);
          overlay = this.getEl('heat-death-overlay');
          setTimeout(() => overlay.style.opacity = '1', 50);

          this.getEl('btn-big-bounce').addEventListener('click', () => {
            if (window.triggerBigBounce) window.triggerBigBounce();
            overlay.remove();
          });
        }
      }

      if (gameState.activeTab === 'core') {
        this.renderGenericTierList('era5-upgrades-container', 'era5', 'Cost', '#ff7675');
      }
    }

    if (gameState.activeTab === 'prestige') {
      this.renderStats();
      this.renderSystemTab();
      this.renderPrestigeVisibility();
      if (hasArtifactAccess(gameState)) {
        ArtifactManager.renderBar();
        ArtifactManager.renderInventory();
      }
    }
    this.renderFlare();
    this.updateEraProgressBar();
    this.updateVisualProgression();
  },

  renderTuningModal() {
    const list = this.getEl('tuning-upgrades-list');
    const bitsDisplay = this.getEl('tuning-bits-display');
    if (!list || !bitsDisplay) return;

    bitsDisplay.textContent = format(gameState.currencies.bits.amount);

    let html = '';
    const tuningReg = COSMIC_REGISTRY.upgrades.tuning;
    for (let key in tuningReg) {
      const def = tuningReg[key];
      const eligibility = getCosmicTuningEligibility(gameState, key);
      const currentLvl = eligibility.level;
      const cost = eligibility.cost;
      const isMaxed = eligibility.isMaxed;
      const canAfford = eligibility.canAfford;

      html += `
        <div class="cosmic-card" style="border-color: #00cec9;">
          <div class="btn-meta">
            <strong style="color: #00cec9;">${def.name} <span class="lvl-display">(Lvl ${currentLvl}/${eligibility.maxLevel})</span></strong>
            <small>${def.desc}</small>
          </div>
          <button class="upgrade-btn" data-key="${key}" ${isMaxed ? 'disabled' : (canAfford ? '' : 'disabled')} style="${canAfford ? 'background: rgba(0, 206, 201, 0.2); border-color: #00cec9; color: #fff;' : 'opacity: 0.5;'}">
            ${isMaxed ? 'MAXED' : 'Cost: ' + format(cost) + ' Bits'}
          </button>
        </div>
      `;
    }
    list.innerHTML = html;
  }
};

subscribeRuntimeState(() => {
  Viewport.clearElCache();
  ArtifactManager._lastRenderSignature = '';
  CodexEngine.dispose();
});

// ==========================================================================
