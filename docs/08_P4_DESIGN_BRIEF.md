# P4 Design Brief — Physical Agency, Contextual Cosmos, and Visual Causality

> **Document Status:** 🟢 APPROVED BY HUMAN REVIEW
> **Production Implementation:** READY FOR PHASE 1
> **Target Milestone:** P4 (Pre-P4 Decisions Productionization)
> **Authoritative Baseline:** `main` after PRE-P4.4 / D25 closure (commit `3f9c3a7`)


---

## 1. Executive Summary

Milestone **P4** translates the validated design decisions from the PRE-P4 research program into a single, cohesive production update for **Star Forge Idle**.

During PRE-P4 experimentation:
1. **PRE-P4.1** established single-authority command routing and canonical runtime history (D21).
2. **PRE-P4.2** established authoritative headless offline catch-up with player-authored decision gates (D22).
3. **PRE-P4.3** proved that **Model C (Contextual Quick Actions)** resolves Cosmos ↔ Forge navigation friction without layout duplication, and approved **Core Visual Causality** as a design principle (D23, D24).
4. **PRE-P4.4** validated that introducing three coarse physical postures (**`ACCUMULATE`**, **`BALANCE`**, **`CONDENSE`**) creates genuine player steering in Era II, while confirming **Handoff A (constant 250 H starting Hydrogen in Era III)** as the robust, non-exploitable cross-era transition contract (D25).

P4 integrates these verified capabilities into production code:
* **Era-II Physical Operating Postures:** Canonical state (`state.era2.posture`), authoritative command (`SET_PLASMA_POSTURE`), and simulation integration in `src/eras/plasma/evaluator.js`;
* **Model C Contextual Interventions:** Projecting contextually relevant physical actions and posture controls directly in Cosmos without duplicating Forge catalog or planning roles;
* **Era-II Star Core Visual Causality:** Making plasma thermodynamics, particle flux, and recombination readiness visibly readable on Canvas 2D with strict reduced-motion text equivalence;
* **Authoritative Recombination Handoff A:** Enforcing the constant 250 H baseline in production `TRIGGER_RECOMBINATION`.

P4 intentionally does **not** expand into Era IV (Galactic Matrix), redesign Era I or III, introduce new currencies, or alter the frozen P3 architectural contracts.

---

## 2. P4 Player-Facing Goal

### The Problem in Current Production (P3 Baseline)
* In **Era II**, player interaction is largely confined to the Forge upgrade shop. Once upgrades are purchased, the player waits passively for temperature or protons to advance. There is no coarse physical steering—cooling and matter production advance on fixed, unmodulated rails.
* Routine interaction requires frequent tab switching: observing a physical constraint in Cosmos, switching to Forge to buy an upgrade, and switching back to Cosmos to observe the result.
* The **Star Core** canvas displays decorative ambient pulses rather than communicating actual physical state (e.g. thermal stabilization vs. particle abundance).

### What the Player Experiences Differently After P4
1. **Physical Agency in Era II:** The player directly steers the primordial plasma state by selecting operating postures:
   * Switching to **`ACCUMULATE`** when raw Quarks and Gluons are needed to build infrastructure;
   * Switching to **`BALANCE`** for robust, unattended baseline progression;
   * Switching to **`CONDENSE`** when matter infrastructure is established and radiative cooling or hadron binding is desired.
2. **Contextual Flow in Cosmos:** The player can perform immediately relevant physical interventions and posture shifts directly from the Cosmos screen without leaving the physical context of the universe.
3. **Readable Visual Causality:** The Star Core visibly reflects the physical state of the universe—plasma agitation reflects matter flux, core color reflects thermal stabilization, and particle behavior reflects active binding.
4. **Transparent Recombination:** Recombination readiness is clearly messaged through both routes (Protons or Cooling), advancing into Era III with a predictable 250 H starting foundation.

---

## 3. Durable Inputs and Existing Decisions

P4 directly implements settled architectural and gameplay decisions recorded in [`DECISIONS.md`](../DECISIONS.md):

