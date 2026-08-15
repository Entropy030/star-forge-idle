import { beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { createOfflineSummary, captureOfflineSnapshot } from '../src/core/offlineSummary.js';
import { renderOfflineBriefing } from '../src/ui/offlineBriefing.js';
import { getInitialGameState, replaceRuntimeState, serializeState } from '../src/core/state.js';
import { gameState } from '../src/core/state.js';
import { setVacuumCoherence } from '../src/eras/quantum/coherence.js';

function buildSummary({ seconds = 60, actual = seconds, capApplied = false, before, after, checkpoint = { success: true } }) {
  return createOfflineSummary({
    loadMetadata: {
      actualElapsedSeconds: actual,
      creditedElapsedSeconds: seconds,
      capApplied,
      clockAnomaly: false
    },
    beforeSnapshot: before,
    afterSnapshot: after,
    progression: { effects: [] },
    checkpoint
  });
}

describe('offline return summary', () => {
  beforeEach(() => {
    replaceRuntimeState(getInitialGameState());
    document.body.innerHTML = `
      <section id="offline-return-briefing" aria-labelledby="offline-briefing-title" hidden>
        <header><h2 id="offline-briefing-title">While You Were Away</h2>
          <button class="offline-briefing-dismiss">Dismiss</button>
        </header>
        <div class="offline-briefing-body"></div>
      </section>`;
  });

  it('uses stable Decimal-safe snapshots rather than mutable state references', () => {
    gameState.resources.quantumFluctuations.amount = new Decimal(10);
    const snapshot = captureOfflineSnapshot(gameState);
    gameState.resources.quantumFluctuations.amount = new Decimal(20);

    expect(snapshot.resources.quantumFluctuations).toBe('10');
  });

  it('reports exact resource, physical, readiness, discovery, and waiting-decision changes', () => {
    const before = captureOfflineSnapshot(gameState);
    gameState.resources.quantumFluctuations.amount = new Decimal(100000);
    gameState.resources.energyDensity.amount = new Decimal(50000);
    setVacuumCoherence(gameState, new Decimal(100));
    gameState.codex.unlockedEntryIds.push('near-inflation');
    const after = captureOfflineSnapshot(gameState);

    const summary = buildSummary({ before, after });

    expect(summary.visible).toBe(true);
    expect(summary.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'quantumFluctuations', delta: '100000' }),
      expect.objectContaining({ key: 'energyDensity', delta: '50000' })
    ]));
    expect(summary.physical).toContainEqual(expect.objectContaining({ key: 'vacuumCoherence', before: '0', after: '100' }));
    expect(summary.newReadiness).toEqual([{ key: 'inflation', label: 'Cosmic Inflation' }]);
    expect(summary.discoveries.codex).toEqual(['near-inflation']);
    expect(summary.decisionsWaiting).toEqual([{ key: 'inflation', label: 'Initiate Cosmic Inflation' }]);
  });

  it('hides a trivial sub-minute resource-only return without suppressing its simulation data', () => {
    const before = captureOfflineSnapshot(gameState);
    gameState.resources.quantumFluctuations.amount = new Decimal(1);
    const after = captureOfflineSnapshot(gameState);

    const summary = buildSummary({ seconds: 30, before, after });

    expect(summary.visible).toBe(false);
    expect(summary.resources).toHaveLength(1);
  });

  it('surfaces cap, paused automation, and checkpoint failure without persisting summary state', () => {
    gameState.autoBuyer.hydrogen.active = true;
    gameState.upgrades.pulsar.autoCompress.level = 1;
    const before = captureOfflineSnapshot(gameState);
    const after = captureOfflineSnapshot(gameState);

    const summary = buildSummary({
      seconds: 28800,
      actual: 999999,
      capApplied: true,
      before,
      after,
      checkpoint: { success: false, message: 'Storage unavailable' }
    });
    const serialized = serializeState(gameState);

    expect(summary.pausedAutomation).toEqual(['Hydrogen Autobuyer', 'Auto-Compressor']);
    expect(summary.capApplied).toBe(true);
    expect(summary.persistenceWarning).toBe('Storage unavailable');
    expect(serialized).not.toHaveProperty('offlineSummary');
  });

  it('renders a semantic dismissible region without stealing focus', () => {
    const before = captureOfflineSnapshot(gameState);
    gameState.resources.quantumFluctuations.amount = new Decimal(60);
    const after = captureOfflineSnapshot(gameState);
    const summary = buildSummary({ before, after });
    const priorFocus = document.createElement('button');
    document.body.prepend(priorFocus);
    priorFocus.focus();

    renderOfflineBriefing(summary);

    const briefing = document.getElementById('offline-return-briefing');
    expect(briefing.hidden).toBe(false);
    expect(document.activeElement).toBe(priorFocus);
    expect(briefing.textContent).toContain('Universe simulated');
    expect(briefing.textContent).toContain('Quantum Fluctuations +60');

    briefing.querySelector('.offline-briefing-dismiss').click();
    expect(briefing.hidden).toBe(true);
  });
});
