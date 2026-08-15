export function appendHistoryEntry(state, { msg, type = 'milestone', ...details }) {
  const entry = {
    time: state.cosmicAge,
    msg,
    type,
    ...details
  };
  state.history.push(entry);
  return entry;
}
