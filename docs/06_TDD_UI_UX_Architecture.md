# TDD — UI/UX Architecture

## Surface contract

| Surface | Player question | Owns | Does not own |
| --- | --- | --- | --- |
| Cosmos | What is happening now, and what should I affect? | Current universe, process status, immediate action, Core context | Full upgrade shop, meta loadout, utility settings |
| Forge | What can I construct or improve this run? | Upgrade hierarchy, cost, contribution, buy controls, requirements | Permanent reset rewards or narrative reference |
| Legacy | What persists across stellar runs? | Supernova terminal, meta currencies/rewards, loadout | Current-run resource wall or save utilities |
| More | Where are reference and utilities? | Archive/Codex, settings, save/import/export | Primary progression actions |

Navigation exposes only relevant destinations and uses at most the current supported set. Do not add a permanent destination merely because a module exists.

## Guidance ownership

- Objective: a concise next action and progress.
- Chrono: a short event interpretation or change in meaning.
- Codex: deeper explanation unlocked for later reading.

An objective should not duplicate Codex prose. Chrono should not become a blocker checklist. Cosmos status can identify the active bottleneck but should not replace the objective.

## Era-specific Cosmos

- Fresh Era I is intentionally sparse and Core-focused.
- Later Era I introduces Vacuum Coherence only when it has acquisition/purpose context.
- Era II foregrounds the active recipe/cooling bottleneck rather than every particle equally.
- Era III foregrounds Core Temperature, the next physical threshold, and stellar action.

Vacuum Coherence is not a cross-era HUD metric. Era II/III and future Era IV/V presentation must use their native Temperature, Galaxy Stability, or Entropy semantics and must not expose the hidden v17 compatibility key as generic “Coherence.”

Presentation is derived in `src/engine/cosmosPresentation.js`. The renderer should not recreate readiness formulas.

## Resource hierarchy

`src/engine/resourcePresentation.js` groups current resources into:

- **Primary:** the value that best represents current progress.
- **Support:** active inputs/outputs or bottlenecks needed for the current process.
- **Details:** useful secondary information available on demand.

Meta currencies belong in Legacy, not the always-visible current-run HUD. Resource membership can change with Era/relevance, but current values must come from authoritative state.

## Forge hierarchy

Forge prioritizes the currently meaningful construction decision. Cards show name, level/state, cost, contribution/effect, and Buy 1/10/Max controls when supported. Locked cards remain compact but expose authoritative requirements. Actions dispatch commands; `forgePresentation` derives display data without mutation.

## Live-data layout contract

The final P3 invariant is:

```text
STATIC SEMANTIC CONTENT
  → stable layout anchor

LIVE NUMERIC CONTENT
  → bounded compact formatting
  → reserved logical geometry
  → persistent/keyed DOM node
  → independent update
```

On an authoritative state change, related title, instruction, progress, phase, transition status, and requirements update from the same snapshot, while unchanged semantic nodes retain identity.

Rules:

1. Stable labels and frequently changing values have separate DOM ownership.
2. Player-facing formatters bound values around suffix and digit thresholds.
3. Header, status, rate, requirement, and comparison values occupy explicit logical tracks instead of intrinsic `auto` width.
4. Renderers retain keyed cards/rows/labels and update live descendants. `replaceChildren()` is reserved for real identity/order changes.
5. Icons/statuses reserve width so `○ → ✓` and `Locked → Ready` cannot move adjacent labels.
6. Centered composite strings and `justify-content: flex-end`/`space-between` require special scrutiny because they can redistribute static content.
7. Tabular numerals are supplementary; they are not the layout guarantee.

The contract must hold across `99 → 100`, `999 → 1,000`, `999,999 → 1.00M`, `99.9% → 100%`, readiness changes, and supported unit suffixes. Tests protect formatting and DOM identity; browser/device checks protect actual geometry. Historical diagnosis and implementation evidence are in `P3_STABILIZATION_AUDIT.md#resolved-live-data-layout-contract`.

## Responsive and mobile

- At narrow widths the header prioritizes STAR FORGE and the full Era label; phase may hide rather than truncate.
- Fixed bottom navigation uses safe-area insets and shared `--bottom-nav-clearance` so content/actions are not obscured.
- Interactive controls target a minimum 44 px height/area where specified by current contracts.
- All supported presets must avoid horizontal overflow at 390 × 844 and remain usable at desktop reference widths.

Responsive behavior must be verified in a browser. CSS-token/source tests are guardrails, not proof of layout stability. New live metrics must be checked for stable anchors as well as overflow and clipping.

