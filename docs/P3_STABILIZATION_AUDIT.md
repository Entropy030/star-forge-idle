# P3 Stabilization Audit

Audit date: 2026-08-15

Audited revision: `d400a95` (`main`)

Scope: final P3 repository truth after the live-metric layout fix; documentation changes only

Post-audit resolution: S2–S5.5 subsequently closed the runtime, test/CI, browser/persistence, and cross-era Coherence boundaries identified here. The finding rows remain dated evidence; current authority lives in the focused TDDs and `DECISIONS.md`.

## Executive diagnosis

P3 has a coherent player-facing architecture, strong regression coverage for Eras I–III, and no confirmed release-blocking correctness, persistence, or UI defect. The live-number/text layout jitter was closed by `d400a95`: bounded formatting, reserved logical geometry, stable static anchors, and persistent live-value nodes now form a durable UI contract. The defect remains important as an architectural lesson, not an open release gate.

No P0 correctness or data-loss defect was confirmed. The historical `[object Object]` persistence failure class is prevented in current write paths and covered by regression tests. The most important architecture debt is the coexistence of the real `main.js`/`gameTick` runtime with an unused engine-loop/runtime abstraction, plus mixed simulation, progression, narrative, and DOM ownership in `Timeline` and `gameTick`. Resolve those boundaries before extending the game into Era IV.

The test suite protects substantial durable behavior, but P3 milestone names have become permanent suite structure. Several tests assert source text or CSS tokens instead of observable behavior, and the large playtest bot is too expensive for a future fast PR lane. Documentation before this audit was materially behind the implementation, especially for Coherence, Era II, Supernova versus Galactic Ignition, runtime ownership, and persistence.

## Release gate

Status: **P3 STABLE WITH DOCUMENTED DEBT**

The repository-specific P3 gate is satisfied when:

1. `npm run lint`, the complete `npm run test`, and `npm run build` pass.
2. The documentation baseline and handover describe the current implementation rather than milestone history.
3. No P0/P1 release defect remains in supported Era I–III gameplay or persistence.
4. All eight presets, first-run narrative, save boundaries, desktop/mobile layout, and real-device Core/Forge/navigation behavior have a completed smoke record.
5. The working tree is clean at the release boundary.

The final layout pass measured stable anchors at desktop and 390 px mobile widths and added regressions for formatting boundaries and persistent live nodes. Runtime-boundary work below remains required before P4, but it does not make current Era I–III gameplay unstable.

## Findings by severity

### P0 — correctness or data loss

None confirmed.

### P1 — release or pre-P4 work

| Finding | Impact | Required boundary |
| --- | --- | --- |
| Two runtime stories coexist: production boots through `src/main.js`, `gameTick`, and `Timeline`, while `src/app/runtime.js` and `src/app/loop.js` describe an unused engine-system loop. | A future contributor can implement behavior in the wrong runtime; P4 would deepen divergence. | Choose and document one simulation/composition path before P4. |
| `Timeline`/`gameTick` mix simulation with Coherence, objectives, milestones, achievements, missions, Chrono updates, DOM events, and other visual side effects. | Ordering is hard to reason about and headless simulation is coupled to UI behavior. | Separate pure simulation/progression results from presentation side effects before P4. |
| `main.js` is more than a composition root and includes compatibility globals, action wrappers, dev helpers, and duplicate telemetry calculations. `getAIState()` does not use the full authoritative Inflation eligibility contract. | Bot/dev telemetry can disagree with command eligibility even though player UI uses authoritative selectors. | Move or replace duplicate calculations; preserve one command/eligibility contract before P4. |
| **Resolved S5.5:** `state.coherence` was an Era I player concept reused as temperature/stability/entropy input in later-era scaffolding. | Extending Era IV/V could have cemented unrelated meanings into one field. | Model D now makes Vacuum Coherence Era-I-only; later eras use native state. |
| Existing GDD/TDD material was materially stale. | New work could follow obsolete mechanics or runtime assumptions. | Remediated by the documentation baseline following this audit. |

