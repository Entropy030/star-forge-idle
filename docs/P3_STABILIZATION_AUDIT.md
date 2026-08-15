# P3 Stabilization Audit

Audit date: 2026-08-15

Audited revision: `332db8a` (`main`)

Scope: repository truth after P3.3C.1; documentation changes only

## Executive diagnosis

P3 has a coherent player-facing architecture and strong regression coverage for Eras I–III, but it is **not yet stable**. Real-device playtesting still shows live-number/text layout jitter. That is a meaningful, player-facing P1 defect and remains the release gate for P3.

No P0 correctness or data-loss defect was confirmed. The historical `[object Object]` persistence failure class is prevented in current write paths and covered by regression tests. The most important architecture debt is the coexistence of the real `main.js`/`gameTick` runtime with an unused engine-loop/runtime abstraction, plus mixed simulation, progression, narrative, and DOM ownership in `Timeline` and `gameTick`. Resolve those boundaries before extending the game into Era IV.

The test suite protects substantial durable behavior, but P3 milestone names have become permanent suite structure. Several tests assert source text or CSS tokens instead of observable behavior, and the large playtest bot is too expensive for a future fast PR lane. Documentation before this audit was materially behind the implementation, especially for Coherence, Era II, Supernova versus Galactic Ignition, runtime ownership, and persistence.

## Release gate

Status: **P3 NOT YET STABLE**

The gate closes only when:

1. The remaining real-device live-value/layout jitter is reproduced, fixed, and regression-tested at desktop and 390 px mobile widths.
2. Lint, the complete test suite, and the production build pass.
3. A focused first-run playtest confirms narrative continuity, stable layout, and save/load behavior.

The runtime-boundary work below is required before P4, but is not itself a claim that current Era I–III gameplay is broken.

## Findings by severity

### P0 — correctness or data loss

None confirmed.

### P1 — release or pre-P4 work

| Finding | Impact | Required boundary |
| --- | --- | --- |
| Live numeric values still move surrounding text/layout on real devices. | Player-facing visual instability; blocks calling P3 stable. | Fix and visually verify before closing P3. |
| Two runtime stories coexist: production boots through `src/main.js`, `gameTick`, and `Timeline`, while `src/app/runtime.js` and `src/app/loop.js` describe an unused engine-system loop. | A future contributor can implement behavior in the wrong runtime; P4 would deepen divergence. | Choose and document one simulation/composition path before P4. |
| `Timeline`/`gameTick` mix simulation with Coherence, objectives, milestones, achievements, missions, Chrono updates, DOM events, and other visual side effects. | Ordering is hard to reason about and headless simulation is coupled to UI behavior. | Separate pure simulation/progression results from presentation side effects before P4. |
| `main.js` is more than a composition root and includes compatibility globals, action wrappers, dev helpers, and duplicate telemetry calculations. `getAIState()` does not use the full authoritative Inflation eligibility contract. | Bot/dev telemetry can disagree with command eligibility even though player UI uses authoritative selectors. | Move or replace duplicate calculations; preserve one command/eligibility contract before P4. |
| `state.coherence` is an Era I player concept but is reused as temperature/stability/entropy input in later-era scaffolding. | Extending Era IV/V could silently cement unrelated meanings into one field. | Decide the later-era state model before P4; do not remove covered behavior casually. |
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

## Documentation inventory at audit start

| Document | Classification | Drift or purpose |
| --- | --- | --- |
| `README.md` | MISSING | No repository entry point or documentation index. |
| `HANDOVER.md` | MISSING | Current status, operating instructions, and known debt lived only in implementation history. |
| `DECISIONS.md` | MISSING | Product and architecture contracts were distributed across milestone prompts and tests. |
| `docs/01_GDD_Narrative_and_Philosophy.md` | PARTIALLY STALE | Treated Coherence as one universal cross-era mechanic and named obsolete Supernova currency. |
| `docs/02_GDD_Eras_and_Mechanics.md` | STALE | Mixed old implementation diary with mechanics; Era I units/requirements, Era II process, and Era III reset/transition semantics contradicted code. |
| `docs/03_TDD_Architecture_and_State.md` | STALE | Described an engine/runtime boundary not used by production, stale offline limits, and obsolete toast/UI assumptions. |
| `docs/04_TDD_Bot_and_Telemetry.md` | PARTIALLY STALE | Bot APIs remained real, but timing, playtest isolation, presets, and the distinction between regression and balance telemetry were incomplete. |
| `docs/05_Coherence_Semantics_Audit.md` | CURRENT / HISTORICAL | Accurate focused audit of current reads/writes and intentional uncertainty. Keep as a dated technical record. |
| `docs/PHYSICS_ABSTRACTION_GUIDE.md` | PARTIALLY STALE | Useful design framing, but some Era I/II examples and later-era language overstate current mechanics. Retain as design guidance, label accordingly. |

No additional planning/TODO/audit Markdown files were present. There was no durable UI/UX TDD or Testing/CI guide.

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

Remaining violations/debt:

