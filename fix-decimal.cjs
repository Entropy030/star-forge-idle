const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import Decimal from') && content.includes('break_infinity.js')) {
    content = content.replace(/import Decimal from ['"].*?break_infinity\.js['"];?\n?/g, '');
    if (content.includes('Decimal') && !content.includes('/* global Decimal */')) {
      content = '/* global Decimal */\n' + content;
    }
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
