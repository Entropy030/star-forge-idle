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

**Consequences:** It is hidden at fresh start and disclosed contextually. Fundamental Law upgrades do not falsely claim a Coherence requirement. Later-era reuse of the state field is debt, not a settled universal concept.

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