| Decision | Title | Durable Principle for P4 |
| :--- | :--- | :--- |
| **D20** | Vacuum Coherence ends with Era I | Era II uses Plasma Temperature; no generic cross-era coherence is stored or displayed. |
| **D21** | UI actions dispatch; commands mutate | Posture changes and contextual interventions dispatch canonical engine commands (`SET_PLASMA_POSTURE`, `BUY_UPGRADE_PLASMA`). |
| **D22** | Offline progression shares live authority | Selected posture persists and advances deterministically during offline catch-up. Recombination never auto-triggers offline. |
| **D23** | Contextual interaction model (Model C) | Cosmos projects contextually relevant actions; Forge retains browsing, planning, comparison, and bulk Buy 1/10/Max. |
| **D24** | Star Core visual causality | Semantic physical state modulates Canvas 2D rendering. Reduced-motion users receive equivalent semantic text/attributes (`#star-core[data-semantic-label]`). |
| **D25** | Era-II physical agency & Handoff A | Approved postures: `ACCUMULATE`, `BALANCE`, `CONDENSE`. Prototype multipliers remain provisional. Cross-era handoff is constant 250 H starting Hydrogen. |

---

## 4. Current Production Baseline

* **Runtime State:** Single reactive proxy in `src/core/state.js` initialized via `src/state/createInitialState.js`.
* **Save Version:** Version `17` in `src/state/migrations.js`. Default field merging in `src/state/schema.js` safely seeds new properties without requiring a save-version bump.
* **Era-II Simulation:** Single-step calculation in `src/eras/plasma/evaluator.js` called from `src/eras/plasma/simulation.js` during the authoritative 100ms / 1s tick.
* **Current Handoff Implementation:** `TRIGGER_RECOMBINATION` in `src/eras/plasma/commands.js` currently calculates starting Hydrogen via `protons.times(1.5).plus(electronBonus).max(250)`, which P4 Phase 4 will replace with constant 250 H.
* **Cosmos UI:** `src/engine/cosmosPresentation.js` derives pure read-only models; `src/ui/cosmosExperience.js` updates DOM nodes using stable keys.
* **Star Core:** Canvas 2D engine in `src/ui/canvasCore.js` with era-specific renderers (`drawEra1`, `drawEra2`, `drawEra3`).

---

## 5. P4 Scope

| Candidate Capability | P4 | Later | Not Needed | Evidence / Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Canonical Era-II Posture State** | **YES** | — | — | Required for physical agency; stores `state.era2.posture` (`'ACCUMULATE'` \| `'BALANCE'` \| `'CONDENSE'`). |
| **Authoritative `SET_PLASMA_POSTURE` Command** | **YES** | — | — | Preserves D21 single-mutation command architecture. |
| **Simulation Posture Integration** | **YES** | — | — | Modulates particle flux vs radiative cooling in `src/eras/plasma/evaluator.js`. |
| **Cosmos Posture Selector UI** | **YES** | — | — | Renders 3-way posture control in Cosmos with clear state feedback and compliant mobile touch targets. |
| **Model C Contextual Quick Actions** | **YES** | — | — | Projects contextually relevant actions directly in Cosmos (D23). |
| **Era-II Star Core Visual Causality** | **YES** | — | — | Connects plasma state to readable Canvas 2D presentation + ARIA text (D24). Era-III rendering compatibility preserved. |
| **Handoff A Production Enforcement** | **YES** | — | — | Enforces constant 250 H in `TRIGGER_RECOMBINATION` command, replacing legacy formula (D25). |
| **Reduced-Motion Core Fallback** | **YES** | — | — | Accessible static geometric representation + descriptive live attributes. |
| **Objective / Guidance Alignment** | **YES** | — | — | Minimal updates to Era-II objective copy to introduce posture awareness. |
| **Configurable Balance Multipliers** | **YES** | — | — | Exposes posture multipliers in configuration constants rather than hardcoding in logic. |
| *Posture Switching Cooldown / Penalty* | — | — | **NO** | PRE-P4.4 empirical verification showed no mathematical rapid-toggle advantage; adding friction is unjustified. |
| *B30 State-Derived Quality Handoff* | — | — | **NO** | Formally rejected in D25 due to low differentiation and post-readiness waiting incentives. |
| *Model E Persistent Split-Pane Stage* | — | **LATER** | — | Rejected for Cosmos scope in D23; may be reconsidered if Era IV Galactic Matrix requires it. |
| *Galactic Matrix / Era IV Gameplay* | — | **LATER** | — | Belongs to Post-P4 roadmap. |
| *Era I / Era III Strategic Overhauls* | — | — | **NO** | Era I and III are stable and verified in S6 baseline. |
| *New Global Notification / Toast System* | — | — | **NO** | Violates contextual information architecture; feedback belongs inline. |
| *Renderer Migration (WebGL / WebGPU)* | — | — | **NO** | Canvas 2D is lightweight, performant, and fully meets visual causality needs. |