### P2 — cleanup and hardening

- Consolidate milestone-named UI regressions into durable domain suites.
- Replace source-text/CSS-regex assertions with behavioral DOM or browser checks where practical.
- Split fast, full, and periodic simulation lanes; add PR validation before relying on GitHub Pages deployment as the only CI path.
- Scope GitHub Actions permissions by job, review action-version warnings periodically, and retain npm caching.
- Harden import/session-backup error reporting and document the exact-version import restriction.
- Reduce broad `import/no-cycle` suppressions after runtime/UI ownership is clarified.
- Remove or label misleading comments and unused alternative runtime paths only in an implementation follow-up.
- Add real-browser coverage for storage, clipboard import/export, offline progression, focus/keyboard behavior, and responsive layout stability.

### P3 — harmless residue

- Compatibility aliases and globals retained for older tests/dev tools.
- Historical milestone wording in test descriptions.
- Old migration branches that are still intentionally required for supported saves.
- Small direct-DOM helpers that are isolated and covered but should not become patterns for new work.

## Documentation inventory

| Document | Classification | Purpose and recommended action |
| --- | --- | --- |
| `README.md` | PARTIALLY STALE | Correct entry point and reading order, but still names jitter as open. Update status and keep as the concise index. |
| `HANDOVER.md` | PARTIALLY STALE | Correct operating map, gameplay, persistence, CI, and debt; update revision, release status, layout contract, and pre-P4 order. |
| `DECISIONS.md` | PARTIALLY STALE | Durable decisions are sound; D10 must record the completed geometry contract rather than an unsatisfied aspiration. |
| `docs/01_GDD_Narrative_and_Philosophy.md` | CURRENT | Current narrative ownership and Era I–III intent. Keep implementation detail out. |
| `docs/02_GDD_Eras_and_Mechanics.md` | CURRENT | Current Era I–III mechanics and future boundary. Verify links/formulas when gameplay changes. |
| `docs/03_TDD_Architecture_and_State.md` | CURRENT | Accurate state/runtime/command/persistence map with explicit runtime debt. |
| `docs/04_TDD_Bot_and_Telemetry.md` | CURRENT | Accurate playtest, bot, timing, and telemetry boundaries. |
| `docs/05_Coherence_Semantics_Audit.md` | CURRENT / HISTORICAL | Accurate focused evidence. Retain as dated semantics audit rather than general architecture authority. |
| `docs/06_TDD_UI_UX_Architecture.md` | PARTIALLY STALE | Surface contracts are current; update the live-data section to the closed invariant and remove the open-defect note. |
| `docs/07_TESTING_AND_CI.md` | PARTIALLY STALE | Structure and recommendations are current; update the snapshot from 208 to 209 tests and close the jitter gate. |
| `docs/DOCUMENTATION_POLICY.md` | CURRENT | Clear source-of-truth and impact-check policy. Keep lightweight. |
| `docs/P3_STABILIZATION_AUDIT.md` | PARTIALLY STALE | Historical evidence is useful, but the audited revision, counts, layout status, release status, and plan require this update. |
| `docs/PHYSICS_ABSTRACTION_GUIDE.md` | CURRENT / DESIGN GUIDANCE | Correctly labeled non-authoritative design framing. Retain unchanged. |

No redundant documentation requires deletion. The focused Coherence audit and physics guide serve distinct historical/design purposes. No additional Markdown plan is missing after the handover baseline is refreshed.

## Gameplay documentation drift

### Era I

