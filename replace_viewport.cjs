const fs = require('fs');
let content = fs.readFileSync('src/ui/viewport.js', 'utf8');
content = content.replace(
  "import { Timeline } from '../core/timeline.js';",
  "import { Timeline } from '../core/timeline.js';\nimport * as Actions from '../core/actions.js';\nimport Decimal from '../break_infinity.js';"
);

const startIndex = content.indexOf('export function triggerSupernova() {');
if (startIndex !== -1) {
  const newFns = `export function triggerSupernova() {
  initAudio();
  const res = Actions.triggerSupernova();
  if (!res.success) return;

  if (window.Haptics) window.Haptics.heavy();
  
  res.events.forEach(ev => {
    if (ev.type === "SUPERNOVA_TRIGGERED") {
      Viewport.showToast(\`SUPERNOVA! Yielded \${format(new Decimal(ev.yieldAmt))} Stardust.\`, "success");
    } else if (ev.type === "STATE_RESET") {
      saveGame();
      Viewport.switchTab('core');
      Timeline.reset();
    } else if (ev.type === "ERA_TRANSITION") {
      startEraTransition(ev.targetEra, { title: "Era IV: Stellar Evolution", desc: "A new era of star formation begins." });
    }
  });
  Viewport.update();
}

export function triggerBigBounce() {
  initAudio();
  const res = Actions.triggerBigBounce();
  if (!res.success) return;

  if (window.Haptics) window.Haptics.heavy();

  res.events.forEach(ev => {
    if (ev.type === "BIG_BOUNCE_TRIGGERED") {
      Viewport.showToast(\`BIG BOUNCE! Yielded \${format(new Decimal(ev.pulsarYield))} Pulsar Shards and \${format(new Decimal(ev.bitsYield))} bits.\`, "success");
    } else if (ev.type === "STATE_RESET") {
      saveGame();
      Viewport.switchTab('core');
      Timeline.reset();
    }
  });
  Viewport.update();
}

export function triggerGalacticMerge() {
  initAudio();
  const res = Actions.triggerGalacticMerge();
  if (!res.success) return;

  if (window.Haptics) window.Haptics.heavy();
  
  res.events.forEach(ev => {
    if (ev.type === "GALACTIC_MERGE_TRIGGERED") {
      Viewport.showToast(\`GALACTIC MERGE! Yielded \${format(new Decimal(ev.yieldAmt))} Singularity Mass.\`, "success");
    }
  });
  saveGame();
  Viewport.update();
}

export function stabilizeArms() {
  initAudio();
  Actions.stabilizeArmsAction();
  Viewport.showToast(\`Spiral Arms Stabilized!\`, "success");
}

export function accretePlanetConfiguration() {
  initAudio();
  Actions.accretePlanetConfigurationAction();
  Viewport.showToast(\`Planetary Configuration Accreted!\`, "success");
}

export function buyCelestialCard(key) {
  initAudio();
  const res = Actions.buyCelestialCardAction(key);
  if (res.success) {
    Viewport.renderSystemTab();
    saveGame();
  }
}
`;
  content = content.substring(0, startIndex) + newFns;
  fs.writeFileSync('src/ui/viewport.js', content);
  console.log("Replaced Viewport functions!");
}
