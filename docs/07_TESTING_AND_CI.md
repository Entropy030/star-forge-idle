# Testing and CI

## Current inventory

S6 freeze snapshot on 2026-08-15:

| Lane | Files | Tests | Measured local wall time | Purpose |
|---|---:|---:|---:|---|
| FAST | 44 | 237 | 4.94 s | Durable correctness and regression feedback |
| FULL | 44 | 237 | 5.15 s | FAST plus repository hygiene; main/release correctness |
| BROWSER | 5 | 15 | 75.99 s | Production-preview persistence, interaction, geometry and PWA acceptance |
| TELEMETRY | 1 | 3 | 516.47 s | Long-run strategy viability and balance signals |
| Vitest total | 45 | 240 | — | Union of correctness and telemetry coverage |

The pre-S4 default suite had 43 files and 227 tests and most recently took 158.60 s. `p2c_bot.test.js` alone took 156.42 s. Counts and timings are dated evidence, not quality targets. S6 FAST and FULL were measured as separate sequential commands. The S6 TELEMETRY run completed with the expected three outcomes and second-run checkpoints but exceeded its prior 130–260 s local range; this is accepted performance variance to monitor, not correctness drift. One preceding BROWSER attempt saw a transient Google Fonts CDN 404; its isolated retry and the complete final 15-test run passed without code or test changes.

PRE-P4.2 adds structured elapsed/load, authoritative offline parity/policy, checkpoint/idempotency, ephemeral summary, and 390 px cold-return browser contracts. The final PRE-P4.2 baseline is 50 FAST/FULL files with 295 correctness tests and 6 BROWSER files with 16 tests; the historical S6 table above remains release-freeze evidence.

## Commands and lanes

### FAST

```bash
npm run test:fast
```

Runs unit, state/runtime, Era mechanics, commands, UI/DOM contracts, persistence, runtime characterization, bot authority, and the bounded bot smoke. It excludes only `tests/simulation/bot_longrun.test.js`.

Use FAST while developing and on pull requests. It intentionally does not repeat repository hygiene, because CI runs that check as its own PR step.

### FULL

```bash
npm run test:full
```

Runs repository hygiene and the complete correctness suite. FULL currently discovers the same Vitest files as FAST because every non-telemetry contract is already inexpensive. The separate name communicates release intent without inventing an artificial slow correctness group.

`npm test` and `npm run test:run` both map to FULL. This preserves the unsurprising convention that the default test command is the required local correctness gate.

### TELEMETRY

```bash
npm run test:telemetry
```

Runs the efficient, massive, and compact multi-million-tick profiles in `tests/simulation/bot_longrun.test.js`. These protect long-run strategy viability, Supernova outcome/reward parity, and second-run Legacy behavior. A test-only seeded `Math.random` implementation makes gameplay telemetry reproducible without changing production randomness.

Telemetry failures are visible balance/strategy signals requiring investigation. They do not block routine pull requests or deployment. If a long-run assertion becomes a correctness requirement, first add or move a bounded contract into FULL.

### BROWSER

```bash
npm run test:browser:install
npm run test:browser
```

The one-time install command downloads Playwright Chromium; browser binaries are not committed. `test:browser` builds the Vite production bundle, starts the local preview at `/star-forge-idle/`, and runs Playwright with safe file-level parallelism (`workers: process.env.CI ? 4 : 2`, with `fullyParallel: false` preserving sequential test execution within each spec). It covers real Web Storage and clipboard paths, playtest isolation, corrupt-save recovery, keyboard/focus/ARIA behavior, reduced motion, 1440 × 1000 and 390 × 844 geometry, CLS/overflow, manifest/service-worker scope, same-origin caches, and offline shell boot.

Browser acceptance complements unit/jsdom contracts; it does not replace their faster domain and DOM feedback. Automated browser semantics and keyboard contracts are covered. Manual screen-reader validation remains a release smoke activity.

### OFFLINE PERFORMANCE

```bash
npm run test:offline-performance
```

Profiles 1 minute, 1 hour, and 8 hours across representative Era I–III/second-run states and all eight supported presets at the cap. It reports logical ticks, wall time, batch count, and maximum batch duration. This is profiling evidence rather than a brittle CI assertion; if one-second authoritative chunks meet responsiveness targets, do not add analytical formula shortcuts.