- Observation is optional acceleration, not a mandatory click gate. `CLICK_CORE` produces Quantum Fluctuations and, once relevant, Vacuum Coherence.
- Quantum Fluctuations, upgrade levels, and maximum observed QF drive progressive Fundamental Law eligibility. The old docs presented a flatter purchase model.
- Energy Density and Vacuum Coherence are distinct Inflation requirements. Current authoritative Inflation eligibility requires 100,000 QF, 50,000 Energy Density, and 100% Vacuum Coherence.
- `state.coherence` uses a 0–100 percentage scale. Era I passive stabilization is 0.1 percentage points per second; the base observation gain is 0.5 percentage points before authoritative modifiers. Old documentation used a 0–1 representation.
- Vacuum Coherence is hidden at the fresh start, introduced contextually, and made explicit during Inflation preparation. The Core, objective, Chrono, and Codex each have different explanatory ownership.
- Narrative staging is milestone-driven; Cosmic Inflation is the permanent transition into Era II.

Authoritative implementation: `src/eras/quantum/commands.js`, `src/eras/quantum/eligibility.js`, `src/eras/quantum/selectors.js`, `src/core/timeline.js`, `src/engine/cosmosPresentation.js`, and the narrative/Codex modules.

### Era II

- The implemented economy is a coupled chain of Quarks, Gluons, Leptons, Protons, Electrons, and Plasma Temperature rather than a single cooling counter.
- Proton synthesis and Lepton decay have explicit production/consumption recipes. Cooling is a player-controlled process with bottlenecks exposed through presentation selectors.
- Recombination eligibility includes supported alternative routes rather than one strictly linear checklist.
- Existing design text omitted current recipe evaluation, bottleneck guidance, resource hierarchy, and the authoritative transition contract.

Authoritative implementation: `src/eras/plasma/`, `src/core/economy.js`, `src/engine/cosmosPresentation.js`, and `src/engine/resourcePresentation.js`.

### Era III

- Hydrogen/Helium fusion, compression, Core Temperature, Carbon, and Iron form the current-run stellar process.
- A Supernova is a repeatable Legacy reset. It grants Stardust and Pulsar Shards, with Singularity Mass depending on the achieved outcome/archetype; it does not permanently advance the Era.
- Galactic Ignition is the distinct permanent Era transition. The implemented gate requires stellar progression including 1,000 Iron and a 2 billion K Core Temperature.
- Earlier documentation conflated the Supernova reset with permanent Era progression and referred to an obsolete “Neural Synapse”/“Synaptic Dust” reward.

Authoritative implementation: `src/eras/stellar/`, `src/ui/stellar.js`, and Legacy presentation/navigation modules.

Era IV and V modules exist as prototype/future scaffolding and have tests for selected commands. They are not part of the currently supported P3 player journey and must not be described as a completed milestone.

## Architecture truth

### Authoritative state

- `src/core/state.js` owns the live `gameState` proxy.
- `replaceRuntimeState()` merges initial defaults, runs `ensureStateShape()`, installs a new deep reactive proxy, and notifies subscribers.
- `src/engine/instance.js` subscribes to replacements so `engine.getStateUnsafe()` references the same runtime object.
- Presets, load/import, and playtest restoration must replace state through this path; local component patching is not authoritative.

### Mutation and eligibility

- `src/engine/dispatch.js` is the public command dispatcher facade.
- Era command handlers own gameplay mutations.
- Eligibility/selectors are authoritative for readiness outside commands. The quantum economy dependency cycle was correctly broken by `src/eras/quantum/eligibility.js`.
- `src/engine/cosmosPresentation.js`, `src/engine/resourcePresentation.js`, and `src/ui/forgePresentation.js` derive player-facing data and must not mutate state.

### Simulation

- The production path is `src/main.js` → scheduler → `gameTick()`/`Timeline.process()`.
- `Timeline.simulate()` dispatches Era I–III simulation and contains fallback behavior for later scaffolding.
- `src/app/runtime.js` and `src/app/loop.js` are not the production boot path; engine systems are not registered to reproduce the current simulation.
- UI/progression side effects inside `Timeline` and `gameTick` are the most important ownership debt.

### UI

- `src/ui/viewport.js` remains the large orchestration renderer.
- Cosmos, Forge, resource, navigation, objective, Chrono, Codex, and stellar helpers provide increasingly focused presentation contracts.
- Dirty checking reduces work, but several render paths still rewrite combined text or rebuild child collections.

