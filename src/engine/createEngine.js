/**
 * The core game engine.
 * State is owned by this engine and must only be mutated via dispatched commands or the tick loop.
 */
export function createGameEngine({ initialState, commandHandlers, systems = [] }) {
  let state = initialState;
  const stateSubscribers = new Set();
  const eventSubscribers = new Set();

  function getStateUnsafe() {
    return state;
  }

  function subscribeState(listener) {
    stateSubscribers.add(listener);
    return () => stateSubscribers.delete(listener);
  }

  function subscribeEvents(listener) {
    eventSubscribers.add(listener);
    return () => eventSubscribers.delete(listener);
  }

  function select(selector, ...args) {
    return selector(state, ...args);
  }

  function loadState(normalizedState) {
    state = normalizedState;
    // We do NOT notify state subscribers here to avoid UI churn mid-load. 
    // The caller (runtime) typically manages the UI re-render explicitly after load.
  }

  function dispatch(command) {
    const handler = commandHandlers[command.type];
    if (!handler) {
      return { 
        ok: false, 
        changed: false, 
        events: [], 
        error: { code: 'UNKNOWN_COMMAND', context: { commandType: command.type } } 
      };
    }

    try {
      const result = handler(state, command);
      
      // Notify state subscribers exactly once per command if state changed
      if (result.changed) {
        stateSubscribers.forEach(sub => sub(state));
      }

      // Deliver domain events exactly once per command
      if (result.events && result.events.length > 0) {
        result.events.forEach(evt => {
          eventSubscribers.forEach(sub => sub(evt));
        });
      }

      return result;
    } catch (err) {
      console.error(`Command ${command.type} threw an error:`, err);
      // Ensure we don't return OK if it crashed
      return { ok: false, changed: false, events: [], error: { code: 'INTERNAL_COMMAND_ERROR', message: err.message } };
    }
  }

  function tick(deltaSeconds) {
    let anyStateChanged = false;
    let accumulatedEvents = [];

    // Increment logical simulation time
    if (!state.runtime) {
      state.runtime = { simulationTime: 0 };
    }
    state.runtime.simulationTime += deltaSeconds;

    // Run all registered simulation systems
    for (const system of systems) {
      try {
        const result = system(state, deltaSeconds);
        if (result) {
          if (result.changed) anyStateChanged = true;
          if (result.events && result.events.length > 0) {
            accumulatedEvents.push(...result.events);
          }
        }
      } catch (err) {
        console.error("System tick failed:", err);
      }
    }

    if (anyStateChanged) {
      stateSubscribers.forEach(sub => sub(state));
    }

    if (accumulatedEvents.length > 0) {
      accumulatedEvents.forEach(evt => {
        eventSubscribers.forEach(sub => sub(evt));
      });
    }
    
    return { changed: anyStateChanged, events: accumulatedEvents };
  }

  return {
    dispatch,
    tick,
    getStateUnsafe,
    loadState,
    subscribeState,
    subscribeEvents,
    select
  };
}
