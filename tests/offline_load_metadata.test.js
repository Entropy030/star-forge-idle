import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import {
  MAX_OFFLINE_SECONDS,
  getActiveSaveKey,
  getElapsedLoadMetadata,
  importSave,
  loadGame,
  setPlaytestMode
} from '../src/core/persistence.js';
import { disablePlaytestMode, preparePlaytestBoot } from '../src/dev/playtestMode.js';
import { gameState, getInitialGameState, replaceRuntimeState } from '../src/core/state.js';
import { serializeState } from '../src/state/serialization.js';

function installSave({ state = getInitialGameState(), savedAt, key = 'starForgeSave_v18' }) {
  localStorage.setItem(key, JSON.stringify({
    version: 18,
    gameState: serializeState(state),
    lastSavedTime: savedAt
  }));
}

describe('structured offline load metadata', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setPlaytestMode(false);
    replaceRuntimeState(getInitialGameState());
  });

  afterEach(() => {
    disablePlaytestMode();
    setPlaytestMode(false);
    localStorage.clear();
    sessionStorage.clear();
    replaceRuntimeState(getInitialGameState());
  });

  it('describes a fresh boot without duplicating gameplay state', () => {
    const metadata = loadGame({ now: 100_000 });

    expect(metadata).toEqual({
      loaded: false,
      source: 'fresh',
      actualElapsedSeconds: 0,
      creditedElapsedSeconds: 0,
      capApplied: false,
      clockAnomaly: false,
      recovered: false
    });
    expect(metadata).not.toHaveProperty('gameState');
  });

  it.each([
    [0, 0, false],
    [60, 60, false],
    [MAX_OFFLINE_SECONDS, MAX_OFFLINE_SECONDS, false],
    [MAX_OFFLINE_SECONDS + 1, MAX_OFFLINE_SECONDS, true],
    [Number.MAX_SAFE_INTEGER / 1000, MAX_OFFLINE_SECONDS, true]
  ])('credits %s elapsed seconds as %s with cap=%s', (elapsed, credited, capApplied) => {
    const metadata = getElapsedLoadMetadata(1_000, 1_000 + elapsed * 1000);

    expect(metadata.actualElapsedSeconds).toBe(elapsed);
    expect(metadata.creditedElapsedSeconds).toBe(credited);
    expect(metadata.capApplied).toBe(capApplied);
    expect(metadata.clockAnomaly).toBe(false);
  });

  it('flags a negative clock delta and never credits negative simulation', () => {
    const metadata = getElapsedLoadMetadata(61_000, 1_000);

    expect(metadata.actualElapsedSeconds).toBe(-60);
    expect(metadata.creditedElapsedSeconds).toBe(0);
    expect(metadata.clockAnomaly).toBe(true);
    expect(metadata.capApplied).toBe(false);
  });

  it('returns structured metadata for a valid normal save', () => {
    const loaded = getInitialGameState();
    loaded.resources.quantumFluctuations.amount = new Decimal(42);
    installSave({ state: loaded, savedAt: 40_000 });

    const metadata = loadGame({ now: 100_000 });

    expect(metadata).toMatchObject({
      loaded: true,
      source: 'normal-save',
      actualElapsedSeconds: 60,
      creditedElapsedSeconds: 60,
      recovered: false
    });
    expect(gameState.resources.quantumFluctuations.amount.eq(42)).toBe(true);
  });

  it('gives rejected data no offline credit', () => {
    localStorage.setItem('starForgeSave_v18', '{invalid');

    const metadata = loadGame({ now: 100_000 });

    expect(metadata).toMatchObject({
      loaded: false,
      source: 'recovery',
      creditedElapsedSeconds: 0,
      recovered: true
    });
  });

  it('re-anchors a manual import instead of preserving its historical timestamp', () => {
    const imported = getInitialGameState();
    imported.resources.quantumFluctuations.amount = new Decimal(99);
    const encoded = btoa(JSON.stringify({
      version: 18,
      gameState: serializeState(imported),
      lastSavedTime: 1_000
    }));

    const result = importSave(encoded, { now: 100_000 });
    const stored = JSON.parse(localStorage.getItem(getActiveSaveKey()));
    const metadata = loadGame({ now: 100_000 });

    expect(result).toMatchObject({ success: true, source: 'manual-import', offlineAnchorReset: true });
    expect(stored.lastSavedTime).toBe(100_000);
    expect(metadata.creditedElapsedSeconds).toBe(0);
    expect(gameState.resources.quantumFluctuations.amount.eq(99)).toBe(true);
  });

  it('selects isolated playtest persistence before loading and grants no offline credit', () => {
    const normal = getInitialGameState();
    normal.activeEpoch = 2;
    const playtest = getInitialGameState();
    playtest.activeEpoch = 3;
    installSave({ state: normal, savedAt: 1_000 });
    installSave({ state: playtest, savedAt: 1_000, key: 'starForgePlaytestSave_v18' });

    expect(preparePlaytestBoot('?playtest=1')).toBe(true);
    const metadata = loadGame({ now: 100_000 });

    expect(getActiveSaveKey()).toBe('starForgePlaytestSave_v18');
    expect(metadata).toMatchObject({
      loaded: true,
      source: 'playtest-save',
      actualElapsedSeconds: 99,
      creditedElapsedSeconds: 0
    });
    expect(gameState.activeEpoch).toBe(3);
    expect(localStorage.getItem('starForgeSave_v18')).not.toBeNull();
  });
});
