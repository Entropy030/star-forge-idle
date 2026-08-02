const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

const firstSec01 = main.indexOf('// [SEC-01] THIRD-PARTY INTEGRATIONS & SHIMS');
const secondSec01 = main.indexOf('// [SEC-01] THIRD-PARTY INTEGRATIONS & SHIMS', firstSec01 + 1);

if (secondSec01 !== -1) {
  main = main.substring(0, secondSec01);
  main += `// ==========================================================================
// [SEC-04] CORE DATA ACCESSORS & MUTATORS
// ==========================================================================
// getAmount and deduct are now in economy.js

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
  window.addEventListener("resize", () => Viewport.syncAnchor(true));
  requestAnimationFrame(renderLoop);
}
`;
}

fs.writeFileSync('src/main.js', main);
console.log('Fixed main.js duplication.');
