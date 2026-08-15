# Testing and CI

## Current inventory

S4 snapshot on 2026-08-15:

| Lane | Files | Tests | Measured local wall time | Purpose |
|---|---:|---:|---:|---|
| FAST | 43 | 225 | 4.03 s | Durable correctness and regression feedback |
| FULL | 43 | 225 | 4.08 s | FAST plus repository hygiene; main/release correctness |
| TELEMETRY | 1 | 3 | 152.15 s | Long-run strategy viability and balance signals |
| All unique tests | 44 | 228 | — | Union of correctness and telemetry coverage |

The pre-S4 default suite had 43 files and 227 tests and most recently took 158.60 s. `p2c_bot.test.js` alone took 156.42 s. Counts and timings are dated evidence, not quality targets.

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

## Test domains and coverage

Test count is not a quality target. Every durable test must protect an observable gameplay, runtime, UI, persistence, or architectural contract.

- **Runtime/state:** canonical state replacement, engine identity, authoritative tick ordering, simulated-time semantics, bootstrap and DOM initialization.
- **Era I:** commands, Fundamental Law eligibility, Vacuum Coherence, Inflation and pre-production narrative timing.
- **Era II:** commands, production/synthesis, cooling, progressive disclosure and Recombination.
- **Era III:** stellar simulation, temperature/fusion, Supernova eligibility/outcomes/rewards, Galactic Ignition and repeat-run Legacy behavior.
- **UI:** Cosmos, Forge, resources, navigation, state truth, stable live-value nodes, responsive/mobile, reduced motion and semantic controls.
- **Persistence:** serialization, migration, import failure safety, playtest isolation and corrupt-save quarantine.
- **Bot:** legality and exactly-once tick authority in FAST; bounded reset/Legacy smoke in FAST; long-run strategy and pacing in TELEMETRY.

Known high-value boundaries intentionally have overlapping protection: state replacement, Inflation, Recombination, Supernova reward parity, Galactic Ignition, and stable live-value DOM identity. The tests cover different command, runtime, presentation, or historical-regression contracts and were not merged merely because they touch the same feature.

Milestone/hotfix filenames were renamed to durable domain names during S4. No existing behavior test was deleted.

## Structural source guards

Some inexpensive tests intentionally inspect source/HTML/CSS structure. They protect bootstrap import order, raw-HTML safe defaults, navigation destination limits, safe-area CSS, reduced-motion rules and scrolling contracts. These remain structural guards where jsdom cannot provide trustworthy browser geometry or where an observable browser test would be disproportionately expensive.

Real-browser storage, clipboard, accessibility interaction, service-worker and geometry/CLS automation remain S5 work.

## GitHub Actions

`.github/workflows/deploy-pages.yml` provides:

- pull requests to `main`: install, repository hygiene, lint, FAST, build; never deploy;
- pushes to `main`: install, lint, FULL, build, Pages artifact, then dependent deployment;
- manual dispatch: the same FULL-gated build and deployment path.

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
