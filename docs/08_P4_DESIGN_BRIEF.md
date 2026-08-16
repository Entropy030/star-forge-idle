# P4 Design Brief — Physical Agency, Contextual Cosmos, and Visual Causality

> **Document Status:** DRAFT FOR HUMAN REVIEW  
> **Production Implementation:** NOT STARTED  
> **Target Milestone:** P4 (Pre-P4 Decisions Productionization)  
> **Authoritative Baseline:** Post-S6 / Post-PRE-P4 (`f881a86`, `ada0229`)  

---

## 1. Executive Summary

Milestone **P4** translates the validated design decisions from the PRE-P4 research program into a single, cohesive production update for **Star Forge Idle**.

During PRE-P4 experimentation:
1. **PRE-P4.1** established single-authority command routing and canonical runtime history (D21).
2. **PRE-P4.2** established authoritative headless offline catch-up with player-authored decision gates (D22).
3. **PRE-P4.3** proved that **Model C (Contextual Quick Actions)** resolves Cosmos ↔ Forge navigation friction without layout duplication, and approved **Core Visual Causality** as a design principle (D23, D24).
4. **PRE-P4.4** validated that introducing three coarse physical postures (**`ACCUMULATE`**, **`BALANCE`**, **`CONDENSE`**) creates genuine player steering in Era II, while confirming **Handoff A (constant 250 H starting Hydrogen in Era III)** as the robust, non-exploitable cross-era transition contract (D25).

P4 integrates these verified capabilities into production code:
* **Era-II Physical Operating Postures** (`SET_PLASMA_POSTURE`, canonical `state.era2.posture`, and simulation integration);
* **Model C Contextual Interventions** in Cosmos (projecting immediate bottleneck actions and posture controls without duplicating Forge);
* **Semantic Star Core Visual Causality** (making plasma thermodynamics, particle flux, and stellar transitions visibly readable on Canvas 2D with strict reduced-motion text equivalence);
* **Authoritative Recombination Handoff A** (250 H constant baseline in production commands).

P4 intentionally does **not** expand into Era IV (Galactic Matrix), redesign Era I or III, introduce new currencies, or alter the frozen P3 architectural contracts.

---

## 2. P4 Player-Facing Goal

### The Problem in Current Production (P3 Baseline)
* In **Era II**, player interaction is almost entirely confined to the Forge upgrade shop. Once upgrades are purchased, the player waits passively for temperature or protons to tick over. There is no coarse physical steering—cooling and matter production advance on fixed, unmodulated rails.
* Routine interaction requires constant tab switching: observing a bottleneck in Cosmos, switching to Forge to buy an upgrade, and switching back to Cosmos to see the result.
* The **Star Core** canvas displays decorative ambient pulses rather than communicating actual physical state (e.g. thermal stabilization vs. particle abundance).

### What the Player Experiences Differently After P4
1. **Physical Agency in Era II:** The player directly steers the primordial plasma state by switching operating postures:
   * Switching to **`ACCUMULATE`** when raw Quarks and Gluons are needed to build infrastructure;
   * Switching to **`BALANCE`** for safe, unattended baseline progression;
   * Switching to **`CONDENSE`** when matter infrastructure is established and rapid radiative cooling/hadron binding is needed.
2. **Contextual Flow in Cosmos:** The player can perform immediate bottleneck interventions and posture shifts directly from the Cosmos screen without leaving the physical context of the universe.
3. **Readable Visual Causality:** The Star Core visibly reacts to the state of the universe—plasma turbulence reflects matter flux, core bloom reflects thermal stabilization, and particle orbits reflect active binding.
4. **Transparent Recombination:** Recombination readiness is clearly messaged through both routes (Protons or Cooling), advancing into Era III with a predictable 250 H starting foundation.

---

## 3. Durable Inputs and Existing Decisions

P4 directly implements settled architectural and gameplay decisions recorded in [`DECISIONS.md`](../DECISIONS.md):

