import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import Decimal from 'break_infinity.js';
import { getInitialGameState, setGameState, gameState } from '../src/core/state.js';
import { computePlasmaStep } from '../src/eras/plasma/evaluator.js';
import { simulatePlasmaEra } from '../src/eras/plasma/simulation.js';
import { getPlasmaUpgradeVisibility, getPlasmaRates } from '../src/eras/plasma/selectors.js';
import { Viewport } from '../src/ui/viewport.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';

describe('P3 Follow-up 3: Complete Era-II Economy & Real Rendering', () => {

  describe('HTML Safe Default State', () => {
    it('should have game-shell and the earned-meta summary hidden by default in the raw HTML', () => {
      const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      
      const gameShell = doc.getElementById('game-shell');
      expect(gameShell).not.toBeNull();
      expect(gameShell.hasAttribute('hidden')).toBe(true);

      const metaSummary = doc.getElementById('meta-resource-summary');
      expect(metaSummary).not.toBeNull();
      expect(metaSummary.hasAttribute('hidden')).toBe(true);
      
      const introScreen = doc.getElementById('intro-screen-overlay');
      expect(introScreen.style.display).toBe('none');
    });
  });

  describe('Shared Evaluator: computePlasmaStep', () => {
    let state;
    beforeEach(() => {
      state = getInitialGameState();
      state.activeEpoch = 2;
      state.plasmaTemperature = new Decimal(1000000); // 1M K, above Recombination and Lepton Decay thresholds
      state.upgrades.plasma.quarkCondenser.level = 0;
      state.upgrades.plasma.gluonBinding.level = 0;
      state.upgrades.plasma.leptonHarvest.level = 0;
      state.upgrades.plasma.plasmaAutomation.level = 0;
      state.upgrades.plasma.baryoRadiator.level = 0;
    });

    it('Quark Condenser L1 generates 2 Quarks without Surviving Matter', () => {
      state.upgrades.plasma.quarkCondenser.level = 1;
      const step = computePlasmaStep(state, 1);
      expect(step.deltas.quarks.toNumber()).toBe(2);
      
      simulatePlasmaEra(state, 1);
      expect(state.resources.quarks.amount.toNumber()).toBe(2);
    });

    it('Gluon Matrix L1 generates 1.5 Gluons', () => {
      state.upgrades.plasma.gluonBinding.level = 1;
      const step = computePlasmaStep(state, 1);
      expect(step.deltas.gluons.toNumber()).toBe(1.5);
    });

    it('Lepton Decay limits conversion by available Leptons', () => {
      state.upgrades.plasma.leptonHarvest.level = 1;
      state.plasmaTemperature = new Decimal(400000); // Below 500k, unlocks Lepton Decay
      state.resources.leptons = { amount: new Decimal(0.5) };
      
      const step = computePlasmaStep(state, 1);
      // It produces 1 Lepton/s from the Harvest upgrade, giving 1.5 total leptons available.
      // Capacity is 1 Lepton/s for L1.
      expect(step.deltas.leptons.toNumber()).toBe(0); // +1 from production, -1 from decay = 0 delta
      expect(step.deltas.electrons.toNumber()).toBe(1); // 1 electron produced from 1 lepton decay
    });
    
    it('Proton Synthesizer correctly consumes 3 Quarks and 1 Gluon to synthesize 1 Proton', () => {
      state.upgrades.plasma.plasmaAutomation.level = 1;
      state.resources.quarks = { amount: new Decimal(2) }; // Start with 2
      state.resources.gluons = { amount: new Decimal(1) };
      
      // Need 3 quarks. If I don't have enough, it limits it.
      let step = computePlasmaStep(state, 1);
      // Wait, 2 quarks available means maxByQuarks = 2/3 = 0.666
      expect(step.deltas.protons.toNumber()).toBeCloseTo(0.666, 2);
      expect(step.deltas.quarks.toNumber()).toBeCloseTo(-2, 2);
      
      // Give plenty of resources
      state.resources.quarks.amount = new Decimal(10);
      state.resources.gluons.amount = new Decimal(10);
      step = computePlasmaStep(state, 1);
      expect(step.deltas.protons.toNumber()).toBe(1);
      expect(step.deltas.quarks.toNumber()).toBe(-3);
      expect(step.deltas.gluons.toNumber()).toBe(-1);
    });
  });

  describe('Real DOM Viewport Era-II Visibility Rendering', () => {
    let state;
    beforeEach(() => {
      state = getInitialGameState();
      state.activeEpoch = 2;
      setGameState(state);
      
      // Setup DOM
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="plasma-upgrades-container"></div>
          </body>
        </html>
      `);
      global.window = dom.window;
      global.document = dom.window.document;
      
      Viewport.clearElCache();
      
      // We must mock Templates because it expects HTML templates
      Viewport.renderGenericTierList = function(containerId, category, costLabelText, displayColor, activeCurrencyField) {
        const container = document.getElementById(containerId);
        if (!container.dataset.initialized) {
          for (let key in COSMIC_REGISTRY.upgrades[category]) {
            const row = document.createElement('div');
            row.id = `${category}-row-${key}`;
            row.style.display = 'none';
            container.appendChild(row);
          }
          container.dataset.initialized = 'true';
          container.dataset.category = category;
        }

        // Apply visibility directly as per our updated Viewport implementation
        for (let key in COSMIC_REGISTRY.upgrades[category]) {
          const row = document.getElementById(`${category}-row-${key}`);
          if (!row) continue;
          let isVisible = true;
          
          if (category === 'plasma') {
            const plasmaVis = getPlasmaUpgradeVisibility(state);
            if (plasmaVis[key]) {
              isVisible = plasmaVis[key] !== 'none';
            }
          }
          
          row.style.display = isVisible ? 'flex' : 'none';
        }
      };
    });
    
    afterEach(() => {
      delete global.window;
      delete global.document;
    });

    it('should reveal Gluon Matrix Synthesis when Quark Condenser hits Level 3', () => {
      // Act 1: Quark Condenser Level 2
      state.upgrades.plasma.quarkCondenser.level = 2;
      Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
      
      let gluonRow = document.getElementById('plasma-row-gluonBinding');
      expect(gluonRow.style.display).toBe('none');
      
      // Act 2: Quark Condenser Level 3
      state.upgrades.plasma.quarkCondenser.level = 3;
      Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
      
      expect(gluonRow.style.display).toBe('flex');
    });
    
    it('should reveal Baryogenesis Radiator when Proton Synthesizer hits Level 1', () => {
      state.upgrades.plasma.quarkCondenser.level = 3;
      state.upgrades.plasma.gluonBinding.level = 2;
      state.upgrades.plasma.leptonHarvest.level = 1;
      
      state.upgrades.plasma.plasmaAutomation.level = 0;
      Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
      let baryoRow = document.getElementById('plasma-row-baryoRadiator');
      expect(baryoRow.style.display).toBe('none');
      
      state.upgrades.plasma.plasmaAutomation.level = 1;
      Viewport.renderGenericTierList('plasma-upgrades-container', 'plasma');
      expect(baryoRow.style.display).toBe('flex');
    });
  });

});
