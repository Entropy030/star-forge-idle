# Star Forge Idle — Handover

Last verified during P5.3C (2026-08-19).

## Project and status

Star Forge Idle is a browser incremental game in which the player observes and shapes a universe from quantum fluctuations through plasma, recombination, and stellar evolution.

Current milestone: **P5.3C COMPLETE (PUBLISHED + HUMAN APPROVED)**.

### P5 Progress Overview

- **P5.1 Interaction & UI Integrity:** `COMPLETE (PUBLISHED + HUMAN APPROVED)`
- **P5.2 Progression & Semantic Grammar:** `COMPLETE (PUBLISHED + HUMAN APPROVED)` (P5.2A + P5.2B)
- **P5.3A Era-I Vacuum Field Allocation:** `COMPLETE (PUBLISHED + HUMAN APPROVED)`
- **P5.3B0 Stellar Authority & Automation Parity:** `COMPLETE (PUBLISHED + HUMAN APPROVED)`
- **P5.3B1 Era-III Hydrostatic Stellar Engine Model B1:** `COMPLETE (PUBLISHED + HUMAN APPROVED)`
- **P5.3C Cross-Era Integration & Regression:** `COMPLETE (PUBLISHED + HUMAN APPROVED)`
- **P5.4 Coarse Balance & Full Run Calibration:** `NEXT (NOT STARTED)`

### Current Physical Agency Models

- **Era I — Quantum Genesis:** Discrete 3-State **Vacuum Field Allocation** (`PROPAGATION`, `BALANCED`, `STABILIZATION`) with Coherence as dynamic System Quality scaling established Fundamental Laws.
- **Era II — Primordial Plasma:** Coupled hadron flows and 3 **Operating Postures** (`ACCUMULATE`, `BALANCE`, `CONDENSE`) driving thermal stabilization, baryon harvest, and Recombination (constant 250 H seed).
- **Era III — Hydrostatic Stellar Engine (Model B1):** Coupled hydrostatic engine:
  - **Gravity:** Controls Hydrogen inflow rate and fuel containment buffer capacity ($C = 10 \times \text{inflowRate}$).
  - **Fusers:** Control Hydrogen $\to$ Helium conversion throughput.
  - **Compression:** Converts accumulated Helium into Core Temperature via authoritative heat yield.
  - **Core Temperature:** Active physical capability state continuously scaling reaction velocities across active burning layers while retaining hard threshold gates ($10\text{M K}$, $500\text{M K}$, $2.0\text{B K}$, $100\text{M K}$).
  - **Carbon / Iron:** Heavy nucleosynthesis consuming sustainable upstream flows.
  - **Stellar Configuration:** Efficient, Massive, and Compact identities shaping remnant outcomes.

Supported player journey:

- Era I — Quantum Genesis, Vacuum Field Allocation, and Cosmic Inflation
- Era II — Particle/Plasma evolution, Postures, and Recombination
- Era III — Stellar Dawn, Hydrostatic Stellar Engine, repeatable Supernova, and the Galactic Ignition gate