| Decision | Title | Durable Principle for P4 |
| :--- | :--- | :--- |
| **D20** | Vacuum Coherence ends with Era I | Era II uses Plasma Temperature; no generic cross-era coherence is stored or displayed. |
| **D21** | UI actions dispatch; commands mutate | Posture changes and contextual interventions dispatch canonical engine commands (`SET_PLASMA_POSTURE`, `BUY_UPGRADE_PLASMA`). |
| **D22** | Offline progression shares live authority | Selected posture persists and advances deterministically during offline catch-up. Recombination never auto-triggers offline. |
| **D23** | Contextual interaction model (Model C) | Cosmos projects immediate bottleneck actions; Forge retains browsing, planning, and bulk Buy 1/10/Max. |
| **D24** | Star Core visual causality | Semantic physical state modulates Canvas 2D rendering. Reduced-motion users receive complete text/attribute equivalence (`#star-core[data-semantic-label]`). |
| **D25** | Era-II physical agency & Handoff A | Approved postures: `ACCUMULATE`, `BALANCE`, `CONDENSE`. Prototype multipliers remain provisional. Cross-era handoff is constant 250 H starting Hydrogen. |

---

## 4. Current Production Baseline

* **Runtime State:** Single reactive proxy in `src/core/state.js` initialized via `src/state/createInitialState.js`.
* **Save Version:** Version `17` in `src/state/migrations.js`. Default field merging in `src/state/schema.js` safely seeds new properties without requiring a save-version bump.
* **Era-II Simulation:** Single-step calculation in `src/eras/plasma/evaluator.js` called from `src/eras/plasma/simulation.js` during the authoritative 100ms / 1s tick.
* **Cosmos UI:** `src/engine/cosmosPresentation.js` derives pure read-only models; `src/ui/cosmosExperience.js` updates DOM nodes using stable keys.
* **Star Core:** Canvas 2D engine in `src/ui/canvasCore.js` with era-specific renderers (`drawEra1`, `drawEra2`, `drawEra3`).

---

## 5. P4 Scope

| Candidate Capability | P4 | Later | Not Needed | Evidence / Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **Canonical Era-II Posture State** | **YES** | — | — | Required for physical agency; stores `state.era2.posture` (`'ACCUMULATE'` \| `'BALANCE'` \| `'CONDENSE'`). |
| **Authoritative `SET_PLASMA_POSTURE` Command** | **YES** | — | — | Preserves D21 single-mutation command architecture. |
| **Simulation Posture Integration** | **YES** | — | — | Modulates particle flux vs radiative cooling in `src/eras/plasma/evaluator.js`. |
| **Cosmos Posture Selector UI** | **YES** | — | — | Renders 3-way posture control in Cosmos with clear state feedback and >=44px mobile touch targets. |
| **Model C Contextual Quick Actions** | **YES** | — | — | Projects immediate bottleneck upgrade directly in Cosmos (D23). |
| **Star Core Visual Causality (Era II & III)** | **YES** | — | — | Connects plasma/stellar state to readable Canvas 2D presentation + ARIA text (D24). |
| **Handoff A Production Enforcement** | **YES** | — | — | Enforces constant 250 H in `TRIGGER_RECOMBINATION` command (D25). |
| **Reduced-Motion Core Fallback** | **YES** | — | — | Accessible static geometric/color representation + descriptive live attributes. |
| **Objective / Codex Content Alignment** | **YES** | — | — | Updates Era-II objective copy and Codex descriptions to explain postures. |
| **Configurable Balance Multipliers** | **YES** | — | — | Exposes posture multipliers in `src/config/registry.js` or `src/eras/plasma/constants.js`. |
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
1. **NO Era-I or Era-III redesign:** Quantum Genesis and Stellar Evolution remain mechanically untouched.
2. **NO Era-IV (Galactic Matrix) implementation:** Scaffolding remains non-authoritative.
3. **NO new currencies or meta-layers:** Postures modulate existing physical rates; they do not introduce "posture points" or new tokens.
4. **NO Forge duplication in Cosmos:** Cosmos shows only the single immediately relevant intervention; full browsing and bulk purchases remain in Forge.
5. **NO automatic transition triggers:** Recombination, Supernova, and Inflation remain explicit player-clicked Observer milestones.
6. **NO WebGL/Three.js renderer overhaul:** Canvas 2D engine in `src/ui/canvasCore.js` remains the graphics foundation.
7. **NO save-version bump:** Field defaulting in schema normalization will handle `state.era2.posture` seamlessly on v17 saves.

---

## 7. Target Player Loop

