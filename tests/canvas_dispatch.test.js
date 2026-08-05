import { expect, test, describe, vi } from 'vitest';
import { dispatchEraRenderer } from '../src/ui/canvasCore.js';

describe('Canvas Epoch Dispatch Regression Test', () => {
  test('correctly maps activeEpoch to the correct Era drawer', () => {
    const renderers = {
      drawEra1: vi.fn(),
      drawEra2: vi.fn(),
      drawEra3: vi.fn(),
      drawEra4: vi.fn(),
      drawEra5: vi.fn(),
    };
    
    // Test Era 1
    dispatchEraRenderer(1, renderers, 100, 100);
    expect(renderers.drawEra1).toHaveBeenCalledWith(100, 100);
    expect(renderers.drawEra1).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
    
    // Test Era 2
    dispatchEraRenderer(2, renderers, 200, 200);
    expect(renderers.drawEra2).toHaveBeenCalledWith(200, 200);
    expect(renderers.drawEra2).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
    
    // Test Era 3
    dispatchEraRenderer(3, renderers, 300, 300);
    expect(renderers.drawEra3).toHaveBeenCalledWith(300, 300);
    expect(renderers.drawEra3).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
    
    // Test Era 4
    dispatchEraRenderer(4, renderers, 400, 400);
    expect(renderers.drawEra4).toHaveBeenCalledWith(400, 400);
    expect(renderers.drawEra4).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
    
    // Test Era 5
    dispatchEraRenderer(5, renderers, 500, 500);
    expect(renderers.drawEra5).toHaveBeenCalledWith(500, 500);
    expect(renderers.drawEra5).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
    
    // Test unknown value -> fallback to Era 1
    dispatchEraRenderer(999, renderers, 999, 999);
    expect(renderers.drawEra1).toHaveBeenCalledWith(999, 999);
    expect(renderers.drawEra1).toHaveBeenCalledTimes(1);
    expect(renderers.drawEra2).not.toHaveBeenCalled();
    vi.clearAllMocks();
    
    dispatchEraRenderer(null, renderers, 0, 0);
    expect(renderers.drawEra1).toHaveBeenCalledWith(0, 0);
    expect(renderers.drawEra1).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
  });
});
