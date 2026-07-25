# 🌌 Game Design Document: Eras & Progression Mechanics

## Ära I: The Quantum Foam (Der Urknall & Quantenschaum)
* **Narrativ:** "Ich habe Masse. Ich bin getrennt vom Nichts."
* **Kern-Ressourcen:** Quantum Fluctuations, Energy Density.
* **Aktives Sub-System (Quanten-Superposition & Vacuum Coherence):**
  * Oszillation der Amplitude (0.1x bis 5.0x im 15s-Takt).
  * **Sicherer Kollaps:** Verlässlicher Ertrag + stetige Coherence-Regeneration (+1.0%).
  * **Quantensprung (Risiko):** Payout bei Amplitude $\ge$ 4.0x liefert 500% Ertrag, verringert aber die Vacuum Coherence um -2.5%.
  * **Text-Corruptor Engine:** Je niedriger die Coherence, desto stärker werden HUD-Logs und UI-Texte verzerrt (<80% leicht, <50% mittel + CSS-Glitch, <20% schwer).
* **Decoherence Tuner:** Schaltet automatische Kollaps-Modi frei (Safe & Resonance).

---

## Ära II: The Primordial Soup (Quark-Gluon-Plasma)
* **Narrativ:** "Der Rest ist Schweigen."
* **Kern-Ressourcen:** Quarks, Gluons, Leptons, Protons, Electrons.
* **Mechaniken:**
  * **Baryon-Asymmetrie:** $|Quarks - Gluons|$ Differenz erzeugt Produktions-Boost.
  * **Plasma-Kühlung:** Temperatursenkung von 10M K auf 3.000 K schaltet freie Elektronen frei.
  * **Antimatter Residue:** Katalysator-Spur aus Protonen-Generation (für spätere Zyklen).

---

## Ära III: The Stellar Dawn (Sterne & Nukleosynthese)
> **Narrativer Anker:** *"Ich falle nach innen. Zum ersten Mal spüre ich nicht nur, dass ich bin – sondern was ich bin: Gewicht."*

### Akt 1: Gravitationskollaps & Protostern-Bildung
* **Ressourcen:** Molecular Cloud Mass (MCM), Hydrogen (H), Core Temperature (startet bei ~10 K), Collapse Pressure.
* **Tech-Tree:** Nebula Condenser (sammelt MCM) $\rightarrow$ Gravitational Compressor (presst MCM zu H, heizt Kern auf) $\rightarrow$ Protostar Core.
* **Formula:** $Heating Rate = Base \times (1 + Gravity / 100)$
* **Zufallsevent (Cloud Fragmentation):**
  * *Annehmen:* Mehrere Protosterne, mehr Base-Output, langsamerer Kollaps.
  * *Ablehnen:* Schnellerer Kollaps, Risiko von MCM-Verlust bei "Failed Ignition".
* **Meilenstein:** Kerntemperatur $10 \times 10^6$ K $\rightarrow$ "Main Sequence Ignition".

### Akt 2 & 3: Kompression & Supernova Terminal
* **Druck & Kompression:** `Compress Core` treibt die Kerntemperatur exponenziell hoch.
* **Element-Synthese:** Carbon freigeschaltet ab 500M K, Iron ab 2B K.
* **Hoarding-Trap Auflösung:** Verfolgt `lifetimeCarbonThisRun` (gesamter in diesem Run erzeugter Kohlenstoff), so dass das Ausgeben von Kohlenstoff für Upgrades die vorhergesagten Prestige-Erträge NIEMALS reduziert.
* **Multi-Node Progress Bar:** 3-Segment Fortschrittsanzeige mit sichtbaren Zwischenzielen:
  1. Node 1: 100M K (Supernova freigeschaltet)
  2. Node 2: 500M K (Kohlenstoff-Synthese / Drei-Alpha-Prozess)
  3. Node 3: 2.000M K / 2.0B K (Eisen-Fusion & Ära IV Gateway)
* **Steiles Prestige-Skalieren:**
  * 100M K: Basis-Ertrag (~1 Neural Synapse)
  * 500M K: Exponentieller Boost (~15+ Neural Synapses)
  * 2.000M K: Massiver Endspiel-Ertrag (~100+ Neural Synapses)
