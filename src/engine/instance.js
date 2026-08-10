/* eslint-disable import/no-cycle */
import { createGameEngine } from './createEngine.js';
import { quantumCommandHandlers } from '../eras/quantum/commands.js';
import { plasmaCommandHandlers } from '../eras/plasma/commands.js';
import { stellarCommandHandlers } from '../eras/stellar/commands.js';
import { galacticCommandHandlers } from '../eras/galactic/commands.js';
import { gameState, subscribeRuntimeState } from '../core/state.js';

const commandHandlers = {
  ...quantumCommandHandlers,
  ...plasmaCommandHandlers,
  ...stellarCommandHandlers,
  ...galacticCommandHandlers
};

export const engine = createGameEngine({
  initialState: gameState,
  commandHandlers,
  systems: []
});

// core/state.js is the canonical runtime owner. Full replacements (load/import/
// playtest presets) immediately point the engine at the exact same proxy.
subscribeRuntimeState((state) => engine.loadState(state));