### Persistence

- `src/state/serialization.js` recursively tags/revives `Decimal` and `Set` values.
- `src/core/persistence.js` serializes before JSON/string storage, migrates supported saves, normalizes via state replacement, separates normal and playtest keys, caps loaded offline progress at eight hours, and quarantines corrupt active saves.
- Import/export uses base64 around serialized JSON. Import currently accepts only the exact current save version rather than running the normal migration path.

## Current UI/UX contract

| Surface | Ownership |
| --- | --- |
| Cosmos | Current universe state, active process, and immediate action. |
| Forge | Current-run construction, upgrades, cost, contribution, and buy decisions. |
| Legacy | Supernova/meta progression, permanent rewards, and loadout. |
| More | Archive/Codex, settings, save/import/export, and utility. |
| Objective | What the player should do next. |
| Chrono | Short event context and meaning. |
| Codex | Deeper explanation and reference. |

Navigation is progressively disclosed and limited to the currently relevant destinations. Resource presentation uses Primary/Support/Details rather than a flat wall. Era-specific Cosmos presentation emphasizes the active process; Era II is bottleneck-oriented and Era III is temperature-centered. Mobile navigation is fixed and safe-area-aware. Semantic buttons, ARIA state, 44 px actionable controls, narrow-header behavior, and both system and in-game reduced-motion preferences are covered by contracts.

Remaining UI debt:

- `Viewport` still owns broad cross-domain rendering and direct DOM decisions.
- Source-level CSS tests cannot prove real-device reflow, focus order, or readable wrapping.
- Some later-era/prototype UI can be reached in code without being a supported P3 experience.

The formerly affected live surfaces now separate semantic labels from values, reserve width through logical `ch`-based tracks, use compact formatting and tabular numerals, and retain keyed DOM nodes. This is a permanent invariant, not a one-off styling choice.

## Test inventory

The suite contains **41 files and 209 executed tests**. Counts below are source-level declarations; parameterized cases make the executed total higher. Cost is relative and based on suite structure and a full local run, not a stable benchmark.

