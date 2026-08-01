# 🛠️ Technical Design Document: Code Architecture & State Management

## 1. System-Architektur & Modul-Trennung (Vite & ES Modules)

Das Spiel folgt einem entkoppelten **Registry-State-Engine** Muster, aufgebaut auf **Vite** und **ES Modules** im `src/` Verzeichnis (zuvor monolithisches `script.js`):

* **`src/config/registry.js`:** Statische Daten-Matrix. Enthält alle Definitionen für Ären, Ressourcen, Upgrades, Solar-Events und Lore-Texte.
* **`src/core/state.js`:** Das zentrale Laufzeit-State-Objekt. Enthält ausschließlich dynamische Variablen.
* **`break_infinity.js` (Decimal):** Alle mathematischen Operationen auf Ressourcen nutzen die `Decimal`-Klasse, um Floating-Point-Fehler und `NaN`-Degradierungen zu verhindern.

---

## 2. Simulation & Tick-Engine

* **`Timeline.process(dt)`:** Entkoppelte Physik-Engine, die in 100ms-Chunks (`dt = 0.10s`) rechnet.
* **Analytischer Offline-Fortschritt:** Bei Abwesenheit (bis zu 12 Stunden / 43.200s) berechnet `Timeline.process(dt)` den Ertrag über genau $\min(120, \lceil dt \rceil)$ gestufte Makro-Chunks (`chunkDt = dt / stepCount`). Garantiert Ausführungszeiten unter 50ms ohne Browser-Freeze.
* **`ensureStateShape()`:** Prüft beim Laden eines Savegames alle Keys und stellt sicher, dass neu eingeführte Felder abwärtskompatibel initialisiert werden.

---

## 3. DOM & Viewport Optimierung & Performance Hardening

* **Lazy DOM Caching (`Viewport.getEl()`):** Um DOM-Thrashing zu vermeiden, werden Element-Referenzen lazily in einem Dictionary gespeichert.
* **Cached Layout Anchors (`_coreAnchorCache`):** `getBoundingClientRect()` wurde vollständig aus dem 100ms `Viewport.update()` Hot-Path entfernt. Anker-Koordinaten (`--core-anchor-x`, `--core-anchor-y`) werden ausschließlich beim Boot und in einem `resize`-EventListener aktualisiert.
* **Deep Proxy State Reactivity (State-Kapselung):** Der `gameState` ist vollständig in einen `createReactiveState()` Proxy gewrappt. Jegliche Zuweisung (z.B. `gameState.resources.x = y`) triggert auf unterster Ebene vollautomatisch den `isDirty`-Flag für das UI-Rerendering. Manuelle `isDirty = true` Aufrufe wurden zu 100% eliminiert.
* **UI Templating (`src/ui/templates.js`):** HTML-Struktur-Strings für Shop-Listen und den Artefakt-Picker sind vom DOM-Rendering in `viewport.js` getrennt und in reinen Template-Funktionen gekapselt. Das reduziert Inline-Markup im JavaScript erheblich und erleichtert künftiges Theming.
* **DOM Object Pool für Partikel (`floatingTextPool`):** 30 `.floating-text-particle` DOM-Knoten werden beim Start prä-allokiert und im Ringpuffer wiederverwendet. Eliminierte Garbage Collection (GC) Thrashing beim schnellen Tappen.
* **Card Row Caching (`row._cache`):** In `renderGenericTierList()` werden Kindelemente (`name`, `lvl`, `desc`, `btn`) direkt am Row-Knoten gecached, um wiederholtes `querySelector()` zu vermeiden.
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
  $$MilestoneMult = 1.0 + \left\lfloor \frac{Level}{10} \right\rfloor \times 0.05$$
  (angewendet auf Ära I Quanten-Upgrades sowie Ära III Gravitations- & Kompressions-Knoten alle 10 Stufen).
* **Typewriter Single-Push Event Queue (`data-active-text`)**:
  * `typeWriter(logNode, text, speed)` wird ausschließlich dann getriggert, wenn `logNode.getAttribute('data-active-text') !== activeLog`.
  * Verhindert kontinuierliche Wiederholungen oder Rerender-Schleifen während des regulären Tick-Loops.
* **`gameState.unfold` Permanente State-Shape Spezifikation**:
  * `hasUnlocked1QF` (Boolean): Wird einmalig `true`, sobald das Konto jemals $\ge 1$ QF erreicht hat. Hält den Quanten-Zähler im HUD dauerhaft sichtbar.
  * `hasUnlocked10QF` (Boolean): Wird einmalig `true`, sobald das Konto jemals $\ge 10$ QF erreicht hat. Hält die Upgrade-Karten und Navigationstabs dauerhaft sichtbar (auch bei Kontostand = 0 QF).
  * `hasUnlocked100QF` (Boolean): Wird einmalig `true`, sobald das Konto jemals $\ge 100$ QF erreicht hat.
  * `introCompleted` (Boolean): Speichert den Abschluss der Cinematic Black Screen Intro-Overlay Sequenz.