Save Schema: Strictly **Save Version 17** (zero new stored state fields). All 61 fast-test suites (472 vitest tests) and 44 Playwright browser specs passing.

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
12. **P4 Phase 1 complete:** canonical Era-II operating posture state (`state.era2.posture`), authoritative command (`SET_PLASMA_POSTURE`), schema normalization, and simulation integration are implemented, verified, approved by human review, and published.
13. **P4 Phase 2 complete:** Cosmos Era-II posture controller (`ACCUMULATE`, `BALANCE`, `CONDENSE`), authoritative command dispatch (`SET_PLASMA_POSTURE`), keyboard/accessibility radiogroup support, bounded Model-C contextual quick actions (`BUY_UPGRADE_PLASMA`), and centralized domain purchase calculations are implemented, verified, approved by human review, and published.
14. **P4 Phase 3 complete:** Era-II Star Core state-driven visual causality (pure semantic selector, thermal interpolation, posture dynamics, Recombination-Ready neutral-gas halo, reduced motion compliance) is implemented, verified, approved by human review, and published to `star/main`.
15. **P4 Phase 4 complete:** Recombination Handoff A (constant 250 H starting Hydrogen) is strictly enforced in `TRIGGER_RECOMBINATION` command, removing legacy variable formula; deterministic test matrix across all routes, high-matter totals, residue non-stacking, wait invariance, and active postures is verified; live browser transition and HUD presentation are verified; approved by human review and published.
16. **P4 Overall complete & stable:** All four P4 phases are implemented, verified, human-approved, and published under stable milestone tag `p4-stable-v1`.
17. **P5.1 Interaction & UI Integrity complete:** Whole-number stock formatting with floored truncation for positive balances, live Model-C contextual action event dispatch, Era-III Forge multi-purchase (`Buy 10` and `Buy Max`), desktop header & Matter Production alignment normalization, Codex navigation column width stabilization (`200px`), and simplified reduced-motion settings are implemented, verified, human approved, and published to `star/main` across 56 test files (370 vitest tests + 23 Playwright browser tests). Deferred finding on cross-era resource grammar recorded for dedicated UI normalization in P5.2/P5.3; Buy Max 10k sentinel recorded as existing implementation debt. P5 roadmap is established in `docs/09_P5_CORE_LOOP_AND_PRODUCT_COHESION.md`.
18. **P5 Design Synthesis complete:** Machine models for Eras I–III (Era I: Vacuum Field Allocation; Era II: Coupled Hadron Flows & 3 Postures; Era III: Hydrostatic Stellar Engine), agency mechanisms, automation ladder, candidate principles P1–P8, and low-attention constraints are formalized in `docs/10_P5_DESIGN_SYNTHESIS.md`, human approved (D27), and published to `star/main`.
19. **PRE-P5.3A Era-I Vacuum Field Allocation Prototype complete:** Prototype evidence for Coherence as System Quality (Variant B) is verified across parameter sweeps ($k \in [0.5, 1.5]$) and curve shapes, anti-exploit resilience is proven, documented in `docs/11_PRE_P5_3_ERA1_MACHINE_PROTOTYPE.md`, human approved (D28), and published to `star/main`. Exact numerical calibration deferred to P5.3/P5.4.
20. **PRE-P5.3B Era-III Hydrostatic Stellar Engine Prototype complete:** Structural coupling prototype evidence for Model B1 (Capacity / Throughput + Active Thermal Capability) is verified across full 2.0B K / Supernova progression, 2D parameter grid, strategy-aware Pareto analysis, recoverability tests, and Compact first-run automation analysis; documented in `docs/12_PRE_P5_3_ERA3_MACHINE_PROTOTYPE.md`, human approved (D29), and published to `star/main`. Exact numerical calibration deferred to P5.3/P5.4.
21. **P5 Implementation Planning complete & human approved:** Execution architecture, authority matrix, and phase contracts documented in `docs/13_P5_IMPLEMENTATION_PLAN.md`, human approved and published (D30, D31).
22. **P5.2A Semantic Progression & Resource Grammar Foundation complete & human approved:** Cross-era semantic slot assignments normalized (Era I: Quantum Fluctuations in Primary throughout; Era II: progressive Quarks → Protons → Plasma Temperature; Era III: Core Temperature in Primary per D31); meta-resource duplication removed from current-run HUD with Legacy retaining full persistent ownership; gameplay semantics unchanged; no gameplay/state/simulation authority modified; verified across 56 test files (371 vitest tests) and 27 Playwright browser tests, approved by human review, and published to `star/main`.
23. **P5.2B Current Transitions & First Supernova / Legacy Onboarding complete & human approved (D32):** Implemented pure transition presentation layer (`src/engine/transitionPresentation.js`), shared constant `RECOMBINATION_STARTING_HYDROGEN = 250` between commands and presentation, structured first/repeat Supernova transformation preview (RESET, PERSISTS, GAIN, NEXT) with explicit distinction from permanent Galactic Ignition, compact Era I / II transition cards in Cosmos, and refined Codex entries with Cooling-route unlock support; fixed `TRIGGER_SUPERNOVA` command to preserve Legacy upgrade families (`state.upgrades.stardust`, `state.upgrades.pulsar`, `state.upgrades.singularity`) including level and cost state per human decision (D32) while ensuring run-local construction and stellar upgrades reset; updated Legacy shop visibility to keep owned upgrade categories discoverable even at zero currency balance; verified across 57 test files (387 vitest tests) and 32 Playwright browser tests. **P5.2 Milestone Complete:** Cross-era resource grammar normalized and transition onboarding fully aligned.
24. **P5.3A Era-I Vacuum Field Allocation Vertical Slice complete & human approved (D28, D30):** Implemented approved D28 structural gameplay: discrete 3-state physical field control (`PROPAGATION`, `BALANCED`, `STABILIZATION`) in Era I; additive state field `state.era1.vacuumAllocation` normalized to `BALANCED` in schema (save version strictly 17); authoritative engine command `SET_VACUUM_ALLOCATION`; Fundamental Law rate coupling ($ \text{rate} = \text{base} \times \text{allocationThroughput} \times \text{fieldQuality} $ where $\text{fieldQuality} = 1 + (\text{Coherence}/100) \times 1.0$); passive coherence rate coupling ($0.05\%/\text{s}$, $0.10\%/\text{s}$, $0.25\%/\text{s}$); Cosmos roving radiogroup controller in `#cosmos-posture-controller` with $\ge 44\text{px}$ touch targets; Star Core canvas dynamic field geometry and coherence definition; Chrono milestone and Codex entry unlocked when Vacuum Resonance becomes available; non-blocking objective guidance in `obj_era1_complete`. Provisional calibration: `PROPAGATION: 1.5/0.5`, `BALANCED: 1.0/1.0`, `STABILIZATION: 0.5/2.5`, `qualityFeedbackStrength: 1.0` (final numerical calibration in P5.4). Human visual review confirmed controller is hidden before unlock, Balanced is neutral center/default, Propagation and Stabilization communicate throughput vs coherence priorities, live readouts make tradeoffs legible, Star Core provides visible causal feedback, Era I is distinct from Era II, mobile 390x844 passed, and reduced-motion semantics remain legible. Rapid toggling provides no advantage across tested cadences. Verified across 58 test files (405 vitest tests) and 36 Playwright browser tests. **P5.3A Milestone Complete & Human Approved.** Next activity: P5.3B0 Stellar Authority & Automation Parity Reconciliation.
25. **P5.3B0 Stellar Authority & Automation Parity Reconciliation complete, human approved, and published:** Established single state-explicit domain authority (`src/eras/stellar/authority.js`) reconciling Hydrogen base pacing ($10\text{ H/s}$), Stardust Fusion Discount ($\max(1, 10 - 2 \times \text{lvl})$ before Efficient scaling), constant $\alpha$ throughput modifier ($+30\%/\text{lvl}$ across He, C, Fe), AutoSynthesize velocity modifier ($+100\%/\text{lvl}$ for C and Fe), deterministic AutoCompress accumulator ($1\text{ compression/sec/level}$ with full heat yield, maxTemp, and stage promotion parity), live Solar Flare lifecycle and authoritative `COLLECT_SOLAR_FLARE` engine command (Hydrogen Surge $180\text{s}$, Magnetic Surge $60\text{s}$ $2\times$ nominal capacity, $25\%$ compression heat on live miss), constant $\hbar$ Supernova Stardust multiplier ($+20\%/\text{lvl}$), and HUD rate precision; schema normalized with `era3.autoCompressProgress` (Save Version 17 strictly preserved); verified across 59 fast-test files (429 tests), 36 Playwright browser specs, lint clean, build clean, and diff clean. **P5.3B0 Milestone Complete & Human Approved.**
26. **P5.3B1 Era-III Hydrostatic Stellar Engine Model B1 Implementation complete, human approved, and published (D29):** Implemented approved D29 Hydrostatic Engine architecture on top of reconciled D33 stellar authority without modifying save schema (Save Version 17 strictly preserved, zero new stored state fields). Added pure containment capacity authority $C = 10 \times \text{inflowRate}$ with non-destructive buffer semantics (direct inflow feeding, residual buffer accretion, existing stock above cap untouched); promoted thermal multiplier $M(T) = 1 + \log_{10}(T / 10^6 + 1)$ to active reaction velocity capability scaling nominal capacities across H->He, Carbon, and Iron; preserved early Protostar H->He bootstrap below 10M K; strictly enforced 500M K thermal gate on Carbon and 2.0B K gate on Iron; implemented pure continuous Decimal flow step `resolveStellarFlowStep(state, dt)` guaranteeing exact mass conservation and tick partition invariance ($1 \times 1.0\text{s} \equiv 10 \times 0.1\text{s}$); added pure selectors `getStellarMachineSnapshot(state)` and sustainable-flow `getStellarBottleneck(state)`; unified player-facing Reaction Capability display truth via `formatThermalCapability(getThermalReactionMultiplier(state))` (`1.00×`, `2.71×`, `4.54×`); implemented adaptive flow rate formatting explaining constraints; verified mobile 390x844 layout geometry and scrollability; verified across 60 fast-test files (463 vitest tests) and 41 Playwright browser tests. **P5.3B1 Milestone Complete, Human Approved, and Published.**
27. **P5.3C Cross-Era Integration & Regression complete, human approved, and published (D34):** Formally reconciled test evidence and product contracts across Eras I, II, and III. Proved that Eras I, II, and III operate as distinct physical systems inside one coherent incremental architecture sharing authoritative commands, presentation boundaries, resource grammar, and offline tick discipline. Reconciled Era-I allocation profile authority (Propagation: 1.50/0.50 $\to$ 0.05 pp/s, Balanced: 1.00/1.00 $\to$ 0.10 pp/s, Stabilization: 0.50/2.50 $\to$ 0.25 pp/s); validated Era-II posture bounds; proved exact Recombination handoff (250 H starting seed, real entry at 0 K / Protostar, antimatterResidue preserved as dormant compatibility state) and distinguished from isolated `getPresetFreshEraIII()` development fixture (2000 K); verified Supernova repeatable reset contract (resets stellar core to 0 K / Protostar, clears run-local stockpiles, preserves D32 Stardust, Pulsar, and Singularity upgrade families and meta currencies, prior-era Quantum and Plasma upgrades are not restored); codified human decision on Cosmic Constants (reset to 0 on Supernova, not part of D32 Era-III persistence, active modifier semantics under D33 preserved, future deep-future ownership deferred); verified Galactic Ignition evaluated in Era III ($T \ge 2.0\text{B K}$, $\text{Fe} \ge 1{,}000$) advancing to Era IV; proved deterministic offline tick advances without auto-triggering major transformations; verified responsive mobile 390x844 layout and radiogroup keyboard accessibility; verified across 61 fast-test suites (472 vitest tests) and 44 Playwright browser specs. **P5.3C Milestone Complete, Human Approved, and Published.** Next activity: P5.4 Coarse Balance & Natural Full Run Calibration.

Full evidence and follow-up boundaries are in [docs/P3_STABILIZATION_AUDIT.md](docs/P3_STABILIZATION_AUDIT.md), [docs/09_P5_CORE_LOOP_AND_PRODUCT_COHESION.md](docs/09_P5_CORE_LOOP_AND_PRODUCT_COHESION.md), [docs/10_P5_DESIGN_SYNTHESIS.md](docs/10_P5_DESIGN_SYNTHESIS.md), [docs/11_PRE_P5_3_ERA1_MACHINE_PROTOTYPE.md](docs/11_PRE_P5_3_ERA1_MACHINE_PROTOTYPE.md), [docs/12_PRE_P5_3_ERA3_MACHINE_PROTOTYPE.md](docs/12_PRE_P5_3_ERA3_MACHINE_PROTOTYPE.md), and [docs/13_P5_IMPLEMENTATION_PLAN.md](docs/13_P5_IMPLEMENTATION_PLAN.md).
