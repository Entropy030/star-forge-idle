/* eslint-disable import/no-cycle */
import { getQuantumFluctuationRate } from './economy.js';
import { engine } from '../engine/instance.js';
import { isDirty, setIsDirty } from './state.js';
import { Economy, getAmount } from './economy.js';
import { Timeline } from './timeline.js';
import { Viewport } from '../ui/viewport.js';
import { getAIState } from '../main.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { format } from '../ui/viewport.js';
/* global Decimal */
import { getSupernovaEligibility, getSupernovaOutcome, getStellarRates } from '../eras/stellar/selectors.js';

class PlaytestEngine {
  constructor() {
    this.isRunning = false;
    this.speedMultiplier = 1;
    this.logIntervalSec = 5;
    this.botTimer = null;
    this.logTimer = null;

    this.profile = 'efficient';
    this.target = 'p2c-second-run';
    this.runPhase = 'FIRST_STELLAR_RUN';

    // Telemetry Data
    this.stats = {
      profile: 'efficient',
      seed: null,
      startTime: 0,
      ticksElapsed: 0,
      gameSecondsElapsed: 0,
      totalClicks: 0,
      totalLeaps: 0,
      totalSafeCollapses: 0,
      totalUpgradesBought: 0,
      flaresCollected: 0,
      milestones: {},
      firstRunGameSeconds: 0,
      supernovaOutcome: null,
      predictedRewards: null,
      grantedRewards: null,
      stellarArchitectureLevels: {},
      secondRunStartedAt: 0,
      secondRunCheckpointAt: 0,
      legacyModifiers: null,
      result: null,
      failureReason: null
    };
  }

  resetStats(profile, seed) {
    this.profile = profile || 'efficient';
    this.runPhase = 'FIRST_STELLAR_RUN';
    this.stats = {
      profile: this.profile,
      seed: seed,
      startTime: Date.now(),
      ticksElapsed: 0,
      gameSecondsElapsed: 0,
      totalClicks: 0,
      totalLeaps: 0,
      totalSafeCollapses: 0,
      totalUpgradesBought: 0,
      flaresCollected: 0,
      milestones: {},
      firstRunGameSeconds: 0,
      supernovaOutcome: null,
      predictedRewards: null,
      grantedRewards: null,
      stellarArchitectureLevels: {},
      secondRunStartedAt: 0,
      secondRunCheckpointAt: 0,
      legacyModifiers: null,
      result: null,
      failureReason: null
    };
  }

  failBot(reason) {
    this.stats.result = 'FAILED';
    this.stats.failureReason = reason;
    this.runPhase = 'FAILED';
    this.isRunning = false;
    this.logMilestone(`Bot Failed: ${reason}`);
  }

  logMilestone(name, details = "") {
    if (!this.stats.milestones[name]) {
      this.stats.milestones[name] = {
        gameSeconds: this.stats.gameSecondsElapsed.toFixed(1),
        ticks: this.stats.ticksElapsed,
        realTimeSec: ((Date.now() - this.stats.startTime) / 1000).toFixed(1),
        details: details
      };
      console.log(`🏆 [AI TELEMETRY] Milestone Reached: "${name}" at t=${this.stats.gameSecondsElapsed.toFixed(1)}s (Ticks: ${this.stats.ticksElapsed}) ${details}`);
      this.updateDevPanelUI();
    }
  }

  getCommandType(category) {
    if (category === 'quantum') return 'BUY_UPGRADE';
    if (category === 'plasma') return 'BUY_UPGRADE_PLASMA';
    if (category === 'galaxy') return 'BUY_UPGRADE_GALAXY';
    if (category === 'stellar') return 'BUY_UPGRADE_STELLAR';
    return 'BUY_UPGRADE';
  }

  getResAmount(key, state) {
    if (key === 'stardust') {
      console.log(`[DEBUG] getResAmount('stardust'): currencies exists? ${!!state.currencies}, stardust exists? ${!!state.currencies?.stardust}, amount=${state.currencies?.stardust?.amount}`);
    }
    if (state.currencies?.[key]) return state.currencies[key].amount;
    if (state.resources?.[key]) return state.resources[key].amount;
    return new Decimal(0);
  }

