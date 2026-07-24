# 🤖 Technical Design Document: Automated Playtest Bot & Telemetry

## 1. Playtest Engine (`playtestBot.js`)

Um Pacing-Anpassungen, Scaling-Kurven und Balancing über mehrere Spielstunden hinweg in Realsekunden zu testen, existiert eine integrierte Bot-Harness.

* **`window.runHeadlessSim({ durationInGameSeconds })`:** Simuliert z. B. 3 Stunden Spielzeit (10.800s) ohne Grafik-Rendering in ~1–2 Realsekunden.
* **`window.startAutoPlaytest({ speed })`:** Löst Entscheidungs-Ticks in Echtzeit mit z. B. 10x Geschwindigkeit aus.

---

## 2. Bot Decision Tree (Entscheidungs-Logik)

In jedem Tick evaluiert der Bot folgende Prioritäten-Hierarchie:

1. **Solar Flares / Prominences:** Aktive Prominences sofort einsammeln.
2. **Prestige / Stardust Upgrades:** Prüfen, ob Stardust-Upgrades (z. B. `thermalInsulation`) bezahlbar sind.
3. **Core / Ären-Upgrades:**
   * Filtert Upgrades nach Leistbarkeit (`canAfford`).
   * Prüft bei Ära III, ob der Yield des jeweiligen Elements $> 0$ ist (verhindert Carbon/Iron-Spamming bei Yield = 0).
4. **Prestige-Trigger:** Führt Inflation, Recombination oder Supernova aus, sobald die Schwellenwerte erreicht sind.

---

## 3. Telemetrie & Auswertung

* **`window.getTelemetryHistory()`:** Speichert das Erreichen von Meilensteinen mit folgenden Metriken:
  * `gameSeconds`: Spielzeit in Sekunden.
  * `ticks`: Anzahl durchgeführter Ticks.
  * `realTimeSec`: Verstrichene Realsekunden.
  * `details`: Zusatzinformationen zum Event.
* **Ausgabe:** Kann jederzeit per `console.table(window.getTelemetryHistory())` in der Browser-Konsole als saubere Tabelle eingesehen werden.
