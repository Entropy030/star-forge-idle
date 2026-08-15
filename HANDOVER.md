# Star Forge Idle — Handover

Last verified against `main` after P3.3C.1 and the P3 stabilization audit (2026-08-15).

## Project and status

Star Forge Idle is a browser incremental game in which the player observes and shapes a universe from quantum fluctuations through plasma, recombination, and stellar evolution.

Current milestone: **P3 implementation complete; P3 NOT YET STABLE**.

Supported player journey:

- Era I — Quantum Genesis and Cosmic Inflation
- Era II — Particle/Plasma evolution and Recombination
- Era III — Stellar evolution, repeatable Supernova, and the Galactic Ignition gate

Era IV/V source and selected command tests exist as prototype/future scaffolding. They are not a supported P3 experience and are not permission to begin P4.

Open release gate: real-device playtesting still shows live numeric values moving surrounding text/layout. See [the audit](docs/P3_STABILIZATION_AUDIT.md#unresolved-live-valuetext-jitter). This is P1 and blocks declaring P3 stable.

## Architecture map

```text
core/state.js (authoritative runtime state)
  → engine/dispatch.js + engine/instance.js
  → eras/*/commands.js (gameplay mutation)
  → core/timeline.js + era simulation (production tick)
  → eligibility/selectors + presentation selectors (read-only derivation)
  → UI modules + Viewport (DOM rendering)
```

Important locations:

- `src/core/state.js` — `gameState`, deep reactive dirty tracking, normalization, full replacement, replacement subscribers.
- `src/state/` — initial state, schema, serialization, and migrations.
- `src/engine/instance.js` — command handler registration and state-replacement synchronization.
- `src/engine/dispatch.js` — command dispatcher facade used outside engine setup.
- `src/eras/` — per-era commands, simulation, eligibility, and selectors.
- `src/core/timeline.js` — current production simulation dispatch plus mixed progression/UI side effects.
- `src/engine/*Presentation.js` and `src/ui/forgePresentation.js` — mutation-free player-facing models.
- `src/ui/viewport.js` — large UI orchestrator; focused UI modules sit beside it.
- `src/main.js` — actual browser composition root, scheduler, rendering, autosave, and compatibility/dev surface.
- `src/core/persistence.js` — normal/playtest saves, load, import/export, corrupt-save quarantine.

`src/app/runtime.js` and `src/app/loop.js` are not the production runtime. Engine systems are currently empty. Do not add gameplay there unless the runtime-consolidation work explicitly adopts that path.

## State contract

`src/core/state.js` is the one authoritative runtime owner. All player-facing reads must ultimately derive from its live `gameState` proxy.

Use engine commands for gameplay mutation. Use authoritative eligibility outside commands. Presentation selectors must be read-only.

Full state changes—load, import, migration, playtest preset, or restore—must use `replaceRuntimeState()`. It merges defaults, runs `ensureStateShape()`, installs a new reactive proxy, and notifies subscribers. The engine subscribes and immediately points to the same object. Do not cache the old state object or manually patch missing fields in UI code.

## UI ownership

- **Cosmos:** current universe, active process, and immediate action.
- **Forge:** current-run construction/upgrades and their decision information.
- **Legacy:** Supernova, meta rewards/progression, and loadout.
- **More:** Archive/Codex, settings, save/import/export, and utility.

Information roles:

- **Objective:** what the player should do next.
- **Chrono:** short event context and meaning.
- **Codex:** deeper explanation and reference.

Navigation is progressively disclosed. Resources use Primary/Support/Details. Static copy and live numeric values should be separate DOM nodes, and stable copy should not be rewritten every tick. No toast notifications; feedback stays contextual.

## Development

Requirements: Node.js `>=22.13.0` and npm.

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

`npm run test` first runs `scripts/check-repo-hygiene.mjs`, then the Vitest suite. `npm run typecheck` is currently a placeholder and provides no type safety.

## Playtest

Enable playtest mode with `?playtest=1` or Shift+F2. It protects the normal save by serializing a session backup and switches persistence to `starForgePlaytestSave_v17`. Disabling it restores the session backup and returns speed to 1×.

Presets:

- Fresh Era I
- Late Era I
- Fresh Era II
- Mid Era II
- Recombination Ready
- Fresh Era III
- Mid Era III
- Supernova Ready

Preset loads replace the complete runtime state through `replaceRuntimeState()`.

The UI speed buttons are 1×, 5×, and 25×. In the real scheduler, the multiplier scales simulated elapsed seconds; it does not change wall-clock timer frequency. The speed-of-light upgrade modifier also scales simulated time.

`src/core/playtestBot.js` has two modes:

- headless/fixed-tick runs advance explicit logical time for deterministic regression/progression checks;
- auto-playtest uses wall-clock timers and batches more logical ticks at higher requested speed, so it is not a timing benchmark.

Large bot runs are balance/progression telemetry and should eventually move to a periodic/manual lane. They are not substitutes for focused regression tests or real-device playtesting.

## Persistence

- Normal active key: `starForgeSave_v17` with fallbacks for older normal versions.
- Playtest active key: `starForgePlaytestSave_v17`.
- Saves are `{ version, gameState, lastSavedTime }`, recursively serialized, JSON-stringified, then written.
- `Decimal` and `Set` values are tagged by `src/state/serialization.js` and revived on load.
- Normal loads migrate supported older versions, then replace/normalize runtime state.
- Offline elapsed time is capped at eight hours and processed by the production catch-up path.
- Corrupt active saves are copied to a timestamped quarantine key before the active key is removed.
- Export copies base64-encoded serialized JSON to the clipboard.
- Import currently accepts only the exact current save version; unlike normal load, it does not migrate older exports.

The historical literal `[object Object]` write failure is prevented by current known write paths and regression tests. Remaining risks include exact-version imports, clipboard/storage browser failures, thinner session-backup recovery, and accumulating quarantine keys.

## Deployment

`.github/workflows/deploy-pages.yml` runs on pushes to `main` and manual dispatch. It uses Node 22, `npm ci`, lint, all tests, and the production build. Only the dependent deploy job uploads to GitHub Pages, so validation gates deployment correctly.

There is currently no pull-request workflow or fast/full/periodic split. Every successful `main` push is a deployment.

## Known technical debt

P1/release or pre-P4:

- unresolved live-value/text layout jitter;
- production `main.js`/`gameTick` runtime diverges from unused `app/runtime.js`/engine loop;
- `Timeline`/`gameTick` mix simulation, progression, narrative, missions/achievements, and UI side effects;
- bot/dev `getAIState()` duplicates eligibility and can disagree on Inflation readiness;
- later-era scaffolding overloads `state.coherence` with concepts unrelated to Era I Vacuum Coherence.

P2:

- broad import-cycle suppressions around `main`, bot, `Viewport`, and stellar UI;
- milestone-named and source-regex tests need durable organization/behavioral replacement;
- no PR validation or test lanes;
- large composition modules and incomplete real-browser persistence/accessibility coverage.

## Before P4

1. Close the P3 layout-jitter gate with instrumentation, a focused fix, browser/device coverage, and first-run playtesting.
2. Characterize current tick ordering and make bot/telemetry consume authoritative eligibility.
3. Consolidate one runtime and separate pure simulation/progression from presentation side effects without changing balance.
4. Decide how later eras represent stability/temperature/entropy instead of extending overloaded Coherence semantics.
5. Re-run all eight presets, save/load/import/export cases, bot progression, lint, tests, and build.

Full evidence and follow-up boundaries are in [docs/P3_STABILIZATION_AUDIT.md](docs/P3_STABILIZATION_AUDIT.md).
