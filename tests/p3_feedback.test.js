import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Viewport } from '../src/ui/viewport.js';
import { gameState } from '../src/core/state.js'; // Assuming mock context where possible

// Since testing actual ResizeObserver in jsdom is tricky, we focus on the logic
describe('Viewport Feedback', () => {
  let deltaEl;
  beforeEach(() => {
    document.body.innerHTML = '<div id="delta-helium"></div><div class="core-canvas"></div>';
    deltaEl = document.getElementById('delta-helium');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('updateResourceDelta does not hardcode zero if rate is positive', () => {
    Viewport.updateResourceDelta('helium', 5.5);
    expect(deltaEl.textContent).toContain('5');
    expect(deltaEl.textContent).not.toContain('—');
  });

  it('updateResourceDelta sets dash when rate is exactly 0', () => {
    Viewport.updateResourceDelta('helium', 0);
    expect(deltaEl.textContent).toBe('—');
  });

  it('syncAnchor uses .core-canvas for anchor calculations', () => {
    const canvasContainer = document.querySelector('.core-canvas');
    canvasContainer.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 100,
      width: 200,
      height: 200
    }));

    Viewport.syncAnchor(true);
    
    const rootStyles = getComputedStyle(document.documentElement);
    // Note: getComputedStyle might not reflect setProperty in basic jsdom without a proper window,
    // so we test the cache behavior or the documentElement's style directly.
    expect(document.documentElement.style.getPropertyValue('--core-anchor-y')).toBe('200px'); // 100 + 100
    expect(document.documentElement.style.getPropertyValue('--core-anchor-x')).toBe('200px');
  });
});
