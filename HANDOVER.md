# Star Forge Idle — Handover

Last verified against `main` during P3 Stabilization S4 (2026-08-15).

## Project and status

Star Forge Idle is a browser incremental game in which the player observes and shapes a universe from quantum fluctuations through plasma, recombination, and stellar evolution.

Current milestone: **P3 STABLE WITH DOCUMENTED DEBT**.

Supported player journey:

- Era I — Quantum Genesis and Cosmic Inflation
- Era II — Particle/Plasma evolution and Recombination
- Era III — Stellar evolution, repeatable Supernova, and the Galactic Ignition gate

Era IV/V source and selected command tests exist as prototype/future scaffolding. They are not a supported P3 experience and are not permission to begin P4.

The final live-metric jitter defect is closed. Its permanent engineering contract is documented below and in [the audit](docs/P3_STABILIZATION_AUDIT.md#resolved-live-data-layout-contract). The remaining P1 findings are extension-boundary work required before P4, not confirmed defects in the supported P3 journey.

## Architecture map

```text
core/state.js (authoritative runtime state)
  → engine/dispatch.js + engine/instance.js
  → eras/*/commands.js (gameplay mutation)
  → core/runtimeTick.js (authoritative production/headless tick)
  → core/timeline.js + era simulation
  → core objectives/achievements/missions → explicit UI effects
  → eligibility/selectors + presentation selectors (read-only derivation)
  → UI modules + Viewport (DOM rendering)
```

Important locations:

- `src/core/state.js` — `gameState`, deep reactive dirty tracking, normalization, full replacement, replacement subscribers.
- `src/state/` — initial state, schema, serialization, and migrations.
- `src/engine/instance.js` — command handler registration and state-replacement synchronization.
- `src/engine/dispatch.js` — command dispatcher facade used outside engine setup.
- `src/eras/` — per-era commands, simulation, eligibility, and selectors.
- `src/core/runtimeTick.js` — authoritative tick ordering shared by production and automation.
- `src/core/timeline.js` — simulation chunking and Era dispatch.
- `src/core/objectives.js` — objective progression; UI modules use compatibility re-exports.
- `src/ui/runtimeEffects.js` — Chrono and achievement browser effects injected by production.
- `src/engine/*Presentation.js` and `src/ui/forgePresentation.js` — mutation-free player-facing models.
- `src/ui/viewport.js` — large UI orchestrator; focused UI modules sit beside it.
- `src/main.js` — actual browser composition root, scheduler, rendering, autosave, and compatibility/dev surface.
- `src/core/persistence.js` — normal/playtest saves, load, import/export, corrupt-save quarantine.

S3 removed the former unreferenced `src/app/runtime.js`/`src/app/loop.js` alternatives. `src/main.js` remains the only browser scheduler/composition root: its 100 ms scheduler calls `advanceGameTick()` with the browser effect sink, while an independent dirty-checked RAF renders.

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

Navigation is progressively disclosed. Resources use Primary/Support/Details. No toast notifications; feedback stays contextual.

Live-data layout is a permanent invariant:

```text
static semantic content → stable layout anchor
live numeric content → bounded formatting → reserved geometry
                     → persistent/keyed node → independent update
```

Static labels must not move across digit, suffix, percentage, readiness, or icon transitions. Separate spans and tabular numerals help, but reserved logical tracks and stable DOM identity provide the guarantee. New live metrics must preserve this contract at desktop and narrow mobile widths.

## Development

Requirements: Node.js `>=22.13.0` and npm.

```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:fast
npm run test:telemetry
npm run build
```

`npm run test` maps to `test:full`: repository hygiene plus all 225 correctness tests. `test:fast` runs the same inexpensive Vitest correctness contracts without repeating hygiene. `test:telemetry` separately runs three multi-million-tick bot profiles. `npm run typecheck` is currently a placeholder and provides no type safety.

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

Large bot runs are balance/progression telemetry in the periodic/manual lane. They are not substitutes for the bounded bot correctness smoke or real-device playtesting.

The bot owns strategy, not legality. Inflation, Fundamental Law, Recombination, plasma-upgrade, and Supernova decisions consume domain eligibility APIs and successful command results. Its fixed ticks now use `advanceGameTick()` exactly once, so domain simulation/progression matches production; browser effects remain intentionally absent in headless runs.

## Persistence

- Normal active key: `starForgeSave_v17` with fallbacks for older normal versions.
- Playtest active key: `starForgePlaytestSave_v17`.
- Saves are `{ version, gameState, lastSavedTime }`, recursively serialized, JSON-stringified, then written.
- `Decimal` and `Set` values are tagged by `src/state/serialization.js` and revived on load.
- Normal loads migrate supported older versions, then replace/normalize runtime state.
- `loadGame()` reports offline elapsed time capped at eight hours, but current boot does not consume that return value; only in-session scheduler/visibility gaps enter production catch-up.
- Corrupt active saves are copied to a timestamped quarantine key before the active key is removed.
- Export copies base64-encoded serialized JSON to the clipboard.
- Import currently accepts only the exact current save version; unlike normal load, it does not migrate older exports.

The historical literal `[object Object]` write failure is prevented by current known write paths and regression tests. Remaining risks include exact-version imports, clipboard/storage browser failures, thinner session-backup recovery, and accumulating quarantine keys.

## Deployment

`.github/workflows/deploy-pages.yml` validates pull requests to `main` with hygiene, lint, FAST and build, without deployment. Pushes to `main` and manual dispatch run FULL plus build; the dependent Pages job deploys only after success. `.github/workflows/telemetry.yml` runs the long bot profiles weekly or manually and does not block routine PRs or deployment.

## Known technical debt

P1 pre-P4:

- manual dev `getAIState()` and the unused `core/botActions.js` compatibility copy still expose simplified telemetry flags, but the active playtest bot no longer consumes them;
- later-era scaffolding overloads `state.coherence` with concepts unrelated to Era I Vacuum Coherence.

P2:

- the `Viewport` ↔ `ui/stellar.js` presentation cycle still has scoped suppressions;
- remaining source/regex structural guards need eventual real-browser counterparts where geometry or interaction matters;
- large composition modules and incomplete real-browser persistence/accessibility coverage.

## Before P4

1. **S2 complete:** production tick ordering and gameplay eligibility are characterized.
2. **S3 complete:** one authoritative production/headless tick exists; dead runtimes are removed; browser effects are injected outside simulation ownership.
3. **S4 complete:** durable test naming, bounded bot correctness, long-run telemetry, PR validation and proportionate FAST/FULL/TELEMETRY lanes are established.
4. **Next — S5:** harden browser persistence/import/offline behavior; boot still does not consume returned offline elapsed time.
5. Decide how later eras represent stability/temperature/entropy instead of extending overloaded Coherence semantics.
6. Re-run all eight presets, save/load/import/export cases, bot progression, lint, tests, build, and real-device smoke before P4 implementation.

Full evidence and follow-up boundaries are in [docs/P3_STABILIZATION_AUDIT.md](docs/P3_STABILIZATION_AUDIT.md).
