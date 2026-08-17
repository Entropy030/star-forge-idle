# 09 — P5 Core Loop & Product Cohesion Roadmap

---

## 1. Product Thesis

Following the technical, state-authority, and interaction foundations established across P1–P4, the primary product question is no longer architectural validity. It is product cohesion and incremental engagement:

> **"Players should feel that they are building and operating an increasingly capable physical system, rather than merely clicking the next unlocked button."**

The objective of P5 is to transform the existing discrete upgrade chains into a coherent, deeply engaging incremental engine where physical mechanics feel distinct, progression transitions feel momentous, and player choices produce tangible system outcomes.

---

## 2. Roadmap Phases Overview

```mermaid
graph TD
  P5_1["P5.1 — Interaction & UI Integrity\n(Current Production Pass)"] --> P5_2["P5.2 — Progression & Mechanic Introduction\n(Transition Presentation & Lore Event)"]
  P5_2 --> P5_3["P5.3 — Incremental Economy & Agency\n(Stock → Flow → Conversion → Policy)"]
  P5_3 --> P5_4["P5.4 — Coarse Balance & Full Run\n(Order-of-Magnitude Viability)"]
```

### P5.1 — Interaction & UI Integrity (Complete & Human Approved)
Eliminates interaction bugs, presentation inconsistencies, and digit jitter across all current surfaces before executing gameplay restructures:
- **Whole-number visible stock balances:** Truncated display floor prevents misleading affordability indicators while retaining underlying high-precision Decimal state.
- **Model-C Contextual Quick Action Integrity:** Resolves stale closure event capture in Era-II Cosmos so enabled contextual actions dispatch and execute reliably.
- **Era-III Buy Max Correction:** Fixes hardcoded unit purchasing on Forge Stellar Core nodes so `Buy 10` and `Buy Max` execute iterative multi-level purchases.
  - *Note:* Buy Max currently uses the existing 10,000-loop sentinel convention (`EXISTING BUY-MODE IMPLEMENTATION DEBT`). Analytical closed-form pricing is deferred to future economy refactoring.
- **Header Alignment Normalization:** Aligns Era-II top-header and Matter Production status panels with existing design system hierarchy.
- **Codex & Archive Geometry Stability:** Locks navigation column geometry (`200px` fixed width) so article selection never introduces layout shifts.
- **Reduced Motion Settings Simplification:** Removes redundant player-facing setting toggle while preserving 100% OS-level `prefers-reduced-motion: reduce` compliance across CSS and Canvas.

#### Deferred Design Finding — Cross-Era Resource Grammar
Human review in P5.1 established:
```text
CROSS-ERA RESOURCE LOCATION CONTRACT:
PARTIALLY CONSISTENT — VISUAL DIFFERENCES REMAIN

RESOURCE GRAMMAR:
NEEDS DEDICATED UI NORMALIZATION
```
- **Review Confirmation:** Eras I, II, and III share the same visual aesthetic, but their resource and primary-state information architecture is not yet sufficiently location-consistent (e.g. Primary HUD card populated in Eras I/II vs. Support-only in Era III; Gateway locations split across Cosmos, Forge, and Legacy).
- **Resolution Strategy:** This is not a blocker for P5.1 integrity fixes. It requires a deliberate cross-era layout-normalization pass in P5.2/P5.3 rather than an ad-hoc patch.
- **Durable Principle:**
  > *"Era identity may change WHAT occupies a semantic information slot, but should not unnecessarily change WHERE the player looks for that slot."*
- **Candidate Normalization Surface Hierarchy:**
  $$\text{OBJECTIVE / NEXT} \longrightarrow \text{PRIMARY STATE / PRIMARY RESOURCE} \longrightarrow \text{STAR CORE} \longrightarrow \text{ERA-SPECIFIC PHYSICAL CONTROL / CONTEXT} \longrightarrow \text{CURRENT PROCESS} \longrightarrow \text{SUPPORT RESOURCES} \longrightarrow \text{CHRONO}$$

### P5.2 — Progression & Mechanic Introduction (Future Scope)
- Meaningful introduction and onboarding for newly revealed mechanics.
- Qualitative transition presentation for Cosmic Inflation, Recombination, and Stellar Dawn.
- Theatrical Legacy / Supernova prestige presented as a significant cosmic milestone rather than merely a new navigation tab:
  - Transparent communication of what changes, what is sacrificed, what persists, and what is gained.