* **`Viewport.update()` Intro DOM Guard & Async Narrative Streamer Engine**:
  * `Viewport.update()` startet mit einem strikten Guard Clause (`if (!gameState.unfold?.introCompleted && overlay.style.display !== 'none') return;`), um jegliche Mutation an `#intro-narrative-text` während des aktiven Intro-Overlays zu verhindern.
  * Das Intro verwendet einen entkoppelten `async/await` Streamer (`playIntroNarrative()`), der Zeile für Zeile Zeichen in `<p class="intro-line">` injiziert.
  * Ein Klick auf `#intro-story-card` setzt `target.dataset.skipped = "true"`, wodurch die Zeilen ohne Verzögerung vervollständigt werden und der Button `#btn-intro-complete` freigeschaltet wird.
  * Ein Guard-Flag `overlay.dataset.initialized = "true"` stellt die Single-Execution sicher und wird beim Reset via `delete overlay.dataset.initialized` gereinigt.
* **Z-Index Layering Hierarchy Rules**:
  * `z-index: 10001`: `#intro-screen-overlay` (Top modal gate, sits above all elements).
  * `z-index: 10000`: `#era-transition-overlay` (Macro Era shift prompts).
  * `z-index: 9998`: `#toast-container` (Glassmorphic system toasts).
  * `z-index: 9997`: `#ai-dev-controls` (Developer overlay matrix).
  * `z-index: 1000`: `#nav-tab-menu` (Fixed mobile navigation capsule system).
  * `z-index: 100`: `.dashboard-container` (Sticky header and HUD resource metric boxes).
  * `z-index: 3`: `.core-canvas` (Central hero star core interactive visualizer).
* **Rotating Solar Flare Aura Positioning & Concentric Canvas Origin**:
  * Canvas Dynamic Center Origin: `cx = canvas.clientWidth / 2`, `cy = canvas.clientHeight / 2`.
  * `#star-core` Radial Gradient Origin: `radial-gradient(circle at 50% 50%, ...)` zentriert alle glühenden Coronas und orbitalen Partikel ohne diagonale Versätze.
  * Solar Flare Aura (`.core-canvas::before`): Positioniert als zentriertes `$420px \times 420px$` Element (`top: 50%`, `left: 50%`, `margin-top: -210px`, `margin-left: -210px`) direkt hinter `.core-canvas`.
  * Verwendet `radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(108, 92, 231, 0.08) 45%, transparent 70%)`.
  * Rotiert kontinuierlich via `@keyframes rotateAura` (24s linear infinite) mit `transform-origin: center center`, 100% konzentrisch zentriert bei allen Viewport-Breiten.
* **`gameState.autoBuyer.hydrogen.active`**: Booleanscher Umschalter für die automatische Ausführung von `Economy.buyCoreNodes('gravity')` im Tick-Loop von `Timeline.stellarDawn(dt)`, sobald $T \ge 500M K$ erreicht ist.
* **`gameState.artifacts` Schema & $O(1)$ `ArtifactManager` Cache Pipeline**:
  * **Schema:** `artifacts: { equipped: [null, null, null], unlocked: [...], modifiers: { productionMult: 1.0, costDiscount: 0.0, clickCoherenceBonus: 0.0, clickPassiveBoost: 0.0, act3Multiplier: 1.0 } }`
  * **$O(1)$ Evaluator:** `recalculateArtifactModifiers()` wird **ausschließlich** getriggert, wenn Artefakte ausgerüstet oder abgelegt werden. Modifikatoren fließen in `getQuantumFluctuationRate()` und `Economy.buy()` ein.
  * **UI-Events:** Sockel-Klicks öffnen den `.artifact-picker` Drawer für schwebende Interaktionen ohne Re-Render-Schleifen.
* **$O(1)$ `ActManager` Evaluator & Attributes**:
  * `ActManager.evaluate()` führt in $O(1)$ Zeit State-Checks durch und setzt `currentAct` (1, 2, 3) für die jeweilige Ära.
  * Das HTML-Attribut `data-act="1|2|3"` wird automatisch am Container / `body` aktualisiert.
* **Text-Corruptor Engine (`corruptText(text, coherence)`)**:
  * Werden Zeichen in `chrono-neural-log` Terminal-Einträgen ersetzt durch Symbols `['#', '%', '░', '█', 'Ø', '§', 'Δ', 'X', '0']`.
  * Schaltet stumm (`cleanText`), wenn `prestige.autoStabilizer === true` ODER `vacuumCoherence >= 1.0` ODER `currentAct > 1`.
  * Leerzeichen und Zeilenumbrüche bleiben stets unberührt.
  * Alle Buttons, Klickzähler, Tooltips und Kosten bleiben strikt unberührt.

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
