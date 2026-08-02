const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

const triggerStart = main.indexOf('function triggerSupernova() {');
const sec07 = main.indexOf('// ==========================================================================\n// [SEC-07] GAME LOOP & TICK DISPATCHER');

if (triggerStart !== -1 && sec07 !== -1) {
  main = main.substring(0, triggerStart) + main.substring(sec07);
}

// Remove window.triggerBigBounce = triggerBigBounce;
main = main.replace("window.triggerBigBounce = triggerBigBounce;\n", "");

fs.writeFileSync('src/main.js', main);
console.log('Removed duplicate functions from main.js');
