const fs = require('fs');

let main = fs.readFileSync('src/main.js', 'utf8');

main = main.replace(/function triggerSupernova\(\) \{[\s\S]*?\}\n\nexport function triggerBigBounce\(\) \{[\s\S]*?\}\n\nfunction buyCosmicTuning\(key\) \{[\s\S]*?\}\n\nfunction buyMission\(id\) \{[\s\S]*?\}\n\nexport function triggerGalacticMerge\(\) \{[\s\S]*?\}\n\nexport function stabilizeArms\(\) \{[\s\S]*?\}\n\nexport function accretePlanetConfiguration\(\) \{[\s\S]*?\}\n/, "");

fs.writeFileSync('src/main.js', main);
console.log('Removed duplicate functions from main.js');