### P5.3 — Incremental Economy & Agency (Future Scope)
Addresses the symptom of linear upgrade clicking in Era I and early Era III:
- Transition from simple unlock ladders to systemic operations:
  $$\text{STOCK} \longrightarrow \text{FLOW} \longrightarrow \text{CONVERSION} \longrightarrow \text{ALLOCATION / POLICY} \longrightarrow \text{TRANSFORMATION}$$
- Deepen Era-I quantum fluctuation dynamics beyond linear upgrade acquisition.
- Expand Era-III stellar nucleosynthesis and stellar configuration choices prior to Supernova.

### P5.4 — Coarse Balance & Full Run (Future Scope)
- Verify end-to-end viability of all progression routes across orders of magnitude.
- Validate balance between Era-II cooling and matter synthesis pathways.
- Ensure human playtest full runs can smoothly navigate Era I through Supernova reset without artificial bottlenecks.

---

## 3. Reference Benchmark Track (Future Design Input)

To inform P5.2 and P5.3 design without cloning features or destabilizing scope, the following reference incremental titles will be evaluated:

| Candidate Title | Key System Strengths to Study |
| :--- | :--- |
| **Antimatter Dimensions** | Dimension tiering, exponential acceleration, crisp prestige layers, automation unlocking. |
| **CIFI (Cell Idle Factory Incremental)** | Complex loop interconnectivity, loop specialization, mechanical synergy. |
| **ISEPS** | Distinct particle systems, state-switching policies, color/identity differentiation. |
| **Realm Grinder** | Faction identity, deep build differentiation, active vs. passive alignment. |
| **Orb of Creation** | Spatially grounded crafting, resource conversion dynamics, spell/channel allocation. |
| **The Gnorp Apologue** | Expressive visual causality, tangible physical agency, clear conversion pipelines. |

**Key Research Inquiries:**
1. What does the player own and build over time?
2. What physical systems convert into higher-order physical systems?
3. Where do meaningful player decisions take place?
4. What becomes automated or obsolete as new cosmic epochs emerge?
5. How are prestige milestones dramatized?

---

## 4. Graphical Polish & Unity Scenario (Future Strategy)

1. **Current Sequence:**
   $$\text{Gameplay / Concept} \longrightarrow \text{Product Cohesion} \longrightarrow \text{Balance} \longrightarrow \text{Major Visual Polish}$$
2. **Platform Scenarios:**
   - **Path A (Web First):** Continue with current lightweight HTML5/Canvas 2D stack, polishing shaders, background dynamics, and particle causality.
   - **Path B (Visual Slice Exploration):** Build an isolated Unity visual prototype later to benchmark fidelity, development velocity, and deployment overhead.
3. **Execution Guardrail:** No renderer migration or Unity code work in P5.1.

---

## 5. Milestone Tracking & Closure Matrix

| Milestone | Scope Summary | Implementation Status | Publication Status |
| :--- | :--- | :---: | :---: |
| **P4 Overall** | Era-II Postures, Model C, Core Causality, Handoff A | **Complete** | **`p4-stable-v1` Published** |
| **P5.1** | Interaction & UI Integrity (Whole Numbers, Model C, Buy Max, Layouts) | **Complete (Human Approved)** | **Published to `star/main`** |
| **P5 Design Synthesis** | Physical Machine Models for Eras I–III, Agency Analysis, Principles P1–P8 | **Complete (Human Approved)** | **Published to `star/main`** |
| **PRE-P5.3A Prototype** | Era-I Vacuum Field Allocation (Coherence as System Quality) | **Complete (Human Approved)** | **Published to `star/main`** |
| **PRE-P5.3B Prototype** | Era-III Hydrostatic Stellar Engine Coupling (Model B1) | **Complete (Human Approved)** | **Published to `star/main`** |
| **P5 Implementation Plan** | Execution Architecture, Authority Matrix, Phase Contracts (D30, D31) | **Complete (Human Approved)** | **Published to `star/main`** |
| **P5.2A** | Semantic Progression & Resource Grammar Foundation (D31 Core Temp) | **Complete (Human Approved)** | **Published to `star/main`** |
| **P5.2B** | Current Transitions & First Supernova / Legacy Onboarding (D32) | **Complete (Human Approved)** | **Published to `star/main`** |
| **P5.3** | Incremental Systems & Agency (Vertical Slices P5.3A, P5.3B0, P5.3B1, P5.3C) | *Not Started* | *Pending* |
| **P5.4** | Coarse Balancing & Playable Full Run Validation (Calibration-Only) | *Not Started* | *Pending* |
