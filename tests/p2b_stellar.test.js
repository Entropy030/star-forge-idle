import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '../src/state/createInitialState.js';
import { simulateStellarEra } from '../src/eras/stellar/simulation.js';
import Decimal from '../break_infinity.js';
import { setGameState } from '../src/core/state.js';

describe('P2B Stellar Simulation & Build Archetypes', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 3;
    setGameState(state);
  });

  it('calculates coherence correctly based on stability, fuel efficiency and phases', () => {
    state.upgrades.stellar = {
      efficient: { level: 2 }, // Stability: +20, Fuel Efficiency: +0.2
      massive: { level: 0 },
      compact: { level: 0 }
    };
    state.era3.stage = "Protostar"; // phase 1
    
    // stability = 100 + 20 = 120
    // fuelEfficiency = 1.0 + 0.2 = 1.2
    // phases = 1
    // rawCoherence = 120 * 1.2 * 1 = 144
    // actualCoherence = 144 ^ 0.85 = ~67.14
    
    simulateStellarEra(state, 1.0);
    expect(state.coherence.toNumber()).toBeGreaterThan(0);
    // target is ~67.14, diff = 67.14. At 0.1 rate, it approaches by 6.714
    expect(state.coherence.toNumber()).toBeCloseTo(6.83, 2);
  });

  describe('Efficient Build', () => {
    it('increases fuel efficiency, lowering costs', () => {
      state.era3.gravity = new Decimal(0);
      state.upgrades.stellar = { efficient: { level: 5 } }; // fuel efficiency = 1.5
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(10); // target fusions = 10
      state.resources.hydrogen.amount = new Decimal(100);
      
      simulateStellarEra(state, 1.0);
      
      expect(state.resources.helium.amount.toNumber()).toBe(10);
      expect(state.resources.hydrogen.amount.toNumber()).toBeCloseTo(100 - 66.666, 1);
    });
  });

  describe('Massive Build', () => {
    it('increases generation speed and Iron yield, lowers stability', () => {
      state.upgrades.stellar = { massive: { level: 4 } }; 
      state.era3.gravity = new Decimal(1);
      state.era3.stage = "Main Sequence Star";
      state.era3.ironYield = new Decimal(2);
      state.era3.temperature = new Decimal(3000000000); // 3 billion, above unlockTemp (2 billion)
      state.resources.carbon.amount = new Decimal(10000);
      
      simulateStellarEra(state, 1.0);
      
      // hydrogenRate = 10 * 1.4 = 14
      expect(state.resources.hydrogen.amount.toNumber()).toBe(14);
      
      // targetIron = 2 * 1.4 * 3.0 = 8.4
      expect(state.resources.iron.amount.toNumber()).toBeCloseTo(8.4, 1);
    });
  });

  describe('Compact Build', () => {
    it('generates Pulsar Shards passively based on compact level', () => {
      let oldRandom = Math.random;
      Math.random = () => 0.005; 
      
      state.upgrades.stellar = { compact: { level: 1 } }; 
      
      simulateStellarEra(state, 1.0);
      
      expect(state.currencies.pulsarShards.amount.toNumber()).toBe(1);
      
      Math.random = oldRandom;
    });
  });

  describe('Mechanics & Negative Prevention', () => {
    it('does not consume resources if disabled or zero yield', () => {
      state.era3.gravity = new Decimal(0);
      state.era3.fusersEnabled = false;
      state.era3.fusionYield = new Decimal(10);
      state.resources.hydrogen.amount = new Decimal(100);
      
      simulateStellarEra(state, 1.0);
      
      expect(state.resources.hydrogen.amount.toNumber()).toBe(100);
      expect(state.resources.helium.amount.toNumber()).toBe(0);
    });
    
    it('limits production to available input resources without going negative', () => {
      state.era3.gravity = new Decimal(0);
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(10);
      state.resources.hydrogen.amount = new Decimal(15);
      
      simulateStellarEra(state, 1.0);
      
      expect(state.resources.helium.amount.toNumber()).toBe(1);
      expect(state.resources.hydrogen.amount.toNumber()).toBe(5);
    });
  });
  
  describe('Flares', () => {
    it('spawns a flare after timer expires', () => {
      state.flares = {
        active: null,
        nextSpawnInSec: new Decimal(0.5)
      };
      
      simulateStellarEra(state, 1.0);
      
      expect(state.flares.active).not.toBeNull();
      expect(state.flares.active.expiresInSec.toNumber()).toBe(10);
      expect(state.flares.nextSpawnInSec.toNumber()).toBe(60);
    });
  });
});