---

## 6. P4 Non-Goals

To prevent scope creep and architecture drift, P4 explicitly excludes:
1. **NO Era-I or Era-III mechanical redesign:** Quantum Genesis and Stellar Evolution remain mechanically untouched.
2. **NO Era-IV (Galactic Matrix) implementation:** Scaffolding remains non-authoritative.
3. **NO new currencies or meta-layers:** Postures modulate existing physical rates; they do not introduce "posture points" or new tokens.
4. **NO Forge duplication in Cosmos:** Cosmos shows only contextually relevant actions; full browsing, comparison, and bulk purchases remain in Forge.
5. **NO universal recommendation engine:** Cosmos does not compute an "optimal next buy" or act as a universal NEXT button.
6. **NO automatic transition triggers:** Recombination, Supernova, and Inflation remain explicit player-clicked Observer milestones.
7. **NO WebGL/Three.js renderer overhaul:** Canvas 2D engine in `src/ui/canvasCore.js` remains the graphics foundation.
8. **NO save-version bump:** Field defaulting in schema normalization will handle `state.era2.posture` seamlessly on v17 saves.

---

## 7. Target Player Loop

```text
[OBSERVE PHYSICAL STATE]
       │  (Inspect Plasma Temperature, particle reserves, throughput in Cosmos)
       ▼
[UNDERSTAND CURRENT CONSTRAINT]
       │  (e.g., raw matter scarcity vs. thermal dissipation needs)
       ▼
[CHOOSE POSTURE OR RELEVANT INTERVENTION]
       │  (Select ACCUMULATE, BALANCE, or CONDENSE; or trigger contextually relevant action)
       ▼
[OBSERVE PHYSICAL CONSEQUENCE]
       │  (Star Core visual energy/cooling shifts; throughput numbers update)
       ▼
[ADJUST TRAJECTORY]
       │  (Shift postures or construct Forge infrastructure as physical state evolves)
       ▼
[DELIBERATELY TRIGGER RECOMBINATION]
       │  (Advance to Era III Protostar when readiness conditions are satisfied)
```

*Note: Contextual quick actions support this loop when an intervention is relevant, but are not a mandatory step for progression. Players can progress through posture decisions and standard Forge construction.*

---

## 8. Era-II Posture Production Contract

### Semantic Roles

```text
               ┌────────────────────────────────────────┐
               │                BALANCE                 │
               │   • Baseline throughput (1.0x)         │
               │   • Robust lower-attention mode        │
               └───────────────────┬────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
   ┌───────────────────────────┐       ┌───────────────────────────┐
   │        ACCUMULATE         │       │         CONDENSE          │
   │ • Raw matter accumulation │       │ • Thermal stabilization   │
   │ • Favors particle flux    │       │ • Favors radiative cooling│
   │ • Dampens cooling/binding │       │ • Favors hadron binding   │
   │ • Early-phase preparation │       │ • Late-phase transition   │
   └───────────────────────────┘       └───────────────────────────┘
```

#### 1. ACCUMULATE
* **Player Intent:** Build raw particle inventory (Quarks, Gluons, Leptons) to unlock or afford Forge upgrades.
* **Physical Effect:** Favors upstream particle synthesis rates; dampens radiative cooling and hadron binding.
* **Role in Loop:** Highly useful in early Era II before radiators exist, and during mid-Era II when stocking matter for significant infrastructure upgrades.

#### 2. BALANCE
* **Player Intent:** Predictable, unattended progression without active management.
* **Physical Effect:** Neutral baseline throughput (1.0x across all processes).
* **Role in Loop:** Baseline default for lower-attention progression and offline catch-up.

#### 3. CONDENSE
* **Player Intent:** Drive thermal stabilization, trigger Lepton decay, and bind Protons/Electrons into Hydrogen.
* **Physical Effect:** Favors radiative cooling and bound-state formation; dampens raw particle influx.
* **Role in Loop:** Primary driving posture for late Era II once matter infrastructure can sustain cooling and binding.
* **Recoverability:** Suboptimal posture choices (e.g. early `CONDENSE` before radiators exist) reduce efficiency but must never cause a permanent progress trap. Switching back to `ACCUMULATE` restores matter flux immediately.

