/* eslint-disable import/no-cycle */
import { getQuantumFluctuationRate } from './economy.js';
/**
 * Star Forge Idle - Automated AI Playtest & Fast-Simulation Harness
 * playtestBot.js
 */

import { engine } from '../engine/instance.js';
import { isDirty, setIsDirty } from './state.js';
import { Economy, getAmount } from './economy.js';
import { Viewport } from '../ui/viewport.js';
import { getAIState } from '../main.js';
import { COSMIC_REGISTRY } from '../config/registry.js';
import { format } from '../ui/viewport.js';
  class PlaytestEngine {
    constructor() {
      this.isRunning = false;
      this.speedMultiplier = 1;
      this.logIntervalSec = 5;
      this.botTimer = null;
      this.logTimer = null;
      
      this.targetNode = '100M'; // '100M' (100M K), '500M' (500M K / Carbon), or '2B' (2B K / Iron / Gateway)
      
      // Telemetry Data
      this.stats = {
        startTime: 0,
        ticksElapsed: 0,
        gameSecondsElapsed: 0,
        totalClicks: 0,
        totalLeaps: 0,
        totalSafeCollapses: 0,
        totalUpgradesBought: 0,
        totalFlaresCollected: 0,
        milestones: {}
      };
    }

    resetStats() {
      this.stats = {
        startTime: Date.now(),
        ticksElapsed: 0,
        gameSecondsElapsed: 0,
        totalClicks: 0,
        totalLeaps: 0,
        totalSafeCollapses: 0,
        totalUpgradesBought: 0,
        totalFlaresCollected: 0,
        milestones: {}
      };
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

    // ------------------------------------------------------------------------
    // 1. BOT DECISION ENGINE
    // ------------------------------------------------------------------------
    stepBotDecision() {
      const state = engine.getStateUnsafe();
      const epoch = state.activeEpoch;
      const amp = 1.0;
      const storage = state.quantumStorage || new Decimal(0);

      // Helper for safely retrieving Decimal resource amounts directly from state
      const getResAmount = (key) => state.resources[key]?.amount || new Decimal(0);

      // --- ERA TRANSITIONS & SPECIAL ERA ACTIONS ---
      if (epoch === 1) {
        if (getResAmount('quantumFluctuations').gte(COSMIC_REGISTRY.constants.inflationThreshold)) {
          this.logMilestone("Era I Complete (Cosmic Inflation Ready)");
          engine.dispatch({ type: 'TRIGGER_INFLATION' }); // Assuming we made this command later
          return;
        }
      } else if (epoch === 2) {
        if (getResAmount('protons').gte(COSMIC_REGISTRY.constants.recombinationProtonThreshold) || (state.plasmaTemperature && state.plasmaTemperature.lte(3000))) {
          this.logMilestone("Era II Complete (Recombination Ready)");
          engine.dispatch({ type: 'TRIGGER_RECOMBINATION' });
          return;
        }
      } else if (epoch === 3) {
        if (state.flares && state.flares.active) {
          engine.dispatch({ type: 'COLLECT_FLARE' });
          this.stats.totalFlaresCollected++;
        }
        let currentTemp = state.era3?.temperature || new Decimal(0);
        let targetThreshold = 100000000; // default 100M K
        if (this.targetNode === '500M' || this.targetNode === 'TARGET_NODE_500M') {
          targetThreshold = 500000000; // 500M K (Carbon Synthesis)
        } else if (this.targetNode === '2B' || this.targetNode === 'TARGET_NODE_2B') {
          targetThreshold = 2000000000; // 2B K (Iron Core / Gateway)
        }

        if (currentTemp.gte(targetThreshold) && state.era3 && (state.era3.supernovaUnlocked || state.era3.currentAct >= 3)) {
          this.logMilestone(`Era III Complete (Supernova Ready @ ${this.targetNode})`);
          engine.dispatch({ type: 'TRIGGER_SUPERNOVA' });
          return;
        }
      } else if (epoch === 4) {
        if (getResAmount('darkMatter').gte(10000)) {
          this.logMilestone("Era IV Complete (Galactic Merge Ready)");
          engine.dispatch({ type: 'TRIGGER_GALACTIC_MERGE' });
          return;
        }
      }

      // --- UPGRADE PURCHASING STRATEGY ---
      let boughtSomething = false;

      const getCommandType = (category) => {
        if (category === 'quantum') return 'BUY_UPGRADE';
        if (category === 'plasma') return 'BUY_UPGRADE_PLASMA';
        if (category === 'galaxy') return 'BUY_UPGRADE_GALAXY';
        return 'BUY_UPGRADE';
      };

      // Priority 2: Stardust / Prestige Upgrades (Thermal Insulation has priority)
      const stardustUpgrades = (typeof getAIState === 'function')
        ? (getAIState(false).availableUpgrades || []).filter(u => u.category === 'stardust' && u.canAfford)
        : [];
      if (stardustUpgrades.length > 0) {
        const thermal = stardustUpgrades.find(u => u.key === 'thermalInsulation');
        const target = thermal || stardustUpgrades[0];
        engine.dispatch({ type: getCommandType('stardust'), payload: { category: 'stardust', upgradeId: target.key } });
        this.stats.totalUpgradesBought++;
        this.logMilestone(`Bought Stardust Upgrade: ${target.name}`);
        boughtSomething = true;
      }

      if (epoch === 1) {
        // Priority order for Era I
        const priorityKeys = ['gravityForce', 'weakForce', 'electromagneticForce', 'strongForce'];
        for (let key of priorityKeys) {
          const upState = state.upgrades?.quantum?.[key];
          const def = COSMIC_REGISTRY.upgrades.quantum[key];
          if (upState && def) {
            const currencyKey = Economy.resolveCurrencyKey('quantum', key, def);
            const balance = getAmount(currencyKey);
            if (balance.gte(upState.cost) && (def.max === undefined || upState.level < def.max)) {
              engine.dispatch({ type: getCommandType('quantum'), payload: { category: 'quantum', upgradeId: key } });
              this.stats.totalUpgradesBought++;
              boughtSomething = true;
              if (key === 'electromagneticForce' && upState.level === 1) {
                this.logMilestone("Unlocked Electromagnetic Tensor");
              }
              break;
            }
          }
        }
      } else if (epoch === 2) {
        // Epoch II Strategy:
        const quarkCondenserLvl = state.upgrades?.plasma?.quarkCondenser?.level || 0;
        const currentQuarks = getResAmount('quarks');

        // 1. If Quarks < 20 or quarkCondenser is 0, click core to grind initial Quarks
        if (currentQuarks.lt(20) || quarkCondenserLvl === 0) {
          const upState = state.upgrades?.plasma?.quarkCondenser;
          const def = COSMIC_REGISTRY.upgrades.plasma.quarkCondenser;
          const balance = upState && def ? getAmount(Economy.resolveCurrencyKey('plasma', 'quarkCondenser', def)) : new Decimal(0);
          
          if (upState && balance.gte(upState.cost)) {
            engine.dispatch({ type: getCommandType('plasma'), payload: { category: 'plasma', upgradeId: 'quarkCondenser' } });
            this.stats.totalUpgradesBought++;
            boughtSomething = true;
          } else {
            engine.dispatch({ type: 'CLICK_CORE_ERA2' });
            this.stats.totalClicks++;
            return;
          }
        } else {
          // Priority order for Era II plasma upgrades
          const priorityKeys = ['quarkCondenser', 'baryoRadiator', 'gluonBinding', 'leptonHarvest', 'plasmaAutomation'];
          for (let key of priorityKeys) {
            const upState = state.upgrades?.plasma?.[key];
            const def = COSMIC_REGISTRY.upgrades.plasma[key];
            if (upState && def) {
              const currencyKey = Economy.resolveCurrencyKey('plasma', key, def);
              const balance = getAmount(currencyKey);
              if (balance.gte(upState.cost) && (def.max === undefined || upState.level < def.max)) {
                engine.dispatch({ type: getCommandType('plasma'), payload: { category: 'plasma', upgradeId: key } });
                this.stats.totalUpgradesBought++;
                boughtSomething = true;
                break;
              }
            }
          }
        }
      } else if (epoch === 3 && state.era3) {
        // Era III Aggressive Strategy: Auto-Fuser & Gravity first to maximize Helium inflow, then Compression & Elements
        const era3 = state.era3;
        const fuserCost = era3.fusionYield?.eq(0) ? era3.fuserCostHydrogen : era3.fuserCostHelium;
        const fuserCurrency = era3.fusionYield?.eq(0) ? getResAmount('hydrogen') : getResAmount('helium');

        // Always prioritize Fuser & Gravity to build sustainable Helium & Hydrogen scaling
        if (fuserCost && fuserCurrency.gte(fuserCost)) {
          engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'fuser' } });
          this.stats.totalUpgradesBought++;
          boughtSomething = true;
        } else if (era3.gravityCost && getResAmount('hydrogen').gte(era3.gravityCost)) {
          engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'gravity' } });
          this.stats.totalUpgradesBought++;
          boughtSomething = true;
        } else if (era3.compressCost && getResAmount('helium').gte(era3.compressCost)) {
          engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'compress' } });
          this.stats.totalUpgradesBought++;
          boughtSomething = true;
        }

        // Carbon & Iron elements (safely guarded against yield = 0 locks)
        if (era3.stage === "Main Sequence Star") {
          const carbonCost = era3.carbonYield?.eq(0) ? era3.carbonCostHelium : era3.carbonCostCarbon;
          const carbonCurrency = era3.carbonYield?.eq(0) ? getResAmount('helium') : getResAmount('carbon');
          if (carbonCost && carbonCurrency.gte(carbonCost)) {
            engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'carbon' } });
            this.stats.totalUpgradesBought++;
            boughtSomething = true;
          }

          const ironCost = era3.ironYield?.eq(0) ? era3.ironCostCarbon : era3.ironCostIron;
          const ironCurrency = era3.ironYield?.eq(0) ? getResAmount('carbon') : getResAmount('iron');
          if (ironCost && ironCurrency.gte(ironCost)) {
            engine.dispatch({ type: 'BUY_CORE_NODE', payload: { key: 'iron' } });
            this.stats.totalUpgradesBought++;
            boughtSomething = true;
          }
        }
      } else if (epoch === 4 && state.era4) {
        // Era IV Strategy: Node accretion, stability recovery, galaxy upgrades
        if (state.era4.stability.lte(30)) {
           // Placeholder for stabilize arms
           // engine.dispatch({ type: 'STABILIZE_ARMS' });
        }

        let nodeCost = state.era4.planetaryNodeCost || new Decimal(1000);
        if (getResAmount('planetaryDebris').gte(nodeCost)) {
           // engine.dispatch({ type: 'ACCRETE_PLANETS' });
        }

        for (let key in COSMIC_REGISTRY.upgrades.galaxy) {
          const upState = state.upgrades?.galaxy?.[key];
          const def = COSMIC_REGISTRY.upgrades.galaxy[key];
          if (upState && def) {
            const currencyKey = Economy.resolveCurrencyKey('galaxy', key, def);
            const balance = getAmount(currencyKey);
            if (balance.gte(upState.cost) && (def.max === undefined || upState.level < def.max)) {
              engine.dispatch({ type: getCommandType('galaxy'), payload: { category: 'galaxy', upgradeId: key } });
              this.stats.totalUpgradesBought++;
              boughtSomething = true;
              break;
            }
          }
        }
      } else if (epoch === 5 && state.era5) {
        // Era V Strategy: Buy era5 upgrades
        for (let key in COSMIC_REGISTRY.upgrades.era5) {
          const upState = state.upgrades?.era5?.[key];
          const def = COSMIC_REGISTRY.upgrades.era5[key];
          if (upState && def) {
            const currencyKey = Economy.resolveCurrencyKey('era5', key, def);
            const balance = getAmount(currencyKey);
            if (balance.gte(upState.cost) && (def.max === undefined || upState.level < def.max)) {
              engine.dispatch({ type: getCommandType('era5'), payload: { category: 'era5', upgradeId: key } });
              this.stats.totalUpgradesBought++;
              boughtSomething = true;
              break;
            }
          }
        }
      }

      // Track 100% Coherence Milestone
      if (state.coherence && state.coherence.gte(100)) {
        this.logMilestone("100% Vacuum Coherence Achieved");
      }

      // --- ACTIVE IDLE CLICKING ---
      // Click core if no upgrades were bought and amp is not at peak
      if (!boughtSomething && amp < 3.8) {
        let clickCmd = 'CLICK_CORE';
        if (epoch === 2) clickCmd = 'CLICK_CORE_ERA2';
        if (epoch === 3) clickCmd = 'CLICK_CORE_ERA3';
        if (epoch === 4) clickCmd = 'CLICK_CORE_ERA4';
        
        engine.dispatch({ type: clickCmd });
        this.stats.totalClicks++;
      }
    }

    // ------------------------------------------------------------------------
    // 2. SIMULATION & FAST-FORWARD ENGINE
    // ------------------------------------------------------------------------
    runGameTicks(seconds, isHeadless = false) {
      const tickRate = 0.10; // 100ms per tick
      const totalTicks = Math.ceil(seconds / tickRate);

      for (let i = 0; i < totalTicks; i++) {
        engine.tick(tickRate);
        this.stats.ticksElapsed++;
        this.stats.gameSecondsElapsed += tickRate;

        // Run Bot Decision loop every tick
        this.stepBotDecision();
      }

      if (!isHeadless && isDirty) {
        try { Viewport.update(); } catch (e) {}
        setIsDirty(false);
      }
    }

    startAutoPlaytest({ speed = 10, logIntervalSec = 5 } = {}) {
      this.stopAutoPlaytest();
      this.isRunning = true;
      this.speedMultiplier = speed;
      this.logIntervalSec = logIntervalSec;
      this.resetStats();

      console.log(`🚀 [AI PLAYTEST] Started Auto-Playtest (Speed: ${speed}x, Log Interval: ${logIntervalSec}s)`);

      // Realtime speed loop
      const intervalMs = Math.max(10, Math.floor(100 / speed));
      this.botTimer = setInterval(() => {
        if (!this.isRunning) return;
        this.runGameTicks(0.10 * (speed > 10 ? Math.floor(speed / 5) : 1), false);
      }, intervalMs);

      // Telemetry log timer
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

    runHeadlessSim({ durationInGameSeconds = 3600 } = {}) {
      console.log(`⚡ [HEADLESS SIM] Running ${durationInGameSeconds}s (${(durationInGameSeconds / 3600).toFixed(2)} hrs) of simulated gameplay...`);
      const startRealTime = Date.now();
      this.resetStats();
      this.isRunning = true;

      this.runGameTicks(durationInGameSeconds, true);

      this.isRunning = false;
      // Force single render update at the end
      if (typeof Viewport !== 'undefined' && Viewport.update) Viewport.update();

      const realTimeDuration = ((Date.now() - startRealTime) / 1000).toFixed(2);
      console.log(`✅ [HEADLESS SIM] Finished in ${realTimeDuration}s real-time!`);
      this.logTelemetryReport();
    }

    // ------------------------------------------------------------------------
    // 3. TELEMETRY & ANALYTICS LOGGING
    // ------------------------------------------------------------------------
    logTelemetryReport() {
      const state = engine.getStateUnsafe();
      const qfRate = typeof getQuantumFluctuationRate === 'function' ? format(getQuantumFluctuationRate()) : "0";
      const report = {
        gameTimeSec: this.stats.gameSecondsElapsed.toFixed(1) + "s",
        ticks: this.stats.ticksElapsed,
        epoch: state.activeEpoch,
        coherence: state.coherence.toFixed(1) + "%",
        clicks: this.stats.totalClicks,
        leaps: this.stats.totalLeaps,
        upgradesBought: this.stats.totalUpgradesBought,
        qfRate: qfRate + "/s",
        milestones: this.stats.milestones
      };

      console.log(`📊 [AI TELEMETRY REPORT @ t=${report.gameTimeSec}]`, report);
      console.table(Object.entries(this.stats.milestones).map(([name, data]) => ({
        Milestone: name,
        "Game Secs": data.gameSeconds + "s",
        Ticks: data.ticks,
        "Real Secs": data.realTimeSec + "s",
        Details: data.details
      })));
      this.updateDevPanelUI();
    }

    updateDevPanelUI() {
      const statusEl = document.getElementById('playtest-status-text');
      if (statusEl) {
        statusEl.innerHTML = this.isRunning
          ? `<span style="color:#00ecc6;">RUNNING (${this.speedMultiplier}x)</span> | t=${this.stats.gameSecondsElapsed.toFixed(0)}s | Ticks: ${this.stats.ticksElapsed}`
          : `<span style="color:#b2bec3;">IDLE</span>`;
      }
    }
  }

  const harness = new PlaytestEngine();

  // Expose Controls on window
  export const startAutoPlaytest = (opts) => harness.startAutoPlaytest(opts);
  export const stopAutoPlaytest = () => harness.stopAutoPlaytest();
  export const runHeadlessSim = (opts) => harness.runHeadlessSim(opts);
  export const playtestHarness = harness;
  export const getTelemetryHistory = () => harness.stats.milestones;
