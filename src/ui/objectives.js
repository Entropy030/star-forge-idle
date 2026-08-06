import { COSMIC_REGISTRY } from '../config/registry.js';

export function getCurrentObjective(state) {
  if (!state || !COSMIC_REGISTRY.progression) return null;
  
  for (let obj of COSMIC_REGISTRY.progression) {
    if (obj.epoch !== state.activeEpoch) continue;
    
    let current = obj.getCurrent(state);
    if (current < obj.target) {
      let progress = Math.min(100, Math.floor((current / obj.target) * 100));
      return {
        id: obj.id,
        title: obj.title,
        instruction: obj.instruction,
        explanation: obj.explanation,
        current: current,
        target: obj.target,
        progress: progress,
        completed: false
      };
    }
  }
  
  return null; // All objectives in current epoch completed or no objectives
}