| File | Decl. | Domain / type | Durable protection | Cost | Disposition |
| --- | ---: | --- | --- | --- | --- |
| `canvas_dispatch.test.js` | 1 | UI integration/regression | Canvas epoch dispatch | Low | KEEP |
| `economy.test.js` | 2 | Unit | Economy calculations | Low | KEEP |
| `engine.test.js` | 4 | Unit | Engine dispatch/tick/state contract | Low | KEEP |
| `era1.test.js` | 7 | Domain/integration | Era I commands and Inflation authority | Low | KEEP |
| `era2.test.js` | 3 | Domain/unit | Era II commands | Low | KEEP |
| `era3.test.js` | 3 | Domain/unit | Era III commands | Low | KEEP |
| `era4.test.js` | 5 | Domain/unit | Prototype Era IV/V commands | Low | KEEP, label support boundary |
| `era5.test.js` | 1 | Domain/unit | Prototype Era V command | Low | MERGE with later-era suite |
| `events.test.js` | 1 | Unit | Event dispatch architecture | Low | KEEP |
| `p2b_stellar.test.js` | 7 | Domain/simulation | Stellar simulation/build outcomes | Medium | MERGE into Era III |
| `p2c_bot.test.js` | 4 | Large simulation | Automated playthrough and failure modes | Very high | MOVE to periodic/full |
| `p2c_codex.test.js` | 18 | Content/unit | Codex entries and unlocks | Low | KEEP, rename eventually |
| `p2c_command.test.js` | 6 | Domain/integration | Supernova command authority | Low | MERGE into Era III/Legacy |
| `p2c_supernova.test.js` | 5 | Domain/unit | Supernova outcomes/rewards | Low | MERGE into Era III/Legacy |
| `p2c_ui.test.js` | 8 | UI contract | Supernova terminal states | Medium | MERGE into Legacy UI |
| `p3_bootstrap.test.js` | 5 | Source/regression | Boot ordering and production wiring | Low | REWRITE behaviorally |
| `p3_coherence_semantics.test.js` | 7 | Domain/UI contract | Coherence mechanics/presentation boundary | Low | KEEP, rename by domain |
| `p3_cosmos_experience.test.js` | 12 | UI contract | Era-specific Cosmos presentation | Medium | KEEP, rename by surface |
| `p3_era2_progression.test.js` | 1 | Integration | Era II progression route | Medium | MERGE into Era II |
| `p3_feedback.test.js` | 3 | UI regression | Contextual feedback/no toast behavior | Low | MERGE into UI contract |
| `p3_followup.test.js` | 2 | Regression | Historical P3 fixes | Low | MERGE; milestone name has no durable domain |
| `p3_followup2.test.js` | 3 | Regression | Historical P3 fixes | Low | MERGE; milestone name has no durable domain |
| `p3_followup3.test.js` | 7 | Integration/UI | Era II economy and safe rendering | Medium | MERGE into Era II/UI |
| `p3_forge_ux.test.js` | 8 | UI contract | Forge hierarchy and buying affordances | Medium | KEEP, rename by surface |
| `p3_layout_narrative_hotfix.test.js` | 3 | Source/UI regression | Layout/narrative continuity | Low | REWRITE and merge |
| `p3_mobile_regression_hotfix.test.js` | 7 | Source/UI regression | Mobile structure and safe actions | Medium | REWRITE/merge into responsive UI |
| `p3_narrative.test.js` | 3 | Domain/content | Narrative progression | Low | KEEP, rename by domain |
| `p3_navigation_architecture.test.js` | 11 | UI contract | Progressive navigation/meta ownership | Medium | KEEP, rename by surface |
| `p3_persistence_corruption.test.js` | 6 | Integration/regression | String serialization and corrupt-save recovery | Low | KEEP, merge into persistence |
| `p3_playtest.test.js` | 3 | Integration | Save isolation and timing controls | Medium | KEEP, rename by domain |
| `p3_resource_hierarchy.test.js` | 13 | UI contract | Era-specific resource hierarchy, compact formatting boundaries, and persistent live-value nodes | Medium | KEEP, rename by surface |
| `p3_runtime_dom.test.js` | 3 | DOM integration | Initialization and boot DOM safety | Medium | KEEP/REWRITE with browser harness |
| `p3_scrolling.test.js` | 3 | Source/UI regression | Scrolling structure | Low | REWRITE as layout/browser test |
| `p3_ui_hierarchy.test.js` | 6 | UI contract | Global hierarchy/Core focus | Medium | MERGE into surface suites |
| `p3_ui_truth_contract.test.js` | 7 | Integration/UI | State agreement, presets, transition truth | Medium | KEEP, rename by contract |
| `p3_visual_polish.test.js` | 3 | CSS source contract | Responsive/reduced-motion tokens | Low | REWRITE as browser behavior |
| `persistence.test.js` | 1 | Unit | Basic persistence behavior | Low | MERGE into persistence |
| `save_migration.test.js` | 7 | Integration | Save migration/normalization | Low | KEEP |
| `smoke.test.js` | 1 | Smoke | Minimal module/runtime health | Low | KEEP |
| `timeline.test.js` | 1 | Unit | Timeline chunking/progression | Low | EXPAND after ownership refactor |
| `transitions.test.js` | 1 | Unit | Transition eligibility | Low | EXPAND/MERGE with era transitions |

No test is an immediate delete candidate without first moving its durable assertion. The primary problem is organization and assertion quality, not raw count.

### Test creep

- P3 history is now long-term structure: 21 files begin with `p3_`, and several more retain P2 milestone names.
- Follow-up/hotfix names do not answer what durable behavior is protected.
- Bootstrap, scrolling, visual-polish, and portions of mobile/navigation tests inspect source strings or CSS tokens. They catch accidental deletion but cannot establish rendered behavior.
- Persistence, Supernova, UI hierarchy, and Era II progression are split across overlapping milestone and domain suites with repeated state/DOM setup.
- The bot repeats long simulations that are valuable for progression/balance confidence but disproportionate for a fast lane.

