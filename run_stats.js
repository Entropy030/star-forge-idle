import { playtestHarness } from './src/core/playtestBot.js';

['efficient', 'massive', 'compact'].forEach(profile => {
  playtestHarness.runHeadlessSim({
    profile: profile,
    target: 'p2c-second-run',
    maxTicks: 30000000, 
    seed: 'test-seed'
  });
  console.log(`${profile}: ${playtestHarness.stats.ticksElapsed} ticks`);
});
