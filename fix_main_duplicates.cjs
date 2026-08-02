const fs = require('fs');
let main = fs.readFileSync('src/main.js', 'utf8');

const toRemove = [
  'triggerSupernova',
  'triggerBigBounce',
  'buyCosmicTuning',
  'triggerEraVTransition',
  'closeTheatrical',
  'triggerGalacticMerge',
  'stabilizeArms',
  'accretePlanetConfiguration'
];

let lines = main.split('\\n');
let newLines = [];
let skip = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  if (!skip) {
    let started = false;
    for (let fn of toRemove) {
      if (line.startsWith('function ' + fn + '(') || line.startsWith('export function ' + fn + '(')) {
        skip = true;
        started = true;
        braceCount = 0;
        break;
      }
    }
    
    if (started) {
      if (line.includes('{')) braceCount += (line.match(/\\{/g) || []).length;
      if (line.includes('}')) braceCount -= (line.match(/\\}/g) || []).length;
      if (braceCount === 0) skip = false;
      continue;
    }
  } else {
    if (line.includes('{')) braceCount += (line.match(/\\{/g) || []).length;
    if (line.includes('}')) braceCount -= (line.match(/\\}/g) || []).length;
    if (braceCount === 0) {
      skip = false;
    }
    continue;
  }

  newLines.push(line);
}

fs.writeFileSync('src/main.js', newLines.join('\\n'));
console.log('Removed duplicate functions precisely.');
