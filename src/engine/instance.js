/* eslint-disable import/no-cycle */
import { createGameEngine } from './createEngine.js';
import { quantumCommandHandlers } from '../eras/quantum/commands.js';
import { plasmaCommandHandlers } from '../eras/plasma/commands.js';
import { stellarCommandHandlers } from '../eras/stellar/commands.js';
import { galacticCommandHandlers } from '../eras/galactic/commands.js';
import { gameState, setGameState } from '../core/state.js';

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

// Since loadGame re-creates the proxy, we need a way to resync engine state
// In runtime or state.js after loading: engine.loadState(gameState);
