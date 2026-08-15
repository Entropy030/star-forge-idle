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
