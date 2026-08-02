import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '../src/state/createInitialState.js';
import { Timeline } from '../src/core/timeline.js';
import { gameState, setGameState } from '../src/core/state.js';
import Decimal from '../break_infinity.js';

describe('P2A Material Flow & Recipe Semantics', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    setGameState(state);
  });

  describe('Era I: Quantum Foam', () => {
    it('generates annihilation energy and surviving matter based on asymmetry', () => {
      state.activeEpoch = 1;
      state.resources.energyDensity.amount = new Decimal(100); // log10 = 2
      state.era1.asymmetryBias = 0.8;
      
      Timeline.simulate.call({ stellarDawn: () => {}, galacticMatrix: () => {} }, 1.0);
      
      // baseGen = 2.
      // matterGen = 2 * 0.8 = 1.6
      // antimatterGen = 2 * 0.2 = 0.4
      // annihilationAmt = min(1.6, 0.4) = 0.4
      // survivingMatter = 1.6 - 0.4 = 1.2
      // annihilationEnergy = 0.4 * 10 = 4.0
      
      expect(state.resources.survivingMatter.amount.toNumber()).toBeCloseTo(1.2);
      expect(state.resources.annihilationEnergy.amount.toNumber()).toBeCloseTo(4.0);
    });
  });

  describe('Era II: Plasma Crucible Recipes', () => {
    it('blocks process if inputs are missing (no resources from nothing)', () => {
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser = { level: 1 };
      state.resources.survivingMatter.amount = new Decimal(0);
      
      Timeline.simulate.call({ stellarDawn: () => {}, galacticMatrix: () => {} }, 1.0);
      
      expect(state.resources.quarks.amount.toNumber()).toBe(0);
      expect(state.resources.leptons.amount.toNumber()).toBe(0);
    });

    it('consumes surviving matter to produce quarks and leptons', () => {
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser = { level: 1 };
      state.resources.survivingMatter.amount = new Decimal(10);
      
      Timeline.simulate.call({ stellarDawn: () => {}, galacticMatrix: () => {} }, 1.0);
      
      // Level 1 generates baseRate = 1. 
      // Input: 2 SM -> Output: 2 Quarks, 1 Lepton
      expect(state.resources.survivingMatter.amount.toNumber()).toBe(8);
      expect(state.resources.quarks.amount.toNumber()).toBe(2);
      expect(state.resources.leptons.amount.toNumber()).toBe(1);
    });
    
    it('limits production if input is insufficient', () => {
      state.activeEpoch = 2;
      state.upgrades.plasma.quarkCondenser = { level: 10 };
      // BaseRate = 10, needs 20 SM, but we only have 5.
      state.resources.survivingMatter.amount = new Decimal(5);
      
      Timeline.simulate.call({ stellarDawn: () => {}, galacticMatrix: () => {} }, 1.0);
      
      // Since it needs 20, it will be limited by a factor of 5/20 = 0.25
      // Consumes 5 SM.
      // Produces 20 * 0.25 = 5 Quarks.
      // Produces 10 * 0.25 = 2.5 Leptons.
      expect(state.resources.survivingMatter.amount.toNumber()).toBe(0);
      expect(state.resources.quarks.amount.toNumber()).toBe(5);
      expect(state.resources.leptons.amount.toNumber()).toBeCloseTo(2.5);
    });

    it('processes proton synthesis properly', () => {
      state.activeEpoch = 2;
      state.upgrades.plasma.plasmaAutomation = { level: 1 };
      state.resources.quarks.amount = new Decimal(6);
      
      Timeline.simulate.call({ stellarDawn: () => {}, galacticMatrix: () => {} }, 1.0);
      
      // Level 1 synth: baseRate = 2. 
      // Input: 3 Quarks -> Output: 1 Proton. Needed Quarks = 2 * 3 = 6.
      expect(state.resources.quarks.amount.toNumber()).toBe(0);
      expect(state.resources.protons.amount.toNumber()).toBe(2);
    });
    
    it('prevents negative resources', () => {
      state.activeEpoch = 2;
      state.upgrades.plasma.plasmaAutomation = { level: 1 };
      state.resources.quarks.amount = new Decimal(2); // Not enough for even 1 baseRate tick (needs 6)
      
      Timeline.simulate.call({ stellarDawn: () => {}, galacticMatrix: () => {} }, 1.0);
      
      // Factor: 2 / 6 = 1/3
      // Consumes 2 Quarks. Produces 2 * 1/3 = 2/3 Protons.
      expect(state.resources.quarks.amount.toNumber()).toBe(0);
      expect(state.resources.protons.amount.toNumber()).toBeCloseTo(0.66666);
    });
  });
});