### Calibration Parameter Schema (Illustrative Prototype Values)
P4 implementation will expose posture multipliers as named configuration constants rather than embedding hardcoded multipliers in calculation logic.

For illustrative reference only, the PRE-P4.4 prototype tested:
```javascript
// PROTOTYPE CALIBRATION EXAMPLE (PRE-P4.4)
export const PROTOTYPE_POSTURE_EXAMPLE = {
  ACCUMULATE: { particleFlux: 1.50, coolingMult: 0.50, bindingMult: 0.75 },
  BALANCE:    { particleFlux: 1.00, coolingMult: 1.00, bindingMult: 1.00 },
  CONDENSE:   { particleFlux: 0.50, coolingMult: 1.50, bindingMult: 1.30 }
};
```

P4 Initial Production Calibration (adjusted to eliminate the +2.5% arithmetic rapid-toggle binding advantage):
```javascript
// P4 INITIAL PRODUCTION CALIBRATION
export const PLASMA_POSTURE_CONFIG = {
  ACCUMULATE: { particleFlux: 1.50, coolingMult: 0.50, bindingMult: 0.70 },
  BALANCE:    { particleFlux: 1.00, coolingMult: 1.00, bindingMult: 1.00 },
  CONDENSE:   { particleFlux: 0.50, coolingMult: 1.50, bindingMult: 1.30 }
};
```
*(Exact production values remain subject to ongoing P4 tuning; the durable requirement is the directional semantic relationship).*


---

## 9. Cosmos Contextual Interaction Model (Model C)

### Principles of Contextual Interaction
* **No Universal Recommendation:** Cosmos does not compute an optimal next purchase or dictate player choices.
* **Context-Driven Projection:** A quick action appears only when an existing authoritative action is clearly relevant to the current physical state (e.g. an upgrade that directly relieves a starved process).
* **Direct Dispatch:** Clicking a contextual quick action dispatches the existing canonical engine command (`BUY_UPGRADE_PLASMA`) with standard eligibility/cost validation.
* **Forge Authority:** The full Forge remains the single surface for browsing the full upgrade catalog, comparing alternate branches, viewing detailed lore/scaling, and executing bulk purchases (Buy 1 / 10 / Max).

### Cosmos Interface Layout
1. **Universe Header / Primary Status:** Displays current epoch, active process status, and milestone progress.
2. **Star Core Canvas + Semantic Overlay:** Displays physical-state visualizer with accessible text and click/tap reaction.
3. **Posture Controller (Era II):** Segmented posture selector (`ACCUMULATE` | `BALANCE` | `CONDENSE`) with active state indicator and concise semantic role descriptions.
4. **Contextual Action Slot:** Displays an immediately relevant physical action when applicable (or milestone trigger when ready).
5. **Process Flow Summary:** Displays live input/throughput/output nodes.

---

## 10. Core / Physical Visual Causality

### A. Semantic Visual Requirements (Durable Contracts)
The Star Core must provide readable visual feedback corresponding to underlying physical state:

| Authoritative State | Semantic Requirement | Visual Feedback Direction | Accessible Fallback |
| :--- | :--- | :--- | :--- |
| **Thermal Intensity ($T$)** | Hotter plasma appears more energetic / thermally intense; cooler plasma appears stabilized. | Visibly communicates high thermal intensity/energy at high temperatures, transitioning to stabilized, concentrated emission as plasma cools. | `#star-core[data-thermal-state]` + descriptive text. |
| **`ACCUMULATE`** | Visibly communicates high matter influx and energetic agitation. | Increased particle agitation and outward flux. | `#star-core[data-posture="ACCUMULATE"]` + `"Posture: Accumulate"`. |
| **`BALANCE`** | Visibly communicates steady-state equilibrium. | Balanced harmonic orbital motion. | `#star-core[data-posture="BALANCE"]` + `"Posture: Balance"`. |
| **`CONDENSE`** | Visibly communicates inward concentration and thermal binding. | Compact core density and inward particle flow. | `#star-core[data-posture="CONDENSE"]` + `"Posture: Condense"`. |
| **Recombination Readiness** | Distinct from ordinary in-progress plasma. | Visibly communicates stable neutral gas formation, clearly distinguishable from in-progress energetic plasma. | `#star-core[data-transition-ready="true"]` + `"Recombination Ready"`. |

