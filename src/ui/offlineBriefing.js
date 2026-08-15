const LABELS = {
  quantumFluctuations: 'Quantum Fluctuations',
  energyDensity: 'Energy Density',
  quarks: 'Quarks',
  gluons: 'Gluons',
  protons: 'Protons',
  leptons: 'Leptons',
  electrons: 'Electrons',
  hydrogen: 'Hydrogen',
  helium: 'Helium',
  carbon: 'Carbon',
  iron: 'Iron',
  stardust: 'Stardust',
  pulsarShards: 'Pulsar Shards',
  singularityMass: 'Singularity Mass'
};

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  const absolute = Math.abs(number);
  if (absolute >= 1e9) return number.toExponential(2);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: absolute < 10 ? 2 : 0 }).format(number);
}

function appendList(section, title, items) {
  if (!items.length) return;
  const heading = document.createElement('h3');
  heading.textContent = title;
  const list = document.createElement('ul');
  for (const item of items) {
    const row = document.createElement('li');
    row.textContent = item;
    list.appendChild(row);
  }
  section.append(heading, list);
}

function humanizeId(id) {
  return String(id).replace(/^(obj_|qf_)/, '').replaceAll('_', ' ').replaceAll('-', ' ');
}

export function renderOfflineBriefing(summary) {
  const section = document.getElementById('offline-return-briefing');
  if (!section) return;
  if (!summary?.visible) {
    section.hidden = true;
    return;
  }

  const body = section.querySelector('.offline-briefing-body');
  body.replaceChildren();

  const timing = document.createElement('dl');
  timing.className = 'offline-briefing-timing';
  const timingRows = [
    ['Away', formatDuration(summary.actualElapsedSeconds)],
    ['Universe simulated', formatDuration(summary.creditedElapsedSeconds)]
  ];
  for (const [label, value] of timingRows) {
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    timing.append(term, detail);
  }
  body.appendChild(timing);

  appendList(body, 'Resource changes', summary.resources.map(change => {
    const delta = Number(change.delta);
    const sign = delta > 0 ? '+' : '';
    return `${LABELS[change.key] || humanizeId(change.key)} ${sign}${formatNumber(change.delta)}`;
  }));
  appendList(body, 'Physical state', summary.physical.map(change => (
    `${change.label} ${formatNumber(change.before)} → ${formatNumber(change.after)}`
  )));
  appendList(body, 'Newly available', summary.newReadiness.map(item => item.label));

  const discoveryRows = [
    ...summary.discoveries.achievements.map(id => `Achievement: ${humanizeId(id)}`),
    ...summary.discoveries.codex.map(id => `Codex: ${humanizeId(id)}`),
    ...summary.discoveries.narrative.map(id => `Milestone: ${humanizeId(id)}`),
    ...summary.discoveries.objectives.map(id => `Objective: ${humanizeId(id)}`),
    ...summary.discoveries.missions.map(id => `Mission: ${humanizeId(id)}`)
  ];
  appendList(body, 'Discoveries and milestones', discoveryRows);
  appendList(body, 'Waiting for Observer', summary.decisionsWaiting.map(item => item.label));
  appendList(body, 'Paused while away', summary.pausedAutomation);

  if (summary.capApplied) {
    const note = document.createElement('p');
    note.className = 'offline-briefing-note';
    note.textContent = 'Offline simulation reached the 8-hour credit limit.';
    body.appendChild(note);
  }
  if (summary.persistenceWarning) {
    const warning = document.createElement('p');
    warning.className = 'offline-briefing-warning';
    warning.setAttribute('role', 'status');
    warning.textContent = summary.persistenceWarning;
    body.appendChild(warning);
  }

  const dismiss = section.querySelector('.offline-briefing-dismiss');
  if (!dismiss.dataset.bound) {
    dismiss.dataset.bound = 'true';
    dismiss.addEventListener('click', () => {
      section.hidden = true;
    });
  }
  section.hidden = false;
}
