# Star Forge Idle — Handover

Last verified during P3 Stabilization S6 (2026-08-15).

## Project and status

Star Forge Idle is a browser incremental game in which the player observes and shapes a universe from quantum fluctuations through plasma, recombination, and stellar evolution.

Current milestone: **P3 STABLE WITH ACCEPTED DEBT**.

Supported player journey:

- Era I — Quantum Genesis and Cosmic Inflation
- Era II — Particle/Plasma evolution and Recombination
- Era III — Stellar evolution, repeatable Supernova, and the Galactic Ignition gate

Era IV/V source and selected command tests exist as prototype/future scaffolding. They are not a supported P3 experience and are not permission to begin P4.

The final live-metric jitter defect is closed. Its permanent engineering contract is documented below and in [the audit](docs/P3_STABILIZATION_AUDIT.md#resolved-live-data-layout-contract). S6 also reproduced and closed a release-blocking console exception in the repeatable Supernova UI wrapper; the reset itself, remnant rewards, second-run state, and Chrono continuity now complete together without an exception.

## P3 freeze baseline

The S6 release gate completed clean installation, repository hygiene, lint, FAST, FULL, BROWSER, TELEMETRY, production build, production dependency audit, all eight playtest presets, the supported Era I–III journey, Supernova reset, persistence/isolation acceptance, remote Actions inspection, and live Pages boot.

The recommended release tag is `p3-stable-v1`, pointing at the final P3 freeze commit. S6 does not create or push that tag. External red-team review is the next activity; P4 implementation remains out of scope until that review is triaged.

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
npm run test:browser
npm run test:telemetry
npm run build
```

`npm run test` maps to `test:full`: repository hygiene plus 295 correctness tests at the PRE-P4.2 baseline. `test:fast` runs the same inexpensive Vitest correctness contracts without repeating hygiene. `test:browser` builds and runs 16 production-preview Playwright contracts; install Chromium once with `npm run test:browser:install`. `test:telemetry` separately runs three multi-million-tick bot profiles. `test:offline-performance` profiles authoritative 1s catch-up batches. `npm run typecheck` is currently a placeholder and provides no type safety.

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
- `loadGame()` returns structured source/elapsed/cap/anomaly/recovery metadata. Valid normal cold returns consume at most eight hours through `advanceGameTick()` before first render, then checkpoint and reset the live clock.
- Offline progression allows deterministic passive systems and reconciliation, but never purchases, autobuy, stochastic auto-compress/flares, Inflation, Recombination, Supernova, or Galactic Ignition. Readiness may become true for later player action.
- Corrupt/empty/future active saves recover to a known fresh state, are removed from the active slot, and retain at most three timestamped quarantine diagnostics when storage permits.
- Export copies base64-encoded serialized JSON to the clipboard.
- Import currently accepts only the exact current save version; unlike normal load, it does not migrate older exports.
- Autosave/export storage failures and unavailable/rejected clipboard operations remain contextual, non-throwing failures. Import does not replace runtime state unless its storage write succeeds.
- Playtest changes save ownership only after the serialized session backup succeeds; failed/missing restore keeps playtest mode active.

The historical literal `[object Object]` write failure and browser storage/clipboard failure paths are covered in real Chromium. Exact-version manual import is intentional policy, not a migration promise.

## Deployment

`.github/workflows/deploy-pages.yml` validates pull requests to `main` with hygiene, lint, FAST/build and a parallel required BROWSER job, without deployment. Pushes to `main` and manual dispatch run FULL/build plus BROWSER; Pages deploys only after both required jobs succeed. `.github/workflows/telemetry.yml` runs the long bot profiles weekly or manually and does not block routine PRs or deployment.

## Dependency security

At the S6 freeze, `npm audit --omit=dev` reports zero production vulnerabilities. The full development graph still reports two moderate, two high, and one critical advisory in Vite/Vitest/vite-node tooling and their esbuild/Nanoid dependencies. Those packages are not shipped as reachable browser runtime dependencies in the current static production artifact. Remediation requires a coordinated major Vite/Vitest toolchain upgrade and is intentionally deferred; do not interpret this as approval to ignore future production-reachable advisories.

## Known technical debt

Accepted P3 debt:

- post-catch-up storage denial preserves the in-memory universe but cannot durably prevent a later reload from crediting the still-unmodified save interval;
- manual import accepts the exact current save version and does not migrate older exports;
- automated accessibility contracts are present, while manual screen-reader validation remains a release smoke;
- one S6 TELEMETRY run completed correctly but took 516.47 s, above the prior 130–260 s local range. Outcomes and checkpoints did not drift; telemetry duration remains an observation, not a correctness target.

P4 prerequisites:

- preserve the PRE-P4.1 command boundary: UI/action adapters dispatch once, while Core-node, Celestial-Card, Stellar, Legacy-shop, and Cosmic-Tuning purchase legality/mutation remain inside registered commands;
- preserve the single `advanceGameTick()` production/headless boundary and Era-I-only Vacuum Coherence model when adding later-era systems.

Future maintenance:

- perform the coordinated Vite/Vitest major security-tooling upgrade and re-audit the full graph;
- update GitHub Actions whose Node 20 runtimes are currently forced onto Node 24, and consider immutable action SHA pinning;
- the `Viewport` ↔ `ui/stellar.js` presentation cycle still has scoped suppressions;
- large composition modules remain migration debt;
- `npm run typecheck` remains a placeholder.

## Before P4

1. **S2 complete:** production tick ordering and gameplay eligibility are characterized.
2. **S3 complete:** one authoritative production/headless tick exists; dead runtimes are removed; browser effects are injected outside simulation ownership.
3. **S4 complete:** durable test naming, bounded bot correctness, long-run telemetry, PR validation and proportionate FAST/FULL/TELEMETRY lanes are established.
4. **S5 complete:** production-preview browser persistence, failure handling, keyboard/ARIA, geometry/CLS, PWA/offline shell and required CI coverage are established. Its no-cold-catch-up observation is historical and was superseded by PRE-P4.2.
5. **S5.5 complete:** Vacuum Coherence is Era-I-only; later eras use Plasma Temperature, stellar state, Galaxy Stability, and Entropy without mirroring them into `state.coherence`.
6. **Security triage complete:** production dependencies have zero known vulnerabilities; development-tooling remediation is deferred as documented debt.
7. **S6 complete:** final local gates, all presets, supported Era I–III progression, persistence/PWA acceptance, remote CI, live deployment, and the repeatable Supernova reset are verified.
8. **PRE-P4.1 complete:** runtime history is canonical, abandoned Era-I baryon-simulation fields are normalized out of v17 state, and legacy UI/dev action paths no longer duplicate gameplay authority.
9. **PRE-P4.2 complete:** valid cold returns share the authoritative runtime tick, major decisions remain player-authored, successful catch-up checkpoints before live scheduling, and an ephemeral accessible briefing summarizes meaningful change.
10. **PRE-P4.3 complete:** Model C (Contextual Quick Actions) and Star Core visual causality are approved as product direction (D23, D24); Model E persistent stage is rejected for current scope; the prototype branch `antigravity/prototype-pre-p4-interaction` is preserved as disposable experimental evidence; production implementation is deferred to P4.
11. **PRE-P4.4 complete:** Era-II Physical Agency / Operating Posture model is approved as design direction (D25); semantic postures (`ACCUMULATE`, `BALANCE`, `CONDENSE`) are validated; provisional multipliers remain unapproved; Handoff A (constant 250 H Starting Hydrogen) is selected; tested B30 formula is rejected; the prototype branch `antigravity/prototype-pre-p4-era2-agency` (commits `739a42c`, `b9de369`) is preserved as disposable experimental evidence; production implementation is deferred to P4.
12. **P4 Phase 1 complete:** canonical Era-II operating posture state (`state.era2.posture`), authoritative command (`SET_PLASMA_POSTURE`), schema normalization, and simulation integration are implemented and verified.
13. **P4 Phase 2 implemented (awaiting human approval):** Cosmos Era-II posture controller (`ACCUMULATE`, `BALANCE`, `CONDENSE`), authoritative command dispatch (`SET_PLASMA_POSTURE`), keyboard/accessibility radiogroup support, and bounded Model-C contextual quick actions (`BUY_UPGRADE_PLASMA`) are implemented and verified in production; Phase 3 not started.
14. **Next:** Human review of P4 Phase 2 before Phase 3 (Era-II Star Core Semantic Visual Causality & Accessibility).

Full evidence and follow-up boundaries are in [docs/P3_STABILIZATION_AUDIT.md](docs/P3_STABILIZATION_AUDIT.md).