## Accessibility

- Preserve native semantic buttons and navigation controls.
- Keep ARIA current/expanded/pressed/disabled states synchronized with visible state.
- Maintain keyboard reachability, focus visibility, and meaningful labels.
- Do not encode state using color alone.
- Both system `prefers-reduced-motion` and in-game reduced-motion settings suppress nonessential motion without removing information.
- Details/disclosure content remains operable without pointer-only gestures.

Production-preview browser acceptance covers primary navigation, Core/Forge/More/Codex keyboard activation, focus retention and visible focus at desktop and 390 px, readiness/progress semantics, and reduced-motion media emulation. This is automated semantic accessibility coverage, not screen-reader certification. Manual screen-reader validation remains a release smoke activity.

## Feedback

The game uses contextual feedback near the Core, process, Forge card, or terminal. No generic toast notifications. Feedback must avoid excessive floating text/animation, remain understandable with reduced motion, and never be the only place an error or requirement is exposed.

## Offline return briefing

Cold-return facts appear in the Cosmos context as an ephemeral `WHILE YOU WERE AWAY` region. It derives only from stable before/after snapshots, load metadata, and collected domain events; it never mutates or persists gameplay state.

The region shows useful non-zero resource/physical changes, newly available transitions, discoveries/milestones, Observer decisions, paused automation, the eight-hour cap, and checkpoint failure when relevant. A sub-minute resource-only return remains hidden, but its credited simulation is still applied. The briefing is not a toast, does not steal focus, has a semantic heading and dismiss button, supports keyboard operation, uses no required motion, and collapses to one column at 390 px without covering primary actions.

## Contextual interaction direction (Model C — Approved, Implementation Pending)

Following PRE-P4.3 prototype evaluation (D23), **Model C (Contextual Quick Actions)** is the approved design direction for connecting the Cosmos universe view with immediately relevant player interventions.

The approved interaction model follows:

```text
CURRENT PHYSICAL CONTEXT
        ↓
IMMEDIATELY RELEVANT INTERVENTION
        ↓
EXISTING AUTHORITATIVE COMMAND
```

Guardrails:
1. **Cosmos vs. Forge Ownership:** Cosmos projects only the single immediate bottleneck action or next logical intervention. Full Forge remains authoritative for browsing, planning, branch comparison, alternate choices, and bulk purchasing (Buy 1 / 10 / Max). Cosmos must never become a duplicate Forge shop.
2. **Major Decision Boundary:** Model C must not act as a universal "NEXT" trigger for major irreversible or meta commitments. Supernova remains a player-authored Legacy decision; Inflation and Recombination remain explicit cosmic milestone triggers.
3. **Mobile Touch Target Contract:** Contextual quick action buttons must satisfy the repository mobile baseline of `>= 44px` effective touch height and area.
4. **Authority & Mutation:** Contextual selectors must be pure and read-only. Clicking a projected quick action dispatches the existing canonical engine command through `dispatchEngineCommand()` without bypassing eligibility or cost rules.
5. **Shared Economy & Eligibility Authority:** Presentation layers (Cosmos and Forge) must not reimplement or duplicate pricing, discount, eligibility, or readiness formulas. All purchase details (effective cost, currency, affordability, eligibility) and milestone readiness states derive from authoritative domain helpers (e.g. `getPlasmaUpgradePurchaseDetails`, `getRecombinationEligibility`). When an era milestone is ready, foundational upgrade quick actions are suppressed (`action = null`) to maintain focus on the explicit milestone transition.

## Star Core visual causality (Approved, Implementation Pending)

Following PRE-P4.3 prototype evaluation (D24), **Core Visual Causality** is approved as a durable UI/UX design principle: The Star Core / Universe View is primarily a physical-state visualizer. Meaningful physical state changes should create readable semantic visual changes where practical.

Contract:
1. **Semantic Derivation:** Authoritative numerical state maps to semantic physical state classes (e.g. quantum fluctuation density, plasma thermal stabilization, protostar core fusion phases) that modulate Canvas 2D rendering.
2. **Reduced-Motion Equivalence:** Every gameplay-relevant semantic visual state must retain complete informational equivalence under system or in-game reduced motion. High-frequency turbulence, orbital motion, and pulse rates are replaced with static geometry, distinct color gradients, and explicit accessible text attributes (`#star-core[data-semantic-label]`). Motion may enhance presentation, but must never be the exclusive medium for state comprehension.
