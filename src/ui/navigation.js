const VIEW_ALIASES = {
  cosmos: 'core',
  forge: 'upgrades',
  legacy: 'prestige',
  more: 'settings',
  artifacts: 'prestige',
  system: 'settings'
};

function hasMetaWealth(state) {
  return ['stardust', 'pulsarShards', 'singularityMass']
    .some(key => state.currencies?.[key]?.amount?.gt?.(0));
}

export function hasArtifactAccess(state) {
  return Array.isArray(state.artifacts?.unlocked) && state.artifacts.unlocked.length > 0;
}

export function isLegacyAvailable(state) {
  if (hasArtifactAccess(state) || hasMetaWealth(state)) return true;
  if ((state.stats?.supernovas?.gt?.(0)) || state.activeEpoch > 3) return true;
  return state.activeEpoch === 3 && state.era3?.stage === 'Main Sequence Star';
}

export function isForgeAvailable(state) {
  if (state.activeEpoch > 1) return true;
  if (state.discoveries?.has?.('qf_10')) return true;
  return Object.values(state.upgrades?.quantum || {}).some(upgrade => (upgrade?.level || 0) > 0);
}

export function getPrimaryNavigation(state) {
  const forgeAvailable = isForgeAvailable(state);
  const legacyAvailable = isLegacyAvailable(state);
  const destinations = [{ id: 'core', label: 'Cosmos', responsibility: 'Current universe' }];

  if (forgeAvailable) {
    destinations.push({ id: 'upgrades', label: 'Forge', responsibility: 'Current-run construction' });
  }
  if (legacyAvailable) {
    destinations.push({ id: 'prestige', label: 'Legacy', responsibility: 'Meta progression and loadout' });
  }
  if (forgeAvailable || state.activeEpoch > 1 || legacyAvailable) {
    destinations.push({ id: 'settings', label: 'More', responsibility: 'Archive and settings' });
  }

  return destinations;
}

export function normalizeViewId(state, requestedView) {
  const requested = VIEW_ALIASES[requestedView] || requestedView || 'core';
  return getPrimaryNavigation(state).some(destination => destination.id === requested)
    ? requested
    : 'core';
}
