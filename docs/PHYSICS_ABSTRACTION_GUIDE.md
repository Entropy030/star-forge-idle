# Star Forge Idle: Physics Abstraction Guide

This document outlines how real-world physics concepts are abstracted into game mechanics, ensuring a balance between scientific grounding and engaging gameplay.

## 1. Baryon Asymmetry (Era I)
*   **Real concept:** The observed imbalance between matter and antimatter in the observable universe.
*   **Game abstraction:** A strategic trade-off where creating extreme imbalance yields high amounts of Surviving Matter (long-term capacity), while maintaining symmetry yields high Annihilation Energy (short-term boost).
*   **Reason:** Provides a strategic decision early in the game rather than a simple passive multiplier.
*   **Known simplification:** Baryogenesis is highly complex; here it is reduced to a slider-like balance.
*   **Player-facing explanation:** "A subtle imbalance determines whether fluctuations annihilate into pure energy or survive as stable matter."

## 2. Plasma Recombination (Era II)
*   **Real concept:** The epoch when the universe cooled enough for electrons and protons to form neutral hydrogen atoms.
*   **Game abstraction:** A clear recipe flow: Quarks → Protons/Neutrons, Leptons → Electrons, and Protons + Electrons → Hydrogen.
*   **Reason:** Enforces a strict input/output economy (matter is conserved, not created from nothing) and prepares fuel for the Stellar Forge.
*   **Known simplification:** Ignores the complex intermediate states and forces all baryons into a simple proton/neutron duality.
*   **Player-facing explanation:** "As the universe expands and cools, chaotic particles bind into the first stable structures."

## 3. Stellar Equilibrium (Era III)
*   **Real concept:** A star maintains hydrostatic equilibrium when the outward thermal pressure from nuclear fusion balances the inward pull of gravity.
*   **Game abstraction:** The central mechanic of Era III. Gravity pulls inward (determined by Initial Mass and Core Density), while Fusion creates outward pressure (determined by Fuel and Heat).
*   **Reason:** Creates the core interactive loop of Era III, where players must manage stability to prevent premature collapse or fusion stall.
*   **Known simplification:** Simplifies the incredibly complex fluid dynamics and radiation transport into a single "Stability" meter.
*   **Player-facing explanation:** "Your star is a constant battle between the crushing weight of gravity and the explosive outward force of nuclear fusion."

## 4. Stellar Builds & Supernova Outcomes
*   **Real concept:** A star's mass and composition determine its lifespan and ultimate fate (White Dwarf, Neutron Star, or Black Hole).
*   **Game abstraction:** Three distinct archetypes (Efficient, Massive, Compact) that players can deliberately aim for, resulting in different Supernova outcomes and Prestige rewards.
*   **Reason:** Ensures replayability and diverse strategic paths.
*   **Known simplification:** Stars don't transition between these archetypes dynamically; in the game, the player actively guides the star's evolution.
*   **Player-facing explanation:** "The mass and density of your star dictate not only how it burns, but how it will eventually die—leaving behind a cosmic remnant to seed the next run."

## 5. Solar Flares
*   **Real concept:** Sudden flashes of increased brightness on a star, usually observed near its surface and in close proximity to a sunspot group.
*   **Game abstraction:** RNG-based events driven by the star's rotation and magnetic instability.
*   **Reason:** Adds an active element and a sense of unpredictability to the otherwise deterministic idle loop.
*   **Known simplification:** Tied directly to player-controlled instability metrics rather than complex magnetic reconnection models.
*   **Player-facing explanation:** "Instability breeds chaos. Sudden bursts of energy offer temporary boons, but reveal the turbulent nature of your forge."