```text
[OBSERVE PHYSICAL STATE]
       │  (Inspect Plasma Temperature, Quark/Gluon reserves, Proton throughput in Cosmos)
       ▼
[IDENTIFY CURRENT BOTTLENECK]
       │  (e.g., "Insufficient Quarks for Proton synthesis" vs. "Plasma too hot for Recombination")
       ▼
[CHOOSE OPERATING POSTURE]
       │  (Select ACCUMULATE, BALANCE, or CONDENSE via Cosmos quick-selector)
       ▼
[OBSERVE IMMEDIATE CAUSALITY]
       │  (Star Core visual turbulence/cooling shifts; throughput numbers update instantly)
       ▼
[EXECUTE CONTEXTUAL INTERVENTION]
       │  (Click projected quick action to purchase bottleneck upgrade without leaving Cosmos)
       ▼
[REACH RECOMBINATION THRESHOLD]
       │  (3,000 K reached OR Proton accumulation satisfied)
       ▼
[DELIBERATELY TRIGGER ADVANCEMENT]
       │  (Advance to Era III Protostar with clean 250 H baseline)
```

---

## 8. Era-II Posture Production Contract

### Semantic Roles

```text
               ┌────────────────────────────────────────┐
               │                BALANCE                 │
               │   • Baseline throughput (1.0x)         │
               │   • Unattended / low-attention mode    │
               └───────────────────┬────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
   ┌───────────────────────────┐       ┌───────────────────────────┐
   │        ACCUMULATE         │       │         CONDENSE          │
   │ • Raw matter accumulation │       │ • Thermal stabilization   │
   │ • Boosts particle flux    │       │ • Boosts radiative cooling│
   │ • Dampens cooling/binding │       │ • Boosts hadron binding   │
   │ • Early-phase preparation │       │ • Late-phase transition   │
   └───────────────────────────┘       └───────────────────────────┘
```

#### 1. ACCUMULATE
* **Player Intent:** Build raw particle inventory (Quarks, Gluons, Leptons) to unlock or afford expensive Forge upgrades.
* **Physical Effect:** Accelerates upstream particle synthesis rates; dampens radiative cooling and hadron binding.
* **Visual Expression:** High particle agitation, increased orbital velocity, bright raw flux glow.
* **Role in Loop:** Critical in early Era II before radiators exist, and during mid-Era II when stocking matter for big upgrades.

#### 2. BALANCE
* **Player Intent:** Safe, predictable progression without active management.
* **Physical Effect:** Neutral baseline throughput (1.0x across all processes).
* **Visual Expression:** Harmonic orbital balance, steady moderate core pulse.
* **Role in Loop:** Ideal default for idle progression and unattended offline catch-up.

#### 3. CONDENSE
* **Player Intent:** Force thermal stabilization, trigger Lepton decay, and bind Protons/Electrons into Hydrogen.
* **Physical Effect:** Accelerates radiative cooling and bound-state formation; reduces raw particle influx.
* **Visual Expression:** Concentrated inward contraction, deep cooling color shift (blue-white → warm amber), subdued particle turbulence.
* **Role in Loop:** Primary driving posture for late Era II once matter infrastructure can feed cooling and binding.
* **Recoverability Guardrail:** Using `CONDENSE` early (before radiators exist) is inefficient but **never causes a deadlock**. Switching back to `ACCUMULATE` immediately restores matter flux.

### Configurable Balance Parameters
P4 implementation will define these parameters in a dedicated configuration object (e.g. `COSMIC_REGISTRY.plasma.postures`):
```javascript
export const PLASMA_POSTURE_CONFIG = {
  ACCUMULATE: {
    particleFluxMult: 1.50,   // Provisional: +50% raw generation
    coolingMult: 0.50,        // Provisional: -50% cooling throughput
    bindingMult: 0.70         // Provisional: -30% binding rate
  },
  BALANCE: {
    particleFluxMult: 1.00,
    coolingMult: 1.00,
    bindingMult: 1.00
  },
  CONDENSE: {
    particleFluxMult: 0.50,   // Provisional: -50% raw generation
    coolingMult: 1.50,        // Provisional: +50% cooling throughput
    bindingMult: 1.30         // Provisional: +30% binding rate
  }
};
```
*(Note: Multipliers are configurable tuning constants subject to P4 balance calibration, not immutable architectural contracts).*

---

## 9. Cosmos Contextual Interaction Model (Model C)

