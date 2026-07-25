# 🛠️ Technical Design Document: Code Architecture & State Management

## 1. System-Architektur & Modul-Trennung (`script.js`)

Das Spiel folgt einem entkoppelten **Registry-State-Engine** Muster:

* **`COSMIC_REGISTRY`:** Statische Daten-Matrix. Enthält alle Definitionen für Ären, Ressourcen, Upgrades, Solar-Events und Lore-Texte.
* **`gameState`:** Das zentrale Laufzeit-State-Objekt. Enthält ausschließlich dynamische Variablen.
* **`break_infinity.js` (Decimal):** Alle mathematischen Operationen auf Ressourcen nutzen die `Decimal`-Klasse, um Floating-Point-Fehler und `NaN`-Degradierungen zu verhindern.

---

## 2. Simulation & Tick-Engine

* **`Timeline.process(dt)`:** Entkoppelte Physik-Engine, die in 100ms-Chunks (`dt = 0.10s`) rechnet.
* **Analytischer Offline-Fortschritt:** Bei Abwesenheit (bis zu 12 Stunden / 43.200s) berechnet `Timeline.process(dt)` den Ertrag über genau $\min(120, \lceil dt \rceil)$ gestufte Makro-Chunks (`chunkDt = dt / stepCount`). Garantiert Ausführungszeiten unter 50ms ohne Browser-Freeze.
* **`ensureStateShape()`:** Prüft beim Laden eines Savegames alle Keys und stellt sicher, dass neu eingeführte Felder abwärtskompatibel initialisiert werden.

---

## 3. DOM & Viewport Optimierung

* **Lazy DOM Caching (`Viewport.getEl()`):** Um DOM-Thrashing zu vermeiden, werden Element-Referenzen lazily in einem Dictionary gespeichert.
* **Dirty-Checking Flag (`isDirty`):** UI-Renderings (`Viewport.update()`) werden nur dann ausgeführt, wenn sich im Spielzustand tatsächlich Werte verändert haben.
* **CSS Whitelist Isolation:** Visuelle Sichtbarkeiten von Ären und Tabs werden primär über CSS-Attribute am `<body>` Tag gesteuert (`data-epoch`, `data-tab`).

---

## 4. State-Schema & Formel-Spezifikationen (Ära III & Prestige)

* **`gameState.era3.lifetimeCarbonThisRun`**: Trackt den gesamten in der aktuellen Ära III kumulierten Kohlenstoff (`Decimal`). Verhindert das Absinken von Prestige-Erträgen beim Kauf von Kohlenstoff-Upgrades.
* **Stardust-Yield Formel**:
  $$Stardust = \left\lfloor \left(\frac{T}{100.000.000}\right)^{1.6} \right\rfloor$$
* **Neural Synapse (Pulsar Shard) Yield Formel**:
  $$Pulsar = \left\lfloor \frac{lifetimeCarbonThisRun}{100} \times TempMult \right\rfloor$$
  wobei $TempMult = 1$ ($T < 500M K$), $3$ ($500M K \le T < 2B K$), $8$ ($T \ge 2B K$).
* **Core Density (Singularity Mass) Yield Formel**:
  $$SingularityMass = \left\lfloor \frac{Eisen}{25} \right\rfloor + 1 \quad (\text{sofern Supernova-Ergebnis } = \text{"Black Hole"})$$
* **Singularity Upgrades Exponenten**:
  * `darkGravity`: $HydrogenRate \propto BaseRate^{1 + (0.05 \times Level)}$.
  * `stellarIgnition`: $CompressionHeat \propto BaseHeat^{1 + (0.05 \times Level)}$.
* **Ära IV Gateway-Bedingungen**:
  * $T \ge 2.000.000.000 \text{ K} \quad (2.0B \text{ K})$
  * $Eisen \ge 1.000 \text{ Fe}$
* **Ära IV Stability & Antimatter Residue Kontinuität**:
  * $dynamicDecay = DecayRate \times (1 - 0.15 \times ArmStabilizationLvl)$.
  * Falls `antimatterResidue` > 0: $dynamicDecay = dynamicDecay \times 0.85$.
  * Stability Untergrenze: $Stability = \max(5, Stability - dynamicDecay \times dt)$.
* **Meilenstein-Synergie Formel**:
  $$MilestoneMult = 1.0 + \left\lfloor \frac{Level}{25} \right\rfloor \times 0.05$$
  (angewendet auf Ära I Quanten-Upgrades sowie Ära III Gravitations- & Kompressions-Knoten).
* **`gameState.autoBuyer.hydrogen.active`**: Booleanscher Umschalter für die automatische Ausführung von `Economy.buyCoreNodes('gravity')` im Tick-Loop von `Timeline.stellarDawn(dt)`, sobald $T \ge 500M K$ erreicht ist.
* **Vacuum Coherence Dynamik & Formeln**:
  * **Ära I:** `quantumLeapRisk()` $\rightarrow \Delta Coherence = -2.5\%$, `measureQuantumSafe()` $\rightarrow \Delta Coherence = +1.0\%$, Passive Regeneration $\Delta Coherence = +0.1\% \times dt$.
  * **Ära II:** $T > 8\text{M K} \rightarrow \Delta Coherence = -0.2\% \times dt$; Kühlung/Stabilität $\rightarrow \Delta Coherence = +0.5\% \times dt$.
  * **Ära III:** $T > 1.5\text{B K} \rightarrow \Delta Coherence = -0.1\% \times dt$; Normalbetrieb $\rightarrow \Delta Coherence = +0.5\% \times dt$.
  * **Ära IV:** $Coherence = \min(100, \max(0, HaloStability))$.
* **Text-Corruptor Engine (`corruptText`)**:
  * $Chance = \left(1 - \frac{Coherence}{100}\right) \times 0.8$.
  * Schwellenwerte: $<80\%$ (subtile Zeichen-Glitches 5%), $<50\%$ (mittlere Glitch-Texte & CSS-Effekte 15%), $<20\%$ (schwere Korruption 35%).

---

## 5. i18n Lokalisierungs-Architektur (`i18n` & `t(key, params)`)

* **Zentrales Wörterbuch (`i18n`)**: Strukturierter Hash-Table mit `en` als Default-Sprachschlüssel (`i18n.en`).
---

## 6. Playtest Bot Strategie-Konfiguration (`playtestBot.js`)

* **`playtestHarness.targetNode`**:
  * `'100M'` / `'TARGET_NODE_100M'`: Sofortiges Prestige-Auslösen bei $100\text{M K}$ (Supernova-Schwelle).
  * `'500M'` / `'TARGET_NODE_500M'`: Hält die Supernova zurück bis $500\text{M K}$ (Kohlenstoff-Synthese / Drei-Alpha-Prozess).
  * `'2B'` / `'TARGET_NODE_2B'`: Hält die Supernova zurück bis $2.000\text{M K}$ ($2.0\text{B K}$ / Eisen-Fusion & Ära IV Gateway).
  * Erlaubt automatisiertes Testen der Pulsar-Shard Ertragskurven und Ära IV Gateway-Bedingungen.
