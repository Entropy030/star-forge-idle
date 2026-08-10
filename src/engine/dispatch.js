let dispatchCommand = null;

export function setEngineDispatcher(dispatcher) {
  dispatchCommand = dispatcher;
}

export function dispatchEngineCommand(command) {
  if (!dispatchCommand) {
    return {
      ok: false,
      changed: false,
      events: [],
      error: { code: 'ENGINE_NOT_READY' }
    };
  }

  return dispatchCommand(command);
}
