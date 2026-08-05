import { execSync } from 'child_process';
import path from 'path';

console.log('Running repository hygiene check...');

try {
  // Use git ls-files to only check tracked files in src/
  const output = execSync('git ls-files src/', { encoding: 'utf8' });
  const files = output.trim().split('\n').filter(Boolean);

  const patterns = [
    / 2\.js$/,
    / copy\.js$/,
    / old\.js$/,
    / backup\.js$/
  ];

  let violations = [];

  for (const file of files) {
    for (const pattern of patterns) {
      if (pattern.test(file)) {
        violations.push(file);
        break;
      }
    }
  }

  if (violations.length > 0) {
    console.error('❌ Repository hygiene check failed. Found unwanted file patterns in tracked paths:');
    violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  } else {
    console.log('✅ Repository hygiene check passed.');
  }

} catch (e) {
  // If git ls-files fails (e.g. not a git repo or no files), we ignore or fail gracefully
  console.error('Error running hygiene check:', e.message);
  process.exit(1);
}
