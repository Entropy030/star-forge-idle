# 🌌 Game Design Document: Eras & Progression Mechanics

## Ära I: The Quantum Foam (Cinematic Intro, Permanent Unfold, 5-50-5-50 Pacing & Engine Hardening)
* **Quantum Superposition Architektonische Bereinigung:**
  * Vollständige Entfernung des ungenutzten Quantum Superposition Mechanismus (`measureQuantumSafe()`, `quantumLeapRisk()`, `quantumStorage`, `getQuantumAmplitude()`, `quantumPhaseTime`).
  * Era I ist hyper-fokussiert auf Core Clicks, Fluctuation Upgrades und den sauberen Entfaltungs-Hain.
* **5-50-5-50 Pacing & Kostenkurven-Rebalancierung:**
  * Geglätteter Fortschrittsverlauf im Bereich 0 bis 100.000 QF:
    * `gravityForce`: Base Cost 10 QF (Scaling 1.35)
    * `weakForce`: Base Cost 120 QF (Scaling 1.40)
    * `electromagneticForce`: Base Cost 1,500 QF (Scaling 1.45)
    * `vacuumResonance`: Interim-Upgrade bei 5,000 QF (Scaling 1.50, +450 QF/s, +100 Density/s) schließt das Pacing-Loch vor der starken Kraft.
    * `strongForce`: Base Cost 18,000 QF (Scaling 1.55)
  * Zusätzliche chronologische Terminal-Logeinträge bei 500, 2,500, 10,000 und 25,000 QF halten die diegetische Immersion aufrecht.
* **Black Screen Cinematic Intro Overlay & Automated Pre-Cosmic Vacuum Narrative:**
  * Bei neuem Spielstart / Reset wird die Glassmorphism Story Card (`#intro-screen-overlay` / `#intro-story-card`) ab Frame 1 zu 100% sichtbar gerendert.
  * Sequenzielle, vollautomatisierte Schreibmaschinen-Zeilen (ohne dass der Nutzer klicken muss):
    1. `t = -0.00000000001s :: PRE-COSMIC VACUUM STATE`
    2. `No space. No time. Only infinite probability density dormant in pure nothingness.`
    3. `A single observer awakens. Your first glance collapses the void and ignites the Star Forge.`
  * Der Aktions-Button `[ INITIALIZE OBSERVER PROTOCOL ]` erscheint erst nach Beendigung der letzten Zeile (oder bei optionalem Skip-Klick) und startet die Ära I Beobachtung.
* **Permanente Unfold State Flags (`gameState.unfold`):**
  * Entkopplung der UI-Sichtbarkeit von der aktuellen Währungsbilanz.
  * Verwendet permanente Flags (`hasUnlocked1QF`, `hasUnlocked10QF`, `hasUnlocked100QF`). Einmal freigeschaltete Panels (z. B. Upgrade-Karten ab 10 QF) bleiben permanent geöffnet, selbst wenn QF beim Kauf auf 0 sinkt.
* **Erweiterter Star Core Hitbox Radius:**
  * Großzügige Klickzone (`#star-core::before` mit ~280px-300px Durchmesser, 2.5x-3x des visuellen Kerns).
  * Garantiert fehlerfreies Klicken in der gesamten zentralen Kernregion ohne präzises Zielen.
  * Durchgängiger `cursor: pointer` und instantanes haptisches Skalier-Feedback.
* **Holographic Sci-Fi & Glassmorphism Design Standard:**
  * **Farbschema & Visuals:** Dominantes Cyan/Neon-System (`background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`, `backdrop-filter: blur(var(--glass-blur))`).
  * **Hero Core Visualizer:** Der zentrale `#star-core` Canvas steht als visueller Held im Zentrum mit einer ambienten radialen Aura (`background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)`).
* **Universelles 3-Akt-Designprinzip & Vacuum Coherence Engine:**
  * **Akt 1 (Erwachen / Ignition):** Cold Boot Zustand. Manuelle Klicks (`unfoldCount`) erzeugen Quantenschaum (`quantumFoam`) und stabilisieren schrittweise die Kohärenz (`vacuumCoherence`: 0.0 $\rightarrow$ 1.0). Terminal-Logs durchlaufen bei $Coherence < 1.0$ die `corruptText` Glitch-Engine. UI-Elemente bleiben 100% lesbar. Visuals: Minimalistisch (`data-act="1"`).
  * **Akt 2 (Expansion / Equilibrium):** Trigger bei `quantumFoam >= 100` AND `vacuumCoherence >= 1.0`. Fluctuation Condenser öffnet permanent. Terminal-Logs werden vollkommen klar (`data-act="2"`). Automatisierte Generatoren übernehmen.
  * **Akt 3 (Klimax / Critical Mass):** Trigger bei `quantumFoam >= 10000`. Overdrive-Visuals aktivieren einen pulsierenden orange/weißen Glow (`data-act="3"`) für das bevorstehende Cosmic Inflation Event bei 100,000 QF.
* **Forge Artifacts System (Balatro-inspired Collectibles):**
  * **Die 3 Goldenen Regeln:** Maximal 3 equipped Slots, streng strukturierte Farb-Kategorien (Produktion = Blau `#00d2ff`, Effizienz = Grün `#00ff88`, Synergie = Violett `#a855f7`), präzise Ein-Satz-Effekte.
  * **Initial-Pool der 6 Artefakte:**
    1. `quantum_lens` (Blau, Common): +25% Quantum Foam Ertrag (`productionMult: 1.25`).
    2. `density_compressor` (Grün, Common): 10% Ersparnis auf alle Generator-Kosten (`costDiscount: 0.10`).
    3. `pulse_coupler` (Violett, Uncommon): Jeder Core-Klick erhöht die Passiv-Produktion für 3s um +10% (`clickPassiveBoost: 0.10`).
    4. `singularity_core` (Blau, Uncommon): +50% Ertrag in Akt 3 (`act3Multiplier: 1.50`).
    5. `vacuum_stabilizer` (Grün, Rare): Setzt Coherence dauerhaft auf 1.0 (schützt vor Glitches).
    6. `big_bang_catalyst` (Violett, Rare): +1 zusätzliche Prestige-Währung bei Aufstieg zu Ära II.

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
* **Meilenstein-Synergien (Ära I & III):** Alle 10 Stufen (Lvl 10, 20, 30, 40...) gewährt jedes Upgrade einen globalen +5% Ertrags-Multiplikator (`Next Milestone (Lvl X): +5% Global Yield`).
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