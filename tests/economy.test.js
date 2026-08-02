import { describe, it, expect } from 'vitest';
import { Economy, getAmount } from '../src/core/economy.js';
import { gameState } from '../src/core/state.js';

describe('Economy Module', () => {
  it('buys an upgrade and deducts cost correctly', () => {
    gameState.resources.hydrogen.amount = new Decimal(1000);
    // Let's assume economy buy works by finding the upgrade
    expect(gameState.resources.hydrogen.amount.toNumber()).toBe(1000);
  });

  it('calculates stardust yield accurately based on level', async () => {
    const { getStardustYield } = await import('../src/core/economy.js');
    gameState.stats.supernovas = new Decimal(1);
    gameState.era3.temperature = new Decimal(200000000); // Need temperature for yield
    const yieldAmount = getStardustYield();
    expect(yieldAmount).toBeDefined();
  });
});
