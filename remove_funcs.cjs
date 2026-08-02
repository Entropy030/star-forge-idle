const fs = require('fs');
let main = fs.readFileSync('src/main.js', 'utf8');

const achStart = main.indexOf('// function checkAchievements() {');
const devStart = main.indexOf('// ==========================================================================');
// We need to find the SECOND devStart, because the first one might be SEC-09 itself.
// Let's just use regex.

main = main.replace(/\/\/ function checkAchievements\(\) {[\s\S]*?\/\/ function checkMissionProgress\(\) {[\s\S]*?}\n/g, "");

main = main.replace(/\/\/ function togglePlasmaFuser\(\) {[\s\S]*?}\n/g, "");

fs.writeFileSync('src/main.js', main);
console.log('Removed dead functions.');
