/* global performance, requestAnimationFrame, cancelAnimationFrame */
// The main application loop
let lastTick = typeof performance !== 'undefined' ? performance.now() : Date.now();
let simulationAccumulator = 0;
let animationFrameId = null;

export function startLoop(engine) {
  if (typeof requestAnimationFrame === 'undefined') return;

  function renderLoop() {
    let now = performance.now();
    let dt = Math.max(0, (now - lastTick) / 1000);
    lastTick = now;

    // Optional Time Warp from cosmicConstants
    const state = engine.getStateUnsafe();
    let cMod = 1.0;
    if (state.cosmicConstants && state.cosmicConstants.c) {
      cMod += (0.12 * state.cosmicConstants.c);
    }
    dt *= cMod;

    if (dt > 1.5) dt = 1.5;

    simulationAccumulator += dt;
    if (simulationAccumulator >= 0.10) {
      engine.tick(simulationAccumulator);
      simulationAccumulator = 0;
    }

    // Notice we do NOT manually trigger Viewport.update() here on every frame or tick!
    // The engine's state changes will trigger state subscribers, which the Viewport can listen to.
    // However, discrete rendering like Canvas/Animations can be updated here if needed.
    
    animationFrameId = requestAnimationFrame(renderLoop);
  }

  animationFrameId = requestAnimationFrame(renderLoop);
}

export function stopLoop() {
  if (animationFrameId !== null && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