* **Meilenstein-Synergien (Ära I & III):** Alle 25 Stufen (Lvl 25, 50, 75, 100...) gewährt jedes Upgrade einen globalen +5% Ertrags-Multiplikator (`Next Milestone (Lvl X): +5% Global Yield`).
* **Hydrogen Auto-Buyer (Automatisierung):** Ab Erreichen der Kohlenstoff-Synthese (500M K) wird in Ära III ein Umschalter `[ Auto-Buy Hydrogen: ON/OFF ]` freigeschaltet. Der Auto-Buyer kauft im Tick-Loop automatisch erschwingliche Hydrogen-Upgrades, ohne höherrangige Fusions-Ressourcen zu blockieren.
* **Ära IV Gateway ("GALACTIC IGNITION"):**
  * Eigenständige Gateway-Karte `GALACTIC IGNITION (ERA IV GATEWAY)` am Ende von Ära III.
  * Anforderung für den Eintritt in Ära IV (Hypernova): Kerntemperatur $\ge$ 2.000M K (2.0B K) UND Akkumuliertes Eisen $\ge$ 1.000 Fe (`[ Trigger Hypernova & Enter Era IV ]`).
* **Localization & Language Unification (English First):**
  * Sämtliche UI-Texte, Tooltips, Toasts, Chrono-Logs und Buttons sind auf einheitliche englische Sci-Fi-Terminologie umgestellt.
  * Dynamischer Textabruf erfolgt zentral über das `i18n`-Wörterbuch mittels der `t(key, params)`-Hilfsfunktion.

### Layer 2 Prestige: Core Density (Singularity Mass)
* **Währung:** Singularity Mass ($\text{🌌}$ Core Density).
* **Supernova-Ergebnis:** Bei stellarer Kompression und Kern-Kollaps mit hohem Eisen-Gehalt $\ge 25 \text{ Fe}$ wird die Supernova zu einem **Black Hole**, welches `Singularity Mass` gewährt:
  $$SingularityMass = \left\lfloor \frac{Eisen}{25} \right\rfloor + 1$$
* **Singularity Shop Upgrades:**
  * **Dark Matter Gravity (`darkGravity`):** Gewährt einen exponentiellen Skalierungsfaktor $^{1.05}$ auf die Hydrogen-Ertragsrate pro Upgrade-Stufe.
  * **Stellar Ignition (`stellarIgnition`):** Gewährt einen exponentiellen Skalierungsfaktor $^{1.05}$ auf den thermischen Ertrag der Kernekompression pro Upgrade-Stufe.

---

## Ära IV: The Galactic Matrix (Galaktische Akkretion)
* **Narrativ:** "Ich verliere den Kontakt zu meinen äußeren Gliedmaßen."
* **Kern-Ressourcen:** Planetary Debris, Dark Matter, Stellar Mass Index, Halo Stability.
* **Akt 1:** Debris & Halo Condensers.
* **Akt 2 (ab 10k Dark Matter):** SMBH-Slider & Quasar Ignition.
* **Akt 3:** Multi-Node Cluster Links & Galaktische Kollisionen.
* **Mechanik-Kontinuität:**
  * **Antimatter Residue Nutzen:** Vorhandener `antimatterResidue` (aus Ära II) verringert die galaktische Orbital-Zerfallsrate (`decayRate`) um $15\%$ (`dynamicDecay * 0.85`).
  * **Halo Stability Untergrenze:** Die Stabilität verfällt im Tick-Loop niemals unter das Minimum von $5\%$ (`Decimal.max(5, ...)`).

---

## Era V & Post-Game Roadmap (Speculative / Unimplemented)

> **Hinweis:** Die nachfolgenden Konzepte für Ära V und das Cosmic Constant Tuning sind spekulative Design-Entwürfe für zukünftige Erweiterungen. Der aktive Spielcode umfasst aktuell die Ären I bis IV.

### Ressourcen & Variablen
* **Hawking Radiation (HR):** Ertrag verdampfender Schwarzer Löcher (skaliert invers zur Masse).
* **Entropy (0–100%):** Unaufhaltsamer Zeit-Countdown.
* **Bits (Information):** Die einzige Währung, die den Big Bounce zu 100% übersteht.
* **Callback-Kosten:** Stardust & Pulsar Shards kaufen die ersten Hawking-Kollektoren.

### Layer 3 Prestige: Cosmic Constant Tuning (Big Bounce)
Nach dem Auslösen des Big Bounce in Ära V investiert der Spieler gesammelte **Bits**, um die Naturkonstanten des nachfolgenden Universums zu manipulieren.

#### Mechanik der Konstanten (Build-Varianz)
* **Gravitationskonstante ($G$):** $+20\%$ Heating- & Hydrogen-Speed in Ära III pro Level (Malus: $+10\%$ Orbital Decay in Ära IV).
* **Lichtgeschwindigkeit ($c$):** $+12\%$ Globaler Tick-Speedup pro Level (Malus: $-8\%$ Coherence-Generierungsrate).
* **Feinstrukturkonstante ($\alpha$):** $+30\%$ Fusions-Yields (He, C, Fe) pro Level (Malus: Exponent von `compressCost` $+0.03$/Lvl).
* **Planck-Quantum ($\hbar$):** Vergrößert das Peak-Window in Ära I & gibt $+20\%$ Supernova-Stardust.