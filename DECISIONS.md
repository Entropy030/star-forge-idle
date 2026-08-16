# Decision Log

This is a lightweight record of settled current contracts. Proposed work belongs in the audit or an issue, not here.

## D01 — One authoritative runtime state

**Decision:** `src/core/state.js` owns the live runtime state. Full replacements use `replaceRuntimeState()`.

**Why:** Header, objectives, transitions, terminals, presets, commands, and persistence must observe one state identity.

**Consequences:** Consumers must not retain stale state objects. Engine state is synchronized by replacement subscription. No second global store.

## D02 — Commands own gameplay mutation

**Decision:** Player gameplay mutations enter through engine command handlers organized by era.

**Why:** One command path can validate eligibility, mutate, and emit a consistent result.

**Consequences:** UI and presentation modules dispatch commands rather than recreating mechanics.

## D03 — Eligibility is authoritative outside UI

**Decision:** Domain eligibility selectors define readiness and requirements used by commands and presentation.

**Why:** A button, terminal, objective, bot, and command must not disagree.

**Consequences:** UI-specific readiness formulas and simplified telemetry copies are defects. Eligibility modules must avoid UI/runtime-instance dependencies.

## D04 — Presentation selectors do not mutate

**Decision:** Cosmos, resource, and Forge presentation selectors derive display models without changing gameplay state.

**Why:** Rendering must be repeatable and safe to test.

**Consequences:** State normalization and repair occur at creation/load/replacement boundaries, not during presentation.

## D05 — Top-level surface ownership

**Decision:** Cosmos owns current process/action; Forge current-run construction; Legacy meta/Supernova/loadout; More Archive/settings/save/utility.

**Why:** Each destination answers a distinct player question.

**Consequences:** Avoid duplicate controls and do not move current-run upgrades into Legacy or utility into Cosmos.

## D06 — Objective, Chrono, and Codex have separate jobs

**Decision:** Objective says what to do next; Chrono gives short meaning/context; Codex gives deeper explanation.

**Why:** Guidance remains actionable without turning the main screen into a lore wall.

**Consequences:** Objective definitions contain no long narrative prose or detailed diagnostic essays.

## D07 — Progressive disclosure

**Decision:** Navigation, resources, mechanics, and explanations appear when they become relevant.

**Why:** First-run comprehension matters more than exposing the complete system immediately.

**Consequences:** Fresh Era I stays sparse; new destinations and details require explicit relevance/unlock rules.

## D08 — Contextual feedback, no toast notifications

**Decision:** Feedback is placed near the action/process that caused it; the game does not use generic toast notifications.

**Why:** Context reduces interruption and preserves the Cosmos hierarchy.

**Consequences:** Observation, purchase, transition, and error feedback should update local status/visual state and respect reduced motion.

## D09 — Era-specific resource hierarchy

**Decision:** Resources are grouped into Primary, Support, and Details according to the active Era.

**Why:** A flat resource wall obscures the current bottleneck and next decision.

**Consequences:** Meta currencies stay in Legacy; details remain available without dominating Cosmos.

## D10 — Live data cannot own static geometry

**Decision:** Static semantic labels are stable layout anchors. Live values use separate persistent/keyed nodes, bounded compact formatting, and reserved logical geometry.

**Why:** Tabular numerals or split spans alone do not stop intrinsic tracks, flex redistribution, centered composite strings, status widths, or icon changes from moving surrounding content.

**Consequences:** Live updates change their owned descendants without rebuilding stable rows/cards. Static anchors must remain fixed across `99 → 100`, `999 → 1,000`, `999,999 → 1.00M`, `99.9% → 100%`, `Locked → Ready`, and `○ → ✓`. New live surfaces require desktop and narrow-mobile geometry verification.

## D11 — Vacuum Coherence is an Era I concept

**Decision:** Player-facing `Vacuum Coherence` means stability of the emerging vacuum/universe. It passively stabilizes, observation can accelerate it, and 100% is required for Cosmic Inflation.

**Why:** This gives the mechanic a concise acquisition/purpose identity.

**Consequences:** It is hidden at fresh start and disclosed contextually. Fundamental Law upgrades do not falsely claim a Coherence requirement. D20 resolves later-era ownership.

## D12 — Supernova and Galactic Ignition are distinct

