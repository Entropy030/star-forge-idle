export const LIVE_TICK_CONTEXT = Object.freeze({
  mode: 'live',
  allowAutomation: true,
  allowRandomEvents: true
});

export const OFFLINE_TICK_CONTEXT = Object.freeze({
  mode: 'offline',
  allowAutomation: false,
  allowRandomEvents: false
});

export function getTickContext(context) {
  return context?.mode === 'offline' ? OFFLINE_TICK_CONTEXT : LIVE_TICK_CONTEXT;
}
