import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPresetFreshEraI, getPresetLateEraI } from '../src/dev/playtestPresets.js';
import { setPlaytestMode, getPlaytestMode, setPlaytestSpeedMultiplier, getPlaytestSpeedMultiplier, getActiveSaveKey } from '../src/core/persistence.js';

describe('Playtest Save Isolation', () => {
  afterEach(() => {
    setPlaytestMode(false);
  });

  it('uses isolated save key in playtest mode', () => {
    setPlaytestMode(false);
    expect(getActiveSaveKey()).toBe('starForgeSave_v17');
    
    setPlaytestMode(true);
    expect(getActiveSaveKey()).toBe('starForgePlaytestSave_v17');
  });

  it('presets generate valid structural state', () => {
    const freshState = getPresetFreshEraI();
    expect(freshState.activeEpoch).toBe(1);
    
    const lateState = getPresetLateEraI();
    expect(lateState.resources.quantumFluctuations.amount.toNumber()).toBe(50000);
    expect(lateState.upgrades.quantum.gravityForce.level).toBe(5);
  });
});

describe('Simulation Timing & Speed', () => {
  afterEach(() => {
    setPlaytestSpeedMultiplier(1);
  });

  it('applies speed multiplier centrally', () => {
    setPlaytestSpeedMultiplier(5);
    expect(getPlaytestSpeedMultiplier()).toBe(5);
    
    setPlaytestSpeedMultiplier(25);
    expect(getPlaytestSpeedMultiplier()).toBe(25);
  });
});
