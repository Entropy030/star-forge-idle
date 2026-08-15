# TDD — Architecture and State

## Current production path

```text
index.html → src/bootstrap.js → src/main.js → bootApp()
  ├─ loadGame() → replaceRuntimeState() → engine replacement subscription
  ├─ load/save + playtest bootstrap
  ├─ 100 ms scheduler → advanceGameTick(dt, applyRuntimeEffect)
  │                    → Timeline.process(dt) + domain progression
  ├─ requestAnimationFrame → Viewport.update() when dirty
  └─ command/UI/dev compatibility wiring
```

This is the one production runtime. S3 removed the former `src/app/runtime.js` and `src/app/loop.js`; they were incomplete, unreferenced alternatives and contained no production behavior worth preserving.

## Authoritative runtime state

`src/core/state.js` owns:

- exported live `gameState`;
- recursive reactive proxies and `isDirty` tracking;
- `getRuntimeState()` and replacement subscriptions;
- `replaceRuntimeState()`/compatibility alias `setGameState()`;
- `ensureStateShape()` re-export for legacy consumers.

`replaceRuntimeState(nextState)`:

1. rejects non-object state;
2. merges missing fields from a fresh initial state;
3. runs schema normalization;
4. wraps the full object in a new reactive proxy;
5. marks the UI dirty and synchronizes body Era/tab attributes;
6. notifies subscribers.

`src/engine/instance.js` subscribes and calls `engine.loadState(state)`, so `engine.getStateUnsafe()` and `gameState` refer to the same proxy immediately after load/import/preset replacement.

### Rules

- Never introduce another global player-state store.
- Never keep a module-level copy of the old state object across replacement.
- Never repair/normalize state in a Viewport renderer.
- Creation, load, migration, import, preset, and restore paths must converge on the same replacement/normalization contract.

## Initial state, schema, and migrations

- `src/state/createInitialState.js` creates the complete current shape.
- `src/state/schema.js` supplies normalization and compatibility aliases.
- `src/state/migrations.js` defines the current save version and sequential migrations.
- `src/state/serialization.js` recursively tags and revives non-JSON types (`Decimal` and `Set`).

Normalization handles shape/type defaults after deserialization; it is not a serialization mechanism. JSON persistence must still serialize special values and stringify the outer payload.

## Engine and commands

`src/engine/createEngine.js` provides a command dispatcher and optional system tick interface. `src/engine/instance.js` registers quantum, plasma, stellar, and galactic command handlers and exposes the singleton engine.

`src/engine/dispatch.js` is a narrow dispatcher facade that lets UI/actions send commands without importing engine construction details.

Gameplay mutation belongs in `src/eras/*/commands.js`. A command should:

1. validate active Era and authoritative eligibility;
2. apply the mutation once;
3. return a structured success/failure result and events;
4. avoid direct DOM work.

Some compatibility action wrappers still exist in `src/core/actions.js` and `src/main.js`. They are migration debt; do not duplicate new mechanics there.

## Eligibility and selectors

Eligibility modules own readiness and requirement details used outside the command implementation. Examples:

- `src/eras/quantum/eligibility.js`
- `src/eras/plasma/eligibility.js`
- `src/eras/stellar/selectors.js`

Eligibility must not import UI modules or engine runtime instances. It may read the state passed to it. Commands, transition UI, objectives, and automation should consume the same result.

Domain selectors calculate read-only rates/outcomes. Presentation selectors convert current state and authoritative results into display models:

- `src/engine/cosmosPresentation.js`
- `src/engine/resourcePresentation.js`
- `src/ui/forgePresentation.js`

Presentation selectors must not mutate, normalize, or dispatch.

## Simulation ownership

The production scheduler in `src/main.js` measures real elapsed time and scales it by the speed-of-light modifier and playtest multiplier. Normal ticks call `advanceGameTick(simulatedSeconds, applyRuntimeEffect)`. Large/background intervals are processed asynchronously in one-second chunks, capped at eight hours.

Simulation and rendering are separate clocks:

1. A 100 ms `setInterval` measures wall time and calls `advanceGameTick()` with scaled simulated time.
2. A gap over 1.5 wall-clock seconds enters asynchronous catch-up instead of a normal tick.
3. `advanceGameTick()` mutates the reactive state, which marks it dirty.
4. An independent RAF renders `Viewport.update()` only when dirty, then clears the flag.

`loadGame()` calculates and returns saved offline elapsed time, but the current `bootApp()` does not consume that return value. The active catch-up path therefore handles scheduler/visibility gaps in the running browser session; persisted close/reopen offline progress is not currently fed into simulation. S5 characterized this behavior and intentionally did not enable offline progression.

Within `advanceGameTick()` the observable ordering remains:

