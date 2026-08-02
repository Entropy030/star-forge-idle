// ==========================================================================
// [SEC-CANVAS-01] HIGH-PERFORMANCE CANVAS 2D ENGINE & PARTICLE POOL
// ==========================================================================

export const CanvasCore = (function () {
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animFrameId = null;
  let isRunning = false;
  let time = 0;

  // Particle Pool Architecture
  const MAX_PARTICLES = 200;
  const particlePool = [];
  const activeParticles = [];
  const shockwaves = [];
  const ambientParticles = [];

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particlePool.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      alpha: 1,
      decay: 0.02,
      color: '#00ecc6',
      active: false
    });
  }

  function obtainParticle() {
    for (let i = 0; i < particlePool.length; i++) {
      if (!particlePool[i].active) {
        particlePool[i].active = true;
        return particlePool[i];
      }
    }
    // Fallback: reuse oldest
    const p = particlePool.shift();
    p.active = true;
    particlePool.push(p);
    return p;
  }

  function init() {
    canvas = document.getElementById('core-fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    start();
  }

  function resize() {
    if (!canvas) return;
    const parent = canvas.parentElement || document.body;
    const rect = parent.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    loop();
  }

  function stop() {
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  function loop() {
    if (!isRunning) return;
    time += 0.016;

    render();

    animFrameId = requestAnimationFrame(loop);
  }

  function render() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const epoch = (typeof gameState !== 'undefined' && gameState.activeEpoch) ? gameState.activeEpoch : 1;

    switch (epoch) {
      case 1:
        drawEra1(cx, cy);
        break;
      case 2:
        drawEra2(cx, cy);
        break;
      case 3:
        drawEra3(cx, cy);
        break;
      case 4:
        drawEra4(cx, cy);
        break;
      case 5:
        drawEra5(cx, cy);
        break;
      default:
        drawEra1(cx, cy);
        break;
    }

    updateAndDrawParticles(ctx);
    updateAndDrawShockwaves(ctx);
    updateAndDrawAmbientParticles(ctx, width, height, epoch);
  }

  function spawnAmbientParticle(w, h, epoch) {
    const isDark = epoch === 5 || epoch === 4;
    const speed = isDark ? 0.2 : 0.5;
    const colors = epoch === 1 ? ['#6c5ce7', '#a29bfe'] :
                   epoch === 2 ? ['#e17055', '#fab1a0'] :
                   epoch === 3 ? ['#fdcb6e', '#ffeaa7'] :
                   epoch === 4 ? ['#0984e3', '#74b9ff'] :
                   ['#d63031', '#ff7675'];

    ambientParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: -Math.random() * speed - 0.1,
      size: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0
    });
  }

  function updateAndDrawAmbientParticles(ctx, w, h, epoch) {
    // Spawn rate
    if (Math.random() < 0.1) spawnAmbientParticle(w, h, epoch);

    for (let i = ambientParticles.length - 1; i >= 0; i--) {
      let p = ambientParticles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Fade in/out logic
      if (p.alpha < 0.6 && p.y > h * 0.2) p.alpha += 0.02;
      if (p.y < h * 0.2) p.alpha -= 0.02;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.y < -10 || (p.alpha <= 0 && p.y < h * 0.2)) {
        ambientParticles.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // --- ERA 1: QUANTUM SINGULARITY & BLOOM RINGS ---
  function drawEra1(cx, cy) {
    const pulse = 1 + Math.sin(time * 3) * 0.08;
    const radius = 55 * pulse;

    // Additive Radial Bloom
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.25, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(0.6, 'rgba(108, 92, 231, 0.20)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Force Rings
    for (let i = 0; i < 3; i++) {
      const ringRadius = radius + 20 + i * 18;
      const angle = time * (1.2 - i * 0.3) * (i % 2 === 0 ? 1 : -1);
      ctx.strokeStyle = i === 0 ? 'rgba(0, 236, 198, 0.4)' : 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.45, angle, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- ERA 2: PRIMORDIAL PLASMA CRUCIBLE (COOLING INTERPOLATED) ---
  function drawEra2(cx, cy) {
    let tempK = 10000000;
    if (typeof gameState !== 'undefined' && gameState.plasmaTemperature) {
      tempK = (typeof gameState.plasmaTemperature.toNumber === 'function')
        ? gameState.plasmaTemperature.toNumber()
        : Number(gameState.plasmaTemperature) || 10000000;
    }

    // Interpolation factor: 1.0 = freshly hot (10M K, start of Era II), 0.0 = at recombination (3000K)
    const startTemp = 10000000;
    const endTemp = 3000;
    const coolProgress = Math.min(1, Math.max(0,
      (startTemp - tempK) / (startTemp - endTemp)
    ));

    // Blend from hot white-blue (coolProgress=0) to warm orange-red (coolProgress=1)
    const r = Math.round(200 + coolProgress * 55);   // 200 -> 255
    const g = Math.round(220 - coolProgress * 130);  // 220 -> 90
    const b = Math.round(255 - coolProgress * 175);  // 255 -> 80

    const pulse = 1 + Math.cos(time * 2.5) * 0.06;
    const radius = 60 * pulse;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Plasma Core Haze
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
    grad.addColorStop(0.4, `rgba(${Math.round(r * 0.9)}, ${Math.round(g * 0.4)}, ${Math.round(b * 0.3)}, 0.5)`);
    grad.addColorStop(0.7, 'rgba(120, 20, 160, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Quark Dust
    for (let i = 0; i < 12; i++) {
      const orbAngle = time * 1.5 + (i * Math.PI / 6);
      const orbDist = radius * 0.8 + Math.sin(time * 3 + i) * 15;
      const px = cx + Math.cos(orbAngle) * orbDist;
      const py = cy + Math.sin(orbAngle) * orbDist * 0.7;

      ctx.fillStyle = i % 2 === 0 ? `rgba(${r}, ${g}, ${Math.round(b * 0.6)}, 0.8)` : 'rgba(255, 90, 140, 0.8)';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- ERA 3: STELLAR DAWN (TEMPERATURE-INTERPOLATED) ---
  function drawEra3(cx, cy) {
    let tempK = 0;
    if (typeof gameState !== 'undefined' && gameState.era3 && gameState.era3.temperature) {
      tempK = (typeof gameState.era3.temperature.toNumber === 'function')
        ? gameState.era3.temperature.toNumber()
        : Number(gameState.era3.temperature) || 0;
    }

    // Temperature Color Interpolation, calibrated to Era III's actual scale (Protostar -> Iron Core)
    let coreColor = 'rgba(0, 210, 255, 0.9)';   // Blue-white: Iron core / pre-supernova (>=2B K)
    let auraColor = 'rgba(108, 92, 231, 0.4)';
    if (tempK < 10000000) {
      // Protostar: still collapsing, not yet fusing. Dim, dull red-orange glow.
      coreColor = 'rgba(255, 110, 60, 0.9)';
      auraColor = 'rgba(180, 50, 20, 0.35)';
    } else if (tempK < 500000000) {
      // Main Sequence: sustained hydrogen fusion. Warm white-gold, sun-like.
      coreColor = 'rgba(255, 225, 150, 0.95)';
      auraColor = 'rgba(255, 170, 60, 0.4)';
    } else if (tempK < 2000000000) {
      // Carbon/advanced fusion stages: hotter, shifting toward blue-white.
      coreColor = 'rgba(160, 210, 255, 0.95)';
      auraColor = 'rgba(100, 140, 255, 0.4)';
    }
    // else: >= 2B K (Iron core, imminent collapse), keeps the default blue-white defined above.

    const radius = 62 + Math.sin(time * 4) * 3;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Stellar Body Bloom
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.6);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, coreColor);
    grad.addColorStop(0.7, auraColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Corona Arcs
    for (let i = 0; i < 4; i++) {
      const arcAngle = time * 0.8 + (i * Math.PI / 2);
      ctx.strokeStyle = auraColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * (1.1 + i * 0.12), arcAngle, arcAngle + 0.8);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- ERA 4: GALACTIC MATRIX (SPIRAL ARMS) ---
  function drawEra4(cx, cy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Galactic Core
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, 'rgba(168, 85, 247, 0.6)');
    grad.addColorStop(0.7, 'rgba(0, 210, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.fill();

    // Spiral Arms Stars
    const arms = 2;
    const numStars = 60;
    const rot = time * 0.3;

    for (let i = 0; i < numStars; i++) {
      const armIndex = i % arms;
      const distance = 20 + (i / numStars) * 110;
      const angle = rot + armIndex * Math.PI + (distance * 0.03);

      const sx = cx + Math.cos(angle) * distance;
      const sy = cy + Math.sin(angle) * distance * 0.5;

      ctx.fillStyle = armIndex === 0 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(216, 180, 254, 0.8)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5 + (1 - distance / 130), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- ERA 5: THE HEAT DEATH (ENTROPY-COUPLED EVAPORATING SINGULARITY) ---
  function drawEra5(cx, cy) {
    let entropy = 0;
    if (typeof gameState !== 'undefined' && gameState.era5 && typeof gameState.era5.entropy === 'number') {
      entropy = gameState.era5.entropy;
    }
    const entropyFrac = Math.min(1, Math.max(0, entropy / 100));

    // Radius shrinks as entropy rises (evaporating black hole), floor at 15% of original size
    const shrink = 1.0 - (entropyFrac * 0.85);
    const pulse = 1 + Math.sin(time * 3) * 0.08;
    const radius = 55 * pulse * shrink;

    // Color drifts from cool cyan/white (low entropy, "just arrived" from Big Bounce echo)
    // toward deep red/near-black (high entropy, heat death approaching)
    const r = Math.round(0 + entropyFrac * 214);     // 0 -> 214
    const g = Math.round(240 - entropyFrac * 210);    // 240 -> 30
    const b = Math.round(255 - entropyFrac * 225);    // 255 -> 30

    // Final flash: brief brightening in the last few percent before Heat Death (last Hawking burst)
    const isFinalFlash = entropyFrac > 0.95;
    const flashPulse = isFinalFlash ? (1 + Math.sin(time * 12) * 0.4) : 1;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.8 * flashPulse);
    grad.addColorStop(0, isFinalFlash ? 'rgba(255, 255, 255, 0.95)' : `rgba(${r}, ${g}, ${b}, 0.9)`);
    grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.5)`);
    grad.addColorStop(0.7, `rgba(${Math.round(r * 0.6)}, ${Math.round(g * 0.3)}, ${Math.round(b * 0.3)}, 0.25)`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.8 * flashPulse, 0, Math.PI * 2);
    ctx.fill();

    // Collapsing rings: fewer and tighter as entropy rises, unlike Era 1's expanding rings
    const ringCount = Math.max(1, Math.round(3 * (1 - entropyFrac * 0.6)));
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = radius + 15 + i * 14 * shrink;
      const angle = time * (1.2 - i * 0.3) * (i % 2 === 0 ? 1 : -1);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 - entropyFrac * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.45, angle, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- PARTICLE BURST ENGINE ---
  function updateAndDrawParticles(c) {
    c.save();
    c.globalCompositeOperation = 'lighter';

    for (let i = 0; i < particlePool.length; i++) {
      const p = particlePool[i];
      if (!p.active) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        p.active = false;
        continue;
      }

      c.globalAlpha = p.alpha;
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  function updateAndDrawShockwaves(c) {
    c.save();
    c.globalCompositeOperation = 'lighter';

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= 0.04;

      if (sw.alpha <= 0) {
        shockwaves.splice(i, 1);
        continue;
      }

      c.globalAlpha = sw.alpha;
      c.strokeStyle = sw.color;
      c.lineWidth = sw.lineWidth;
      c.beginPath();
      c.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      c.stroke();
    }

    c.restore();
  }

  // Public API to trigger particle burst on click / tap / keydown
  function spawnClickBurst(clientX, clientY, epoch) {
    if (!canvas) return;

    let x = width / 2;
    let y = height / 2;

    if (typeof clientX === 'number' && typeof clientY === 'number' && clientX > 0 && clientY > 0) {
      const rect = canvas.getBoundingClientRect();
      x = clientX - rect.left;
      y = clientY - rect.top;
    }

    const currentEpoch = epoch || (gameState ? gameState.activeEpoch : 1);
    let burstColor = '#00ecc6';
    if (currentEpoch === 2) burstColor = '#ff9f43';
    if (currentEpoch === 3) burstColor = '#ff5252';
    if (currentEpoch >= 4) burstColor = '#a855f7';

    // Shockwave Ring
    shockwaves.push({
      x: x,
      y: y,
      radius: 10,
      speed: 4.5,
      alpha: 0.9,
      lineWidth: 3,
      color: burstColor
    });

    // Particle Sparks
    const count = 18;
    for (let i = 0; i < count; i++) {
      const p = obtainParticle();
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5.5;

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 1.8 + Math.random() * 2.5;
      p.alpha = 1;
      p.decay = 0.025 + Math.random() * 0.02;
      p.color = burstColor;
    }
  }

  return {
    init: init,
    start: start,
    stop: stop,
    resize: resize,
    spawnClickBurst: spawnClickBurst
  };
})();
