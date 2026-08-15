# Coherence Semantics Audit

## Status

**RESOLVED in P3 Stabilization S5.5.** The historical audit correctly identified one property changing meaning by Era. Decision D20 selects **D — Era-I-only Coherence**, while retaining the existing v17 storage key for compatibility.

## Durable semantic contract

Vacuum Coherence is the 0–100% stability of the emerging vacuum and is authoritative only in Era I. It rises passively, observation can accelerate it, and 100% gates Cosmic Inflation. Later eras do not reinterpret or display it: Era II owns Plasma Temperature, Era III owns Core Temperature/stage/stellar architecture, Era IV owns Galaxy Stability, and Era V owns Entropy. Values derived from those native metrics are selectors, not additional stored Coherence truth.

## Resolved usage map

| Domain | Meaning and authority | Operations | Progression/player use |
| --- | --- | --- | --- |
| Era I | Vacuum stability in `state.coherence`; the top-level name is retained by save v17 | Read by quantum selectors, Inflation, presentation, Codex, bot and telemetry; written by passive tick and Core observation | Gates Cosmic Inflation at 100%; disclosed contextually as Vacuum Coherence |
| Era II | `plasmaTemperature` is native thermal/process authority | Temperature is read/written by Plasma simulation and eligibility; no Coherence write | Cooling and Recombination use Temperature; no Coherence display or gate |
| Era III | `era3.temperature`, stage, resources and architecture are native stellar authority | Stellar simulation reads/writes those fields; no Coherence write | Supernova and Galactic Ignition use native stellar state; no Coherence display or gate |
| Era IV | `era4.stability` is Galaxy Stability authority | Galactic simulation writes it; economy and transition/UI read it | Affects prototype debris production and Entropy transition; never mirrored to Coherence |
| Era V | `era5.entropy` is Entropy authority | Era V simulation writes Entropy; `getEntropyBitProductionMultiplier()` derives the existing multiplier | Prototype Bit production derives from inverse Entropy; no stored/displayed Coherence |

Additional classifications:

- **Presentation only:** Era I resource/Cosmos/header/Chrono/Codex paths use the Vacuum Coherence accessor. Codex text corruption is clean outside Era I.
- **Compatibility:** the top-level `state.coherence` key remains serialized to avoid a cosmetic save migration. The semantic accessor isolates that historical name.
- **Save/migration:** normalization still converts obsolete `era1.vacuumCoherence` values from 0–1 to the v17 0–100 key, then deletes the obsolete field.
- **Telemetry:** Vacuum Coherence milestones/metadata are emitted only for Era I. Later-era telemetry uses native metrics.
- **Historical/dead:** Era II thermal writes, two competing Era III writers, the Era IV mirror, the Era V mirror, the unused Supernova `coherenceBonus`, and the inactive legacy artifact effect were removed without changing a consumed gameplay formula.

## Models evaluated

- **A — Universal Coherence:** rejected. Vacuum stabilization, plasma temperature, stellar architecture, Galaxy Stability and inverse Entropy cannot be one continuous player concept without hand-waving.
- **B — Era-specific semantics over compatibility storage:** better labels, but retaining later-era mutations in one storage field would preserve duplicated/competing truth.
- **C — Split authoritative state:** unnecessary. Era II–V already have native authoritative fields; adding new Coherence-like fields would create migration risk and redundant state.
- **D — Era-I-only Coherence:** selected. It matches player meaning, removes duplicate truth, preserves the v17 save contract, and gives P4 explicit native extension points.

## Compatibility impact

Save version remains 17. Normal migrations and exact-version manual import behavior are unchanged. Existing saves retain their Vacuum Coherence value; later-era saves may retain the historical value, but later-era mechanics and presentation neither mutate nor interpret it.