### B. Art & Animation Tuning (Production-Tunable)
The following visual parameters are explicitly designated as production-tunable during implementation and do not form rigid acceptance criteria:
* Exact RGB color values and gradient stops;
* Particle counts within the bounded particle pool (utilizing the existing CanvasCore `MAX_PARTICLES` engine limit of 200);
* Orbit velocities, pulse frequencies, and oscillation amplitudes;
* Exact intermediate thermal interpolation curves.


### Reduced-Motion Contract
Under reduced-motion preference:
* High-frequency oscillations, turbulence jitter, and rapid orbiting are disabled.
* Canvas 2D renders static geometric shapes and stable color states.
* Full informational equivalence is provided via DOM attributes (`data-semantic-label`, `data-posture`, `data-thermal-state`) and `aria-label`.

---

## 11. Information Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                                COSMOS                                  │
│  "What is my universe doing right now, and how do I steer it?"         │
│  • Live physical state & temperature                                   │
│  • Operating posture selector (ACCUMULATE / BALANCE / CONDENSE)        │
│  • Contextually relevant physical quick action                         │
│  • Milestone readiness status                                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│      FORGE       │      │    OBJECTIVE     │      │      CODEX       │
│ "How do I build  │      │ "What should I   │      │ "Why does this   │
│  my capacity?"   │      │  aim for next?"  │      │  work this way?" │
│ • Complete shop  │      │ • Single clear   │      │ • Reference &    │
│ • Buy 1/10/Max   │      │   strategic goal │      │   astrophysics   │
│ • Upgrade paths  │      │ • Objective hints│      │ • Unlocked lore  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

* **Inline Feedback:** Action results appear inline within the relevant card (`aria-live="polite"` status). No floating toasts or snackbars.
* **Minimal Objective Scope:** Era-II objective copy receives concise updates to acknowledge posture steering. Deeper narrative lore remains in the Codex.

---

## 12. Recombination Experience

1. **Dual Route Clarity:** Cosmos displays progress toward both Recombination routes:
   * Route A: Protons accumulated ($P \ge 800,000$).
   * Route B: Plasma cooled ($T \le 3,000\,\text{K}$).
2. **Deliberate Transition:** When ready, the contextual action slot provides `[Initiate Cosmic Recombination]`. Activating the action displays the existing narrative transition overlay (`startEraTransition`) before advancing to Era III. No redundant pop-up confirmation modals are introduced.
3. **Handoff A Enforcement:** `TRIGGER_RECOMBINATION` sets starting Hydrogen in Era III strictly to constant **$250\,\text{H}$** (D25), replacing the legacy variable formula.

---

## 13. Offline Behavior

### Explicit Offline Posture Contract
* **Persistence of Choice:** The player's currently selected posture (`state.era2.posture`) remains active throughout authoritative offline simulation (`advanceGameTick()`).
* **No Auto-Switching:** Offline progress advances deterministically under the active posture and does not automatically alter the player's choice.
* **No Auto-Transition:** Recombination readiness can be reached offline, but the transition never auto-executes without player consent.
* **Briefing Summary:** The return briefing (`WHILE YOU WERE AWAY`) summarizes physical changes accumulated under the active posture.

---

## 14. State, Command, and Persistence Contract

### Canonical State Schema
* Property: `state.era2.posture` in `src/state/createInitialState.js`.
* Allowed Values: `'ACCUMULATE' | 'BALANCE' | 'CONDENSE'` (Default: `'BALANCE'`).
* Normalization: `src/state/schema.js` defaults missing or invalid values to `'BALANCE'`.

### Authoritative Command
* Command: `SET_PLASMA_POSTURE` registered in `src/eras/plasma/commands.js`.
* Validation: Rejects if `state.activeEpoch !== 2` or posture value is invalid.
* Mutation: Sets `state.era2.posture` and emits `PLASMA_POSTURE_CHANGED` event.

### Simulation Integration
* `computePlasmaStep(state, dt)` in `src/eras/plasma/evaluator.js` reads `state.era2.posture` and applies configured multipliers to particle flux, cooling, and binding.

### Persistence
* Save Version: **Remains `17`** (supported via schema normalization).

---

