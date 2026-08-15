import { describe, it, expect, beforeEach, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { CodexEngine } from '../src/ui/codex.js';
import { CODEX_ENTRIES } from '../src/content/codex.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { MIGRATIONS } from '../src/state/migrations.js';

describe('Codex content', () => {
  it('all entries have unique IDs and valid fields', () => {
    const ids = new Set();
    let prevSortOrder = -1;
    for (const entry of CODEX_ENTRIES) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
      expect(entry.category).toBeDefined();
      expect(entry.title).toBeDefined();
      expect(entry.body).toBeDefined();
      
      // Ensure no Era IV or Heat Death lore is present
      const fullText = (entry.title + entry.body + (entry.narrativeText||'')).toLowerCase();
      expect(fullText).not.toContain('heat death');
      expect(fullText).not.toContain('era iv');
      expect(fullText).not.toContain('galactic merge');
    }
  });

  it('remnant entry reflects dynamically', () => {
    const entry = CODEX_ENTRIES.find(e => e.id === 'remnant-outcome');
    expect(entry.unlockCondition.type).toBe('has_remnant');
  });
});

describe('Codex Engine - Unlocks', () => {
  let state;
  beforeEach(() => {
    state = createInitialState();
    CodexEngine.dispose();
  });

  it('unlocks the void correctly', () => {
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('void');
  });

  it('unlocks quantum entry at milestone', () => {
    state.resources.quantumFluctuations.amount = new Decimal(25000);
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('strong-nuclear');
  });

  it('unlocks plasma when era II reached', () => {
    state.activeEpoch = 2;
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('primordial-plasma');
  });

  it('unlocks recombination when era III begins', () => {
    state.activeEpoch = 3;
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('stellar-formation');
  });

  it('unlocks stellar architecture when upgraded', () => {
    state.upgrades.stellar = { compact: { level: 1 } };
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('compact-stellar');
  });

  it('unlocks supernova after first run', () => {
    state.stats.supernovas = new Decimal(1);
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('supernova-event');
    expect(state.codex.unlockedEntryIds).toContain('second-cycle');
  });

  it('unlocks remnant if meta field exists', () => {
    state.meta = { lastSupernovaOutcome: 'neutron-star' };
    CodexEngine.update(state);
    expect(state.codex.unlockedEntryIds).toContain('remnant-outcome');
  });

  it('never adds duplicate IDs on repeated updates', () => {
    state.meta = { lastSupernovaOutcome: 'neutron-star' };
    CodexEngine.update(state);
    CodexEngine.update(state);
    CodexEngine.update(state);
    const count = state.codex.unlockedEntryIds.filter(id => id === 'remnant-outcome').length;
    expect(count).toBe(1);
  });
});

describe('Codex Engine - Typewriter (fake timers)', () => {
  let state;
  beforeEach(() => {
    vi.useFakeTimers();
    state = createInitialState();
    CodexEngine.dispose();
    document.body.innerHTML = '<div id="chrono-neural-log"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts typing a new narrative', () => {
    CodexEngine.update(state);
    const el = document.getElementById('chrono-neural-log');
    expect(el.textContent).toBe('');
    vi.advanceTimersByTime(25 * 5);
    expect(el.textContent.length).toBeGreaterThan(0);
  });

  it('repeated update with same narrative does not restart it', () => {
    CodexEngine.update(state);
    vi.advanceTimersByTime(25 * 5);
    const textAt5 = document.getElementById('chrono-neural-log').textContent;
    
    CodexEngine.update(state); // Update again
    vi.advanceTimersByTime(25 * 5);
    const textAt10 = document.getElementById('chrono-neural-log').textContent;
    
    // Should continue typing, not restart
    expect(textAt10.length).toBeGreaterThan(textAt5.length);
  });

  it('changing narrative cancels previous timer', () => {
    CodexEngine.update(state);
    vi.advanceTimersByTime(25 * 5);
    
    // Change narrative condition
    state.resources.quantumFluctuations.amount = new Decimal(25000);
    CodexEngine.update(state);
    
    const el = document.getElementById('chrono-neural-log');
    expect(el.textContent).toBe(''); // Cleared for new text
    vi.advanceTimersByTime(25 * 5);
    expect(el.textContent.length).toBeGreaterThan(0);
    // Shouldn't contain the void text prefix
    expect(el.textContent).not.toContain('ACTION');
  });

  it('does not reinterpret stored Vacuum Coherence as later-era narrative integrity', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    state.activeEpoch = 2;
    state.coherence = new Decimal(0);

    CodexEngine.update(state);
    vi.runAllTimers();

    const el = document.getElementById('chrono-neural-log');
    expect(el.textContent).toBe(el.title);
  });

  it('dispose clears active timer', () => {
    CodexEngine.update(state);
    vi.advanceTimersByTime(25 * 2);
    CodexEngine.dispose();
    const len = document.getElementById('chrono-neural-log').textContent.length;
    vi.advanceTimersByTime(25 * 10);
    expect(document.getElementById('chrono-neural-log').textContent.length).toBe(len);
  });
  
  it('does not throw if DOM element missing', () => {
    document.body.innerHTML = '';
    expect(() => CodexEngine.update(state)).not.toThrow();
  });
});

describe('Codex Engine - Render', () => {
  let state;
  beforeEach(() => {
    state = createInitialState();
    CodexEngine.dispose();
    document.body.innerHTML = `
      <div id="codex-entry-list"></div>
      <div id="codex-detail-title"></div>
      <div id="codex-detail-body"></div>
    `;
  });

  it('renders unlocked entries in deterministic order', () => {
    state.codex.unlockedEntryIds = ['plasma-automation', 'void', 'quantum-foam'];
    CodexEngine.update(state);
    const list = document.getElementById('codex-entry-list');
    expect(list.children.length).toBe(3);
    expect(list.children[0].textContent).toBe('The Void');
    expect(list.children[1].textContent).toBe('Quantum Foam');
  });

  it('selecting an entry renders its title and body', () => {
    state.codex.unlockedEntryIds = ['void'];
    CodexEngine.update(state);
    
    const btn = document.getElementById('codex-entry-list').children[0];
    btn.click();
    
    expect(document.getElementById('codex-detail-title').textContent).toBe('The Void');
    expect(document.getElementById('codex-detail-body').textContent).toContain('initial state of nothingness');
  });
});

describe('Codex Persistence & Migration', () => {
  it('idempotent migration of bad codex values', () => {
    let legacy = createInitialState();
    legacy.codex = null;
    let m1 = MIGRATIONS[15](legacy);
    expect(m1.codex.unlockedEntryIds).toEqual([]);
    
    let legacy2 = createInitialState();
    legacy2.codex = { unlockedEntryIds: ['void', 'void', null, 42, ''] };
    let m2 = MIGRATIONS[15](legacy2);
    expect(m2.codex.unlockedEntryIds).toEqual(['void']);
    
    // Idempotent
    let m3 = MIGRATIONS[15](m2);
    expect(m3.codex.unlockedEntryIds).toEqual(['void']);
  });
});
