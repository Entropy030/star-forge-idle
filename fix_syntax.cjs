const fs = require('fs');
let main = fs.readFileSync('src/main.js', 'utf8');

main = main.replace(/\/\/ function checkAchievements\(\) {[\s\S]*?\/\/ ==========================================================================\n\/\/ \[SEC-10\]/g, "// ==========================================================================\n// [SEC-10]");

fs.writeFileSync('src/main.js', main);
console.log('Fixed syntax correctly');