## 15. Accessibility and Mobile Contract

* **Mobile Touch Targets:** Primary controls (posture selectors and quick-action buttons) must satisfy standard minimum touch targets (`>= 44px` effective height).
* **Keyboard Navigation:** Posture selection supports standard keyboard interaction (Tab navigation and Space/Enter selection, or standard radio arrow navigation).
* **Visible Focus:** Compliant visible focus indicators (`:focus-visible`) across all interactive posture selectors, quick actions, and milestone buttons.
* **Non-Color Indicators:** Active posture is distinguished by text weight, high-contrast borders, active indicators, and background shading.
* **Mobile Geometry & Stability:** No horizontal overflow or layout clipping at the established 390×844 mobile viewport baseline; reserved dimensions in layout containers ensure state changes do not cause observable layout shifts.

---

## 16. Balance and Tuning Boundaries

### Durable Design Contract (Settled)
* `ACCUMULATE` favors matter / particle acquisition and dampens cooling/binding.
* `BALANCE` provides viable, robust lower-attention progression.
* `CONDENSE` favors cooling and binding while dampening raw matter influx.
* Deliberate posture use must provide meaningful situational advantage over passive fixed play.
* Suboptimal posture choices must remain recoverable without permanent progression traps.
* Handoff A is constant $250\,\text{H}$ starting Hydrogen in Era III.

### Production Tuning Questions (Resolved in P4 Implementation)
* Exact configuration values for posture multipliers;
* Measured progression pacing delta between deliberate posture play and fixed `BALANCE`;
* Tuning the efficiency difference of suboptimal choices to feel noticeable without being punitive;
* Legibility of posture effects across early vs. late Era-II upgrade levels.

---

## 17. Telemetry and Playtest Questions

### Automated Verification Metrics (CI / FAST / TELEMETRY)
1. Run-to-completion verification across strategy matrix (`DELIBERATE_A_TO_B_TO_C`, `FIXED_BALANCE`, `FIXED_ACCUMULATE`).
2. Empirical verification that rapid toggling provides no mathematical advantage over steady posture play.
3. Verification that offline catch-up produces identical mathematical outcomes to live tick advancement.

### Human Playtest Hypotheses (Qualitative Validation)
* Do players understand when to shift between matter accumulation and thermal cooling?
* Is `BALANCE` perceived as a legitimate low-attention option?
* Do players feel physical agency through the posture controls?
* Does the Star Core visual feedback clearly communicate cause and effect?

---

## 18. Risks and Mitigations

| Risk | Early Warning Signal | Mitigation |
| :--- | :--- | :--- |
| **Cosmos Visual Density** | Layout crowding on 390px mobile viewports. | Strict single-column hierarchy; compact process node layout. |
| **Early Suboptimal Play Confusion** | Player selects `CONDENSE` before building radiators and progress slows. | Contextual guidance in Cosmos explains that matter production is dampened in Condense posture. |
| **Accidental Recommendation Creep** | Adding logic that computes "best" purchases in Cosmos. | Enforce strict Model C guardrail: Cosmos projects immediate relevance, Forge owns planning. |
| **Save Deserialization Anomaly** | Missing posture property on older saves causes runtime errors. | Robust schema normalization with default `'BALANCE'` fallback in `src/state/schema.js`. |

---

## 19. Acceptance Criteria

### A. Functional & State
* [ ] `state.era2.posture` is canonically stored and normalized to `'BALANCE'` if missing.
* [ ] `SET_PLASMA_POSTURE` validates epoch and input, mutates state, and emits events.
* [ ] `computePlasmaStep` applies posture multipliers to flux, cooling, and binding.
* [ ] `TRIGGER_RECOMBINATION` grants exactly $250\,\text{H}$ starting Hydrogen in Era III.

### B. UI & Contextual Interaction (Model C)
* [x] Posture selector renders in Cosmos during Era II with clear active indicators.
* [x] Contextually relevant physical actions appear in Cosmos when applicable.
* [x] Clicking contextual actions dispatches canonical engine commands.
* [x] Full upgrade catalog, branch comparison, and Buy 1/10/Max remain in Forge.

### C. Visual Causality & Accessibility
* [ ] Star Core Canvas 2D visibly modulates thermal state and posture feedback.
* [ ] Reduced-motion mode provides equivalent semantic information via DOM attributes and text.
* [ ] Controls satisfy mobile touch target baseline (`>= 44px`), visible focus indicators (`:focus-visible`), and keyboard operability.
* [ ] 390×844 mobile layout exhibits zero horizontal overflow and no observable layout instability.

