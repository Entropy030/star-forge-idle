import { beforeEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { renderCosmosExperience } from '../src/ui/cosmosExperience.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { createGameEngine } from '../src/engine/createEngine.js';
import { dispatchEngineCommand, setEngineDispatcher } from '../src/engine/dispatch.js';
import { plasmaCommandHandlers } from '../src/eras/plasma/commands.js';
import { getPlasmaUpgradePurchaseDetails } from '../src/eras/plasma/eligibility.js';

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
      expect(onPostureChange).toHaveBeenCalledTimes(1);
      expect(onPostureChange).toHaveBeenCalledWith('CONDENSE');

      // ArrowLeft from BALANCE should navigate to ACCUMULATE
      onPostureChange.mockClear();
      group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      expect(onPostureChange).toHaveBeenCalledTimes(1);
      expect(onPostureChange).toHaveBeenCalledWith('ACCUMULATE');
    });

    it('dispatches exactly once on Space key activation on focused posture button', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      const onPostureChange = vi.fn();
      renderCosmosExperience(doc, getCosmosPresentation(state), null, onPostureChange);

      const accumBtn = postureEl.querySelector('[data-posture="ACCUMULATE"]');
      accumBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      expect(onPostureChange).toHaveBeenCalledTimes(1);
      expect(onPostureChange).toHaveBeenCalledWith('ACCUMULATE');
    });

    it('dispatches exactly once on Enter key activation on focused posture button', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      const onPostureChange = vi.fn();
      renderCosmosExperience(doc, getCosmosPresentation(state), null, onPostureChange);

      const condenseBtn = postureEl.querySelector('[data-posture="CONDENSE"]');
      condenseBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      expect(onPostureChange).toHaveBeenCalledTimes(1);
      expect(onPostureChange).toHaveBeenCalledWith('CONDENSE');
    });

    it('does not accumulate event listeners over repeated renders (N renders + 1 click = 1 dispatch)', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.era2.posture = 'BALANCE';

      const onPostureChange = vi.fn();
      // Render 10 times consecutively
      for (let i = 0; i < 10; i++) {
        renderCosmosExperience(doc, getCosmosPresentation(state), null, onPostureChange);
      }

      const accumBtn = postureEl.querySelector('[data-posture="ACCUMULATE"]');
      accumBtn.click();

      expect(onPostureChange).toHaveBeenCalledTimes(1);
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
      expect(pres.process.action.effect).toBe('Increase primordial quark influx');
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
      expect(pres.process.action.effect).toBe('Enable gluon production for hadron binding');
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
      expect(pres.process.action.effect).toBe('Enable lepton harvesting for electron formation');
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
      expect(pres.process.action.effect).toBe('Combine quarks and gluons into stable protons');
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
      expect(pres.process.action.effect).toBe('Radiate excess thermal energy to cool plasma');
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

    it('suppresses contextual upgrade actions when Recombination is ready via protons route', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 1;
      state.upgrades.plasma.plasmaAutomation.level = 1;
      state.upgrades.plasma.baryoRadiator.level = 0; // unconstructed
      state.resources.protons.amount = new Decimal(1000000); // Recombination threshold met (1M protons)

      const pres = getCosmosPresentation(state);
      expect(pres.primary.ready).toBe(true);
      expect(pres.transition.ready).toBe(true);
      expect(pres.process.action).toBeNull(); // Action cleanly suppressed
    });

    it('suppresses contextual upgrade actions when Recombination is ready via temperature route', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 1;
      state.upgrades.plasma.plasmaAutomation.level = 1;
      state.upgrades.plasma.baryoRadiator.level = 0; // unconstructed
      state.plasmaTemperature = new Decimal(3000); // Recombination temp met

      const pres = getCosmosPresentation(state);
      expect(pres.primary.ready).toBe(true);
      expect(pres.transition.ready).toBe(true);
      expect(pres.process.action).toBeNull(); // Action cleanly suppressed
    });

    it('computes effective cost, currency and affordability via shared getPlasmaUpgradePurchaseDetails', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 0;
      state.upgrades.plasma.quarkCondenser.cost = new Decimal(100);
      state.artifacts = { modifiers: { costDiscount: 0.25 } };
      state.resources.quarks.amount = new Decimal(75);

      const pres = getCosmosPresentation(state);
      expect(pres.process.action).not.toBeNull();
      expect(pres.process.action.cost.toNumber()).toBe(75); // 100 * (1 - 0.25)
      expect(pres.process.action.currency).toBe('Quarks');
      expect(pres.process.action.enabled).toBe(true);

      // Decrement balance below discounted cost
      state.resources.quarks.amount = new Decimal(74);
      const presUnaffordable = getCosmosPresentation(state);
      expect(presUnaffordable.process.action.enabled).toBe(false);
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

    it('does not accumulate action listeners over repeated renders (N renders + 1 click = 1 dispatch)', () => {
      const state = engine.getStateUnsafe();
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser.level = 0;
      state.resources.quarks.amount = new Decimal(50);

      const onAction = vi.fn((action) => {
        if (action.kind === 'upgrade-plasma') {
          dispatchEngineCommand({
            type: 'BUY_UPGRADE_PLASMA',
            payload: { category: 'plasma', upgradeId: action.id, loops: 1 }
          });
        }
      });

      // Render 10 times consecutively
      for (let i = 0; i < 10; i++) {
        renderCosmosExperience(doc, getCosmosPresentation(state), onAction);
      }

      const actionBtn = processEl.querySelector('#cosmos-current-action-button');
      actionBtn.click();

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(state.upgrades.plasma.quarkCondenser.level).toBe(1);
      expect(state.resources.quarks.amount.toNumber()).toBe(30);
    });

    it('produces identical state mutation between Cosmos quick-action and Forge purchase command (Forge parity)', () => {
      const stateCosmos = createInitialState();
      stateCosmos.activeEpoch = 2;
      stateCosmos.resources.quarks.amount = new Decimal(100);

      const stateForge = createInitialState();
      stateForge.activeEpoch = 2;
      stateForge.resources.quarks.amount = new Decimal(100);

      const payload = { category: 'plasma', upgradeId: 'quarkCondenser', loops: 1 };

      // Dispatch via Cosmos handler path
      plasmaCommandHandlers.BUY_UPGRADE_PLASMA(stateCosmos, { type: 'BUY_UPGRADE_PLASMA', payload });

      // Dispatch via Forge handler path
      plasmaCommandHandlers.BUY_UPGRADE_PLASMA(stateForge, { type: 'BUY_UPGRADE_PLASMA', payload });

      expect(stateCosmos.upgrades.plasma.quarkCondenser.level).toBe(stateForge.upgrades.plasma.quarkCondenser.level);
      expect(stateCosmos.resources.quarks.amount.toString()).toBe(stateForge.resources.quarks.amount.toString());
      expect(stateCosmos.upgrades.plasma.quarkCondenser.cost.toString()).toBe(stateForge.upgrades.plasma.quarkCondenser.cost.toString());
    });

    it('guarantees shared purchase details effective cost matches exact command deduction (no discount & with discount)', () => {
      // 1. No discount
      const stateNoDiscount = createInitialState();
      stateNoDiscount.activeEpoch = 2;
      stateNoDiscount.resources.quarks.amount = new Decimal(50);
      const detailsNoDiscount = getPlasmaUpgradePurchaseDetails(stateNoDiscount, 'quarkCondenser');
      expect(detailsNoDiscount.cost.toNumber()).toBe(20);

      const resNoDisc = plasmaCommandHandlers.BUY_UPGRADE_PLASMA(stateNoDiscount, {
        type: 'BUY_UPGRADE_PLASMA',
        payload: { category: 'plasma', upgradeId: 'quarkCondenser', loops: 1 }
      });
      expect(resNoDisc.ok).toBe(true);
      expect(stateNoDiscount.resources.quarks.amount.toNumber()).toBe(50 - detailsNoDiscount.cost.toNumber());

      // 2. Active 25% discount
      const stateWithDiscount = createInitialState();
      stateWithDiscount.activeEpoch = 2;
      stateWithDiscount.artifacts = { modifiers: { costDiscount: 0.25 } };
      stateWithDiscount.resources.quarks.amount = new Decimal(50);
      const detailsWithDiscount = getPlasmaUpgradePurchaseDetails(stateWithDiscount, 'quarkCondenser');
      expect(detailsWithDiscount.cost.toNumber()).toBe(15); // 20 * 0.75 = 15

      const resDisc = plasmaCommandHandlers.BUY_UPGRADE_PLASMA(stateWithDiscount, {
        type: 'BUY_UPGRADE_PLASMA',
        payload: { category: 'plasma', upgradeId: 'quarkCondenser', loops: 1 }
      });
      expect(resDisc.ok).toBe(true);
      expect(stateWithDiscount.resources.quarks.amount.toNumber()).toBe(50 - detailsWithDiscount.cost.toNumber());
    });

    it('rejects purchase command when unaffordable and preserves state identically', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.resources.quarks.amount = new Decimal(10); // cost is 20
      const details = getPlasmaUpgradePurchaseDetails(state, 'quarkCondenser');
      expect(details.isAffordable).toBe(false);

      const res = plasmaCommandHandlers.BUY_UPGRADE_PLASMA(state, {
        type: 'BUY_UPGRADE_PLASMA',
        payload: { category: 'plasma', upgradeId: 'quarkCondenser', loops: 1 }
      });
      expect(res.ok).toBe(false);
      expect(res.error.code).toBe('CANNOT_AFFORD');
      expect(state.upgrades.plasma.quarkCondenser.level).toBe(0);
      expect(state.resources.quarks.amount.toNumber()).toBe(10);
    });

    it('evaluates dynamic cost scaling iteratively across bulk purchase loops', () => {
      const state = createInitialState();
      state.activeEpoch = 2;
      state.resources.quarks.amount = new Decimal(200);

      // Level 0 -> cost 20 (base)
      // Level 1 -> cost 26 (20 * 1.3)
      // Level 2 -> cost 34 (26 * 1.3 = 33.8 -> 34)
      // Sum for 3 loops = 20 + 26 + 34 = 80
      const res = plasmaCommandHandlers.BUY_UPGRADE_PLASMA(state, {
        type: 'BUY_UPGRADE_PLASMA',
        payload: { category: 'plasma', upgradeId: 'quarkCondenser', loops: 3 }
      });

      expect(res.ok).toBe(true);
      expect(state.upgrades.plasma.quarkCondenser.level).toBe(3);
      expect(state.resources.quarks.amount.toNumber()).toBe(200 - 80); // 120

      // Subsequent purchase details reflects level 3 (cost 34 * 1.3 = 44.2 -> 44)
      const nextDetails = getPlasmaUpgradePurchaseDetails(state, 'quarkCondenser');
      expect(nextDetails.cost.toNumber()).toBe(44);
      expect(nextDetails.isAffordable).toBe(true); // 120 >= 44
    });

    it('dispatches onAction when button transitions from unaffordable to affordable without DOM reconstruction', () => {
      const testState = createInitialState();
      testState.activeEpoch = 2;
      testState.resources.quarks.amount = new Decimal(0); // initially unaffordable (cost 20)
      engine.loadState(testState);

      const onActionMock = vi.fn((action) => {
        dispatchEngineCommand({
          type: 'BUY_UPGRADE_PLASMA',
          payload: { category: 'plasma', upgradeId: action.id, loops: 1 }
        });
      });

      // 1. Initial render with 0 Quarks
      renderCosmosExperience(doc, getCosmosPresentation(testState), onActionMock);
      const actionButton = processEl.querySelector('#cosmos-current-action-button');
      expect(actionButton).not.toBeNull();
      expect(actionButton.disabled).toBe(true);

      // Attempt click while disabled
      actionButton.click();
      expect(onActionMock).not.toHaveBeenCalled();

      // 2. Accumulate quarks to 25 (affordable, but structureKey unchanged)
      testState.resources.quarks.amount = new Decimal(25);
      renderCosmosExperience(doc, getCosmosPresentation(testState), onActionMock);
      expect(actionButton.disabled).toBe(false);

      // Click now that it is affordable
      actionButton.click();
      expect(onActionMock).toHaveBeenCalledTimes(1);
      expect(onActionMock).toHaveBeenCalledWith(expect.objectContaining({
        id: 'quarkCondenser',
        enabled: true
      }));

      // Verify authoritative engine state updated
      const engineState = engine.getStateUnsafe();
      expect(engineState.upgrades.plasma.quarkCondenser.level).toBe(1);
      expect(engineState.resources.quarks.amount.toNumber()).toBe(5); // 25 - 20 = 5
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
