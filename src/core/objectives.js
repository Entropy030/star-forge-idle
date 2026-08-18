// Objective completion mutates progression state; presentation reads through the UI facade.
import { OBJECTIVE_DEFINITIONS } from './objectiveDefinitions.js';

export function isObjectiveComplete(objective, state) {
  if (objective.isComplete) {
    return objective.isComplete(state);
  } else if (objective.getCurrent) {
    return objective.getCurrent(state) >= objective.target;
  }
  return false;
}

export function updateObjectiveProgress(state) {
  if (!state) return;
  if (!Array.isArray(state.completedObjectives)) {
    state.completedObjectives = [];
  }

  for (let obj of OBJECTIVE_DEFINITIONS) {
    if (obj.epoch !== state.activeEpoch) continue;

    if (state.completedObjectives.includes(obj.id)) {
      continue;
    }

    if (isObjectiveComplete(obj, state)) {
      state.completedObjectives.push(obj.id);
      continue;
    }

    // Stop at the first incomplete objective (monotonic progression)
    break;
  }
}

export function getCurrentObjective(state) {
  if (!state) return null;
  if (!Array.isArray(state.completedObjectives)) return null;

  for (let obj of OBJECTIVE_DEFINITIONS) {
    if (obj.epoch !== state.activeEpoch) continue;
    if (state.completedObjectives.includes(obj.id)) continue;

    let current = obj.getCurrent ? obj.getCurrent(state) : 0;
    let target = obj.target || 1;
    let progress = Math.min(100, Math.floor((current / target) * 100));
    if (isObjectiveComplete(obj, state)) {
      progress = 100;
    }

    return {
      id: obj.id,
      epoch: obj.epoch,
      title: obj.title,
      instruction: obj.instruction,
      explanation: typeof obj.explanation === 'function' ? obj.explanation(state) : obj.explanation,
      current: current,
      target: target,
      progress: progress,
      completed: false
    };
  }

  return null; // All objectives in current epoch completed or no objectives
}