- `Viewport` still owns broad cross-domain rendering and direct DOM decisions.
- Some static copy and live data remain joined in one node or dynamically reconstructed.
- Source-level CSS tests cannot prove real-device reflow, focus order, or readable wrapping.
- Some later-era/prototype UI can be reached in code without being a supported P3 experience.

## Test inventory

The suite contains **41 files and 208 executed tests**. Counts below are source-level declarations; parameterized cases make the executed total higher. Cost is relative and based on suite structure and a full local run, not a stable benchmark.

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
| `p3_resource_hierarchy.test.js` | 12 | UI contract | Era-specific resource hierarchy | Medium | KEEP, rename by surface |
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

- Real-browser reflow and the known jitter on actual viewport/font/device conditions.
- End-to-end localStorage/sessionStorage, clipboard import/export, corrupt-data UX, and offline catch-up.
- Keyboard traversal, focus visibility/restoration, and screen-reader announcements across dynamic surfaces.
- Service-worker update/reload behavior.
- The supported/unsupported boundary for Era IV/V.
- Equivalence between the unused engine loop abstraction and the actual scheduler—currently there is no equivalence to test.

## Runtime and CI lanes

A full local run completed in roughly 114 seconds on the audit machine. UI contract files commonly take around 0.6–0.8 seconds because of DOM/module setup. `p2c_bot.test.js` took roughly 112 seconds and permits multi-million-tick simulations, so it should not set fast-feedback latency.

Recommended lanes:

- **FAST CI — every PR/push:** lint; build; engine, state, economy, era commands, eligibility, migration, presentation selectors, focused DOM contracts, and short smoke/integration tests.
- **FULL CI — main/release:** all fast checks plus the complete current 208-test suite and broader DOM/playtest integration.
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
| P1 | Duplicate runtime story; core/UI side effects; AI eligibility drift; unresolved live UI jitter; later-era Coherence overload. |
| P2 | Broad cycle suppressions; large composition modules; milestone test names; source-regex UI tests; exact-version import; misleading runtime/offline comments; prototype UI paths. |
| P3 | Compatibility aliases/globals, historical test descriptions, supported migration residue, small duplicated formatting/helpers. |

No abandoned telemetry scripts or untracked artifacts were present. No files should be deleted based on this audit alone.

## Unresolved live-value/text jitter

Severity: **P1, P3 release-blocking UX defect**. It is not currently shown to be a gameplay correctness or persistence defect.

Likely surfaces to instrument in a separate debugging pass:

- `src/ui/viewport.js` Forge row updates: contribution/cost/button strings update frequently, requirement lists use `replaceChildren()`, and live prose can change wrapping.
- `src/ui/viewport.js` Era III process/action/rate sections: milestone text, action summaries, flare countdown, and rate strings interpolate live values into whole text/HTML fragments.
- `src/ui/stellar.js` Supernova status, blocked requirements, yield summaries, and action copy rewrite combined strings.
- `src/ui/resourceHud.js` meta-resource rows combine label and value in one text node; regions reorder/reinsert nodes with `replaceChildren()`; auto-sized card/grid content can still alter measured widths.
- `src/ui/cosmosExperience.js` progress labels combine current and target values, structure keys can rebuild the primary presentation when state changes, and reused requirement rows are reinserted.
- Objective/header status and progress nodes: centered or auto-sized parents can move adjacent copy even when label/value nodes are separate.
- `src/style.css`: centered flex/grid layouts, intrinsic/auto columns, insufficient `min-width`/reserved digit width, and wrap-sensitive live copy are candidate amplifiers.

This list is investigative context, not a root-cause claim. A follow-up should record device, font readiness, viewport, element bounding boxes, node replacement frequency, and layout-shift entries before changing CSS or markup.

## Recommended stabilization phases

1. **P3-S1 — live layout stability.** Reproduce and instrument jitter; isolate text-node, intrinsic-width, and node-replacement causes; add browser/device regression coverage. Risk: medium UI regression. Verification: desktop and 390 px real-device/browser matrix plus full validation. One focused fix commit.
2. **P3-S2 — runtime characterization.** Add characterization tests around current tick ordering and state/UI events; correct bot eligibility consumption without changing balance. Risk: medium. Verification: deterministic Era I–III traces and existing bot suite. Separate test and correction commits if needed.
3. **P3-S3 — runtime ownership consolidation.** Choose the production loop, separate pure simulation/progression outputs from UI effects, and remove misleading unused paths only after equivalence is proven. Risk: high. Verification: save fixtures, all presets, offline progress, deterministic simulations, full playthrough bot. Small commits by boundary.
4. **P3-S4 — test and CI lanes.** Rename/merge milestone suites, replace source assertions, introduce fast/full/periodic lanes and PR validation. Risk: medium CI/test-only. Verification: compare discovered tests and run each lane. Separate suite-organization and workflow commits.
5. **P3-S5 — persistence hardening.** Align import with supported migration policy and exercise browser storage/clipboard/session recovery. Risk: high due save data. Verification: versioned fixtures, corrupt payloads, real-browser round trips. Dedicated persistence commit.

Do not begin P4/Era IV until S1 closes the P3 release gate and S2/S3 establish a single safe extension boundary.
