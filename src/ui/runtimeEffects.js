export function applyRuntimeEffect(effect) {
  if (!effect || typeof window === 'undefined') return;

  if (effect.type === 'NARRATIVE_MILESTONE') {
    if (window.Viewport?.logChrono) {
      window.Viewport.logChrono(effect.message);
      return;
    }

    const logNode = window.document?.getElementById('chrono-neural-log');
    if (logNode) logNode.textContent = effect.message;
    return;
  }

  if (effect.type === 'ACHIEVEMENT_UNLOCKED') {
    window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: effect.message }));
  }
}