## Test domains and coverage

Test count is not a quality target. Every durable test must protect an observable gameplay, runtime, UI, persistence, or architectural contract.

- **Runtime/state:** canonical state replacement, engine identity, authoritative tick ordering, simulated-time semantics, bootstrap and DOM initialization.
- **Era I:** commands, Fundamental Law eligibility, Vacuum Coherence, Inflation and pre-production narrative timing.
- **Cross-era semantics:** Vacuum Coherence remains Era-I-only while later-era Temperature, Galaxy Stability and Entropy retain native ownership.
- **Era II:** commands, production/synthesis, cooling, progressive disclosure and Recombination.
- **Era III:** stellar simulation, temperature/fusion, Supernova eligibility/outcomes/rewards, Galactic Ignition and repeat-run Legacy behavior.
- **UI:** Cosmos, Forge, resources, navigation, state truth, stable live-value nodes, responsive/mobile, reduced motion and semantic controls.
- **Persistence/offline:** serialization, migration, structured elapsed metadata, import anchors, playtest isolation, corrupt-save quarantine, authoritative tick parity, transition/automation suppression, checkpoint behavior, storage denial and ephemeral briefing.
- **Bot:** legality and exactly-once tick authority in FAST; bounded reset/Legacy smoke in FAST; long-run strategy and pacing in TELEMETRY.
- **P5.4 Balance Characterization (`tests/p5_natural_run.test.js`):** Separates three evidence lanes: (A) Bounded natural fresh-state observation across playstyle profiles (Informed, Low-Attention, Simple) from Era I through Main Sequence (~10M K); (B) Exact deterministic authority sequence for zero-meta compression crossings (10M K, 500M K, 2.0B K), cumulative Helium demand, and fuel/inflow authority; (C) Prepared-state Supernova transformation preview and 300s second-run legacy acceleration.

Known high-value boundaries intentionally have overlapping protection: state replacement, Inflation, Recombination, Supernova reward parity, Galactic Ignition, and stable live-value DOM identity. The tests cover different command, runtime, presentation, or historical-regression contracts and were not merged merely because they touch the same feature.

Milestone/hotfix filenames were renamed to durable domain names during S4. No existing behavior test was deleted.

## Structural source guards

Some inexpensive tests intentionally inspect source/HTML/CSS structure. They protect bootstrap import order, raw-HTML safe defaults, navigation destination limits, safe-area CSS, reduced-motion rules and scrolling contracts. These remain structural guards where jsdom cannot provide trustworthy browser geometry or where an observable browser test would be disproportionately expensive.

Real-browser storage, clipboard, accessibility interaction, service-worker and geometry/CLS contracts are protected by the BROWSER lane. Structural guards remain useful for inexpensive source-level invariants.

## GitHub Actions

`.github/workflows/deploy-pages.yml` provides:

- pull requests to `main`: validation runs repository hygiene, lint, FAST and build; the parallel browser job explicitly installs Chromium and runs BROWSER; never deploy;
- pushes to `main`: validation runs lint, FULL, build and Pages artifact while the browser job runs BROWSER;
- manual dispatch: the same FULL-gated build and deployment path.

Deployment depends on both validation and browser jobs. A browser failure therefore blocks Pages deployment. Chromium installation stays out of the local FAST/FULL and TELEMETRY lanes.

Validation has `contents: read`. Only the deploy job receives `pages: write` and `id-token: write`.

`.github/workflows/telemetry.yml` runs TELEMETRY weekly on Sunday and through manual dispatch. Its failure does not gate the PR/Main deployment workflow.

## Required manual checks for P3 closure

- All eight presets at desktop and 390 px mobile.
- Fresh Era I first-run narrative through Inflation preparation.
- Recombination alternative routes.
- Supernova-ready Era III state agreement and reset consequences.
- Core interaction, Forge Buy 1/10/Max, Details, and all disclosed navigation.
- Save/load/export/import and playtest restore.
- Reduced motion, keyboard focus, no horizontal overflow, no console errors.
- Real-device live-value stability; static anchors must remain fixed across formatting/readiness/icon boundaries.
