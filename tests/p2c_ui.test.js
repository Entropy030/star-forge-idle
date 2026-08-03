import { describe, it, expect, beforeEach, vi } from 'vitest';
import Decimal from '../break_infinity.js';
import { Viewport } from '../src/ui/viewport.js';
import { createInitialState } from '../src/state/createInitialState.js';
import { COSMIC_REGISTRY } from '../src/config/registry.js';
import { gameState } from '../src/core/state.js';

describe('Supernova UI', () => {
  beforeEach(() => {
    // Reset global state
    Object.assign(gameState, createInitialState());
    gameState.activeEpoch = 3;
    
    // Set up DOM
    document.body.innerHTML = `
      <div id="supernova-outcome-type"></div>
      <div id="supernova-outcome-archetype"></div>
      <div id="supernova-outcome-yields"></div>
      <div id="supernova-outcome-reasons"></div>
      <div id="supernova-outcome-status"></div>
      <button id="btn-supernova"></button>
    `;
  });

  it('displays wrong epoch status safely', () => {
    gameState.activeEpoch = 2;
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Blocked: Supernova is only available during Era III.');
    const btn = document.getElementById('btn-supernova');
    expect(btn.disabled).toBe(true);
  });

  it('displays insufficient temperature status safely', () => {
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal(100); // Too low
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Blocked: Increase the Stellar core temperature to 100M K.');
    expect(document.getElementById('btn-supernova').disabled).toBe(true);
  });

  it('displays incomplete stellar state status', () => {
    gameState.era3.stage = 'Protostar';
    gameState.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Blocked: Reach the Main Sequence Stellar state.');
  });
  
  it('displays iron locked status', () => {
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    gameState.era3.ironYield = new Decimal(0);
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Blocked: Unlock Iron fusion.');
  });

  it('displays insufficient iron status', () => {
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    gameState.era3.ironYield = new Decimal(1);
    gameState.resources.iron.amount = new Decimal(0);
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Blocked: Accumulate 1,000 Iron.');
    expect(document.getElementById('btn-supernova').textContent).toBe('Requires: Accumulate 1,000 Iron.');
  });

  it('displays ready status and enables button when eligible', () => {
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    gameState.era3.ironYield = new Decimal(1);
    gameState.resources.iron.amount = new Decimal(1000);
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-status').textContent).toBe('Ready for Supernova');
    const btn = document.getElementById('btn-supernova');
    expect(btn.disabled).toBe(false);
    expect(btn.textContent).toBe('TRIGGER SUPERNOVA RESET SEQUENCE');
  });

  it('renders massive outcome correctly', () => {
    gameState.era3.stage = 'Main Sequence Star';
    gameState.era3.temperature = new Decimal(COSMIC_REGISTRY.constants.supernovaTempThreshold);
    gameState.era3.ironYield = new Decimal(5);
    gameState.resources.iron.amount = new Decimal(1000);
    
    gameState.upgrades.stellar.massive = { level: 5 };
    Viewport.updateSupernovaOutcome();
    
    expect(document.getElementById('supernova-outcome-archetype').textContent).toBe('Massive');
    expect(document.getElementById('supernova-outcome-type').textContent).toBe('Black Hole');
    const yieldsHtml = document.getElementById('supernova-outcome-yields').innerHTML;
    expect(yieldsHtml).toContain('Synaptic Dust');
    expect(yieldsHtml).toContain('Core Density');
  });

  it('safely runs if optional elements are missing', () => {
    document.body.innerHTML = `
      <div id="supernova-outcome-type"></div>
      <div id="supernova-outcome-yields"></div>
    `;
    // Should not throw
    expect(() => Viewport.updateSupernovaOutcome()).not.toThrow();
  });
});