  stepBotDecision() {
    if (this.runPhase === 'FAILED' || this.runPhase === 'COMPLETE') return;

    const state = engine.getStateUnsafe();
    const epoch = state.activeEpoch;

    if (this.runPhase === 'SECOND_STELLAR_RUN') {
      this.handleSecondRun(state);
      return;
    }

    if (epoch === 1) {
      if (this.getResAmount('quantumFluctuations', state).gte(COSMIC_REGISTRY.constants.inflationThreshold)) {
        this.logMilestone("Era I Complete (Cosmic Inflation Ready)");
        engine.dispatch({ type: 'TRIGGER_INFLATION' });
        return;
      }
      this.handleEra1Upgrades(state);
    } else if (epoch === 2) {
      if (this.getResAmount('protons', state).gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || (state.plasmaTemperature && state.plasmaTemperature.lte(3000))) {
        this.logMilestone("Era II Complete (Recombination Ready)");
        engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
        return;
      }
      this.handleEra2Upgrades(state);
    } else if (epoch === 3) {
      this.handleEra3Upgrades(state);
    }

    // --- ACTIVE IDLE CLICKING ---
    let clickCmd = 'CLICK_CORE';
    if (epoch === 2) clickCmd = 'CLICK_CORE_ERA2';
    if (epoch === 3) clickCmd = 'CLICK_CORE_ERA3';
    if (epoch === 4) clickCmd = 'CLICK_CORE_ERA4';
    engine.dispatch({ type: clickCmd });
    
    // Debug what is being bought
    if (this.stats.totalClicks % 10000 === 0) {
      console.log(`[DEBUG] Tick: ${this.stats.totalClicks}, Helium: ${this.getResAmount('helium', state)}, Temp: ${state.era3?.temperature}, Stage: ${state.era3?.stage}, Carbon Yield: ${state.era3?.carbonYield}, Iron Yield: ${state.era3?.ironYield}`);
      console.log(`[DEBUG] Stellar Architecture Levels: Efficient=${state.upgrades?.stellar?.efficient?.level}, Massive=${state.upgrades?.stellar?.massive?.level}, Compact=${state.upgrades?.stellar?.compact?.level}`);
    }
    
    this.stats.totalClicks++;
  }

  handleEra1Upgrades(state) {
    const priorityKeys = ['gravityForce', 'weakForce', 'electromagneticForce', 'vacuumResonance', 'strongForce'];
    
    // Telemetry: Track when things unlock
    const currentQF = state.stats?.maxQF || new Decimal(0);
    const coh = state.coherence || new Decimal(0);
    const ed = this.getResAmount('energyDensity', state);
    if (coh.gte(100)) this.logMilestone("Coherence Reached 100%");
    if (ed.gte(50000)) this.logMilestone("Energy Density Reached 50k");
    
    for (let key of priorityKeys) {
      const upState = state.upgrades?.quantum?.[key];
      const def = COSMIC_REGISTRY.upgrades.quantum[key];
      
      // Assume getQuantumUpgradeEligibility can be verified if it exists
      if (typeof window !== 'undefined' && window.getQuantumUpgradeEligibility) {
        if (!window.getQuantumUpgradeEligibility(state, key).unlocked) continue;
      }

      if (upState && def) {
        const currencyKey = Economy.resolveCurrencyKey('quantum', key, def);
        const balance = this.getResAmount(currencyKey, state);
        if (balance.gte(upState.cost) && (def.max === undefined || upState.level < def.max)) {
          engine.dispatch({ type: this.getCommandType('quantum'), payload: { category: 'quantum', upgradeId: key } });
          this.stats.totalUpgradesBought++;
          
          if (upState.level === 0) {
            this.logMilestone(`Unlocked ${def.name}`);
          }
          break;
        }
      }
    }
  }

