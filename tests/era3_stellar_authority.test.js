import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { ensureStateShape } from '../src/state/schema.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import {
  applyTemperatureGain,
  executeCompression,
  getAlphaMultiplier,
  getAutoSynthesizeMultiplier,
  getCarbonCapacity,
  getCarbonFuelCost,
  getFusionCapacity,
  getFusionFuelCost,
  getFusionFuelRequirement,
  getFusionSurgeMultiplier,
  getGravityMilestoneMultiplier,
  getHydrogenProductionRate,
  getIronCapacity,
  getIronFuelCost,
  getStellarSpeedMultiplier,
  getTemperatureMultiplier,
  rollNextFlareSpawnDelay
} from '../src/eras/stellar/authority.js';
import { simulateStellarEra } from '../src/eras/stellar/simulation.js';
import { stellarCommandHandlers } from '../src/eras/stellar/commands.js';
import { getStellarRates, getSupernovaOutcome } from '../src/eras/stellar/selectors.js';

describe('P5.3B0: Stellar Authority & Automation Parity Reconciliation', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 3;
  });

  describe('1. Pure Stellar Authority Mathematical Derivations', () => {
    it('calculates stellar speed multiplier with massive upgrades, second-run legacy, and first supernova achievement', () => {
      expect(getStellarSpeedMultiplier(state).toNumber()).toBe(1.0);

      state.upgrades.stellar.massive.level = 2;
      expect(getStellarSpeedMultiplier(state).toNumber()).toBeCloseTo(1.2, 5);

      state.meta = { stellarLegacyModifiers: { secondRunProductionMult: 1.5 } };
      expect(getStellarSpeedMultiplier(state).toNumber()).toBeCloseTo(1.8, 5);

      state.achievements.firstSupernova.unlocked = true;
      expect(getStellarSpeedMultiplier(state).toNumber()).toBeCloseTo(1.98, 5);
    });

    it('calculates Alpha constant modifier (+30% per level) for reaction processing throughput', () => {
      expect(getAlphaMultiplier(state).toNumber()).toBe(1.0);
      state.cosmicConstants.alpha = 2;
      expect(getAlphaMultiplier(state).toNumber()).toBeCloseTo(1.6, 5);
    });

    it('calculates AutoSynthesize modifier (+100% per level) for Carbon and Iron velocity', () => {
      expect(getAutoSynthesizeMultiplier(state).toNumber()).toBe(1.0);
      state.upgrades.pulsar.autoSynthesize.level = 3;
      expect(getAutoSynthesizeMultiplier(state).toNumber()).toBe(4.0);
    });

    it('calculates Fusion Surge multiplier (2x when buff active, 1x when expired)', () => {
      expect(getFusionSurgeMultiplier(state).toNumber()).toBe(1.0);
      state.buffs.fusionSurge.remainingSec = new Decimal(45);
      expect(getFusionSurgeMultiplier(state).toNumber()).toBe(2.0);
      state.buffs.fusionSurge.remainingSec = new Decimal(0);
      expect(getFusionSurgeMultiplier(state).toNumber()).toBe(1.0);
    });

    it('calculates Gravity milestones (+5% per 10 levels)', () => {
      expect(getGravityMilestoneMultiplier(0).toNumber()).toBe(1.0);
      expect(getGravityMilestoneMultiplier(9).toNumber()).toBe(1.0);
      expect(getGravityMilestoneMultiplier(10).toNumber()).toBeCloseTo(1.05, 5);
      expect(getGravityMilestoneMultiplier(25).toNumber()).toBeCloseTo(1.10, 5);
    });

    it('derives authoritative Hydrogen production rate from single source', () => {
      state.era3.gravity = new Decimal(10);
      // Base: 10 * 10 * 1.05 (milestone) = 105 H/s
      expect(getHydrogenProductionRate(state).toNumber()).toBeCloseTo(105, 5);

      // Dark Gravity singularity upgrade adds ^(1 + 0.05*lvl)
      state.upgrades.singularity.darkGravity.level = 1; // exponent 1.05
      const rateWithDarkGrav = Math.pow(105, 1.05);
      expect(getHydrogenProductionRate(state).toNumber()).toBeCloseTo(rateWithDarkGrav, 4);

      // Quantum Stabilizer celestial card adds +10%/lvl
      state.cards.quantum_stabilizer = { level: 2 };
      const rateWithCard = rateWithDarkGrav * 1.20;
      expect(getHydrogenProductionRate(state).toNumber()).toBeCloseTo(rateWithCard, 4);

      // Constant G adds +20%/lvl
      state.cosmicConstants.G = 1;
      const rateWithG = rateWithCard * 1.20;
      expect(getHydrogenProductionRate(state).toNumber()).toBeCloseTo(rateWithG, 4);
    });

    it('enforces Stardust Fusion Discount formula: raw = max(1, 10 - 2*lvl), cost = raw / fuelEfficiency', () => {
      state.upgrades.stardust.fusionDiscount.level = 0;
      expect(getFusionFuelRequirement(state).toNumber()).toBe(10);
      expect(getFusionFuelCost(state).toNumber()).toBe(10);

      state.upgrades.stardust.fusionDiscount.level = 4; // 10 - 8 = 2
      expect(getFusionFuelRequirement(state).toNumber()).toBe(2);

      state.upgrades.stardust.fusionDiscount.level = 5; // 10 - 10 = floor 1
      expect(getFusionFuelRequirement(state).toNumber()).toBe(1);

      state.upgrades.stardust.fusionDiscount.level = 10; // floor at 1
      expect(getFusionFuelRequirement(state).toNumber()).toBe(1);

      // Efficient Build applies after floor: raw 1 / (1 + 0.10 * 2) = 1 / 1.2 = 0.8333...
      state.upgrades.stellar.efficient.level = 2;
      expect(getFusionFuelCost(state).toNumber()).toBeCloseTo(1 / 1.2, 5);
    });

    it('calculates nominal Fusion, Carbon, and Iron capacities with Alpha and AutoSynthesize', () => {
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(5);
      state.cosmicConstants.alpha = 1; // +30%
      state.upgrades.stellar.massive.level = 1; // +10% speed
      // Fusion capacity: 5 * 1.1 * 1.3 = 7.15
      expect(getFusionCapacity(state).toNumber()).toBeCloseTo(7.15, 5);

      state.era3.stage = "Protostar";
      state.era3.carbonYield = new Decimal(2);
      expect(getCarbonCapacity(state).toNumber()).toBe(0); // Locked in Protostar

      state.era3.stage = "Main Sequence Star";
      state.upgrades.pulsar.autoSynthesize.level = 1; // +100% velocity
      // Carbon capacity: 2 * 1.1 * 1.3 * 2.0 = 5.72
      expect(getCarbonCapacity(state).toNumber()).toBeCloseTo(5.72, 5);

      state.era3.temperature = new Decimal(1000000000); // 1.0B K < 2.0B K unlock
      state.era3.ironYield = new Decimal(1);
      expect(getIronCapacity(state).toNumber()).toBe(0); // Locked below 2.0B K

      state.era3.temperature = new Decimal(2500000000); // 2.5B K >= 2.0B K unlock
      // Iron capacity: 1 * 1.1 (speed) * 1.5 (massive iron bonus) * 1.3 (alpha) * 2.0 (autoSynth) = 4.29
      expect(getIronCapacity(state).toNumber()).toBeCloseTo(4.29, 5);
    });

    it('applies temperature gain, updates tempMultiplier and maxTemp, and promotes Protostar to Main Sequence', () => {
      state.era3.temperature = new Decimal(9500000);
      state.era3.stage = "Protostar";
      state.stats.maxTemp = new Decimal(9500000);

      applyTemperatureGain(state, 1000000); // Crosses 10.0M K

      expect(state.era3.temperature.toNumber()).toBe(10500000);
      expect(state.stats.maxTemp.toNumber()).toBe(10500000);
      expect(state.era3.stage).toBe("Main Sequence Star");
      expect(state.era3.tempMultiplier.toNumber()).toBeCloseTo(getTemperatureMultiplier(state).toNumber(), 5);
    });

    it('executes manual compression via executeCompression() with exact cost deduction and heat yield', () => {
      state.resources.helium.amount = new Decimal(100);
      state.era3.compressCost = new Decimal(10);
      state.era3.temperature = new Decimal(0);

      const result = executeCompression(state);
      expect(result.success).toBe(true);
      expect(state.resources.helium.amount.toNumber()).toBe(90);
      expect(state.era3.temperature.toNumber()).toBe(COSMIC_REGISTRY.constants.baseCompressionHeat);
      expect(state.era3.compressCost.toNumber()).toBe(17); // 10 * 1.75 = 17.5 floor = 17
    });

    it('rolls flare spawn delays adhering to registry window and Flare Forecasting reduction', () => {
      state.upgrades.stardust.flareForecasting.level = 0;
      const delay0 = rollNextFlareSpawnDelay(state).toNumber();
      expect(delay0).toBeGreaterThanOrEqual(90);
      expect(delay0).toBeLessThanOrEqual(240);

      state.upgrades.stardust.flareForecasting.level = 2; // -16%
      const delay2 = rollNextFlareSpawnDelay(state).toNumber();
      expect(delay2).toBeGreaterThanOrEqual(90 * 0.84);
      expect(delay2).toBeLessThanOrEqual(240 * 0.84);
    });
  });

  describe('2. Selectors and Parity Verification', () => {
    it('getStellarRates exactly matches authoritative formulas across all resources', () => {
      state.era3.gravity = new Decimal(5);
      state.era3.fusersEnabled = true;
      state.era3.fusionYield = new Decimal(2);
      state.era3.stage = "Main Sequence Star";
      state.era3.carbonYield = new Decimal(1);
      state.era3.temperature = new Decimal(2500000000);
      state.era3.ironYield = new Decimal(1);

      const rates = getStellarRates(state);
      expect(rates.hydrogenProduction.toNumber()).toBeCloseTo(getHydrogenProductionRate(state).toNumber(), 5);
      expect(rates.heliumProduction.toNumber()).toBeCloseTo(getFusionCapacity(state).toNumber(), 5);
      expect(rates.carbonProduction.toNumber()).toBeCloseTo(getCarbonCapacity(state).toNumber(), 5);
      expect(rates.ironProduction.toNumber()).toBeCloseTo(getIronCapacity(state).toNumber(), 5);
    });

    it('activates hbar (+20% stardust per level) in getSupernovaOutcome without affecting other currencies or archetype', () => {
      state.era3.temperature = new Decimal(150000000);
      state.era3.ironYield = new Decimal(5);
      state.cosmicConstants.hbar = 0;

      const outcome0 = getSupernovaOutcome(state);
      // baseStardust = 10 + 5*2 = 20, balanced = 20
      expect(outcome0.rewards.stardust.toNumber()).toBe(20);
      expect(outcome0.rewards.pulsarShards.toNumber()).toBe(1);

      state.cosmicConstants.hbar = 2; // +40%
      const outcome2 = getSupernovaOutcome(state);
      // 20 * 1.40 = 28
      expect(outcome2.rewards.stardust.toNumber()).toBe(28);
      expect(outcome2.rewards.pulsarShards.toNumber()).toBe(1);
      expect(outcome2.archetype).toBe('balanced');
    });
  });

  describe('3. AutoCompress Parity and Automation Lifecycle', () => {
    it('executes deterministic AutoCompress at 1 compression/sec/level with exact heat yield and maxTemp parity', () => {
      state.upgrades.pulsar.autoCompress.level = 2;
      state.resources.helium.amount = new Decimal(1000);
      state.era3.compressCost = new Decimal(10);
      state.era3.temperature = new Decimal(0);
      state.stats.maxTemp = new Decimal(0);

      // 0.5s with lvl 2 -> 1 attempt (yield: 3.5M)
      simulateStellarEra(state, 0.5);
      expect(state.era3.temperature.toNumber()).toBe(COSMIC_REGISTRY.constants.baseCompressionHeat);
      expect(state.stats.maxTemp.toNumber()).toBe(COSMIC_REGISTRY.constants.baseCompressionHeat);
      expect(state.era3.autoCompressProgress.toNumber()).toBeCloseTo(0, 5);

      // another 0.5s -> 1 attempt (yield: 3.5M * 1.15 = 4.025M, total = 7.525M)
      simulateStellarEra(state, 0.5);
      expect(state.era3.temperature.toNumber()).toBe(7525000);
    });

    it('does not bank unaffordable AutoCompress attempts indefinitely', () => {
      state.upgrades.pulsar.autoCompress.level = 10;
      state.resources.helium.amount = new Decimal(0); // Unaffordable

      simulateStellarEra(state, 5.0); // 50 attempts attempted, 0 succeeded
      expect(state.era3.autoCompressProgress.toNumber()).toBeCloseTo(0, 5);
      expect(state.era3.temperature.toNumber()).toBe(0);
    });

    it('disables AutoCompress when context.allowAutomation is false (offline)', () => {
      state.upgrades.pulsar.autoCompress.level = 5;
      state.resources.helium.amount = new Decimal(1000);
      state.era3.compressCost = new Decimal(10);
      state.era3.temperature = new Decimal(0);

      simulateStellarEra(state, 10.0, { allowAutomation: false });
      expect(state.era3.temperature.toNumber()).toBe(0);
    });
  });

  describe('4. Solar Flare Engine Commands and Live Expiry Lifecycle', () => {
    it('COLLECT_SOLAR_FLARE grants hydrogenSurge based on authoritative hydrogen production rate', () => {
      state.era3.gravity = new Decimal(10); // 105 H/s
      state.resources.hydrogen.amount = new Decimal(0);
      state.flares.active = { expiresInSec: new Decimal(10) };

      // Mock random to select hydrogenSurge
      const origRandom = Math.random;
      Math.random = () => 0.1; // First reward is hydrogenSurge

      const res = stellarCommandHandlers.COLLECT_SOLAR_FLARE(state, { type: 'COLLECT_SOLAR_FLARE' });
      Math.random = origRandom;

      expect(res.ok).toBe(true);
      // 180s * 105 H/s = 18,900 H
      expect(state.resources.hydrogen.amount.toNumber()).toBeCloseTo(18900, 2);
      expect(state.flares.active).toBeNull();
      expect(state.flares.nextSpawnInSec.toNumber()).toBeGreaterThanOrEqual(90);
    });

    it('COLLECT_SOLAR_FLARE sets fusionSurge buff duration to 60s for magneticSurge', () => {
      state.era3.fusionYield = new Decimal(1); // Unlocks magneticSurge
      state.flares.active = { expiresInSec: new Decimal(10) };
      state.buffs.fusionSurge.remainingSec = new Decimal(0);

      // Mock random to select magneticSurge (last reward)
      const origRandom = Math.random;
      Math.random = () => 0.99;

      const res = stellarCommandHandlers.COLLECT_SOLAR_FLARE(state, { type: 'COLLECT_SOLAR_FLARE' });
      Math.random = origRandom;

      expect(res.ok).toBe(true);
      expect(state.buffs.fusionSurge.remainingSec.toNumber()).toBe(60);
      expect(state.flares.active).toBeNull();
    });

    it('applies 25% compression heat penalty when active live flare expires', () => {
      state.flares.active = { expiresInSec: new Decimal(1) };
      state.era3.temperature = new Decimal(0);

      simulateStellarEra(state, 2.0); // Flare expires
      expect(state.flares.active).toBeNull();
      const expectedPenalty = COSMIC_REGISTRY.constants.baseCompressionHeat * 0.25;
      expect(state.era3.temperature.toNumber()).toBeCloseTo(expectedPenalty, 2);
      expect(state.flares.nextSpawnInSec.toNumber()).toBeGreaterThanOrEqual(90);
    });
  });

  describe('5. Schema Normalization & Save Compatibility', () => {
    it('normalizes legacy save data without autoCompressProgress to Decimal(0) while preserving save version 17', () => {
      const rawSave = {
        saveVersion: 17,
        activeEpoch: 3,
        resources: { hydrogen: { amount: "100" } },
        era3: {
          gravity: "5",
          temperature: "1000000"
        }
      };

      ensureStateShape(rawSave);
      expect(rawSave.saveVersion).toBe(17);
      expect(rawSave.era3.autoCompressProgress instanceof Decimal).toBe(true);
      expect(rawSave.era3.autoCompressProgress.toNumber()).toBe(0);
    });
  });
});
