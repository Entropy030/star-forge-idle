# TDD — Architecture and State

## Current production path

```text
src/main.js
  ├─ load/save + playtest bootstrap
  ├─ 100 ms scheduler → gameTick(dt) → Timeline.process(dt)
  ├─ requestAnimationFrame → Viewport.update() when dirty
  └─ command/UI/dev compatibility wiring
```

This is the current runtime. `src/app/runtime.js` and `src/app/loop.js` are incomplete alternative abstractions and are not booted by production. `engine` currently has no registered tick systems. Treat this divergence as pre-P4 debt, not as two supported runtimes.

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

The production scheduler in `src/main.js` measures real elapsed time and scales it by the speed-of-light modifier and playtest multiplier. Normal ticks call `gameTick(simulatedSeconds)`. Large/background intervals are processed asynchronously in one-second chunks, capped at eight hours.

`src/core/timeline.js` chunks simulation and routes it to Era-specific simulation. Its current `gameTick()` wrapper also applies cross-cutting effects and progression.

Known ownership debt: Timeline/game tick currently touch Coherence, artifacts, objectives, narrative milestones/Chrono, achievements/window events, and missions. This couples headless simulation to UI and makes ordering implicit. Before P4, characterize the existing order, establish a pure authoritative tick/progression result, then let presentation consume emitted results.

Do not move one mechanic at a time to the unused engine loop without proving equivalence.

## UI and presentation

`src/ui/viewport.js` orchestrates the current DOM and delegates to focused modules. It reads the authoritative state and mutation-free presentation models, then dispatches commands for actions.

Rendering uses dirty-state updates and cached structures in several surfaces. Related live fields—title, instruction, progress, phase, transition status, and requirements—must update from one current snapshot. Stable copy and live values should remain distinct nodes. The known live-value jitter means this contract is not fully satisfied; see `docs/P3_STABILIZATION_AUDIT.md`.

Detailed UI ownership lives in `docs/06_TDD_UI_UX_Architecture.md`.

## Persistence boundary

`src/core/persistence.js` owns browser persistence:

```text
runtime state
  → serializeState()
  → JSON.stringify({ version, gameState, lastSavedTime })
  → localStorage string
```

Load reverses the process, migrates normal saves, and calls `replaceRuntimeState()`. Corrupt active payloads are quarantined under a timestamped key. Normal and playtest slots are isolated. Export/import wraps serialized JSON in base64; current import accepts only the exact current version.

Offline time returned by load is processed through the production catch-up path and capped at eight hours.

## Dependency rules

- Core/domain calculation must not import UI rendering.
- Presentation may import selectors/registries, not command mutation.
- Eligibility accepts state and does not import economy modules that would create cycles.
- The composition root may wire modules, but domain automation should not import calculations from `main.js`.
- A cycle suppression is a temporary marker, not permission to expand the cycle.

Current exceptions are documented in the stabilization audit: Timeline → UI, playtestBot ↔ main composition, and broad Viewport/stellar UI suppressions.

## Common failure modes

- **Split state:** replacing `gameState` without synchronizing the engine or a cached consumer. Use `replaceRuntimeState()` and read state at use time.
- **Eligibility drift:** calculating a button/bot condition separately from its command. Import the authoritative selector.
- **Presentation mutation:** filling missing fields during render. Normalize at state boundaries instead.
- **`[object Object]` saves:** passing objects directly to Web Storage. Serialize special values and JSON-stringify first.
- **Stale UI:** dirty checking only a numeric progress field while title/status/requirements belong to a new Era/objective. Derive one snapshot and update the group.
- **Double simulation:** registering new engine systems while `main.js` still calls `gameTick()`. Adopt one loop only after characterization.
- **Wall-clock confusion:** treating playtest speed or headless ticks as real-time performance measurements. Record logical and wall time separately.
