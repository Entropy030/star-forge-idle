import { describe, it, expect, beforeEach } from 'vitest';
import { getInitialGameState } from '../src/core/state.js';
import { quantumCommandHandlers } from '../src/eras/quantum/commands.js';
import { CodexEngine } from '../src/ui/codex.js';
import { CODEX_ENTRIES } from '../src/content/codex.js';

describe('Progression unlock regressions', () => {
  let state;
  beforeEach(() => {
    state = getInitialGameState();
    state.activeEpoch = 1;
    state.resources.quantumFluctuations = { amount: new Decimal(0) };
    state.stats.maxQF = new Decimal(0);
    state.codex = { unlockedEntryIds: [] };
  });

  it('clicking core tracks maxQF and never decreases it when spending', () => {
    // Simulate clicks to get 15 QF
    for(let i=0; i<15; i++) {
       quantumCommandHandlers.CLICK_CORE(state, { type: 'CLICK_CORE' });
    }
    expect(state.resources.quantumFluctuations.amount.toNumber()).toBe(15);
    expect(state.stats.maxQF.toNumber()).toBe(15);

    // Simulate spending
    state.resources.quantumFluctuations.amount = new Decimal(5);
    expect(state.stats.maxQF.toNumber()).toBe(15); // Max QF should remain 15

    // Simulate more clicks
    for(let i=0; i<5; i++) {
       quantumCommandHandlers.CLICK_CORE(state, { type: 'CLICK_CORE' });
    }
    // Now QF is 10, but max is still 15
    expect(state.resources.quantumFluctuations.amount.toNumber()).toBe(10);
    expect(state.stats.maxQF.toNumber()).toBe(15);
  });

  it('codex engine permanently unlocks entries based on threshold and active narrative uses them', () => {
    state.resources.quantumFluctuations.amount = new Decimal(100);
    CodexEngine.unlockAvailableEntries(state);

    expect(state.codex.unlockedEntryIds).toContain('fluctuation-condenser');
    
    let active = CodexEngine.getActiveNarrative(state);
    expect(active.id).toBe('fundamental-forces'); // The 100 QF one

    // Now spend QF down to 0
    state.resources.quantumFluctuations.amount = new Decimal(0);
    
    // Unlocks should remain, and active narrative should remain fundamental-forces
    let activeAfterSpend = CodexEngine.getActiveNarrative(state);
    expect(activeAfterSpend.id).toBe('fundamental-forces');
    expect(state.codex.unlockedEntryIds).toContain('fluctuation-condenser');
  });
});
