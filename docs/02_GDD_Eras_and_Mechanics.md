# GDD — Eras and Mechanics

This document states current supported gameplay truth at a design level. Numeric formulas and exact costs remain authoritative in code and selectors.

## Cross-era structure

Each Era has:

- an active universe/process shown in Cosmos;
- current-run construction and upgrades in Forge;
- an objective that identifies the next useful action;
- staged Chrono/Codex context;
- an authoritative eligibility contract for transitions.

Legacy becomes relevant when repeatable meta progression exists. Resources are shown as Primary, Support, and Details for the active situation rather than as one permanent wall.

## Era I — Quantum Genesis

### Core loop

Observation of the Core generates Quantum Fluctuations (QF). QF funds Fundamental Law upgrades, which establish passive production and unlock the next parts of the chain.

Observation is optional acceleration. Passive production remains a valid progression path once established.

### Fundamental Laws

Upgrade availability is progressive. Eligibility depends on peak QF and levels in preceding laws; it is not a Coherence cost/gate.

The implemented chain is:

1. Gravitational Coupling
2. Weak Nuclear Vector
3. Electromagnetic Tensor
4. Vacuum Resonance Field
5. Strong Nuclear Binding

Names are player-facing abstractions. Exact thresholds and costs live in quantum registry/eligibility/economy modules.

### Energy Density and Vacuum Coherence

Energy Density is produced by the developed quantum system and represents the energy condition needed for Inflation.

Vacuum Coherence is the stability of the emerging vacuum/universe. It uses a 0–100% scale.

- Passive base stabilization: 0.1 percentage points per simulated second.
- Base Core-observation gain once relevant: 0.5 percentage points, modified by authoritative mechanics.
- It is hidden in Fresh Era I and disclosed contextually.
- It does not gate Fundamental Law upgrades.

Presentation must derive both rates/gains from mechanics rather than duplicate numbers.

### Cosmic Inflation

Authoritative requirements:

- 100,000 Quantum Fluctuations
- 50,000 Energy Density
- 100% Vacuum Coherence

When eligible, Cosmic Inflation permanently advances to Era II. Header, objective, transition UI, and command must use the same eligibility result.

## Era II — Particle and Plasma Evolution

### Process model

Era II is a coupled production chain:

- Quarks and Gluons establish hadronic material.
- Leptons support the charged-particle chain.
- Proton synthesis consumes upstream material.
- Lepton decay and related conversion provide Electrons.
- Protons and Electrons can recombine into Hydrogen when the plasma is sufficiently cool.
- Plasma Temperature is both process state and a transition route.

The evaluator computes a single step’s throughput and bottleneck data. Cosmos describes the active process; Forge owns current-run construction; the resource hierarchy foregrounds the limiting material or temperature.

### Upgrade progression

The implemented progression unlocks through Quark Condenser, Gluon Matrix Synthesis, Lepton Collector, Proton Synthesizer, and the cooling/radiator capability. Upgrade eligibility is level-based and authoritative in the plasma eligibility module.

### Cooling

Cooling is an active strategic process, not merely cosmetic temperature decay. The player must balance material throughput with progress toward a recombination-compatible plasma. UI guidance should state the current bottleneck and rate without turning the objective into a complete diagnostic report.

### Recombination

Recombination can become eligible through either supported route:

- accumulate the configured Proton threshold; or
- cool Plasma Temperature to 3,000 K or below.

The command additionally requires the active Era to be Era II. The UI may explain which route is currently satisfied but must not imply both are mandatory.

Triggering Recombination permanently advances to Era III.

## Era III — Stellar Evolution

### Process model

Era III begins with Hydrogen and a Protostar. Player construction and compression increase gravitational/thermal conditions. At Main Sequence, Hydrogen fusion produces Helium. Higher Core Temperature and Forge investments unlock Carbon and Iron synthesis.

The primary player state is Core Temperature. Hydrogen/Helium are the fusion chain; Carbon and Iron are later stellar materials. Cosmos should foreground current temperature, the next physical threshold, and the action that advances it.

### Stellar builds

Efficient, Massive, and Compact investments influence production and the eventual stellar outcome. The Legacy surface owns the run outcome/reward decision; Forge owns the current-run purchases.

### Supernova — repeatable reset

Supernova eligibility requires:

- active Era III;
- Main Sequence Star state;
- the configured Supernova temperature threshold;
- Iron Fusion unlocked;
- at least 1,000 Iron.

A Supernova ends the current stellar run and starts a new Era III run with permanent/meta rewards. Rewards include Stardust and Pulsar Shards; Singularity Mass depends on the achieved outcome/archetype. The terminal must show authoritative requirements and predicted consequences.

Supernova does **not** permanently advance to Era IV.

### Galactic Ignition — permanent transition

Galactic Ignition is a distinct permanent transition. Its current eligibility requires:

- active Era III;
- Core Temperature at or above the Iron unlock threshold (2 billion K);
- at least 1,000 Iron.

It is an Era IV gate, not part of the repeatable Supernova reward loop. P3 documents the gate, but Era IV gameplay is not a supported milestone.

## Future Eras

Era IV/V modules and selected tests are prototype/future scaffolding. Their semantic ownership is nevertheless settled: Era IV owns Galaxy Stability, and Era V owns Entropy. The existing Era V Bit-production modifier derives directly from inverse Entropy; it does not create a second stored Coherence value. These are not claims that Era IV/V gameplay is complete. P4 must still establish supported mechanics, UI contracts, and regression coverage.
