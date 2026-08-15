let lastSimTick = null;

export function resetLiveSimulationClock(now = Date.now()) {
  lastSimTick = now;
}

export function consumeLiveElapsedSeconds(now = Date.now()) {
  if (lastSimTick === null) {
    resetLiveSimulationClock(now);
    return 0;
  }
  const elapsedSeconds = Math.max(0, (now - lastSimTick) / 1000);
  lastSimTick = now;
  return elapsedSeconds;
}

export function clearLiveSimulationClock() {
  lastSimTick = null;
}