### Interaction Zones in Cosmos
1. **Universe Header / Primary Status:** Displays current cosmic epoch, active bottleneck, and overall progress.
2. **Star Core Canvas + Semantic Overlay:** Displays physical-state visualizer with accessible text and instant click/tap particle response.
3. **Posture Controller (Era II only):** Three segmented buttons (`ACCUMULATE` | `BALANCE` | `CONDENSE`) with active state indicator and short role description.
4. **Contextual Action Card:** Projects the single most urgent intervention:
   * *When an upgrade is affordable and directly unblocks the active bottleneck:* Shows `[Upgrade Name] · Cost: X` button that dispatches `BUY_UPGRADE_PLASMA`.
   * *When transition is ready:* Shows `[Initiate Recombination]` button that dispatches `TRIGGER_RECOMBINATION`.
5. **Process Flow Nodes:** Visualizes live input/throughput/output flow (Quarks + Gluons → Protons → Cooling / Recombination).

### Guardrail Matrix: Cosmos vs. Forge

| Feature / Action | Available in Cosmos? | Available in Forge? | Rationale |
| :--- | :---: | :---: | :--- |
| **Operating Posture Toggle** | **YES** | No | Posture is direct universe operation; belongs in Cosmos. |
| **Single Bottleneck Quick Upgrade** | **YES** | **YES** | Allows immediate unblocking without tab switching (Model C). |
| **Browse Full Upgrade Catalog** | No | **YES** | Full planning and comparison belong in Forge. |
| **Bulk Purchase (Buy 1 / 10 / Max)** | No | **YES** | Prevents accidental bulk spending from the casual view. |
| **Inspect Upgrade Scaling / Tooltips** | No | **YES** | Keeps Cosmos uncluttered and focused on immediate state. |
| **Recombination Transition Trigger** | **YES** | No | Major cosmic milestone belongs on the universe stage. |

---

## 10. Core / Physical Visual Causality

### Semantic State Mapping Table

| Authoritative State | Semantic Physical Meaning | Canvas 2D Visual Consequence | Non-Visual / Reduced-Motion Equivalent |
| :--- | :--- | :--- | :--- |
| **`state.era2.posture === 'ACCUMULATE'`** | High particle flux, expansion | Rapid outer particle swirling, bright orange-gold corona arcs, high turbulence. | `#star-core[data-posture="ACCUMULATE"]`, static energetic gradient, explicit text: `"Posture: Accumulate (Matter Focus)"`. |
| **`state.era2.posture === 'BALANCE'`** | Steady-state equilibrium | Medium orbit speed, balanced cyan/purple dual rings, steady gentle pulse. | `#star-core[data-posture="BALANCE"]`, balanced harmonic rings, explicit text: `"Posture: Balance (Equilibrium)"`. |
| **`state.era2.posture === 'CONDENSE'`** | Inward binding, cooling | Dense compact core, slower inward-drifting particles, deepened violet/amber hue. | `#star-core[data-posture="CONDENSE"]`, concentrated static core, explicit text: `"Posture: Condense (Cooling Focus)"`. |
| **$T > 1,000,000\,\text{K}$** | Hot primordial plasma | High-temperature blue-white core gradient. | `#star-core[data-thermal="hot"]`, text: `"Plasma: Ultra-Hot"`. |
| **$3,000\,\text{K} < T \le 100,000\,\text{K}$** | Recombining plasma | Warm amber/orange hue, reduced core diameter. | `#star-core[data-thermal="cooling"]`, text: `"Plasma: Recombining"`. |
| **$T \le 3,000\,\text{K}$** | Transition-ready neutral gas | Calm golden glow with stable neutral Hydrogen corona. | `#star-core[data-thermal="recombined"]`, text: `"Plasma: Recombined (Ready)"`. |
| **Era III Protostar $\rightarrow$ Main Sequence** | Compression ignition ($T \ge 10\text{M K}$) | Radial flash shockwave, transformation to sustained solar corona with orbiting flares. | `#star-core[data-stage="Main Sequence Star"]`, high-contrast static star graphic, text: `"Main Sequence Star"`. |

### Reduced-Motion Contract
* Under `@media (prefers-reduced-motion: reduce)` or in-game reduced motion setting:
  1. Particle animations, turbulence jitter, and high-frequency oscillations are disabled.
  2. Canvas 2D draws clean, static geometric rings with distinct color palettes representing the active thermal and posture state.
  3. The DOM container `#star-core` updates live attributes: `data-semantic-label`, `data-posture`, `data-thermal-state`, and `aria-label`.

---