**Decision:** Supernova is a repeatable Era III Legacy reset with meta rewards. Galactic Ignition is the permanent Era transition gate.

**Why:** Repeatable optimization and one-way progression serve different player decisions.

**Consequences:** UI, objectives, narrative, and tests must never present a Supernova as permanent Era advancement.

## D13 — Responsive navigation is fixed and safe-area-aware

**Decision:** Mobile uses the same progressively disclosed destinations in a fixed bottom navigation with shared safe-area clearance.

**Why:** Primary actions must remain reachable without content being obscured.

**Consequences:** New fixed UI must use the shared clearance contract; actionable controls target at least 44 px and reduced-motion preferences must remain honored.

## D14 — Playtest data is isolated

**Decision:** Playtest mode uses its own local save and a serialized session backup of the normal state; presets replace the complete normalized runtime state.

**Why:** Fast testing must not corrupt player progress or create split-state UI.

**Consequences:** Disabling playtest restores the backup and speed 1×. Preset/UI consumers may not manually patch state after replacement.

## D15 — The playtest bot owns strategy, not legality

**Decision:** Automated playtesting may choose priorities, timing, and profiles, but domain eligibility and command results decide whether an action is legal and successful.

**Why:** Telemetry is only trustworthy when automation and player-facing gameplay use the same prerequisites and transition contracts.

**Consequences:** The active bot consumes the Era eligibility APIs for Inflation, Laws, Recombination, plasma upgrades, and Supernova. Balance checks may guide strategy, but failed commands do not count as purchases or completed transitions. Bot-side copies of gameplay requirements are defects.

## D16 — One authoritative game-tick boundary

**Decision:** `src/core/runtimeTick.js::advanceGameTick()` is the single production/headless simulation and progression boundary. `main.js` owns wall-clock scheduling and injects browser effects; automation calls the same tick once before telemetry and strategy.

**Why:** Production and headless execution must share Era I Vacuum Coherence, narrative, Timeline, objective, achievement, and mission ordering without coupling domain code to DOM APIs.

**Consequences:** `Timeline` owns chunked Era simulation only. Narrative and achievement facts use an optional effect sink consumed by `src/ui/runtimeEffects.js`. Callers must not combine `advanceGameTick()` with separate `engine.tick()` or `Timeline.process()` advancement.

## D17 — Correctness and telemetry use separate validation lanes

**Decision:** FAST and FULL protect durable correctness contracts; TELEMETRY owns multi-million-tick strategy and balance simulations. `npm test` maps to FULL, while long simulations run weekly or manually and do not gate routine PRs or deployment.

**Why:** Test count and simulated duration are not quality targets. Fast feedback should retain all correctness coverage without making exploratory pacing evidence a multi-minute merge gate.

**Consequences:** Bot correctness uses bounded authoritative ticks and real commands. Long profiles remain easy to run, use test-only seeded randomness, and surface strategy/balance drift for investigation. Any correctness-critical long assertion must gain bounded FULL coverage before it can leave the telemetry lane.

## D18 — Browser acceptance is a separate required lane

**Decision:** Playwright runs against the built Vite production preview as the BROWSER lane. It complements FAST/FULL jsdom coverage and is required on pull requests, main pushes, and deployment.

**Why:** Web Storage, clipboard permissions, service workers, focus behavior, media preferences, and rendered geometry cannot be established reliably by source guards or jsdom alone.

**Consequences:** Contributors install Chromium with `npm run test:browser:install` and run `npm run test:browser`. CI installs Chromium explicitly. BROWSER does not enter TELEMETRY or slow the local FAST lane. Automated semantics do not replace manual screen-reader release smoke.

## D19 — Persistence failures preserve the active session

**Decision:** Browser storage/clipboard failures are contextual non-throwing results. Playtest save ownership changes only after a recoverable session backup exists; import replaces runtime state only after its active-slot write succeeds. Corrupt saves recover fresh and retain at most three quarantine diagnostics.

**Why:** A denied storage or clipboard API must not crash simulation, expose playtest state to the normal slot, or replace a usable in-memory universe with data that could not be persisted.

**Consequences:** Normal loads keep sequential migration support, while manual imports remain exact-current-version only. PRE-P4.2 consumes valid normal-save elapsed time through the authoritative tick and immediately checkpoints successful catch-up; import and playtest establish independent anchors.

