import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_infinity.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { computePlasmaStep } from '../src/eras/plasma/evaluator.js';
import { simulatePlasmaEra } from '../src/eras/plasma/simulation.js';
import { advanceOfflineProgress } from '../src/core/offline.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { gameState, setGameState } from '../src/core/state.js';
import { PLASMA_POSTURE_CONFIG, DEFAULT_PLASMA_POSTURE } from '../src/eras/plasma/constants.js';


describe('Era 2 Posture Simulation Integration', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
    state.activeEpoch = 2;
    state.plasmaTemperature = new Decimal(10000000);
    state.cosmicAge = new Decimal(0);
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

      // Verify baseline math without multipliers (multiplier == 1.0)
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

      // Check exact calibration ratio (1.5x flux, 0.5x cooling, 0.70x binding)
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

  describe('Rapid-Toggle Mathematics Under Binding-Active Conditions', () => {
    it('verifies exact mathematical linear averages for particle flux, cooling, and nominal binding', () => {
      // Create a binding-active test state with abundant buffers
      const makeBindingActiveState = () => {
        const s = createInitialState();
        s.activeEpoch = 2;
        s.plasmaTemperature = new Decimal(80000); // Below 100k
        s.cosmicAge = new Decimal(0);
        s.upgrades.plasma.quarkCondenser = { level: 5, cost: new Decimal(100) };
        s.upgrades.plasma.gluonBinding = { level: 4, cost: new Decimal(150) };
        s.upgrades.plasma.leptonHarvest = { level: 3, cost: new Decimal(200) };
        s.upgrades.plasma.plasmaAutomation = { level: 5, cost: new Decimal(300) }; // 5 Protons/s base
        s.upgrades.plasma.baryoRadiator = { level: 3, cost: new Decimal(400) };     // 3 cycles/s base
        s.resources.quarks.amount = new Decimal(10000);
        s.resources.gluons.amount = new Decimal(10000);
        s.resources.leptons.amount = new Decimal(5000);
        s.resources.protons.amount = new Decimal(5000);
        s.resources.electrons.amount = new Decimal(5000);
        s.resources.hydrogen.amount = new Decimal(0);
        return s;
      };

      // 1. Run Fixed BALANCE for 60s
      const sBalance = makeBindingActiveState();
      sBalance.era2.posture = 'BALANCE';
      for (let t = 0; t < 60; t++) simulatePlasmaEra(sBalance, 1.0);

      // 2. Run Rapid Toggle (1s ACCUMULATE / 1s CONDENSE) for 60s
      const sToggle = makeBindingActiveState();
      for (let t = 0; t < 60; t++) {
        sToggle.era2.posture = (t % 2 === 0) ? 'ACCUMULATE' : 'CONDENSE';
        simulatePlasmaEra(sToggle, 1.0);
      }

      // Mathematical Verification:
      // Flux Average: (1.50 + 0.50)/2 = 1.000x -> Exactly equal to BALANCE
      // Cooling Average: (0.50 + 1.50)/2 = 1.000x -> Exactly equal to BALANCE
      // Binding Average: (0.70 + 1.30)/2 = 1.000x -> Exactly equal to BALANCE (0.0% nominal advantage)
      expect(sToggle.plasmaTemperature.toNumber()).toBe(sBalance.plasmaTemperature.toNumber());

      // Under abundant inputs, 60s of 5 Protons/s base:
      // BALANCE: 60 * 5 * 1.00 = 300 Protons synthesized
      // TOGGLE: 30 * (5 * 0.70) + 30 * (5 * 1.30) = 105.0 + 195.0 = 300.0 Protons synthesized (exact 1.0000x)
      // Quarks consumed: 300 * 3 = 900 in BALANCE vs 300 * 3 = 900 in TOGGLE
      // Quarks generated: 60 * 10 * 1.00 = 600 in BALANCE vs (30 * 15 + 30 * 5) = 600 in TOGGLE
      // Net Quarks delta: 600 - 900 = -300 in BALANCE vs 600 - 900 = -300 in TOGGLE
      const expectedQuarksBalance = 10000 - 300;
      const expectedQuarksToggle = 10000 - 300;
      expect(sBalance.resources.quarks.amount.toNumber()).toBeCloseTo(expectedQuarksBalance, 1);
      expect(sToggle.resources.quarks.amount.toNumber()).toBeCloseTo(expectedQuarksToggle, 1);

      // Verify that Rapid Toggle DOES NOT outperform dedicated CONDENSE in cooling (1.5x) or binding (1.30x)
      const sCondense = makeBindingActiveState();
      sCondense.era2.posture = 'CONDENSE';
      for (let t = 0; t < 60; t++) simulatePlasmaEra(sCondense, 1.0);
      expect(sCondense.plasmaTemperature.toNumber()).toBeLessThanOrEqual(sToggle.plasmaTemperature.toNumber());
    });

  });

  describe('Full Run-to-Completion Recoverability Verification', () => {
    it('proves that all strategies including suboptimal early CONDENSE successfully reach Recombination readiness', () => {
      const makeEarlyState = () => {
        const s = createInitialState();
        s.activeEpoch = 2;
        s.plasmaTemperature = new Decimal(10000000);
        s.cosmicAge = new Decimal(0);
        s.upgrades.plasma.quarkCondenser = { level: 3, cost: new Decimal(20) };
        s.upgrades.plasma.gluonBinding = { level: 2, cost: new Decimal(120) };
        s.upgrades.plasma.leptonHarvest = { level: 1, cost: new Decimal(400) };
        s.upgrades.plasma.plasmaAutomation = { level: 3, cost: new Decimal(2000) };
        s.upgrades.plasma.baryoRadiator = { level: 1, cost: new Decimal(100) };
        s.resources.quarks.amount = new Decimal(0);
        s.resources.gluons.amount = new Decimal(0);
        s.resources.leptons.amount = new Decimal(0);
        s.resources.protons.amount = new Decimal(0);
        s.resources.electrons.amount = new Decimal(0);
        s.resources.hydrogen.amount = new Decimal(0);
        return s;
      };

      const runToReadiness = (postureSelectorFn, maxSeconds = 3000) => {
        const s = makeEarlyState();
        let elapsed = 0;
        let isReady = false;

        while (elapsed < maxSeconds) {
          s.era2.posture = postureSelectorFn(elapsed, s);
          simulatePlasmaEra(s, 1.0);
          elapsed += 1;

          if (s.plasmaTemperature.lte(3000) || s.resources.protons.amount.gte(800000)) {
            isReady = true;
            break;
          }
        }
        return { isReady, elapsed, finalTemp: s.plasmaTemperature.toNumber() };
      };

      // 1. Fixed BALANCE
      const balanceResult = runToReadiness(() => 'BALANCE');
      expect(balanceResult.isReady).toBe(true);
      expect(balanceResult.finalTemp).toBeLessThanOrEqual(3000);

      // 2. Fixed CONDENSE
      const condenseResult = runToReadiness(() => 'CONDENSE');
      expect(condenseResult.isReady).toBe(true);
      expect(condenseResult.finalTemp).toBeLessThanOrEqual(3000);

      // 3. Fixed ACCUMULATE
      const accumResult = runToReadiness(() => 'ACCUMULATE');
      expect(accumResult.isReady).toBe(true);
      expect(accumResult.finalTemp).toBeLessThanOrEqual(3000);

      // 4. Suboptimal Early CONDENSE for 100s, then recover
      const recoveryResult = runToReadiness((t, s) => {
        if (t < 100) return 'CONDENSE';
        if (s.resources.protons.amount.lt(100)) return 'ACCUMULATE';
        return 'CONDENSE';
      });
      expect(recoveryResult.isReady).toBe(true);
      expect(recoveryResult.finalTemp).toBeLessThanOrEqual(3000);
    });
  });

  describe('Offline Parity & Chunk Invariance Contracts', () => {
    it('Chunk Invariance: produces equivalent deterministic state across single-step and chunked tick progression', () => {
      for (const posture of ['ACCUMULATE', 'BALANCE', 'CONDENSE']) {
        state.era2.posture = posture;

        // Method A: 10 discrete 1-second ticks
        let stateTicks = JSON.parse(JSON.stringify(state));
        stateTicks.plasmaTemperature = new Decimal(state.plasmaTemperature);
        stateTicks.cosmicAge = new Decimal(state.cosmicAge);
        for (const r in state.resources) stateTicks.resources[r] = { amount: new Decimal(state.resources[r].amount) };
        for (let i = 0; i < 10; i++) simulatePlasmaEra(stateTicks, 1.0);

        // Method B: 1 single 10-second tick
        let stateChunk = JSON.parse(JSON.stringify(state));
        stateChunk.plasmaTemperature = new Decimal(state.plasmaTemperature);
        stateChunk.cosmicAge = new Decimal(state.cosmicAge);
        for (const r in state.resources) stateChunk.resources[r] = { amount: new Decimal(state.resources[r].amount) };
        simulatePlasmaEra(stateChunk, 10.0);

        // Linear equations match across single vs chunked steps
        expect(stateTicks.plasmaTemperature.toNumber()).toBeCloseTo(stateChunk.plasmaTemperature.toNumber(), 5);
        expect(stateTicks.resources.quarks.amount.toNumber()).toBeCloseTo(stateChunk.resources.quarks.amount.toNumber(), 5);
        expect(stateTicks.resources.gluons.amount.toNumber()).toBeCloseTo(stateChunk.resources.gluons.amount.toNumber(), 5);
        expect(stateTicks.resources.protons.amount.toNumber()).toBeCloseTo(stateChunk.resources.protons.amount.toNumber(), 5);
      }
    });

    it('Offline Path Parity: advanceOfflineProgress applies active posture identically to live runtime ticks', async () => {
      for (const testPosture of ['ACCUMULATE', 'BALANCE', 'CONDENSE']) {
        // Setup Live Baseline
        const liveState = createInitialState();
        liveState.activeEpoch = 2;
        liveState.plasmaTemperature = new Decimal(10000000);
        liveState.upgrades.plasma.quarkCondenser = { level: 5, cost: new Decimal(100) };
        liveState.upgrades.plasma.gluonBinding = { level: 4, cost: new Decimal(150) };
        liveState.upgrades.plasma.plasmaAutomation = { level: 2, cost: new Decimal(300) };
        liveState.upgrades.plasma.baryoRadiator = { level: 2, cost: new Decimal(400) };
        liveState.resources.quarks.amount = new Decimal(500);
        liveState.resources.gluons.amount = new Decimal(500);
        liveState.resources.protons.amount = new Decimal(200);
        liveState.era2.posture = testPosture;

        setGameState(liveState);

        // Run 10 seconds of live ticks
        for (let i = 0; i < 10; i++) {
          advanceGameTick(1.0);
        }
        const liveSnapshot = {
          temp: gameState.plasmaTemperature.toNumber(),
          quarks: gameState.resources.quarks.amount.toNumber(),
          gluons: gameState.resources.gluons.amount.toNumber(),
          protons: gameState.resources.protons.amount.toNumber(),
          posture: gameState.era2.posture
        };

        // Reset to identical starting state for Offline Catch-Up
        const offlineState = createInitialState();
        offlineState.activeEpoch = 2;
        offlineState.plasmaTemperature = new Decimal(10000000);
        offlineState.upgrades.plasma.quarkCondenser = { level: 5, cost: new Decimal(100) };
        offlineState.upgrades.plasma.gluonBinding = { level: 4, cost: new Decimal(150) };
        offlineState.upgrades.plasma.plasmaAutomation = { level: 2, cost: new Decimal(300) };
        offlineState.upgrades.plasma.baryoRadiator = { level: 2, cost: new Decimal(400) };
        offlineState.resources.quarks.amount = new Decimal(500);
        offlineState.resources.gluons.amount = new Decimal(500);
        offlineState.resources.protons.amount = new Decimal(200);
        offlineState.era2.posture = testPosture;

        setGameState(offlineState);

        // Run 10 credited seconds through advanceOfflineProgress
        await advanceOfflineProgress({ creditedElapsedSeconds: 10 });

        const offlineSnapshot = {
          temp: gameState.plasmaTemperature.toNumber(),
          quarks: gameState.resources.quarks.amount.toNumber(),
          gluons: gameState.resources.gluons.amount.toNumber(),
          protons: gameState.resources.protons.amount.toNumber(),
          posture: gameState.era2.posture
        };

        // Live ticks and offline catch-up produce identical state and preserve posture
        expect(offlineSnapshot.posture).toBe(testPosture);
        expect(offlineSnapshot.temp).toBe(liveSnapshot.temp);
        expect(offlineSnapshot.quarks).toBeCloseTo(liveSnapshot.quarks, 5);
        expect(offlineSnapshot.gluons).toBeCloseTo(liveSnapshot.gluons, 5);
        expect(offlineSnapshot.protons).toBeCloseTo(liveSnapshot.protons, 5);
      }
    });
  });
});