## 11. Information Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                                COSMOS                                  │
│  "What is my universe doing right now, and how do I steer it?"         │
│  • Live physical state & temperature                                   │
│  • Operating posture selector (ACCUMULATE / BALANCE / CONDENSE)        │
│  • Immediate bottleneck quick-action                                   │
│  • Primary milestone readiness                                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│      FORGE       │      │    OBJECTIVE     │      │      CODEX       │
│ "How do I build  │      │ "What should I   │      │ "Why does this   │
│  my capacity?"   │      │  aim for next?"  │      │  work this way?" │
│ • Complete shop  │      │ • Single clear   │      │ • Deep narrative │
│ • Buy 1/10/Max   │      │   strategic goal │      │   & astrophysics │
│ • Upgrade paths  │      │ • Dynamic hints  │      │ • Unlocked lore  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

* **No Toasts / Snackbars:** Feedback on posture changes and purchases occurs inline within the active card (`aria-live="polite"` status text).
* **No Tooltip Walls:** Short 1-line semantic explanations appear under the posture selector; detailed physics lore remains in the Codex.

---

## 12. Recombination Experience

1. **Dual Route Clarity:**
   * Cosmos clearly indicates progress toward both routes:
     * Route A: Protons accumulated ($P \ge 800,000$).
     * Route B: Plasma cooled ($T \le 3,000\,\text{K}$).
2. **Transition Trigger:**
   * When either route is satisfied, the Contextual Action Card transforms into `[Initiate Cosmic Recombination]`.
   * A confirmation modal explains the transition consequence: neutral Hydrogen emerges and spacetime collapses into an Era III Protostar.
3. **Enforced Handoff A:**
   * Starting Hydrogen in Era III is set strictly to **$250\,\text{H}$** (D25).
   * Post-readiness idling yields no additional cross-era currency bonus, preventing hoarding traps.
4. **Transition Cleanup:**
   * `state.activeEpoch` advances to `3`.
   * Plasma resources are cleared; Protostar state initializes with $250\,\text{H}$.

---

## 13. Offline Behavior

* **Authoritative Parity:** Offline progress uses the existing `advanceGameTick()` chunked catch-up path (D22).
* **Posture Persistence:** The active posture (`state.era2.posture`) is preserved across offline catch-up and applies its exact multipliers throughout the credited offline interval.
* **No Auto-Switching:** Offline progress never changes posture autonomously.
* **No Auto-Transition:** If Recombination or Inflation conditions are met during offline calculation, the universe state reaches 100% readiness but **waits for the player's manual click upon return**.
* **Return Briefing:** The ephemeral `WHILE YOU WERE AWAY` briefing summarizes temperature dropped and matter synthesized under the active posture.

---

## 14. State, Command, and Persistence Contract

### Canonical State Schema
* Location: `state.era2.posture` in `src/state/createInitialState.js`.
* Allowed Values: `'ACCUMULATE' | 'BALANCE' | 'CONDENSE'` (Default: `'BALANCE'`).
* Normalization: In `src/state/schema.js`:
  ```javascript
  if (state.era2 && !['ACCUMULATE', 'BALANCE', 'CONDENSE'].includes(state.era2.posture)) {
    state.era2.posture = 'BALANCE';
  }
  ```

### Authoritative Command
* Command Name: `SET_PLASMA_POSTURE`
* Handler: Registered in `src/eras/plasma/commands.js`.
* Payload: `{ posture: 'ACCUMULATE' | 'BALANCE' | 'CONDENSE' }`.
* Validation:
  1. `state.activeEpoch === 2` (rejects with `WRONG_EPOCH` if not Era II).
  2. `['ACCUMULATE', 'BALANCE', 'CONDENSE'].includes(cmd.payload.posture)`.
* Mutation: `state.era2.posture = cmd.payload.posture`.
* Events Emitted: `[{ type: 'PLASMA_POSTURE_CHANGED', posture }]`.

### Simulation Integration
* Location: `src/eras/plasma/evaluator.js` in `computePlasmaStep(state, dt)`.
* Reads `state.era2.posture` (defaulting to `'BALANCE'`).
* Applies configured multipliers to:
  * Quark/Gluon/Lepton passive generation (`particleFluxMult`);
  * Baryo Radiator cooling output (`coolingMult`);
  * Proton synthesis / Recombination binding rates (`bindingMult`).

### Persistence
* Save Version: **Remains `17`**.
* No migration script required; schema normalization safely populates missing posture on legacy saves.