## D20 — Vacuum Coherence ends with Era I

**Decision:** Select model D: Vacuum Coherence is authoritative only in Era I. Era II uses Plasma Temperature, Era III uses native stellar state, Era IV uses Galaxy Stability, and Era V uses Entropy. Later-era derived modifiers read those native sources without storing a second Coherence truth.

**Why:** The former mappings combined vacuum stabilization, thermal stress, stellar architecture, galactic stability, and inverse entropy under one property. These are not one continuous physical or player concept, and the later-era fields already provide clearer single sources of truth.

**Consequences:** Later eras neither mutate nor display generic Coherence. Era V derives its existing Bit multiplier directly from Entropy. The semantic adapters in `eras/quantum/coherence.js` isolate the historical storage name, and P4 extends native Era state rather than reusing it.

**Migration/compatibility impact:** Save version remains 17. `state.coherence` remains the serialized compatibility key for Era I Vacuum Coherence, and the existing legacy 0–1 normalization remains supported. No new migration is required; later-era saves may retain the historical value but do not interpret it.

## D21 — UI actions dispatch; commands mutate

**Decision:** Player-facing and dev action adapters may translate input and command results, but gameplay legality, affordability, costs, rewards, resets, and purchase mutation belong to registered commands. Runtime history is canonical state and uses `cosmicAge` as its timestamp source.

**Why:** Direct Core-node, Celestial-Card, Legacy-purchase, transition-history, and dev-eligibility copies created multiple places where one interaction could disagree with or bypass the engine.

**Consequences:** `Economy`, `src/core/actions.js`, and Cosmic-Tuning UI wiring are dispatch-only for migrated actions. Buy 1/10/Max is one command with one mutation sequence. The unused `core/botActions.js` copy is removed, while the remaining manual AI snapshot consumes authoritative eligibility selectors. Save version stays 17; normalization removes the abandoned Era-I `asymmetryBias`, `annihilationEnergy`, and `survivingMatter` keys while preserving `antimatterResidue` and other future compatibility state.

## D22 — Offline progression shares live gameplay authority

**Decision:** Valid normal cold returns credit at most eight wall-clock hours. Catch-up advances one-second logical chunks through `advanceGameTick()` with normal gameplay-time modifiers, while a deny-by-default offline context suppresses purchases, autobuy, stochastic auto-compress, flares, random rewards, and every major transition/reset command.

**Why:** Star Forge is an idle game, but readiness is not consent. Passive universe evolution should continue while Inflation, Recombination, Supernova, and Galactic Ignition remain player-authored decisions.

**Consequences:** Playtest speed never affects cold-return credit. Domain achievements, objectives, missions, narrative, and Codex reconcile headlessly; presentation effects are summarized once rather than replayed. Successful catch-up is checkpointed before live scheduling. The return briefing is ephemeral and never serialized. Storage failure preserves the caught-up in-memory universe but cannot promise durability beyond the existing storage boundary.

## D23 — Contextual interaction model (Model C)

**Decision:** Select **MODEL C — Contextual Quick Actions** as the approved product direction for the Cosmos ↔ Forge interaction model. **MODEL E — Persistent Universe Stage** is not selected for current production. Production implementation is pending completion of PRE-P4.4.

**Why:** Empirical browser measurements confirm Model C eliminates routine navigation friction (dropping from 2 tab switches and 3 navigation actions to 0 tab switches and 1 quick-action click per routine upgrade loop). The Star Core, active physical processes, and narrative objectives remain continuously visible during purchase decisions. Authoritative command dispatch is preserved with zero duplication of cost or eligibility logic. Desktop geometry remains a clean single column, and 390px mobile layout operates with zero horizontal overflow and compliant touch targets without requiring split-pane or glyph workarounds.

