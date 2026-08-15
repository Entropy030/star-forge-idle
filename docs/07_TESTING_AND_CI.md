# Testing and CI

## Current behavior

The repository currently has 41 Vitest files and 208 executed tests. The complete inventory and dispositions are in `P3_STABILIZATION_AUDIT.md`.

Commands:

```bash
npm run lint
npm run test
npm run build
```

- Lint runs ESLint over `src/`.
- Test runs repository hygiene first, then the complete Vitest suite.
- Build creates the Vite production bundle/PWA output in `dist/`.
- `npm run typecheck` is a placeholder and is not a validation gate.

Tests cover engine/commands, Era mechanics, simulation, transitions, state replacement, migrations/persistence, Codex/narrative, presentation/UI contracts, responsive source contracts, playtest isolation, and long bot progression.

## Current GitHub Actions

`.github/workflows/deploy-pages.yml` triggers on:

- push to `main`;
- manual workflow dispatch.

It uses checkout, Node 22 with npm caching, `npm ci`, lint, the full test suite, and build. The Pages artifact is uploaded only after validation. A separate deploy job depends on that job, so failed validation prevents deployment.

There is no pull-request workflow and no fast/full/periodic split. Every successful `main` push deploys.

## Test quality contract

Every durable test should answer: **What permanent behavior does this protect?**

Prefer:

- domain names over milestone/hotfix names;
- public command/selector/presentation behavior over implementation text;
- one shared fixture/builder per domain over copied setup;
- bounded deterministic ticks over large arbitrary limits;
- browser assertions for actual layout/storage/accessibility behavior.

Do not delete a historical regression until its durable behavior is covered elsewhere.

## Recommended future lanes (not implemented)

### Fast CI — every PR/push

- lint and repository hygiene;
- production build;
- engine/state/economy/era command and selector tests;
- migrations and focused persistence tests;
- mutation-free presentation contracts;
- bounded DOM/smoke integration.

Target: quick feedback with no multi-million-tick simulation.

### Full CI — main/release

- all fast checks;
- complete domain/UI integration suite;
- bounded end-to-end playtest path;
- build artifact verification.

### Periodic/manual

- large playtest-bot runs;
- balance/build matrices and telemetry sweeps;
- multi-browser/device/responsive checks;
- extended save-fixture/offline scenarios.

## Planned test cleanup

1. Inventory durable assertions before moving files.
2. Merge `followup`/`hotfix`/milestone files into Era, persistence, navigation, Cosmos, Forge, and responsive-accessibility suites.
3. Replace source/CSS regex tests with observable DOM or browser behavior where practical.
4. Move the large bot suite out of the fast lane while retaining a bounded progression smoke test.
5. Compare test discovery/counts before and after reorganization.

## Required manual checks for P3 closure

- All eight presets at desktop and 390 px mobile.
- Fresh Era I first-run narrative through Inflation preparation.
- Recombination alternative routes.
- Supernova-ready Era III state agreement and reset consequences.
- Core interaction, Forge Buy 1/10/Max, Details, and all disclosed navigation.
- Save/load/export/import and playtest restore.
- Reduced motion, keyboard focus, no horizontal overflow, no console errors.
- Real-device live-value stability; the known jitter must be absent.