1. active click-boost time and Era-specific Coherence/pre-simulation values;
2. Era I peak-QF and narrative milestone detection from the pre-simulation resource value;
3. chunked Era simulation through `Timeline.process()`;
4. objective progression;
5. achievement mutation and an explicit achievement effect;
6. mission completion/rank mutation;
7. a later RAF observes dirty state and updates the UI.

Eligibility and transition readiness are derived on demand rather than stored. A selector called after simulation sees the new state in the same tick. By contrast, Era I peak-QF law unlocks and passive-production narrative thresholds become visible on the following tick because their checks precede production. Characterization tests intentionally protect both behaviors.

`src/core/runtimeTick.js` is the authoritative production/headless advancement boundary. It owns tick ordering, pre-simulation Coherence/narrative domain mutation, Timeline invocation, objective progression, achievement mutation, and missions. It accepts an optional effect sink and emits narrative/achievement facts at their original ordering points.

`src/core/timeline.js` now owns chunking and Era simulation only. Objective definitions/progression live in `src/core/objectiveDefinitions.js` and `src/core/objectives.js`; UI compatibility facades re-export their APIs. `src/ui/runtimeEffects.js` owns Chrono/DOM and achievement `CustomEvent` effects. Production injects that sink; headless automation omits it while still applying the exact same domain tick.

Do not call `engine.tick()` or `Timeline.process()` alongside `advanceGameTick()` for the same logical step; that would create divergent clocks or double simulation.

## UI and presentation

`src/ui/viewport.js` orchestrates the current DOM and delegates to focused modules. It reads the authoritative state and mutation-free presentation models, then dispatches commands for actions.

Rendering uses dirty-state updates and cached structures in several surfaces. Related live fields—title, instruction, progress, phase, transition status, and requirements—must update from one current snapshot. Static labels and live values have separate ownership; bounded formatting, reserved logical tracks, and persistent/keyed nodes keep changing values from moving semantic anchors. See `docs/06_TDD_UI_UX_Architecture.md` for the permanent layout contract and `docs/P3_STABILIZATION_AUDIT.md#resolved-live-data-layout-contract` for the resolved defect evidence.

Detailed UI ownership lives in `docs/06_TDD_UI_UX_Architecture.md`.

## Persistence boundary

`src/core/persistence.js` owns browser persistence:

```text
runtime state
  → serializeState()
  → JSON.stringify({ version, gameState, lastSavedTime })
  → localStorage string
```

Load reverses the process, migrates supported normal saves, and calls `replaceRuntimeState()`. Empty, malformed, structurally invalid, incomplete-migration, and future-version payloads recover to a known fresh state. The bad active payload is removed so it cannot fail every boot; when storage permits, it is retained under a timestamped quarantine key. Quarantine keeps the three newest diagnostic payloads.

Normal and playtest slots are isolated. Entering playtest writes the serialized normal-state backup to `sessionStorage` before save ownership changes. A failed backup aborts entry; a missing/corrupt restore leaves playtest ownership active rather than exposing playtest state to the normal slot.

Export/import wraps serialized JSON in base64. Manual import intentionally accepts only the exact current version; it does not run normal-save migrations. Import persists the validated payload before runtime replacement, so a denied/quota-limited write preserves the current in-memory state. Autosave/export storage errors and unavailable/rejected clipboard writes return contextual failures without throwing through the browser loop.

Offline time returned by load is capped at eight hours, but production boot currently ignores the returned elapsed value. In-session scheduler/visibility gaps use the separate production catch-up accumulator.

## Dependency rules

- Core/domain calculation must not import UI rendering.
- Presentation may import selectors/registries, not command mutation.
- Eligibility accepts state and does not import economy modules that would create cycles.
- The composition root may wire modules, but domain automation should not import calculations from `main.js`.
- A cycle suppression is a temporary marker, not permission to expand the cycle.

The Timeline → UI and playtestBot → main cycles are removed. `Viewport` and `ui/stellar.js` still form a presentation-layer cycle through shared formatting/outcome rendering and retain their scoped suppressions pending a focused UI-module cleanup.

## Common failure modes

- **Split state:** replacing `gameState` without synchronizing the engine or a cached consumer. Use `replaceRuntimeState()` and read state at use time.
- **Eligibility drift:** calculating a button/bot condition separately from its command. Import the authoritative selector.
- **Presentation mutation:** filling missing fields during render. Normalize at state boundaries instead.
- **`[object Object]` saves:** passing objects directly to Web Storage. Serialize special values and JSON-stringify first.
- **Stale UI:** dirty checking only a numeric progress field while title/status/requirements belong to a new Era/objective. Derive one snapshot and update the group.
- **Double simulation:** calling `engine.tick()` or `Timeline.process()` in addition to `advanceGameTick()` for one logical step.
- **Wall-clock confusion:** treating playtest speed or headless ticks as real-time performance measurements. Record logical and wall time separately.