Under-tested durable behavior:

- Automated real-browser geometry/CLS across viewport, font, and device matrices; the final fix was manually measured, while repository tests protect its DOM/formatting prerequisites.
- End-to-end localStorage/sessionStorage, clipboard import/export, corrupt-data UX, and offline catch-up.
- Keyboard traversal, focus visibility/restoration, and screen-reader announcements across dynamic surfaces.
- Service-worker update/reload behavior.
- The supported/unsupported boundary for Era IV/V.
- Equivalence between the unused engine loop abstraction and the actual scheduler—currently there is no equivalence to test.

## Runtime and CI lanes

A full local run completed in roughly 114 seconds on the audit machine. UI contract files commonly take around 0.6–0.8 seconds because of DOM/module setup. `p2c_bot.test.js` took roughly 112 seconds and permits multi-million-tick simulations, so it should not set fast-feedback latency.

Recommended lanes:

- **FAST CI — every PR/push:** lint; build; engine, state, economy, era commands, eligibility, migration, presentation selectors, focused DOM contracts, and short smoke/integration tests.
- **FULL CI — main/release:** all fast checks plus the complete current 209-test suite and broader DOM/playtest integration.
- **PERIODIC/MANUAL — scheduled or balance work:** large bot playthroughs, multi-build balance comparisons, telemetry sweeps, and device/browser matrices.

This is a recommendation only; the repository currently has one validation/deploy workflow.

## GitHub Actions

`.github/workflows/deploy-pages.yml` runs on pushes to `main` and manual dispatch. It checks out code, uses Node 22 with npm caching, runs `npm ci`, lint, the full test suite, and build, uploads `dist`, then deploys through a dependent job.

- Validation correctly gates deployment: the deploy job `needs` the build/validation job, so Pages cannot deploy before required checks pass.
- There is no pull-request validation workflow and no separate fast/full/periodic lane.
- npm caching is enabled through `setup-node`; the workflow does not duplicate installation/build work.
- Permissions are valid but could be reduced from workflow scope to per-job scope.
- Current action majors should be reviewed on a normal maintenance cadence; no blocking obsolete-action failure was observed in repository configuration.
- Every successful `main` push is a production deployment, increasing the value of a PR validation lane and protected branch policy.

## Persistence safety

The historical `[object Object]` class is **genuinely prevented in known current write paths**:

- `saveGame()` applies `serializeState()` and `JSON.stringify()` before `localStorage.setItem()`.
- Playtest session backup applies the same serialization/stringification discipline.
- Searches found no `localStorage.setItem(key, object)` or `sessionStorage.setItem(key, object)` call.
- Load explicitly rejects the literal `[object Object]`, quarantines corrupt raw data, removes the active key, and restores normalized defaults.
- Decimal and Set round trips are tagged recursively by `src/state/serialization.js`.

Residual risks are not normalization failures:

- Imported saves must match the exact current version, unlike normal saved games that use migrations.
- Session backup restore has a thinner error/reporting boundary than normal persistence.
- Quarantined corrupt saves can accumulate.
- A missing migration step can stop the loop before the resulting state is normalized, making migration-chain maintenance important.
- Real-browser storage quota/clipboard-denial paths have limited coverage.

## Dependency and cycle audit

Material risks:

- `src/main.js`, `src/core/playtestBot.js`, `src/ui/viewport.js`, and `src/ui/stellar.js` suppress `import/no-cycle` broadly.
- `playtestBot` imports `getAIState` from `main.js` while `main.js` also composes the bot and UI. This binds headless automation to the browser composition root.
- `Timeline` imports UI objective behavior and emits DOM/window effects, creating a core-to-UI dependency.
- `Viewport` imports across core, engine, and era domains and remains a high-change dependency hub.

