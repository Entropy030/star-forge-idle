# Documentation Policy

Documentation is part of the feature contract. A material gameplay, architecture, UI ownership, persistence, or validation change is not complete until its durable source of truth is updated.

## Sources of truth

| Topic | Durable document |
| --- | --- |
| Current project status and operating context | `HANDOVER.md` |
| Settled product/architecture choices | `DECISIONS.md` |
| Narrative and gameplay design | `docs/01_GDD_Narrative_and_Philosophy.md`, `docs/02_GDD_Eras_and_Mechanics.md` |
| Runtime, state, mutation, simulation, persistence | `docs/03_TDD_Architecture_and_State.md` |
| Playtest bot and telemetry | `docs/04_TDD_Bot_and_Telemetry.md` |
| UI/UX ownership and rendering contracts | `docs/06_TDD_UI_UX_Architecture.md` |
| Tests and CI | `docs/07_TESTING_AND_CI.md` |
| Dated findings/evidence | named audit documents such as `docs/P3_STABILIZATION_AUDIT.md` |

Code, schemas, registries, eligibility selectors, and tests remain authoritative for exact implemented formulas and behavior. The GDD explains design intent; the TDD explains engineering contracts. If documentation and implementation disagree, investigate rather than silently choosing one.

## Maintenance rules

- Update the smallest relevant durable document in the same change as a material feature.
- Keep `HANDOVER.md` concise and current; move evidence/history into dated audits.
- Record only settled decisions in `DECISIONS.md`; mark future proposals as planned elsewhere.
- Label unsupported/future Eras and historical audits explicitly.
- Keep commands and file paths verifiable from the repository.
- Avoid copying exact formulas across multiple documents; link to the owning code/module when precision matters.

The documentation index in `README.md` is the entry point and should remain valid.
