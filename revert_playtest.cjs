const fs = require('fs');
let content = fs.readFileSync('src/core/playtestBot.js', 'utf8');

content = content.replace(/typeof window\.getAIState !== 'function'/g, "typeof getAIState !== 'function'");
content = content.replace(/typeof window\.runAIAction !== 'function'/g, "typeof runAIAction !== 'function'");
content = content.replace(/typeof window\.getAIState === 'function'/g, "typeof getAIState === 'function'");

content = content.replace(/window\.getAIState\(/g, "getAIState(");
content = content.replace(/window\.runAIAction\(/g, "runAIAction(");

fs.writeFileSync('src/core/playtestBot.js', content);
console.log("Reverted playtestBot to use direct imports.");
