# Star Forge Idle

Star Forge Idle is a browser-based incremental game about guiding a universe from quantum emergence through stellar evolution. The supported P3 journey currently covers Eras I–III.

P3 is feature-complete but **not yet stable**: real-device live-value/text layout jitter remains an open release-blocking UX defect. Do not begin Era IV work until the gates in [HANDOVER.md](HANDOVER.md) are closed.

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
9. [Testing and CI](docs/07_TESTING_AND_CI.md) — current validation and recommended lanes.
10. [Documentation policy](docs/DOCUMENTATION_POLICY.md) — lightweight source-of-truth rules.

Focused references:

- [Coherence semantics audit](docs/05_Coherence_Semantics_Audit.md) — dated technical audit retained as historical evidence.
- [Physics abstraction guide](docs/PHYSICS_ABSTRACTION_GUIDE.md) — design guidance, not an implementation contract.

## Validation

```bash
npm run lint
npm run test
npm run build
```