**Guardrails and Nuance:**
- **Contextual Action Guardrail:** The concept is `CURRENT PHYSICAL CONTEXT → IMMEDIATELY RELEVANT INTERVENTION → EXISTING AUTHORITATIVE COMMAND`. The full Forge remains authoritative for planning, browsing, branch comparison, alternate upgrades, and bulk purchasing (Buy 1 / 10 / Max). Cosmos must never become a duplicate Forge shop.
- **Major Decision Guardrail:** Model C must not become a universal "NEXT" button for all commitments. Supernova remains a deliberately player-authored Legacy/stellar-collapse decision on the Legacy surface. Inflation and Recombination transitions remain explicit cosmic milestone triggers.
- **Model E Nuance:** Model E was rejected for the current Cosmos ↔ Forge interaction scope because Model C resolves the measured friction at substantially lower layout and implementation cost. Persistent-world stage presentation is not universally banned and may be reconsidered if future Era-IV Galactic Matrix requirements justify it.
- **Status:** Design Approved; Production Implemented and Verified in P4 Phase 2 (Human Approved).

## D24 — Star Core visual causality

**Decision:** **CORE VISUAL CAUSALITY APPROVED** as a durable design principle: The Star Core / Universe View is primarily a physical-state visualizer. Meaningful physical state changes must create readable semantic visual changes where practical. Production implementation is complete in P4 Phase 3.

**Why:** Grounds abstract numerical progression in tangible cosmic phases (`AUTHORITATIVE GAMEPLAY STATE → SEMANTIC PHYSICAL STATE → READABLE VISUAL CONSEQUENCE`). Player actions produce immediate, readable visual reactions (pulse frequency, turbulence, ring coherence, corona arcs) on the Star Core canvas without requiring tab switches.

**Guardrails and Nuance:**
- **Specification vs. Principle:** The prototype's exact numeric thresholds, state strings, particle counts, RGB colors, and animation quantities were disposable experimental evidence, not final production specifications. Production contracts require the semantic mapping relationship, not literal prototype values.
- **Reduced-Motion Contract:** Every gameplay-relevant semantic visual state must retain complete informational equivalence under reduced motion. Nonessential particle turbulence and oscillation are replaced with static geometric alignment, distinct color gradients, and explicit accessible text (`#star-core[data-semantic-label]`). Motion may communicate state, but must never be the only channel conveying state.
- **Status:** Design Approved; Production Implemented and Verified in P4 Phase 3 (Human Approved).

## D25 — Era II physical agency and operating posture model

**Decision:** **ERA-II PHYSICAL POSTURE MODEL DESIGN APPROVED** as the approved product design direction for Era II. Retain **HANDOFF A (250 H constant baseline Starting Hydrogen)** for production. The tested B30 normalized-quality handoff formula is rejected. Production implementation is complete in P4 (Phases 1, 2, and 4).

**Conceptual Postures and Semantic Roles:**
- **ACCUMULATE:** Prioritizes raw matter / particle accumulation and infrastructure preparation (accelerates particle flux at the cost of thermal stabilization). Production calibration: `1.50 flux / 0.50 cooling / 0.70 binding`.
- **BALANCE:** Provides robust lower-attention progression without requiring active posture optimization (neutral baseline throughput: `1.00 flux / 1.00 cooling / 1.00 binding`).
- **CONDENSE:** Prioritizes thermal stabilization / binding and becomes increasingly useful once sufficient matter infrastructure exists (accelerates cooling and bound-state formation: `0.50 flux / 1.50 cooling / 1.30 binding`).

**Intended Design Rhythm:** Situational rather than symmetric (`build physical capacity → stabilize / convert physical state → reach Recombination`). No posture is universally optimal. Early `CONDENSE` is strongly inefficient when used before matter/radiator infrastructure exists, but verification proved it remains recoverable without deadlocking.

**Evidence Boundaries and Measured Results:**
- Standard Early Era-II state completed runs (prototype branch `antigravity/prototype-pre-p4-era2-agency`, commits `739a42c` and `b9de369`):
  - `DELIBERATE_A_TO_B_TO_C`: `356.2s`
  - `RECOVERY_WRONG_EARLY_40S`: `382.8s` (time delta: `+26.6s`)
  - `RAPID_TOGGLE_1S`: `427.6s`
  - `RAPID_TOGGLE_TICK`: `427.6s`
  - `FIXED_BALANCE`: `428.1s`
  - `FIXED_ACCUMULATE`: `520.1s`
  - `FIXED_CONDENSE`: `615.7s`
