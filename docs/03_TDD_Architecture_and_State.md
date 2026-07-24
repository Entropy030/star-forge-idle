# 🛠️ Technical Design Document: Code Architecture & State Management

## 1. System-Architektur & Modul-Trennung (`script.js`)

Das Spiel folgt einem entkoppelten **Registry-State-Engine** Muster:

* **`COSMIC_REGISTRY`:** Statische Daten-Matrix. Enthält alle Definitionen für Ären, Ressourcen, Upgrades, Solar-Events und Lore-Texte.
* **`gameState`:** Das zentrale Laufzeit-State-Objekt. Enthält ausschließlich dynamische Variablen.
* **`break_infinity.js` (Decimal):** Alle mathematischen Operationen auf Ressourcen nutzen die `Decimal`-Klasse, um Floating-Point-Fehler und `NaN`-Degradierungen zu verhindern.

---

## 2. Simulation & Tick-Engine

* **`Timeline.process(dt)`:** Entkoppelte Physik-Engine, die in 100ms-Chunks (`dt = 0.10s`) rechnet.
* **Offline-Progress:** Verarbeitet verstrichene Zeit mathematisch über Mittelwerte, um CPU-Spitzen beim Laden zu vermeiden.
* **`ensureStateShape()`:** Prüft beim Laden eines Savegames alle Keys und stellt sicher, dass neu eingeführte Felder abwärtskompatibel initialisiert werden.

---

## 3. DOM & Viewport Optimierung

* **Lazy DOM Caching (`Viewport.getEl()`):** Um DOM-Thrashing zu vermeiden, werden Element-Referenzen lazily in einem Dictionary gespeichert.
* **Dirty-Checking Flag (`isDirty`):** UI-Renderings (`Viewport.update()`) werden nur dann ausgeführt, wenn sich im Spielzustand tatsächlich Werte verändert haben.
* **CSS Whitelist Isolation:** Visuelle Sichtbarkeiten von Ären und Tabs werden primär über CSS-Attribute am `<body>` Tag gesteuert (`data-epoch`, `data-tab`).
