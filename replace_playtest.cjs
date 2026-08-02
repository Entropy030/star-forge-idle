const fs = require('fs');
let content = fs.readFileSync('src/core/playtestBot.js', 'utf8');

content = content.replace(/typeof getAIState !== 'function'/g, "typeof window.getAIState !== 'function'");
content = content.replace(/typeof runAIAction !== 'function'/g, "typeof window.runAIAction !== 'function'");
content = content.replace(/typeof getAIState === 'function'/g, "typeof window.getAIState === 'function'");

content = content.replace(/getAIState\(/g, "window.getAIState(");
content = content.replace(/runAIAction\(/g, "window.runAIAction(");

fs.writeFileSync('src/core/playtestBot.js', content);
console.log("Updated playtestBot to use window.");
