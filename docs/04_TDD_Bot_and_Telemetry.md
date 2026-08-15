# TDD — Playtest Bot and Telemetry

## Purpose

Automation has two different jobs:

1. **Regression evidence:** Can commands, transitions, state replacement, and a representative progression path complete without exceptions or state disagreement?
2. **Balance telemetry:** How long, how many actions, and which bottlenecks/build outcomes appear under an automated policy?

Regression tests need stable pass/fail contracts. Balance telemetry is exploratory evidence and should not fail a release because a preferred timing target changed unless that target has been explicitly adopted as a product requirement.

## Playtest mode

`src/dev/playtestMode.js` enables a protected browser testing environment through `?playtest=1` or Shift+F2.

On enable:

- the current normal runtime state is serialized to `sessionStorage` as `starForgeRealSaveBackup`;
- persistence switches to `starForgePlaytestSave_v17`;
- the playtest controls expose speed, presets, export, and restore.

On disable:

- speed returns to 1×;
- the serialized session backup is deserialized and installed with `replaceRuntimeState()`;
- the playtest panel is removed and the current UI is refreshed.

The normal local save is not used as the active playtest slot. This isolation is a correctness contract.

## Presets

`src/dev/playtestPresets.js` derives every preset from the complete initial state and uses registry-aware helpers for upgrade levels/costs.

Current preset set:

- Fresh Era I
- Late Era I
- Fresh Era II
- Mid Era II
- Recombination Ready
- Fresh Era III
- Mid Era III
- Supernova Ready

The UI installs the returned state with `replaceRuntimeState()`. Presets must remain complete, normalizable, and immediately visible to header, objective, transition UI, terminal, engine, and presentation selectors.

## Speed semantics

### Browser playtest multiplier

The production scheduler wakes approximately every 100 ms. It computes:

```text
simulated seconds = real elapsed seconds × c modifier × playtest multiplier
```

The 1×/5×/25× control changes logical time passed to `advanceGameTick`; it does not promise a proportionally faster DOM render loop or wall-clock timer frequency. Background/catch-up work is chunked and capped.

### Headless bot

`PlaytestBot.runGameTicks(tickRate, headless)` advances explicit logical steps through the same `advanceGameTick()` boundary as production, then records telemetry and chooses its next strategy action. It does not call `engine.tick()` or `Timeline.process()` separately. Headless runs omit the browser effect sink, but Coherence, narrative state, objectives, achievements, and missions all advance authoritatively.

### Auto-playtest bot

`startAutoPlaytest()` uses wall-clock `setInterval` timers and adjusts interval/batch behavior from the requested speed. Browser scheduling, throttling, and render cost can affect wall time. Treat its reported logical time as simulation telemetry, not a device performance benchmark.

## Bot architecture

`src/core/playtestBot.js`:

- selects actions from the current state;
- dispatches gameplay commands/actions;
- advances authoritative `advanceGameTick()` logical ticks;
- records clicks, purchases, phase/milestone timing, failures, and Supernova outcome;
- optionally updates the dev panel and logs reports.

### Authority contract

The playtest bot owns strategy, not gameplay legality.

- The bot owns profile, priority, purchase preference, action timing, and telemetry.
- Gameplay owns prerequisites, authoritative affordability, transition readiness, command validity, mutations, and emitted results.

The bot consumes:

- `getInflationEligibility()` for Cosmic Inflation;
- `getQuantumUpgradeEligibility()` for Fundamental Laws;
- `getRecombinationEligibility()` for Recombination;
- `getPlasmaUpgradeEligibility()` for plasma upgrades;
- `getSupernovaEligibility()` and the Supernova command/outcome APIs for collapse.

It may prefilter by current balance to implement purchase strategy, but the command result is final and only successful purchases count in telemetry. Galactic Ignition is not an action in the current supported bot policy. S2 also removed the bot's unused import of `getAIState()` from `src/main.js`, so headless automation no longer depends on the browser composition root.

S3 aligned headless simulation ownership with production. This intentionally makes telemetry observe passive cross-cutting state that the old bot bypassed; for example, passive Vacuum Coherence can move a telemetry milestone slightly earlier without changing strategy, balance, or transition requirements.

The manual `getAIState()` dev export and unused `src/core/botActions.js` compatibility copy still contain simplified display flags. They are not consulted by `PlaytestEngine` decisions; consolidate or remove them only in a later focused cleanup.

## Telemetry interpretation

Useful telemetry includes:

- logical seconds and ticks to milestones;
- action/purchase counts;
- detected bottlenecks and resource state at transition;
- command failures and error codes;
- selected stellar build and predicted/actual Supernova outcome;
- exceptions and stalled phases.

Always record the preset/initial state, bot profile, tick rate, logical time, wall time, revision, and success condition. Do not compare historical numbers if mechanics or automation policy changed without noting that change.

## Test placement

- Focused command, selector, transition, preset agreement, bot-authority and bounded bot-smoke tests belong in FAST/FULL.
- `tests/bot_smoke.test.js` starts near Supernova readiness and uses real authoritative ticks, bot decisions and commands through reward grant, reset and the second-run Legacy checkpoint. It also protects bounded `MAX_TICKS_EXCEEDED` failure.
- `tests/simulation/bot_longrun.test.js` retains the efficient, massive and compact multi-million-tick profiles for periodic/manual TELEMETRY.

The long profiles use a seeded test-only `Math.random` replacement so a given test seed produces repeatable gameplay telemetry. Production stellar randomness is unchanged. See `docs/07_TESTING_AND_CI.md` for commands, triggers and measured runtimes.

## Failure handling

A bot run should fail clearly when:

- a command returns an unexpected error;
- progression stalls beyond a declared logical tick budget;
- UI/engine/runtime states disagree after replacement;
- an exception occurs;
- predicted and actual reset/transition outcomes violate the same authoritative contract.

A change in desired balance timing is a review signal, not automatically a correctness failure.
