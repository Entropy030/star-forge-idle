import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { getInitialGameState } from '../src/core/state.js';
import { advanceGameTick } from '../src/core/runtimeTick.js';
import { quantumCommandHandlers } from '../src/eras/quantum/commands.js';
import { getVacuumCoherenceRates, isVacuumCoherenceRelevant } from '../src/eras/quantum/coherence.js';
import { getInflationEligibility } from '../src/eras/quantum/inflation.js';
import { getQuantumUpgradeEligibility } from '../src/eras/quantum/eligibility.js';
import { getCosmosPresentation } from '../src/engine/cosmosPresentation.js';
import { getEraResourcePresentation } from '../src/engine/resourcePresentation.js';
import { CODEX_ENTRIES } from '../src/content/codex.js';
import { getPresetFreshEraI, getPresetLateEraI } from '../src/dev/playtestPresets.js';
import { gameState, replaceRuntimeState } from '../src/core/state.js';

function snapshot(value) {
  if (value instanceof Decimal) return { decimal: value.toString() };
  if (value instanceof Set) return { set: [...value].sort() };
  if (Array.isArray(value)) return value.map(snapshot);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, snapshot(child)]));
  return value;
}

describe('Era I Vacuum Coherence semantics', () => {
  it('uses the same passive stabilization rate in presentation and the Era I tick', () => {
    const state = getInitialGameState();
    state.unfold.introCompleted = true;
    replaceRuntimeState(state);
    const rate = getVacuumCoherenceRates(gameState).passiveRate;
    advanceGameTick(2);
    expect(gameState.coherence.eq(rate.times(2))).toBe(true);
  });

  it('uses the same observation gain in presentation and CLICK_CORE', () => {
    const state = getInitialGameState();
    state.cosmicConstants.c = 2;
    const gain = getVacuumCoherenceRates(state).observationGain;
    const result = quantumCommandHandlers.CLICK_CORE(state, {});
    expect(result.ok).toBe(true);
    expect(state.coherence.eq(gain)).toBe(true);
    expect(result.events[0].coherenceGain).toBe(gain.toString());
  });

  it('keeps Vacuum Coherence hidden on Fresh Era I', () => {
    const state = getPresetFreshEraI();
    expect(isVacuumCoherenceRelevant(state)).toBe(false);
    expect(getEraResourcePresentation(state).support.map(item => item.id)).not.toContain('coherence');
    expect(getCosmosPresentation(state).core.instruction).not.toContain('Vacuum Coherence');
  });

  it('introduces Vacuum Coherence contextually once its phase is relevant', () => {
    const state = getPresetLateEraI();
    const coherence = getEraResourcePresentation(state).support.find(item => item.id === 'coherence');
    const cosmos = getCosmosPresentation(state);
    expect(coherence.label).toBe('Vacuum Coherence');
    expect(coherence.roleHint).toContain('Inflation target: 100%');
    expect(cosmos.core.instruction).toBe('Vacuum Coherence is required to initiate Cosmic Inflation. Observation is optional acceleration.');
    expect(cosmos.core.metrics).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Passive stabilization', unit: '%/s' }),
      expect.objectContaining({ label: 'Observation', unit: '%' }),
      expect.objectContaining({ label: 'Inflation target', value: expect.any(Decimal) })
    ]));
  });

  it('names Vacuum Coherence and its 100% target in Inflation eligibility', () => {
    const requirement = getInflationEligibility(getPresetLateEraI()).requirements.find(item => item.id === 'coherence');
    expect(requirement).toMatchObject({ label: 'Vacuum Coherence', unit: '%' });
    expect(requirement.target.eq(100)).toBe(true);
  });

  it('does not falsely add Vacuum Coherence to quantum upgrade eligibility', () => {
    const state = getInitialGameState();
    state.stats.maxQF = new Decimal(1000000);
    for (const upgradeId of ['gravityForce', 'weakForce', 'electromagneticForce', 'vacuumResonance', 'strongForce']) {
      expect(getQuantumUpgradeEligibility(state, upgradeId).requirements.map(requirement => requirement.id)).not.toContain('coherence');
    }
  });

  it('keeps coherence presentation pure and documents the first Codex explanation', () => {
    const state = getPresetLateEraI();
    const before = snapshot(state);
    getCosmosPresentation(state);
    getEraResourcePresentation(state);
    expect(snapshot(state)).toEqual(before);

    const entry = CODEX_ENTRIES.find(candidate => candidate.id === 'vacuum-coherence');
    expect(entry.body).toContain('stability of the emerging universe');
    expect(entry.body).toContain('Cosmic Inflation');
  });
});
