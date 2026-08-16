import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { renderCosmosExperience } from '../src/ui/cosmosExperience.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { createGameEngine } from '../src/engine/createEngine.js';
import { dispatchEngineCommand, setEngineDispatcher } from '../src/engine/dispatch.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';

describe('Cosmos Posture Controls & Model-C Contextual Actions (Phase 2)', () => {
  let doc;
  let tabCore;
  let primaryEl;
  let coreContextEl;
  let postureEl;
  let processEl;
  let starCoreEl;
  let engine;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('Cosmos Test');
    tabCore = doc.createElement('div');
    tabCore.id = 'tab-content-core';

    primaryEl = doc.createElement('section');
    primaryEl.id = 'cosmos-primary-status';

    starCoreEl = doc.createElement('button');
    starCoreEl.id = 'star-core';

    coreContextEl = doc.createElement('section');
    coreContextEl.id = 'core-context';

    postureEl = doc.createElement('section');
    postureEl.id = 'cosmos-posture-controller';

    processEl = doc.createElement('section');
    processEl.id = 'cosmos-process-status';

    tabCore.append(primaryEl, starCoreEl, coreContextEl, postureEl, processEl);
    doc.body.append(tabCore);

    engine = createGameEngine({
      initialState: createInitialState(),
      commandHandlers: { ...plasmaCommandHandlers }
    });
    setEngineDispatcher((command) => engine.dispatch(command));
  });

  describe('Posture Presentation & Controller Lifecycle', () => {
    it('returns posture null for Era I and Era III', () => {
      const stateEra1 = createInitialState();
      stateEra1.activeEpoch = 1;
      const pres1 = getCosmosPresentation(stateEra1);
      expect(pres1.posture).toBeNull();

      const stateEra3 = createInitialState();
      stateEra3.activeEpoch = 3;
      const pres3 = getCosmosPresentation(stateEra3);
      expect(pres3.posture).toBeNull();
    });

    it('hides posture controller element when posture is null', () => {
      const stateEra1 = createInitialState();
      stateEra1.activeEpoch = 1;
      renderCosmosExperience(doc, getCosmosPresentation(stateEra1));
      expect(postureEl.hidden).toBe(true);
      expect(postureEl.children.length).toBe(0);
    });

    it('renders radiogroup with 3 posture options in Era II', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      renderCosmosExperience(doc, getCosmosPresentation(state));
      expect(postureEl.hidden).toBe(false);

      const group = postureEl.querySelector('[role="radiogroup"]');
      expect(group).not.toBeNull();
      expect(group.getAttribute('aria-label')).toBe('Plasma operating posture');

      const buttons = postureEl.querySelectorAll('.cosmos-posture-btn');
      expect(buttons.length).toBe(3);

      const postures = [...buttons].map(btn => btn.dataset.posture);
      expect(postures).toEqual(['ACCUMULATE', 'BALANCE', 'CONDENSE']);

      // Check active state
      const balanceBtn = postureEl.querySelector('[data-posture="BALANCE"]');
      expect(balanceBtn.getAttribute('aria-checked')).toBe('true');
      expect(balanceBtn.tabIndex).toBe(0);
      expect(balanceBtn.classList.contains('cosmos-posture-btn--active')).toBe(true);

      const accumBtn = postureEl.querySelector('[data-posture="ACCUMULATE"]');
      expect(accumBtn.getAttribute('aria-checked')).toBe('false');
      expect(accumBtn.tabIndex).toBe(-1);
    });

    it('updates active posture state when presentation changes to ACCUMULATE', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      renderCosmosExperience(doc, getCosmosPresentation(state));

      // Switch posture to ACCUMULATE
      state.era2.posture = 'ACCUMULATE';
      renderCosmosExperience(doc, getCosmosPresentation(state));

      const accumBtn = postureEl.querySelector('[data-posture="ACCUMULATE"]');
      expect(accumBtn.getAttribute('aria-checked')).toBe('true');
      expect(accumBtn.tabIndex).toBe(0);
      expect(accumBtn.classList.contains('cosmos-posture-btn--active')).toBe(true);

      const balanceBtn = postureEl.querySelector('[data-posture="BALANCE"]');
      expect(balanceBtn.getAttribute('aria-checked')).toBe('false');
      expect(balanceBtn.tabIndex).toBe(-1);
    });
  });

  describe('Posture Controller User Interaction & Keyboard Accessibility', () => {
    it('calls onPostureChange when a posture button is clicked', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      const onPostureChange = vi.fn();
      renderCosmosExperience(doc, getCosmosPresentation(state), null, onPostureChange);

      const condenseBtn = postureEl.querySelector('[data-posture="CONDENSE"]');
      condenseBtn.click();

      expect(onPostureChange).toHaveBeenCalledTimes(1);
      expect(onPostureChange).toHaveBeenCalledWith('CONDENSE');
    });

    it('dispatches SET_PLASMA_POSTURE and updates state via authoritative command handler', () => {
      const state = engine.getStateUnsafe();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      const onPostureChange = (posture) => {
        dispatchEngineCommand({
          type: 'SET_PLASMA_POSTURE',
          payload: { posture }
        });
      };

      renderCosmosExperience(doc, getCosmosPresentation(state), null, onPostureChange);

      const accumBtn = postureEl.querySelector('[data-posture="ACCUMULATE"]');
      accumBtn.click();

      expect(state.era2.posture).toBe('ACCUMULATE');
    });

    it('handles keyboard arrow right / left navigation within radiogroup', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE'; // index 1 (ACCUMULATE=0, BALANCE=1, CONDENSE=2)

      const onPostureChange = vi.fn();
      renderCosmosExperience(doc, getCosmosPresentation(state), null, onPostureChange);

      const group = postureEl.querySelector('.cosmos-posture-group');

      // ArrowRight from BALANCE should navigate to CONDENSE
      group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      expect(onPostureChange).toHaveBeenCalledWith('CONDENSE');

      // ArrowLeft from BALANCE should navigate to ACCUMULATE
      onPostureChange.mockClear();
      group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      expect(onPostureChange).toHaveBeenCalledWith('ACCUMULATE');
    });
  });

  describe('Bounded Model-C Contextual Quick Actions', () => {
    it('projects Quark Condenser when condenserLevel < 3', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 0;
      state.resources.quarks.amount = new Decimal(10); // cost is 20

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).not.toBeNull();
      expect(pres.process.action.id).toBe('quarkCondenser');
      expect(pres.process.action.label).toBe('Construct Quark Condenser');
      expect(pres.process.action.currency).toBe('Quarks');
      expect(pres.process.action.enabled).toBe(false);

      // Add enough quarks
      state.resources.quarks.amount = new Decimal(20);
      const presAffordable = getCosmosPresentation(state);
      expect(presAffordable.process.action.enabled).toBe(true);
    });

    it('projects Gluon Matrix when condenserLevel >= 3 and gluonLevel === 0', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 0;
      state.resources.gluons.amount = new Decimal(120); // cost is 120

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).not.toBeNull();
      expect(pres.process.action.id).toBe('gluonBinding');
      expect(pres.process.action.label).toBe('Synthesize Gluon Matrix');
      expect(pres.process.action.currency).toBe('Gluons');
      expect(pres.process.action.enabled).toBe(true);
    });

    it('projects Lepton Collector when gluonLevel >= 2 and leptonLevel === 0', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 0;
      state.resources.gluons.amount = new Decimal(400); // cost is 400

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).not.toBeNull();
      expect(pres.process.action.id).toBe('leptonHarvest');
      expect(pres.process.action.label).toBe('Construct Lepton Collector');
      expect(pres.process.action.currency).toBe('Gluons');
      expect(pres.process.action.enabled).toBe(true);
    });

    it('projects Proton Synthesizer when leptonLevel >= 1 and synthesizerLevel === 0', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 1;
      state.upgrades.plasma.plasmaAutomation.level = 0;
      state.resources.quarks.amount = new Decimal(2000); // cost is 2000

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).not.toBeNull();
      expect(pres.process.action.id).toBe('plasmaAutomation');
      expect(pres.process.action.label).toBe('Synthesize Protons');
      expect(pres.process.action.currency).toBe('Quarks');
      expect(pres.process.action.enabled).toBe(true);
    });

    it('projects Baryogenesis Radiator when synthesizerLevel >= 1 and radiatorLevel === 0', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 1;
      state.upgrades.plasma.plasmaAutomation.level = 1;
      state.upgrades.plasma.baryoRadiator.level = 0;
      state.resources.protons.amount = new Decimal(100); // cost is 100

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).not.toBeNull();
      expect(pres.process.action.id).toBe('baryoRadiator');
      expect(pres.process.action.label).toBe('Construct Baryogenesis Radiator');
      expect(pres.process.action.currency).toBe('Protons');
      expect(pres.process.action.enabled).toBe(true);
    });

    it('returns null action once all 5 foundational pipeline upgrades are unlocked', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 1;
      state.upgrades.plasma.plasmaAutomation.level = 1;
      state.upgrades.plasma.baryoRadiator.level = 1;

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).toBeNull();
    });

    it('renders contextual action button inside cosmos-process-status and handles click dispatch', () => {
      const state = engine.getStateUnsafe();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 0;
      state.resources.quarks.amount = new Decimal(30);

      const onAction = vi.fn((action) => {
        if (action.kind === 'upgrade-plasma') {
          dispatchEngineCommand({
            type: 'BUY_UPGRADE_PLASMA',
            payload: { category: 'plasma', upgradeId: action.id, loops: 1 }
          });
        }
      });

      renderCosmosExperience(doc, getCosmosPresentation(state), onAction);

      const actionBtn = processEl.querySelector('#cosmos-current-action-button');
      expect(actionBtn).not.toBeNull();
      expect(actionBtn.disabled).toBe(false);
      expect(actionBtn.textContent).toContain('Construct Quark Condenser');
      expect(actionBtn.textContent).toContain('Cost: 20 Quarks');

      actionBtn.click();

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(state.upgrades.plasma.quarkCondenser.level).toBe(1);
      expect(state.resources.quarks.amount.toNumber()).toBe(10);
    });
  });

  describe('DOM Layout & Hierarchy Invariance', () => {
    it('maintains correct DOM sibling order in #tab-content-core', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      renderCosmosExperience(doc, getCosmosPresentation(state));

      const children = [...tabCore.children];
      const primaryIdx = children.indexOf(primaryEl);
      const starCoreIdx = children.indexOf(starCoreEl);
      const coreContextIdx = children.indexOf(coreContextEl);
      const postureIdx = children.indexOf(postureEl);
      const processIdx = children.indexOf(processEl);

      expect(primaryIdx).toBeLessThan(starCoreIdx);
      expect(starCoreIdx).toBeLessThan(coreContextIdx);
      expect(coreContextIdx).toBeLessThan(postureIdx);
      expect(postureIdx).toBeLessThan(processIdx);
    });
  });
});