Healthy boundaries worth preserving:

- Quantum upgrade eligibility is isolated from economy calculation, avoiding the former economy ↔ selector cycle.
- Presentation selector modules derive data without owning command mutation.
- Runtime replacement subscription keeps engine and UI state identity aligned.

No value comes from removing every cycle mechanically. Resolve only the cycles that obscure runtime ownership or prevent headless simulation.

## `main.js` audit

`src/main.js` is the actual application composition root, scheduler, autosave/render coordinator, compatibility surface, dev entry point, and telemetry adapter. At roughly 1,100 lines, it contains responsibilities now partially owned elsewhere:

- legacy action wrappers and browser globals;
- dev/playtest helpers and PWA reload state;
- direct state-derived AI/telemetry calculations;
- simulation scheduling and render dirty-checking;
- compatibility/error markup and initialization behavior.

The critical correctness boundary for the player remains command/eligibility modules, but `getAIState()` contains a simplified Inflation readiness calculation and can mislead bots/telemetry. Classify that as P1 pre-P4 because automated evidence must agree with gameplay truth. Compatibility globals and old helpers are P2/P3 unless proven unused through a dedicated cleanup.

## Timeline ownership

`src/core/timeline.js` and its exported `gameTick()` currently mix:

- Era simulation dispatch and chunking;
- artifact and Coherence effects;
- narrative milestones and Chrono DOM updates;
- objectives;
- achievements/window events;
- mission/rank progression.

The chunking and tested Era I–III simulation are safe technical debt for P3. The core-to-UI side effects, duplicate runtime abstraction, and inability to run a pure authoritative tick are **must fix before P4**. The refactor should preserve ordering in characterization tests before moving ownership.

## Repository hygiene

| Level | Items |
| --- | --- |
| P0 | None confirmed. |
| P1 | Historical findings: duplicate runtime story, core/UI side effects, AI eligibility drift, and later-era Coherence overload. The Coherence item was resolved in S5.5; see the post-audit resolution note. |
| P2 | Broad cycle suppressions; large composition modules; milestone test names; source-regex UI tests; exact-version import; misleading runtime/offline comments; prototype UI paths. |
| P3 | Compatibility aliases/globals, historical test descriptions, supported migration residue, small duplicated formatting/helpers. |

No abandoned telemetry scripts or untracked artifacts were present. No files should be deleted based on this audit alone.

## Resolved live-data layout contract

`d400a95` closed the live-value/text jitter. The repository evidence is distributed across `style.css`, `index.html`, `src/ui/resourceHud.js`, `src/ui/cosmosExperience.js`, `src/ui/viewport.js`, and the related P3 UI tests.

Permanent rule:

```text
STATIC SEMANTIC CONTENT
  → stable layout anchor

LIVE NUMERIC CONTENT
  → bounded compact formatting
  → reserved logical geometry
  → persistent/keyed DOM node
  → independent update
```

Required invariants:

1. Labels and live values have separate DOM ownership.
2. Player-facing formatting is bounded around digit/suffix thresholds.
3. Frequently changing values occupy reserved logical geometry; surrounding labels do not depend on intrinsic live width.
4. `99 → 100`, `999 → 1,000`, `999,999 → 1.00M`, `99.9% → 100%`, `Locked → Ready`, and `○ → ✓` must not move static anchors.
5. Stable rows/cards/labels persist; renderers update live descendants and only replace children when identity/order actually changes.
6. `font-variant-numeric: tabular-nums` supplements the contract but cannot replace reserved geometry.
7. Flex distribution, centered composite strings, `auto` tracks, status widths, and icon widths must be reviewed whenever new live metrics are introduced.

Current regression protection covers compact formatter boundaries, persistent resource/check/requirement nodes, fixed logical tracks, and objective comparison ownership. A future browser harness should convert the manual `getBoundingClientRect()`/device checks into automated geometry assertions.

## Behavioral coverage matrix