---

## 15. Accessibility and Mobile Contract

* **Touch Targets:** All posture buttons and quick-action buttons must satisfy `min-height: 44px; min-width: 44px;` on mobile layouts (`<= 390px`).
* **Keyboard Navigation:**
  * Posture controls are implemented as an ARIA radiogroup (`role="radiogroup" aria-label="Plasma Operating Posture"`) with `role="radio"` and `aria-checked="true|false"`.
  * Arrow keys navigate between postures; Space/Enter activates.
* **Non-Color Indicators:** Active posture is denoted by bold text, border contrast, checkmark glyph (`✓`), and distinct background shading.
* **Layout Stability (CLS = 0):** Reserved height for the posture controls and contextual action slot ensures zero layout shift when states toggle.

---

## 16. Balance and Tuning Boundaries

| Category | Durable Contract (Immutable in P4) | Configurable Tuning Parameter (P4 Calibration) |
| :--- | :--- | :--- |
| **Posture Roles** | `ACCUMULATE` boosts flux / slows cooling; `CONDENSE` boosts cooling / slows flux; `BALANCE` is 1.0x neutral. | Exact multipliers ($\pm 30\%\text{--}50\%$). |
| **Recoverability** | Suboptimal posture choice must never cause a hard progress trap or deadlock. | Time penalty for suboptimal play ($\approx 10\%\text{--}25\%$ delta). |
| **Strategy Pacing** | Deliberate posture switching must noticeably accelerate time-to-Recombination over pure `BALANCE`. | Target speedup range: $15\%\text{--}30\%$ faster than fixed `BALANCE`. |
| **Handoff** | Constant $250\,\text{H}$ starting Hydrogen in Era III. | Fixed baseline constant. |

---

## 17. Telemetry and Playtest Questions

### Automated Verification Metrics (CI / FAST / TELEMETRY)
1. Exact run-to-completion times across strategy matrix (Deliberate A $\rightarrow$ B $\rightarrow$ C vs. Fixed Balance vs. Fixed Accumulate).
2. Verification that rapid toggling yields no mathematical throughput boost.
3. Verification that offline catch-up matches live tick progression exactly under all 3 postures.

### Human Playtest Questions (Future User Feedback)
* Do players find the posture selector intuitive, or do they forget to switch out of `ACCUMULATE`?
* Is the visual feedback on the Star Core clear enough that players understand *why* cooling slowed down?
* Does Model C quick-action satisfy players' immediate upgrade needs, or do they still prefer opening Forge?

---

## 18. Risks and Mitigations

| Risk | Early Warning Signal | Mitigation |
| :--- | :--- | :--- |
| **Cosmos Layout Clutter** | Screen height on 390px mobile exceeds single-viewport scroll budget. | Strict CSS single-column stacking; collapse process nodes into clean horizontal tags. |
| **Posture Trap for New Players** | Player selects `CONDENSE` early and progress stalls due to halved Quark flux. | Add contextual guidance in Cosmos status: *"Particle production reduced in Condense mode; switch to Accumulate to build matter"*. |
| **Accidental Forge Duplication** | Team attempts to add multiple upgrade buttons or bulk buy to Cosmos. | Enforce strict Model C guardrail: max 1 contextual intervention button in Cosmos. |
| **Visual Causality Performance Drop** | Particle counts on Canvas 2D cause frame drops on low-end mobile devices. | Bounded particle pool (MAX 200); automatic DPR capping at 2x; visibility change pausing. |
| **Save Deserialization Anomaly** | Missing posture field on older saves causes `undefined` in simulation. | Robust schema normalization with `'BALANCE'` fallback in `src/state/schema.js`. |

---

## 19. Acceptance Criteria

### A. Functional & State
* [ ] `state.era2.posture` is canonically stored and normalized to `'BALANCE'` if missing.
* [ ] `SET_PLASMA_POSTURE` command validates epoch, mutates state, and emits events.
* [ ] `computePlasmaStep` correctly applies posture multipliers to flux, cooling, and binding.
* [ ] `TRIGGER_RECOMBINATION` grants exactly $250\,\text{H}$ starting Hydrogen.

### B. UI & Contextual Interaction (Model C)
* [ ] Posture selector renders in Cosmos during Era II with clear active states.
* [ ] Immediate bottleneck upgrade is projected as a contextual quick action in Cosmos.
* [ ] Clicking quick action dispatches canonical engine command and updates state cleanly.
* [ ] Full upgrade inventory, planning, and Buy 1/10/Max remain strictly in Forge.