- **Durable Interpretation:**
  1. Deliberate posture use can materially improve progression (`356.2s` vs `428.1s`).
  2. `BALANCE` completes from the standard Early state (`428.1s`) and supports the intended lower-attention role.
  3. Incorrect posture choices are recoverable (`382.8s`, a delay of only `26.6s` over optimal play); no permanent build trap was demonstrated.
  4. **Rapid Switching Boundary:** Production calibration `ACCUMULATE.bindingMult = 0.70` produces arithmetic symmetry `(0.70 + 1.30)/2 = 1.00`, removing rapid-toggle optimization advantage.

**Handoff Decision and Rejection of Tested B30:**
- **Selected Handoff:** Handoff A (constant 250 H Starting Hydrogen in Era III).
- **Rejection Rationale:** The tested B30 normalized-quality handoff formula is rejected because across the standard successful strategy matrix ($n = 24$) it produced very little differentiation between otherwise distinct strategies (min 309 H, max 314 H, range 5 H, median 311 H, mean 311.42 H, std dev 1.44 H, relative separation 1.62%). Furthermore, in a separately tested high-matter reachable ready state, it was not invariant to post-readiness waiting (304 H at immediate trigger, 313 H at +60s, 311 H at +300s). Rejection is narrow to the tested formula; future cross-Era consequence mechanics are not permanently barred if a meaningful, non-exploitable design is developed.
- **Corrected Era-III Downstream Effect:** In Era III, the first Fuser node (cost 100 H) is affordable immediately (0.0s) under both 250 H and 309–314 H. The actual measured effect was additional initial Gravity-node purchasing capacity (250 H: Fuser + Gravity 1–4, initial rate 40 H/s, 1,000 H reached in 18.8s; B30 median 311 H: Fuser + Gravity 1–5, initial rate 50 H/s, 1,000 H reached in 13.8s, saving 5.0s / 26.6% on the initial 1,000 H ramp).

**Status:**
- `DESIGN APPROVED: YES`
- `PRODUCTION IMPLEMENTED: YES` (Implemented and Verified in P4 Phases 1, 2, and 4; Human Approved).

## D26 — UI Stock Whole-Number Formatting and Interaction Integrity (P5.1)

**Decision:**
1. **Visible Resource Stock Balances:** Truncate / floor positive visible stock balances to whole numbers across all player-facing surfaces (Cosmos, Forge, HUD, and Cards) to prevent misleading affordability indicators. The underlying authoritative state preserves full Decimal precision. Rates and multipliers retain meaningful decimals.
2. **Model-C Contextual Actions:** Cosmos quick action event listeners read the live dynamic action state (`element._currentAction`) rather than capturing stale closures, ensuring enabled quick actions dispatch reliably upon affordability transition without DOM reconstruction.
3. **Multi-Purchase Multipliers:** Stellar core nodes in Era-III Forge route through `Economy.buy('core', key)` to respect active `Buy 1`, `Buy 10`, and `Buy Max` purchase modes.
4. **Layout Geometry Stability:** Lock Codex / Archive navigation column width (`minmax(180px, 200px) minmax(0, 1fr)`) and enable robust word wrapping (`overflow-wrap: anywhere; word-break: break-word`) to prevent article selection from causing layout jitter.
5. **Reduced Motion Settings Simplification:** Remove redundant manual in-game toggle while preserving 100% OS-level `prefers-reduced-motion: reduce` compliance across CSS animations and CanvasCore rendering.

**Status:**
- `DESIGN APPROVED: YES`
- `PRODUCTION IMPLEMENTED: YES` (Implemented and Verified in P5.1; Human Approved).

**Deferred Design Finding (Resource Grammar):**
- Human review confirmed: `CROSS-ERA RESOURCE LOCATION CONTRACT: PARTIALLY CONSISTENT — VISUAL DIFFERENCES REMAIN` / `RESOURCE GRAMMAR: NEEDS DEDICATED UI NORMALIZATION`.
- Durable Principle: *"Era identity may change WHAT occupies a semantic information slot, but should not unnecessarily change WHERE the player looks for that slot."* Dedicated layout normalization scheduled for future UI milestone.

**Implementation Debt Note (Buy Max):**
- Global Buy Max uses the existing 10,000-loop sentinel convention (`EXISTING BUY-MODE IMPLEMENTATION DEBT`). Closed-form analytical pricing is deferred to future economy refactoring.