### D. Offline & Persistence
* [ ] Selected posture persists across save/load, reload, and offline catch-up.
* [ ] Offline simulation advances deterministically under the active posture without auto-triggering Recombination.
* [ ] Existing v17 saves load cleanly with zero data loss.

### E. Human Playtest Hypotheses (Non-Automated)
* Posture choices feel like meaningful physical interventions.
* Visual causality on the Star Core helps players understand thermal and matter state changes.
* Contextual quick actions reduce routine tab-switching friction without turning Cosmos into a planner.

---

## 20. Proposed Implementation Phases

```text
PHASE 1: Canonical State, Commands & Simulation Postures
  Scope: state.era2.posture, SET_PLASMA_POSTURE command, evaluator.js posture multipliers.
  Files: src/state/createInitialState.js, src/state/schema.js, src/eras/plasma/commands.js, src/eras/plasma/evaluator.js.
  Validation: Unit tests for command legality, posture modulation, and save normalization.

PHASE 2: Cosmos Posture Controls & Model C Contextual Actions
  Scope: Cosmos posture selector UI, contextual action rendering in cosmosExperience.js.
  Files: src/engine/cosmosPresentation.js, src/ui/cosmosExperience.js, src/ui/viewport.js, style.css.
  Validation: DOM tests, keyboard navigation, command dispatch verification.

PHASE 3: Era-II Star Core Semantic Visual Causality & Accessibility
  Scope: Canvas 2D state-driven rendering in canvasCore.js, reduced-motion fallbacks, ARIA sync.
  Files: src/ui/canvasCore.js, src/ui/viewport.js, index.html.
  Validation: Visual rendering tests, reduced-motion attribute verification, mobile geometry check.

PHASE 4: Recombination Handoff A Enforcement & Integration Validation
  Scope: Enforce constant 250 H starting Hydrogen in TRIGGER_RECOMBINATION (ensuring post-transition Hydrogen is strictly 250 H regardless of pre-transition Era-II Hydrogen residue), align Era-II guidance, full suite pass.
  Files: src/eras/plasma/commands.js, src/core/objectiveDefinitions.js, tests/.
  Validation: Complete FAST, FULL, and BROWSER test suites, documentation synchronization.
```


---

## 21. Open Questions

| Question | Classification | Impact | Proposed Resolution |
| :--- | :--- | :--- | :--- |
| **Q1: Exact Posture Multipliers** | `NEEDS BALANCE TEST` | Pacing and feel of deliberate vs. passive play. | Calibrate multipliers during Phase 1 & 4 via simulation benchmarks to achieve noticeable steering. |
| **Q2: Quick-Action Affordability Style** | `RESOLVED BY CONVENTION` | Visual clarity when player lacks funds. | Follow existing `cosmosExperience.js` convention: render button in disabled state with cost visible to preserve layout stability. |
| **Q3: Codex Entry Timing** | `NEEDS HUMAN DESIGN DECISION` | Narrative pacing. | Determine whether a dedicated Codex entry for Plasma Postures should be added in P4 or deferred to broader lore expansion. |

---

## 22. Design-Approved vs. Production-Implemented Matrix

| Feature Area | Design Approved? | Implemented in Production? | P4 Milestone Target |
| :--- | :---: | :---: | :---: |
| **Model C Contextual Quick Actions** | **YES (D23)** | **YES (Phase 2)** | **Implemented in P4 Phase 2** |
| **Era-II Core Visual Causality** | **YES (D24)** | NO | **Implement in P4 (Phase 3)** |
| **Era-II Operating Posture Model** | **YES (D25)** | **YES (Phase 1 & 2)** | **Implemented in P4 Phase 1 & 2** |
| **Recombination Handoff A (250 H)** | **YES (D25)** | NO (Legacy formula active) | **Implement in P4 (Phase 4)** |
| **Offline Progression Parity** | **YES (D22)** | **YES** | **Preserve & Integrate in P4** |
| **Vacuum Coherence Era-I Only** | **YES (D20)** | **YES** | **Preserve in P4** |
| **Galactic Matrix / Era IV** | NO | NO | **Deferred to Post-P4** |