### C. Visual Causality & Accessibility
* [ ] Star Core Canvas 2D visibly modulates color, pulse, and turbulence based on temperature and posture.
* [ ] Reduced-motion mode renders clean static representations with 100% equivalent text attributes.
* [ ] Posture buttons satisfy `>= 44px` touch targets and full keyboard arrow/tab navigation.
* [ ] Mobile 390px layout exhibits zero horizontal overflow and zero CLS.

### D. Offline & Persistence
* [ ] Selected posture persists across page reload, export/import, and offline catch-up.
* [ ] Offline simulation respects active posture without auto-triggering Recombination.
* [ ] Existing v17 saves load cleanly with zero data loss.

---

## 20. Proposed Implementation Phases

To maintain strict scope control and avoid giant unstable refactors, P4 should execute in **4 sequential phases**:

```text
PHASE 1: Canonical State, Commands & Simulation Postures
  Scope: state.era2.posture, SET_PLASMA_POSTURE command, evaluator.js posture multipliers.
  Files: src/state/createInitialState.js, src/state/schema.js, src/eras/plasma/commands.js, src/eras/plasma/evaluator.js.
  Validation: Unit tests for command legality, posture modulation, and save normalization.

PHASE 2: Cosmos Posture Controls & Model C Contextual Actions
  Scope: Cosmos posture selector UI, contextual bottleneck quick action in cosmosExperience.js.
  Files: src/engine/cosmosPresentation.js, src/ui/cosmosExperience.js, src/ui/viewport.js, style.css.
  Validation: DOM tests, keyboard navigation, click dispatch verification.

PHASE 3: Star Core Semantic Visual Causality
  Scope: Canvas 2D state-driven shaders/particles in canvasCore.js, reduced-motion fallbacks, ARIA sync.
  Files: src/ui/canvasCore.js, src/ui/viewport.js, index.html.
  Validation: Visual regression tests, reduced-motion DOM attribute tests, browser acceptance.

PHASE 4: Recombination Handoff A & Polish
  Scope: Enforce 250 H constant handoff, update Era-II Objective & Codex copy, end-to-end verification.
  Files: src/eras/plasma/commands.js, src/core/objectiveDefinitions.js, src/config/registry.js.
  Validation: Full test suite (FAST, FULL, BROWSER), mobile 390px check, documentation sync.
```

---

## 21. Open Questions

| Question | Classification | Impact | Proposed Resolution |
| :--- | :--- | :--- | :--- |
| **Q1: Exact Posture Multipliers** | `NEEDS BALANCE TEST` | Fine-tunes speedup ratio. | Start with provisional prototype values ($\pm 50\%$ flux/cooling, $+30\%$ binding) in Phase 1 and tune in Phase 4 via simulation benchmarks. |
| **Q2: Quick-Action Affordability Style** | `NEEDS IMPLEMENTATION INSPECTION` | Visual clarity when player lacks funds. | Button should appear disabled with clear missing cost requirement rather than disappearing, preventing layout jumping. |
| **Q3: Codex Entry Timing** | `NEEDS HUMAN DESIGN DECISION` | Narrative pacing. | Unlock Codex entry on Plasma Thermodynamics upon first entering Era II Act 2 (Hadron Synthesis). |

---

## 22. Design-Approved vs. Production-Implemented Matrix

| Feature Area | Design Approved? | Implemented in Production? | P4 Milestone Target |
| :--- | :---: | :---: | :---: |
| **Model C Contextual Quick Actions** | **YES (D23)** | NO | **Implement in P4 (Phase 2)** |
| **Core Visual Causality** | **YES (D24)** | NO | **Implement in P4 (Phase 3)** |
| **Era-II Operating Posture Model** | **YES (D25)** | NO | **Implement in P4 (Phase 1 & 2)** |
| **Recombination Handoff A (250 H)** | **YES (D25)** | NO | **Implement in P4 (Phase 4)** |
| **Offline Progression Parity** | **YES (D22)** | **YES** | **Preserve & Integrate in P4** |
| **Vacuum Coherence Era-I Only** | **YES (D20)** | **YES** | **Preserve in P4** |
| **Galactic Matrix / Era IV** | NO | NO | **Deferred to Post-P4** |