  handleEra2Upgrades(state) {
    const quarkCondenserLvl = state.upgrades?.plasma?.quarkCondenser?.level || 0;
    const currentQuarks = this.getResAmount('quarks', state);

    if (currentQuarks.lt(20) || quarkCondenserLvl === 0) {
      const upState = state.upgrades?.plasma?.quarkCondenser;
      const def = COSMIC_REGISTRY.upgrades.plasma.quarkCondenser;
      const balance = upState && def ? this.getResAmount(Economy.resolveCurrencyKey('plasma', 'quarkCondenser', def), state) : new Decimal(0);
      
      if (upState && balance.gte(upState.cost)) {
        engine.dispatch({ type: this.getCommandType('plasma'), payload: { category: 'plasma', upgradeId: 'quarkCondenser' } });
        this.stats.totalUpgradesBought++;
      }
    } else {
      const priorityKeys = ['quarkCondenser', 'baryoRadiator', 'gluonBinding', 'leptonHarvest', 'plasmaAutomation'];
      for (let key of priorityKeys) {
        const upState = state.upgrades?.plasma?.[key];
        const def = COSMIC_REGISTRY.upgrades.plasma[key];
        if (upState && def) {
          const currencyKey = Economy.resolveCurrencyKey('plasma', key, def);
          const balance = this.getResAmount(currencyKey, state);
          if (balance.gte(upState.cost) && (def.max === undefined || upState.level < def.max)) {
            engine.dispatch({ type: this.getCommandType('plasma'), payload: { category: 'plasma', upgradeId: key } });
            this.stats.totalUpgradesBought++;
            break;
          }
        }
      }
    }
  }

  handleEra3Upgrades(state) {
    if (state.flares && state.flares.active) {
      engine.dispatch({ type: 'COLLECT_FLARE' });
      this.stats.flaresCollected++;
    }

    const eligibility = getSupernovaEligibility(state);
    if (eligibility.canTrigger) {
      if (this.runPhase === 'FIRST_STELLAR_RUN') {
        this.attemptSupernova(state);
        return;
      }
    }

    // Infrastructure Purchase
    this.purchaseRequiredStellarInfrastructure(state);

    // Profile-specific Architecture Purchase
    if (this.runPhase === 'FIRST_STELLAR_RUN') {
      this.purchaseProfileUpgrades(state, this.profile);
    }
  }