| Area | Assessment | Evidence and gap |
| --- | --- | --- |
| State identity/replacement/normalization | ADEQUATELY TESTED | Engine, UI truth, migration, and preset tests agree on one runtime proxy; more real-browser load/import coverage is still useful. |
| Serialization, Decimal/Set revival, migrations, corrupt saves | ADEQUATELY TESTED | Unit/integration coverage includes literal `[object Object]` quarantine; storage quota and clipboard/session failures remain thin. |
| Era I eligibility, production, Coherence, Inflation | ADEQUATELY TESTED | Domain, coherence, narrative, transition, and bot suites cover current path. |
| Era II production, recipes, decay, cooling, Recombination | ADEQUATELY TESTED | Shared evaluator and progression tests cover the chain and alternative transition route; files overlap. |
| Era III temperature, fusion, Supernova, Galactic Ignition | ADEQUATELY TESTED | Stellar simulation, commands, Legacy UI, transition truth, and bot coverage are broad; organization is fragmented. |
| Navigation, Cosmos, Forge, resources, objectives | OVER-TESTED BY FILE COUNT / ADEQUATE BY BEHAVIOR | Many durable contracts exist, but milestone/hotfix suites and source assertions duplicate setup and obscure ownership. |
| Live metric geometry | ADEQUATE PREREQUISITE COVERAGE / UNDER-TESTED IN BROWSER | Formatting and stable-node contracts are durable; automated layout-shift/device measurement is missing. |
| Accessibility and responsive behavior | UNDER-TESTED | Semantic/source contracts exist; keyboard, screen-reader, focus restoration, and real-device wrapping need browser coverage. |
| Deterministic/long-run simulation | OVER-TESTED IN DEFAULT LANE | Valuable bot coverage dominates runtime; move heavy telemetry without deleting the bounded progression signal. |
| Service worker/deployment artifact | UNDER-TESTED | Build succeeds, but update/reload behavior lacks an end-to-end test. |

## Recommended stabilization phases

| Phase | Goal and exact scope | Risk | Recommended Codex model / reasoning | Verification | Commit boundary |
| --- | --- | --- | --- | --- | --- |
| S1 — documentation baseline | Refresh audit, handover, decisions, GDD/TDD index, and release status only. | Low | Frontier coding model, high reasoning | Link/path audit, diff scope, lint/test/build | Audit commit; separate handover-baseline commit |
| S2 — runtime characterization | Add behavior-preserving traces for `gameTick`/`Timeline` ordering and make bot telemetry consume authoritative eligibility. No balance change. | Medium | Frontier coding model, high reasoning | Deterministic Era I–III traces, presets, full bot | Characterization tests first; eligibility correction second if needed |
| S3 — runtime ownership consolidation | Select the production loop, separate simulation/progression results from DOM effects, and retire unused runtime paths only after equivalence. | High | Frontier coding model, extra-high reasoning | Save/offline fixtures, all presets, deterministic simulation, complete bot and browser smoke | Small commits by state, tick, event, and composition boundary |
| S4 — test consolidation and CI lanes | Move milestone suites into durable domains, replace source assertions, add PR validation, and split fast/full/periodic execution. | Medium | Balanced coding model, high reasoning | Before/after discovery and assertion inventory; run every lane | Test organization separate from workflow changes |
| S5 — persistence/browser hardening | Decide import migration policy; cover storage, clipboard, session restore, offline, accessibility, and automated layout geometry. | High | Frontier coding model, high reasoning | Versioned fixtures plus real-browser round trips/device matrix | Dedicated persistence commit; separate browser-harness commit |
| S6 — final pre-P4 verification | Re-run P3 release matrix and confirm all P1 pre-P4 boundaries are closed or explicitly accepted. | Low | Balanced coding model, medium reasoning | Full CI, eight presets, first-run, save/import/export, real-device smoke | Verification/docs-only release commit |

S1 was the scope of this dated audit. S2/S3 later established the runtime extension boundary, and S5.5 made the later-era Coherence model explicit. Do not treat this historical phase plan as current handover state.
