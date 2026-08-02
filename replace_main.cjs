const fs = require('fs');
let main = fs.readFileSync('src/main.js', 'utf8');
const splitPoint = main.indexOf('// AI PLAYTEST HARNESS');
if (splitPoint !== -1) {
  let cutMain = main.substring(0, splitPoint);
  cutMain += `if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
  window.addEventListener("resize", () => Viewport.syncAnchor(true));
  requestAnimationFrame(renderLoop);
}
`;
  fs.writeFileSync('src/main.js', cutMain);
  console.log("Removed AI Harness from main.js");
}