  purchaseRequiredStellarInfrastructure(state) {
    const era3 = state.era3;
    const fuserCost = era3.fusionYield?.eq(0) ? era3.fuserCostHydrogen : era3.fuserCostHelium;
    const fuserCurrency = era3.fusionYield?.eq(0) ? this.getResAmount('hydrogen', state) : this.getResAmount('helium', state);

    const upState = state.upgrades?.stellar?.[this.profile];
    const def = COSMIC_REGISTRY.upgrades.stellar[this.profile];
    const isSavingForArchitecture = upState && def && upState.level < 5 && this.getResAmount('helium', state).lt(upState.cost);
    
    if (fuserCost && fuserCurrency.gte(fuserCost)) {
      if (!isSavingForArchitecture || fuserCurrency.gt(fuserCost.times(2))) {
        engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'fuser' } });
        this.stats.totalUpgradesBought++;
        return;
      }
    }
    if (era3.gravityCost && this.getResAmount('hydrogen', state).gte(era3.gravityCost)) {
      engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'gravity' } });
      this.stats.totalUpgradesBought++;
      return;
    }
    if (era3.compressCost && this.getResAmount('helium', state).gte(era3.compressCost)) {
      if (!isSavingForArchitecture || this.getResAmount('helium', state).gt(era3.compressCost.times(2))) {
        engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'compress' } });
        this.stats.totalUpgradesBought++;
        return;
      }
    }

    if (era3.stage === "Main Sequence Star") {
      const carbonCost = era3.carbonYield?.eq(0) ? era3.carbonCostHelium : era3.carbonCostCarbon;
      const carbonCurrency = era3.carbonYield?.eq(0) ? this.getResAmount('helium', state) : this.getResAmount('carbon', state);
      
      // We MUST NOT buy Carbon until we have enough Temp for Iron (2B) AND we bought all architecture.
      // Otherwise Carbon synthesis soft-locks Helium to 50, preventing us from buying compress, fuser, or architecture!
      const shouldBuyCarbon = era3.temperature.gte(2000000000) && (!upState || upState.level >= 5) && (era3.carbonYield ? era3.carbonYield.lt(10) : true);
      
      if (carbonCost && carbonCurrency.gte(carbonCost) && shouldBuyCarbon) {
        engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'carbon' } });
        this.stats.totalUpgradesBought++;
        return;
      }
      const ironCost = era3.ironYield?.eq(0) ? era3.ironCostCarbon : era3.ironCostIron;
      const ironCurrency = era3.ironYield?.eq(0) ? this.getResAmount('carbon', state) : this.getResAmount('iron', state);
      
      // Stop wasting Iron on ironYield when Carbon is the bottleneck! We need 1000 Iron for Supernova.
      const shouldBuyIron = era3.ironYield?.eq(0) || ironCurrency.gte(2000); 
      
      if (ironCost && ironCurrency.gte(ironCost) && shouldBuyIron) {
        engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'iron' } });
        this.stats.totalUpgradesBought++;
        return;
      }
    }
  }

  purchaseProfileUpgrades(state, profile) {
    // Only buy target architecture
    const upState = state.upgrades?.stellar?.[profile];
    const def = COSMIC_REGISTRY.upgrades.stellar[profile];
    if (upState && def) {
      const currencyKey = Economy.resolveCurrencyKey('stellar', profile, def);
      const balance = this.getResAmount(currencyKey, state);
      if (balance.gte(upState.cost)) {
        engine.dispatch({ type: this.getCommandType('stellar'), payload: { category: 'stellar', upgradeId: profile } });
        this.stats.totalUpgradesBought++;
      }
    }
  }

  attemptSupernova(state) {
    const predicted = getSupernovaOutcome(state);
    if (predicted.archetype !== this.profile) {
      this.failBot('PROFILE_OUTCOME_MISMATCH');
      return;
    }

    this.stats.firstRunGameSeconds = this.stats.gameSecondsElapsed;
    this.stats.predictedRewards = predicted.rewards;
    this.stats.supernovaOutcome = predicted.outcome;
    this.stats.stellarArchitectureLevels = {
      efficient: state.upgrades.stellar.efficient.level,
      massive: state.upgrades.stellar.massive.level,
      compact: state.upgrades.stellar.compact.level
    };

    const stardustBefore = this.getResAmount('stardust', state);
    const pulsarShardsBefore = this.getResAmount('pulsarShards', state);

    const res = engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });

    if (!res || !res.ok) {
      this.failBot('SUPERNOVA_COMMAND_FAILED');
      return;
    }

    const hasTriggered = res.events && res.events.some(e => e.type === 'SUPERNOVA_TRIGGERED');
    const hasStarted = res.events && res.events.some(e => e.type === 'STELLAR_RUN_STARTED');
    const hasTransition = res.events && res.events.some(e => e.type === 'ERA_TRANSITION');

    if (!hasTriggered || !hasStarted || hasTransition) {
      this.failBot('INVALID_SUPERNOVA_EVENTS');
      return;
    }

    const stardustAfter = this.getResAmount('stardust', engine.getStateUnsafe());
    const pulsarShardsAfter = this.getResAmount('pulsarShards', engine.getStateUnsafe());

    const expectedStardustGain = predicted.rewards.stardust || new Decimal(0);
    const expectedPulsarGain = predicted.rewards.pulsarShards || new Decimal(0);

    if (!stardustAfter.minus(stardustBefore).eq(expectedStardustGain)) {
      console.log(`[DEBUG] REWARDS_NOT_GRANTED (stardust): Before=${stardustBefore.toString()}, After=${stardustAfter.toString()}, Expected=${expectedStardustGain.toString()}`);
      this.failBot('REWARDS_NOT_GRANTED');
      return;
    }

    if (!pulsarShardsAfter.minus(pulsarShardsBefore).eq(expectedPulsarGain)) {
      console.log(`[DEBUG] REWARDS_NOT_GRANTED (pulsarShards): Before=${pulsarShardsBefore.toString()}, After=${pulsarShardsAfter.toString()}, Expected=${expectedPulsarGain.toString()}`);
      this.failBot('REWARDS_NOT_GRANTED');
      return;
    }

    this.stats.grantedRewards = { stardust: expectedStardustGain, pulsarShards: expectedPulsarGain };
    this.runPhase = 'SECOND_STELLAR_RUN';
    this.stats.secondRunStartedAt = this.stats.gameSecondsElapsed;
    this.logMilestone(`First Supernova Complete (Outcome: ${predicted.archetype})`);
  }

  handleSecondRun(state) {
    if (state.activeEpoch !== 3) {
      this.failBot('SECOND_RUN_NOT_STARTED');
      return;
    }
    
    // Auto-progress slightly in run 2
    this.purchaseRequiredStellarInfrastructure(state);
    engine.dispatch({ type: 'CLICK_CORE_ERA3' });

    if (this.target === 'p2c-second-run') {
      const runsCompleted = state.meta.stellarRunsCompleted === 1;
      const unlocked = state.meta.secondStellarRunUnlocked === true;
      const tempReached = state.era3.temperature.gt(5000);
      const heliumReached = this.getResAmount('helium', state).gt(10);
      const gravityPurchased = state.era3.gravity.gt(0);
      
      let legacyEffectObserved = false;
      if (state.meta.stellarLegacyModifiers) {
         if (state.meta.stellarLegacyModifiers.secondRunProductionMult > 1.0 || state.meta.stellarLegacyModifiers.secondRunStabilityMult > 1.0) {
            legacyEffectObserved = true;
         }
      }

      if (runsCompleted && unlocked && tempReached && heliumReached && gravityPurchased && legacyEffectObserved) {
        this.stats.result = 'SUCCESS';
        this.runPhase = 'COMPLETE';
        this.stats.secondRunCheckpointAt = this.stats.gameSecondsElapsed;
        this.stats.legacyModifiers = state.meta.stellarLegacyModifiers;
        this.logMilestone("Second Stellar Run Checkpoint Reached", "Legacy Modifiers Verified");
        this.isRunning = false;
      }
    }
  }

  runGameTicks(seconds, isHeadless = false, maxTicks = 0) {
    const tickRate = 0.10; // 100ms per tick
    const totalTicks = Math.ceil(seconds / tickRate);
    const limit = maxTicks > 0 ? Math.min(totalTicks, maxTicks) : totalTicks;

    for (let i = 0; i < limit; i++) {
      if (this.runPhase === 'COMPLETE' || this.runPhase === 'FAILED') break;
      
      engine.tick(tickRate);
      Timeline.process(tickRate);
      this.stats.ticksElapsed++;
      this.stats.gameSecondsElapsed += tickRate;

      this.stepBotDecision();
    }

    if (!isHeadless && isDirty) {
      try { Viewport.update(); } catch (e) {}
      setIsDirty(false);
    }
  }

  startAutoPlaytest({ speed = 10, logIntervalSec = 5, profile = 'efficient', target = 'p2c-second-run' } = {}) {
    this.stopAutoPlaytest();
    this.isRunning = true;
    this.speedMultiplier = speed;
    this.logIntervalSec = logIntervalSec;
    this.resetStats(profile, null);
    this.target = target;

    console.log(`🚀 [AI PLAYTEST] Started Auto-Playtest (Speed: ${speed}x, Log Interval: ${logIntervalSec}s)`);

    const intervalMs = Math.max(10, Math.floor(100 / speed));
    this.botTimer = setInterval(() => {
      if (!this.isRunning) return;
      this.runGameTicks(0.10 * (speed > 10 ? Math.floor(speed / 5) : 1), false);
    }, intervalMs);

    this.logTimer = setInterval(() => {
      this.logTelemetryReport();
    }, logIntervalSec * 1000);

    this.updateDevPanelUI();
  }

  stopAutoPlaytest() {
    if (this.botTimer) clearInterval(this.botTimer);
    if (this.logTimer) clearInterval(this.logTimer);
    this.botTimer = null;
    this.logTimer = null;
    this.isRunning = false;
    console.log("⏹️ [AI PLAYTEST] Stopped Auto-Playtest.");
    this.updateDevPanelUI();
  }

  runHeadlessSim({ durationInGameSeconds = 3600, profile = 'efficient', target = 'p2c-second-run', maxTicks = 50000, seed = null } = {}) {
    console.log(`⚡ [HEADLESS SIM] Running profile '${profile}', target '${target}', seed '${seed}'...`);
    const startRealTime = Date.now();
    this.resetStats(profile, seed);
    this.target = target;
    this.isRunning = true;

    if (seed) {
      const state = engine.getStateUnsafe();
      state.flares = { ...state.flares, active: false, cooldown: 10, accumulatedEnergy: new Decimal(0), seed: seed };
    }

    while (this.isRunning && this.runPhase !== 'COMPLETE' && this.runPhase !== 'FAILED') {
      if (this.stats.ticksElapsed >= maxTicks) {
        this.failBot('MAX_TICKS_EXCEEDED');
        break;
      }
      engine.tick(0.10);
      Timeline.process(0.10);
      this.stats.ticksElapsed++;
      this.stats.gameSecondsElapsed += 0.10;
      this.stepBotDecision();
    }

    // In headless test environments, we skip the final Viewport.update 
    // to prevent DOM errors unless explicitly needed.

    const realTimeDuration = ((Date.now() - startRealTime) / 1000).toFixed(2);
    console.log(`✅ [HEADLESS SIM] Finished in ${realTimeDuration}s real-time! Result: ${this.stats.result}`);
    this.logTelemetryReport();
  }

  logTelemetryReport() {
    const state = engine.getStateUnsafe();
    const qfRate = typeof getQuantumFluctuationRate === 'function' ? format(getQuantumFluctuationRate()) : "0";
    const report = {
      profile: this.stats.profile,
      runPhase: this.runPhase,
      result: this.stats.result,
      failureReason: this.stats.failureReason,
      gameTimeSec: this.stats.gameSecondsElapsed.toFixed(1) + "s",
      ticks: this.stats.ticksElapsed,
      epoch: state.activeEpoch,
      coherence: state.coherence.toFixed(1) + "%",
      clicks: this.stats.totalClicks,
      leaps: this.stats.totalLeaps,
      upgradesBought: this.stats.totalUpgradesBought,
      flaresCollected: this.stats.flaresCollected,
      qfRate: qfRate + "/s",
      milestones: this.stats.milestones,
      stellarArchitectureLevels: this.stats.stellarArchitectureLevels,
      supernovaOutcome: this.stats.supernovaOutcome,
      predictedRewards: this.stats.predictedRewards,
      grantedRewards: this.stats.grantedRewards,
      secondRunStartedAt: this.stats.secondRunStartedAt,
      legacyModifiers: this.stats.legacyModifiers
    };

    console.log(`📊 [AI TELEMETRY REPORT @ t=${report.gameTimeSec}]`, report);
    this.updateDevPanelUI();
  }

  updateDevPanelUI() {
    const statusEl = document.getElementById('playtest-status-text');
    if (statusEl) {
      statusEl.innerHTML = this.isRunning
        ? `<span style="color:#00ecc6;">RUNNING (${this.speedMultiplier}x)</span> | t=${this.stats.gameSecondsElapsed.toFixed(0)}s | Phase: ${this.runPhase}`
        : `<span style="color:#b2bec3;">IDLE (Result: ${this.stats.result || 'NONE'})</span>`;
    }
  }
}

const harness = new PlaytestEngine();

export const startAutoPlaytest = (opts) => harness.startAutoPlaytest(opts);
export const stopAutoPlaytest = () => harness.stopAutoPlaytest();
export const runHeadlessSim = (opts) => harness.runHeadlessSim(opts);
export const playtestHarness = harness;
export const getTelemetryHistory = () => harness.stats.milestones;
