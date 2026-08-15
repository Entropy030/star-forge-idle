# Star Forge Idle

Star Forge Idle is a browser-based incremental game about guiding a universe from quantum emergence through stellar evolution. The supported P3 journey currently covers Eras I–III.

P3 is **stable with documented debt**. Eras I–III, their current UI architecture, persistence boundaries, and the live-data layout contract are the supported baseline. Do not begin Era IV work until the pre-P4 architecture boundaries in [HANDOVER.md](HANDOVER.md) are closed.

## Start here

```bash
npm install
npm run dev
```

Requires Node.js 22.13 or newer.

## Documentation

1. [HANDOVER.md](HANDOVER.md) — current status, architecture map, development, playtest, persistence, deployment, and next work.
2. [DECISIONS.md](DECISIONS.md) — settled product and architecture decisions.
3. [P3 stabilization audit](docs/P3_STABILIZATION_AUDIT.md) — dated audit evidence, risks, and release gate.
4. [Narrative and philosophy GDD](docs/01_GDD_Narrative_and_Philosophy.md) — player fantasy and narrative ownership.
5. [Eras and mechanics GDD](docs/02_GDD_Eras_and_Mechanics.md) — supported gameplay truth for Eras I–III.
6. [Architecture and state TDD](docs/03_TDD_Architecture_and_State.md) — runtime, state, mutation, simulation, and persistence boundaries.
7. [Bot and telemetry TDD](docs/04_TDD_Bot_and_Telemetry.md) — presets, automation, timing, regression, and balance evidence.
8. [UI/UX architecture TDD](docs/06_TDD_UI_UX_Architecture.md) — surface ownership and rendering contracts.
9. [Testing and CI](docs/07_TESTING_AND_CI.md) — current validation commands, lanes, coverage, and CI triggers.
10. [Documentation policy](docs/DOCUMENTATION_POLICY.md) — lightweight source-of-truth rules.

Focused references:

- [Coherence semantics audit](docs/05_Coherence_Semantics_Audit.md) — dated technical audit retained as historical evidence.
- [Physics abstraction guide](docs/PHYSICS_ABSTRACTION_GUIDE.md) — design guidance, not an implementation contract.

## Validation

```bash
npm run lint
npm run test
npm run test:fast
npm run test:browser
npm run test:telemetry
npm run build
```

Install the browser binary once with `npm run test:browser:install`. `npm test` is the full correctness gate. Use `test:fast` for rapid local feedback, `test:browser` for production-preview browser acceptance, and `test:telemetry` only for the long strategy/balance simulations. See [Testing and CI](docs/07_TESTING_AND_CI.md) for lane definitions and CI triggers.
