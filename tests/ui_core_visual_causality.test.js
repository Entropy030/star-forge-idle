import { describe, it, expect, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import { getEraTwoVisualSemantics } from '../src/eras/plasma/semantics.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { renderCosmosExperience } from '../src/ui/cosmosExperience.js';
import { dispatchEraRenderer } from '../src/ui/canvasCore.js';

function createMockState(overrides = {}) {
  return {
    activeEpoch: 2,
    plasmaTemperature: new Decimal(10000000),
    resources: {
      quarks: { amount: new Decimal(0) },
      gluons: { amount: new Decimal(0) },
      leptons: { amount: new Decimal(0) },
      protons: { amount: new Decimal(0) },
      electrons: { amount: new Decimal(0) },
      hydrogen: { amount: new Decimal(0) }
    },
    upgrades: {
      quantum: {},
      plasma: {
        quarkCondenser: { level: 1 },
        gluonBinding: { level: 0 },
        leptonHarvest: { level: 0 },
        plasmaAutomation: { level: 0 },
        baryoRadiator: { level: 0 }
      },
      stellar: {}
    },
    era2: {
      posture: 'BALANCE'
    },
    artifacts: {
      modifiers: {}
    },
    ...overrides
  };
}

describe('Era-II Star Core Semantic Visual Model', () => {
  it('returns null for non-Era-II states', () => {
    const era1State = createMockState({ activeEpoch: 1 });
    const era3State = createMockState({ activeEpoch: 3 });
    expect(getEraTwoVisualSemantics(era1State)).toBeNull();
    expect(getEraTwoVisualSemantics(era3State)).toBeNull();
    expect(getEraTwoVisualSemantics(null)).toBeNull();
  });

  describe('Posture Semantic Dimensions', () => {
    it('computes distinct activity and concentration for ACCUMULATE posture', () => {
      const state = createMockState({ era2: { posture: 'ACCUMULATE' } });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.posture).toBe('ACCUMULATE');
      expect(semantics.postureRole).toBe('Matter Influx');
      expect(semantics.activityLevel).toBeGreaterThan(0.8);
      expect(semantics.concentrationFactor).toBeLessThanOrEqual(0.3);
      expect(semantics.semanticLabel).toContain('[ACCUMULATE]');
    });

    it('computes balanced activity and concentration for BALANCE posture', () => {
      const state = createMockState({ era2: { posture: 'BALANCE' } });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.posture).toBe('BALANCE');
      expect(semantics.postureRole).toBe('Equilibrium');
      expect(semantics.activityLevel).toBeGreaterThan(0.5);
      expect(semantics.concentrationFactor).toBeGreaterThanOrEqual(0.3);
      expect(semantics.semanticLabel).toContain('[BALANCE]');
    });

    it('computes distinct activity and concentration for CONDENSE posture', () => {
      const state = createMockState({ era2: { posture: 'CONDENSE' } });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.posture).toBe('CONDENSE');
      expect(semantics.postureRole).toBe('Cooling & Binding');
      expect(semantics.activityLevel).toBeLessThan(0.4);
      expect(semantics.concentrationFactor).toBeGreaterThanOrEqual(0.5);
      expect(semantics.semanticLabel).toContain('[CONDENSE]');
    });
  });

  describe('Thermal State & Cooling Progression', () => {
    it('computes hot thermal state and coolProgress=0 at 10M K', () => {
      const state = createMockState({ plasmaTemperature: new Decimal(10000000) });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.temperatureK).toBe(10000000);
      expect(semantics.coolProgress).toBe(0);
      expect(semantics.thermalCategory).toBe('hot');
      expect(semantics.recombinationReady).toBe(false);
    });

    it('computes cooling thermal state for intermediate temperatures (e.g. 500,000 K)', () => {
      const state = createMockState({ plasmaTemperature: new Decimal(500000) });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.temperatureK).toBe(500000);
      expect(semantics.coolProgress).toBeCloseTo((10000000 - 500000) / (10000000 - 3000), 4);
      expect(semantics.thermalCategory).toBe('cooling');
      expect(semantics.recombinationReady).toBe(false);
    });

    it('computes stabilized thermal state below 100,000 K before recombination', () => {
      const state = createMockState({ plasmaTemperature: new Decimal(50000) });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.temperatureK).toBe(50000);
      expect(semantics.thermalCategory).toBe('stabilized');
    });
  });

  describe('Recombination Readiness Visual Authority', () => {
    it('identifies recombination readiness satisfied via Protons', () => {
      const state = createMockState({
        plasmaTemperature: new Decimal(5000000),
        resources: {
          ...createMockState().resources,
          protons: { amount: new Decimal(COSMIC_REGISTRY.constants.recombinationProtonThreshold) }
        }
      });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.recombinationReady).toBe(true);
      expect(semantics.recombinationSatisfiedVia).toBe('protons');
      expect(semantics.thermalCategory).toBe('recombination-ready');
      expect(semantics.ariaLabel).toContain('Cosmic Recombination is ready (via proton accumulation)');
      expect(semantics.semanticLabel).toContain('Recombination Ready');
    });

    it('identifies recombination readiness satisfied via Cooling', () => {
      const state = createMockState({
        plasmaTemperature: new Decimal(3000),
        resources: {
          ...createMockState().resources,
          protons: { amount: new Decimal(50) }
        }
      });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.recombinationReady).toBe(true);
      expect(semantics.recombinationSatisfiedVia).toBe('cooling');
      expect(semantics.thermalCategory).toBe('recombination-ready');
      expect(semantics.ariaLabel).toContain('Cosmic Recombination is ready (via plasma cooling)');
    });

    it('identifies recombination readiness satisfied via Both routes', () => {
      const state = createMockState({
        plasmaTemperature: new Decimal(3000),
        resources: {
          ...createMockState().resources,
          protons: { amount: new Decimal(COSMIC_REGISTRY.constants.recombinationProtonThreshold) }
        }
      });
      const semantics = getEraTwoVisualSemantics(state);
      expect(semantics.recombinationReady).toBe(true);
      expect(semantics.recombinationSatisfiedVia).toBe('both');
      expect(semantics.ariaLabel).toContain('Cosmic Recombination is ready (via protons and cooling)');
    });
  });

  describe('Cosmos Presentation & DOM Integration', () => {
    it('attaches visualSemantics to Era II cosmos presentation', () => {
      const state = createMockState({ era2: { posture: 'CONDENSE' }, plasmaTemperature: new Decimal(400000) });
      const presentation = getCosmosPresentation(state);
      expect(presentation.visualSemantics).toBeDefined();
      expect(presentation.visualSemantics.posture).toBe('CONDENSE');
      expect(presentation.visualSemantics.thermalCategory).toBe('cooling');
      expect(presentation.core.ariaLabel).toBe(presentation.visualSemantics.ariaLabel);
    });

    it('synchronizes accessible semantic data attributes on #star-core DOM element', () => {
      const state = createMockState({ era2: { posture: 'ACCUMULATE' } });
      const presentation = getCosmosPresentation(state);

      const mockStarCore = document.createElement('div');
      mockStarCore.id = 'star-core';
      const mockDoc = {
        getElementById: vi.fn((id) => {
          if (id === 'star-core') return mockStarCore;
          if (id === 'tab-content-core') return document.createElement('div');
          return null;
        })
      };

      renderCosmosExperience(mockDoc, presentation, () => {}, () => {});

      expect(mockStarCore.dataset.posture).toBe('ACCUMULATE');
      expect(mockStarCore.dataset.thermalState).toBe('hot');
      expect(mockStarCore.dataset.transitionReady).toBe('false');
      expect(mockStarCore.dataset.semanticLabel).toContain('[ACCUMULATE]');
      expect(mockStarCore.getAttribute('aria-label')).toBe(presentation.visualSemantics.ariaLabel);
    });

    it('cleans up Era-II datasets when switching to Era-I or Era-III', () => {
      const era1Presentation = getCosmosPresentation(createMockState({ activeEpoch: 1 }));
      const mockStarCore = document.createElement('div');
      mockStarCore.id = 'star-core';
      mockStarCore.dataset.posture = 'ACCUMULATE';
      mockStarCore.dataset.thermalState = 'hot';
      mockStarCore.dataset.transitionReady = 'false';
      mockStarCore.dataset.semanticLabel = 'old';

      const mockDoc = {
        getElementById: vi.fn((id) => {
          if (id === 'star-core') return mockStarCore;
          if (id === 'tab-content-core') return document.createElement('div');
          return null;
        })
      };

      renderCosmosExperience(mockDoc, era1Presentation, () => {}, () => {});

      expect(mockStarCore.dataset.posture).toBeUndefined();
      expect(mockStarCore.dataset.thermalState).toBeUndefined();
      expect(mockStarCore.dataset.transitionReady).toBeUndefined();
      expect(mockStarCore.dataset.semanticLabel).toBeUndefined();
    });
  });

  describe('Canvas Epoch Dispatch Invariance', () => {
    it('dispatches Era 2 to drawEra2 while preserving all other epochs', () => {
      const renderers = {
        drawEra1: vi.fn(),
        drawEra2: vi.fn(),
        drawEra3: vi.fn(),
        drawEra4: vi.fn(),
        drawEra5: vi.fn()
      };

      dispatchEraRenderer(2, renderers, 250, 250);
      expect(renderers.drawEra2).toHaveBeenCalledWith(250, 250);
      expect(renderers.drawEra1).not.toHaveBeenCalled();
      expect(renderers.drawEra3).not.toHaveBeenCalled();

      vi.clearAllMocks();
      dispatchEraRenderer(1, renderers, 100, 100);
      expect(renderers.drawEra1).toHaveBeenCalledWith(100, 100);
      expect(renderers.drawEra2).not.toHaveBeenCalled();

      vi.clearAllMocks();
      dispatchEraRenderer(3, renderers, 300, 300);
      expect(renderers.drawEra3).toHaveBeenCalledWith(300, 300);
      expect(renderers.drawEra2).not.toHaveBeenCalled();
    });
  });
});
