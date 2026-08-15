# Star Forge Idle — Physics Abstraction Guide

Status: design guidance. This document explains abstraction intent; the GDD and implementation selectors remain authoritative for current mechanics.

Star Forge uses real physical ideas as legible progression metaphors, not as a precision cosmology simulator. An abstraction should create a meaningful player decision, remain explainable in a short Codex entry, and avoid claiming scientific exactness.

## 1. Vacuum stabilization (Era I)

- **Real inspiration:** vacuum state, fluctuations, energy density, and rapid early-universe expansion.
- **Game abstraction:** observation produces Quantum Fluctuations; developed Fundamental Laws create passive structure; Energy Density and 0–100% Vacuum Coherence prepare Cosmic Inflation.
- **Decision value:** the player balances direct observation with passive construction and sees three distinct transition requirements converge.
- **Simplification:** Vacuum Coherence is a readable stability percentage, not a literal field-theory calculation.
- **Player framing:** “Observation accelerates the emerging vacuum’s natural stabilization.”

Baryon asymmetry is represented in the current Era II production model, not as an Era I slider.

## 2. Particle synthesis and recombination (Era II)

- **Real inspiration:** a hot quark/lepton plasma cooling into hadrons, electrons, and neutral matter.
- **Game abstraction:** coupled Quark, Gluon, Lepton, Proton, and Electron recipes plus an independently legible Plasma Temperature. Protons and Electrons form Hydrogen under sufficiently cool conditions.
- **Decision value:** production and cooling expose different bottlenecks and support alternative routes to the transition.
- **Simplification:** many intermediate particles/interactions are collapsed into a small conserved recipe network.
- **Player framing:** “As the plasma cools, charged particles can bind into the first neutral Hydrogen.”

## 3. Stellar evolution (Era III)

- **Real inspiration:** gravitational compression, fusion temperature thresholds, nucleosynthesis, and stellar collapse.
- **Game abstraction:** compression and construction raise Core Temperature; Hydrogen fusion produces Helium; deeper thresholds unlock Carbon and Iron synthesis.
- **Decision value:** the player chooses current-run investments and guides an Efficient, Massive, Compact, or balanced stellar outcome.
- **Simplification:** complex hydrostatic equilibrium, radiation transport, and reaction chains are represented by a small number of resources, rates, build levels, and temperature gates.
- **Player framing:** “Gravity compresses the Core until new fusion pathways become possible.”

## 4. Supernova outcomes

- **Real inspiration:** stellar mass/composition determine a star’s lifetime and remnant.
- **Game abstraction:** build emphasis shapes the predicted Supernova outcome and its Legacy reward mix.
- **Decision value:** the reset is repeatable, making alternate stellar paths and permanent reward priorities meaningful.
- **Simplification:** the player deliberately guides archetypes; the simulation does not model complete stellar lifecycles.
- **Player framing:** “How the star was built determines what survives its collapse.”

Supernova is a repeatable Era III reset. Galactic Ignition is the distinct permanent transition gate.

## 5. Solar activity

- **Real inspiration:** transient magnetic/solar eruptions.
- **Game abstraction:** occasional stellar events provide contextual temporary effects or choices.
- **Decision value:** introduces bounded unpredictability into an otherwise deterministic idle loop.
- **Simplification:** event chance/effect is tied to game state, not a magnetohydrodynamic model.
- **Player framing:** “A turbulent star occasionally releases a burst of usable energy.”

## 6. Galactic and later concepts (future intent)

Era IV/V code contains prototype ideas around galactic formation, stability, and entropy. These are not yet supported design contracts. Before P4, later-era state semantics must be chosen explicitly; Era I Vacuum Coherence should not be reused merely because a field already exists.
