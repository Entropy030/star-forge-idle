import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { computePlasmaStep } from '../src/eras/plasma/evaluator.js';
import { simulatePlasmaEra } from '../src/eras/plasma/simulation.js';
import { PLASMA_POSTURE_CONFIG, DEFAULT_PLASMA_POSTURE } from '../src/eras/plasma/constants.js';

describe('Era 2 Posture Simulation Integration', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(10000000);
    state.upgrades.plasma.quarkCondenser = { level: 5, cost: new Decimal(100) };
    state.upgrades.plasma.gluonBinding = { level: 4, cost: new Decimal(150) };
    state.upgrades.plasma.leptonHarvest = { level: 3, cost: new Decimal(200) };
    state.upgrades.plasma.plasmaAutomation = { level: 2, cost: new Decimal(300) };
    state.upgrades.plasma.baryoRadiator = { level: 2, cost: new Decimal(400) };
    state.resources.quarks.amount = new Decimal(500);
    state.resources.gluons.amount = new Decimal(500);
    state.resources.leptons.amount = new Decimal(200);
    state.resources.protons.amount = new Decimal(200);
    state.resources.electrons.amount = new Decimal(100);
    state.resources.hydrogen.amount = new Decimal(0);
  });

  describe('BALANCE Regression Baseline Contract', () => {
    it('produces exact baseline behavior under posture BALANCE', () => {
      state.era2.posture = 'BALANCE';
      const step = computePlasmaStep(state, 1.0);

      // Verify baseline math without multipliers (or multiplier == 1.0)
      // Recipe 1: Quark Condenser level 5 (mult 1.0) -> baseRate 5 -> 10 Quarks/s generated
      // Recipe 2: Gluon Matrix level 4 (mult 1.0) -> baseRate 4 -> 6 Gluons/s generated
      // Recipe 3: Lepton Collector level 3 (mult 1.0) -> baseRate 3 -> 3 Leptons/s generated
      // Recipe 4: Proton Synthesizer level 2 (mult 1.0) -> baseRate 2 -> 2 Protons synthesized, consumes 6 Quarks, 2 Gluons
      // Recipe 6: Baryo Radiator level 2 -> baseRate 2 -> consumes 4 Protons, 15,000 K cooling

      expect(step.cooling.toNumber()).toBe(15000);
      expect(step.throughput.quarkCondenser.toNumber()).toBe(10);
      expect(step.throughput.gluonBinding.toNumber()).toBe(6);
      expect(step.throughput.leptonHarvest.toNumber()).toBe(3);
      expect(step.throughput.protonSynthesizer.toNumber()).toBe(2);
      expect(step.throughput.baryoRadiator.toNumber()).toBe(2);

      // Net deltas
      expect(step.deltas.quarks.toNumber()).toBe(10 - 6); // +4
      expect(step.deltas.gluons.toNumber()).toBe(6 - 2);  // +4
      expect(step.deltas.leptons.toNumber()).toBe(3);
      expect(step.deltas.protons.toNumber()).toBe(2 - 4); // -2
    });

    it('defaults undefined or omitted posture safely to BALANCE profile', () => {
      delete state.era2.posture;
      const stepDefault = computePlasmaStep(state, 1.0);

      state.era2.posture = 'BALANCE';
      const stepExplicit = computePlasmaStep(state, 1.0);

      expect(stepDefault.cooling.toNumber()).toBe(stepExplicit.cooling.toNumber());
      expect(stepDefault.deltas.quarks.toNumber()).toBe(stepExplicit.deltas.quarks.toNumber());
      expect(stepDefault.deltas.gluons.toNumber()).toBe(stepExplicit.deltas.gluons.toNumber());
      expect(stepDefault.deltas.protons.toNumber()).toBe(stepExplicit.deltas.protons.toNumber());
    });
  });

  describe('Directional Posture Behaviors', () => {
    it('ACCUMULATE yields greater raw particle flux and reduced cooling/binding than BALANCE', () => {
      state.era2.posture = 'BALANCE';
      const balanceStep = computePlasmaStep(state, 1.0);

      state.era2.posture = 'ACCUMULATE';
      const accumStep = computePlasmaStep(state, 1.0);

      // Raw particle throughput must be greater
      expect(accumStep.throughput.quarkCondenser.toNumber()).toBeGreaterThan(balanceStep.throughput.quarkCondenser.toNumber());
      expect(accumStep.throughput.gluonBinding.toNumber()).toBeGreaterThan(balanceStep.throughput.gluonBinding.toNumber());
      expect(accumStep.throughput.leptonHarvest.toNumber()).toBeGreaterThan(balanceStep.throughput.leptonHarvest.toNumber());

      // Radiative cooling and hadron binding must be dampened
      expect(accumStep.cooling.toNumber()).toBeLessThan(balanceStep.cooling.toNumber());
      expect(accumStep.throughput.protonSynthesizer.toNumber()).toBeLessThan(balanceStep.throughput.protonSynthesizer.toNumber());

      // Check exact calibration ratio (1.5x flux, 0.5x cooling, 0.75x binding)
      expect(accumStep.throughput.quarkCondenser.toNumber()).toBe(balanceStep.throughput.quarkCondenser.toNumber() * PLASMA_POSTURE_CONFIG.ACCUMULATE.particleFlux);
      expect(accumStep.cooling.toNumber()).toBe(balanceStep.cooling.toNumber() * PLASMA_POSTURE_CONFIG.ACCUMULATE.coolingMult);
      expect(accumStep.throughput.protonSynthesizer.toNumber()).toBe(balanceStep.throughput.protonSynthesizer.toNumber() * PLASMA_POSTURE_CONFIG.ACCUMULATE.bindingMult);
    });

    it('CONDENSE yields greater cooling and binding, and reduced raw particle flux than BALANCE', () => {
      state.era2.posture = 'BALANCE';
      const balanceStep = computePlasmaStep(state, 1.0);

      state.era2.posture = 'CONDENSE';
      const condenseStep = computePlasmaStep(state, 1.0);

      // Cooling and binding must be greater
      expect(condenseStep.cooling.toNumber()).toBeGreaterThan(balanceStep.cooling.toNumber());
      expect(condenseStep.throughput.protonSynthesizer.toNumber()).toBeGreaterThan(balanceStep.throughput.protonSynthesizer.toNumber());

      // Raw particle influx must be dampened
      expect(condenseStep.throughput.quarkCondenser.toNumber()).toBeLessThan(balanceStep.throughput.quarkCondenser.toNumber());
      expect(condenseStep.throughput.gluonBinding.toNumber()).toBeLessThan(balanceStep.throughput.gluonBinding.toNumber());
      expect(condenseStep.throughput.leptonHarvest.toNumber()).toBeLessThan(balanceStep.throughput.leptonHarvest.toNumber());

      // Check exact calibration ratio (0.5x flux, 1.5x cooling, 1.30x binding)
      expect(condenseStep.cooling.toNumber()).toBe(balanceStep.cooling.toNumber() * PLASMA_POSTURE_CONFIG.CONDENSE.coolingMult);
      expect(condenseStep.throughput.protonSynthesizer.toNumber()).toBe(balanceStep.throughput.protonSynthesizer.toNumber() * PLASMA_POSTURE_CONFIG.CONDENSE.bindingMult);
      expect(condenseStep.throughput.quarkCondenser.toNumber()).toBe(balanceStep.throughput.quarkCondenser.toNumber() * PLASMA_POSTURE_CONFIG.CONDENSE.particleFlux);
    });

    it('modulates low-temperature Lepton Decay and Recombination binding rates', () => {
      // Set temperature below 100k to enable Lepton Decay (<500k) and Recombination (<100k)
      state.plasmaTemperature = new Decimal(50000);

      state.era2.posture = 'BALANCE';
      const balanceStep = computePlasmaStep(state, 1.0);

      state.era2.posture = 'CONDENSE';
      const condenseStep = computePlasmaStep(state, 1.0);

      expect(condenseStep.throughput.leptonDecay.toNumber()).toBeGreaterThan(balanceStep.throughput.leptonDecay.toNumber());
      expect(condenseStep.throughput.recombination.toNumber()).toBeGreaterThan(balanceStep.throughput.recombination.toNumber());
      expect(condenseStep.deltas.hydrogen.toNumber()).toBeGreaterThan(balanceStep.deltas.hydrogen.toNumber());
    });
  });

  describe('Rapid-Toggle Regression Verification', () => {
    it('verifies rapid toggling between ACCUMULATE and CONDENSE yields no mathematical advantage over steady postures', () => {
      // Helper to clone state
      const clone = (s) => JSON.parse(JSON.stringify(s, (k, v) => v instanceof Decimal ? v.toString() : v), (k, v) => {
        if (typeof v === 'string' && /^-?\d+(\.\d+)?(e[+-]?\d+)?$/.test(v) && !['currentAct', 'fusionStage', 'stage', 'activeEpoch', 'activeTab'].includes(k)) {
          return new Decimal(v);
        }
        return v;
      });

      // Run steady ACCUMULATE for 60s
      let stateAccum = clone(state);
      stateAccum.era2.posture = 'ACCUMULATE';
      for (let t = 0; t < 60; t++) simulatePlasmaEra(stateAccum, 1.0);

      // Run steady CONDENSE for 60s
      let stateCondense = clone(state);
      stateCondense.era2.posture = 'CONDENSE';
      for (let t = 0; t < 60; t++) simulatePlasmaEra(stateCondense, 1.0);

      // Run Rapid Toggle (alternating every second) for 60s
      let stateToggle = clone(state);
      for (let t = 0; t < 60; t++) {
        stateToggle.era2.posture = (t % 2 === 0) ? 'ACCUMULATE' : 'CONDENSE';
        simulatePlasmaEra(stateToggle, 1.0);
      }

      // Run steady BALANCE for 60s
      let stateBalance = clone(state);
      stateBalance.era2.posture = 'BALANCE';
      for (let t = 0; t < 60; t++) simulatePlasmaEra(stateBalance, 1.0);

      // Rapid toggle average flux is (1.5 + 0.5)/2 = 1.0; average cooling is (0.5 + 1.5)/2 = 1.0.
      // Rapid toggle should not generate more resources or cooling than the linear combination / steady BALANCE.
      expect(stateToggle.plasmaTemperature.toNumber()).toBeGreaterThanOrEqual(stateCondense.plasmaTemperature.toNumber());
      expect(stateToggle.resources.quarks.amount.toNumber()).toBeLessThan(stateAccum.resources.quarks.amount.toNumber());
    });
  });

  describe('Suboptimal Play & Recoverability Sanity Check', () => {
    it('proves suboptimal early CONDENSE usage is recoverable without deadlocks or permanent progress traps', () => {
      // Early state with 0 radiators and low quarks
      let earlyState = createInitialState();
      earlyState.activeEpoch = 2;
      earlyState.plasmaTemperature = new Decimal(10000000);
      earlyState.upgrades.plasma.quarkCondenser = { level: 1, cost: new Decimal(20) };
      earlyState.resources.quarks.amount = new Decimal(0);
      earlyState.resources.gluons.amount = new Decimal(0);

      // Player mistakenly chooses CONDENSE before radiators exist
      earlyState.era2.posture = 'CONDENSE';
      for (let t = 0; t < 30; t++) simulatePlasmaEra(earlyState, 1.0);

      // Quarks still slowly generate at 0.5x flux (not zero, never locked)
      expect(earlyState.resources.quarks.amount.toNumber()).toBeGreaterThan(0);
      const quarksAfterSuboptimal = earlyState.resources.quarks.amount.toNumber();

      // Player realizes mistake and switches to ACCUMULATE
      earlyState.era2.posture = 'ACCUMULATE';
      for (let t = 0; t < 30; t++) simulatePlasmaEra(earlyState, 1.0);

      const quarksAfterRecovery = earlyState.resources.quarks.amount.toNumber();
      // Rate of gain in second phase (ACCUMULATE: 1.5x) is 3x the first phase (CONDENSE: 0.5x)
      expect(quarksAfterRecovery - quarksAfterSuboptimal).toBeCloseTo(quarksAfterSuboptimal * 3, 1);
    });
  });

  describe('Offline Parity Contract', () => {
    it('produces equivalent deterministic state across single-step and chunked tick progression under all postures', () => {
      for (const posture of ['ACCUMULATE', 'BALANCE', 'CONDENSE']) {
        state.era2.posture = posture;

        // Method A: 10 discrete 1-second ticks
        let stateTicks = JSON.parse(JSON.stringify(state));
        stateTicks.plasmaTemperature = new Decimal(state.plasmaTemperature);
        for (const r in state.resources) stateTicks.resources[r] = { amount: new Decimal(state.resources[r].amount) };
        for (let i = 0; i < 10; i++) simulatePlasmaEra(stateTicks, 1.0);

        // Method B: 1 single 10-second tick
        let stateChunk = JSON.parse(JSON.stringify(state));
        stateChunk.plasmaTemperature = new Decimal(state.plasmaTemperature);
        for (const r in state.resources) stateChunk.resources[r] = { amount: new Decimal(state.resources[r].amount) };
        simulatePlasmaEra(stateChunk, 10.0);

        // Offline simulation consumes dt linearly across evaluator equations
        expect(stateTicks.plasmaTemperature.toNumber()).toBeCloseTo(stateChunk.plasmaTemperature.toNumber(), 5);
        expect(stateTicks.resources.quarks.amount.toNumber()).toBeCloseTo(stateChunk.resources.quarks.amount.toNumber(), 5);
        expect(stateTicks.resources.gluons.amount.toNumber()).toBeCloseTo(stateChunk.resources.gluons.amount.toNumber(), 5);
        expect(stateTicks.resources.protons.amount.toNumber()).toBeCloseTo(stateChunk.resources.protons.amount.toNumber(), 5);
      }
    });
  });
});
