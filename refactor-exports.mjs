import fs from 'fs';

let mainStr = fs.readFileSync('src/main.js', 'utf8');
let ecoStr = fs.readFileSync('src/core/economy.js', 'utf8');
let stellarStr = fs.readFileSync('src/core/stellar.js', 'utf8');

// regex to extract functions
function extractFunc(str, funcName) {
  let match = new RegExp(`export function ${funcName}\\([\\s\\S]*?\\n\\}`).exec(str);
  if (!match) return [str, null];
  return [str.replace(match[0], ''), match[0]];
}

const funcsToEco = ['triggerGalacticMerge', 'stabilizeArms', 'accretePlanetConfiguration', 'buyCelestialCard'];
for (let f of funcsToEco) {
  let [newStr, func] = extractFunc(mainStr, f);
  if (func) {
    mainStr = newStr;
    ecoStr += '\n' + func;
  }
}

const funcsToStellar = ['triggerSupernova', 'triggerBigBounce'];
for (let f of funcsToStellar) {
  let [newStr, func] = extractFunc(mainStr, f);
  if (func) {
    mainStr = newStr;
    stellarStr += '\n' + func;
  }
}

fs.writeFileSync('src/main.js', mainStr);
fs.writeFileSync('src/core/economy.js', ecoStr);
fs.writeFileSync('src/core/stellar.js', stellarStr);
