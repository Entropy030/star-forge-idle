# 🌌 Game Design Document: Eras & Progression Mechanics

## Ära I: The Quantum Foam (Der Urknall & Quantenschaum)
* **Narrativ:** "Ich habe Masse. Ich bin getrennt vom Nichts."
* **Kern-Ressourcen:** Quantum Fluctuations, Energy Density.
* **Aktives Sub-System (Quanten-Superposition):**
  * Oszillation der Amplitude (0.1x bis 5.0x im 15s-Takt).
  * **Sicherer Kollaps:** Verlässlicher Ertrag + Coherence.
  * **Quantensprung (Risiko):** Payout bei Amplitude $\ge$ 4.0x liefert 500% Ertrag + Coherence-Burst.
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
* **Supernova Terminal:** Trigger ab 100M K $\rightarrow$ vergibt Synaptic Dust, Neural Synapses & Core Density.

---

## Ära IV: The Galactic Matrix (Galaktische Akkretion)
* **Narrativ:** "Ich verliere den Kontakt zu meinen äußeren Gliedmaßen."
* **Kern-Ressourcen:** Planetary Debris, Dark Matter, Stellar Mass Index, Halo Stability.
* **Akt 1:** Debris & Halo Condensers.
* **Akt 2 (ab 10k Dark Matter):** SMBH-Slider & Quasar Ignition.
* **Akt 3:** Multi-Node Cluster Links & Galaktische Kollisionen.

---

## Ära V: Deep Future (Das Schwarze Zeitalter & Wärmetod)

### Ressourcen & Variablen
* **Hawking Radiation (HR):** Ertrag verdampfender Schwarzer Löcher (skaliert invers zur Masse).
* **Entropy (0–100%):** Unaufhaltsamer Zeit-Countdown.
* **Bits (Information):** Die einzige Währung, die den Big Bounce zu 100% übersteht.
* **Callback-Kosten:** Stardust & Pulsar Shards kaufen die ersten Hawking-Kollektoren.

## 🎛️ Layer 2 Prestige: Cosmic Constant Tuning (Big Bounce)

Nach dem Auslösen des Big Bounce in Ära V investiert der Spieler gesammelte **Bits**, um die Naturkonstanten des nachfolgenden Universums zu manipulieren.

### Mechanik der Konstanten (Build-Varianz)
* **Gravitationskonstante ($G$):**
  * *Bonus:* $+20\%$ Heating- & Hydrogen-Speed in Ära III pro Level.
  * *Malus:* $+10\%$ Orbital Decay in Ära IV pro Level.
* **Lichtgeschwindigkeit ($c$):**
  * *Bonus:* $+12\%$ Globaler Tick-Speedup pro Level.
  * *Malus:* $-8\%$ Coherence-Generierungsrate pro Level.
* **Feinstrukturkonstante ($\alpha$):**
  * *Bonus:* $+30\%$ Fusions-Yields (He, C, Fe) pro Level.
  * *Malus:* Exponent von `compressCost` steigt leicht an ($+0.03$/Lvl).
* **Planck-Quantum ($\hbar$):**
  * *Bonus:* Vergrößert das Peak-Window in Ära I & gibt $+20\%$ Supernova-Stardust.
  * *Malus:* Verteuert automatische Tuner-Kosten.

### Die 3 Akte
* **Akt 1 (Das Schwarze Zeitalter):** Degenerate Matter Collectors sammeln Restwärme verglühter Sterne. Zufallsevent "Proton Decay Flicker" gibt HR-Bursts.
* **Akt 2 (Die Verdampfungs-Kaskade):** SMBH-Masse verdampft. *Terminal Burst:* Unterschreitet ein Loch eine Schwelle, gibt es einen gigantischen HR-Burst und erlischt.
* **Akt 3 (Der Big-Bounce-Terminal):**
  1. **Heat Death Acceptance (Sanfter NG+):** Moderater Bits- & Coherence-Carryover. Naturkonstanten bleiben stabil.
  2. **Forced Collapse (Radikaler NG+):** Hoher Einsatz. Belohnt mit höherem Bits-Yield, angehobener Coherence-Obergrenze und **zufällig verwürfelten Naturkonstanten** für den nächsten Run.

> **Narrativer Anker (Pfad A):** *"Ich lasse los. Was ich verstanden habe, reicht, um wiederzukehren."* > **Narrativer Anker (Pfad B):** *"Ich weigere mich zu enden. Ich falte mich zusammen, um neu zu beginnen – anders, aber ich."*

---

## ❓ Offene Design-Fragen (To-Discuss)
1. **Farmlock-Risiko:** Ära III Ereignishorizont könnte zur stundenlangen "Warte-Falle" werden $\rightarrow$ Ära IV/V entwertet?
2. **Antimatter Residue:** Braucht noch konkreten Nutzen in Ära IV/V.
3. **Halo Stability Malus:** Soll Stability aus Ära IV entschärft werden, umFrustration zu vermeiden?