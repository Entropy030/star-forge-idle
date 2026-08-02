const fs = require('fs');

function fixNewlines(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\\n/g, '\\n');
  fs.writeFileSync(file, content);
}

fixNewlines('src/core/playtestBot.js');
fixNewlines('src/core/timeline.js');
fixNewlines('src/main.js');
fixNewlines('src/ui/viewport.js');

console.log('Fixed syntax errors.');
