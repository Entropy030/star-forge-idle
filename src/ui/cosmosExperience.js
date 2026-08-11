import { formatHudNumber, formatHudValue } from './resourceFormatters.js';

function textNode(documentRef, tag, className, text) {
  const node = documentRef.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function renderChecks(documentRef, checks, mode) {
  const list = documentRef.createElement('ul');
  list.className = 'cosmos-check-list';
  list.setAttribute('aria-label', mode === 'any' ? 'Complete either requirement' : 'Complete all requirements');
  for (const check of checks) {
    const row = documentRef.createElement('li');
    row.className = `cosmos-check cosmos-check--${check.met ? 'met' : 'missing'}`;
    row.dataset.requirementId = check.id;
    const comparison = check.comparison === 'lte' ? '≤' : '/';
    const icon = textNode(documentRef, 'span', 'cosmos-check-icon', check.met ? '✓' : '○');
    icon.setAttribute('aria-label', check.met ? 'Requirement met' : 'Requirement not met');
    const label = textNode(documentRef, 'span', 'cosmos-check-label', check.label);
    const value = textNode(documentRef, 'span', 'cosmos-check-value', `${formatHudNumber(check.current)} ${comparison} ${formatHudValue(check.target, check.unit || '')}`);
    row.append(icon, label, value);
    list.append(row);
  }
  return list;
}

function renderProgress(documentRef, progress) {
  if (!progress) return null;
  const current = Number(progress.current?.toNumber?.() ?? progress.current);
  const target = Number(progress.target?.toNumber?.() ?? progress.target);
  const percent = target > 0 ? Math.max(0, Math.min(100, (current / target) * 100)) : 0;
  const wrapper = documentRef.createElement('div');
  wrapper.className = 'cosmos-progress';
  wrapper.setAttribute('role', 'progressbar');
  wrapper.setAttribute('aria-label', progress.label);
  wrapper.setAttribute('aria-valuemin', '0');
  wrapper.setAttribute('aria-valuemax', String(target));
  wrapper.setAttribute('aria-valuenow', String(Math.min(current, target)));
  const fill = documentRef.createElement('span');
  fill.className = 'cosmos-progress-fill';
  fill.style.width = `${percent}%`;
  wrapper.append(fill, textNode(documentRef, 'span', 'cosmos-progress-label', progress.label));
  return wrapper;
}

function renderPrimary(element, presentation) {
  if (!element) return;
  const model = presentation.primary;
  element.hidden = !model;
  element.replaceChildren();
  if (!model) return;
  element.dataset.ready = String(Boolean(model.ready));
  const documentRef = element.ownerDocument;
  const heading = documentRef.createElement('div');
  heading.className = 'cosmos-status-heading';
  heading.append(textNode(documentRef, 'span', 'cosmos-eyebrow', model.eyebrow), textNode(documentRef, 'h2', 'cosmos-status-title', model.title));
  if (model.value !== undefined) heading.append(textNode(documentRef, 'strong', 'cosmos-status-value', formatHudValue(model.value, model.unit || '')));
  element.append(heading, textNode(documentRef, 'p', 'cosmos-status-summary', model.summary));
  const progress = renderProgress(documentRef, model.progress);
  if (progress) element.append(progress);
  if (model.checks?.length) element.append(renderChecks(documentRef, model.checks, model.mode));
}

function renderCoreContext(element, core, coreButton) {
  if (!element) return;
  element.hidden = !core;
  element.replaceChildren();
  if (!core) {
    coreButton?.setAttribute('aria-label', 'Cosmic Core');
    return;
  }
  const documentRef = element.ownerDocument;
  element.append(
    textNode(documentRef, 'span', 'cosmos-eyebrow', core.eyebrow),
    textNode(documentRef, 'h2', 'core-context-title', core.title),
    textNode(documentRef, 'p', 'core-context-instruction', core.instruction)
  );
  coreButton?.setAttribute('aria-label', core.ariaLabel);
}

function renderProcess(element, process, onAction) {
  if (!element) return;
  element.hidden = !process;
  element.replaceChildren();
  if (!process) return;
  const documentRef = element.ownerDocument;
  element.append(
    textNode(documentRef, 'span', 'cosmos-eyebrow', process.eyebrow),
    textNode(documentRef, 'h2', 'cosmos-process-title', process.title),
    textNode(documentRef, 'p', 'cosmos-process-summary', process.summary)
  );
  if (process.nodes?.length) {
    const network = documentRef.createElement('div');
    network.className = 'cosmos-process-network';
    for (const model of process.nodes) {
      const node = documentRef.createElement('article');
      node.className = `cosmos-process-node cosmos-process-node--${model.state || 'support'}`;
      const value = typeof model.value === 'string' ? model.value : formatHudValue(model.value, model.unit || '');
      node.append(
        textNode(documentRef, 'span', 'cosmos-process-role', model.role),
        textNode(documentRef, 'strong', 'cosmos-process-label', model.label),
        textNode(documentRef, 'span', 'cosmos-process-value', value)
      );
      network.append(node);
    }
    element.append(network);
  }
  if (process.bottleneck) element.append(textNode(documentRef, 'p', 'cosmos-bottleneck', `Bottleneck · ${process.bottleneck}`));
  if (process.action) {
    const button = textNode(documentRef, 'button', 'cosmos-current-action', process.action.label);
    button.type = 'button';
    button.id = 'cosmos-current-action-button';
    button.disabled = !process.action.enabled;
    button.dataset.actionKind = process.action.kind;
    button.dataset.actionId = process.action.id;
    button.addEventListener('click', () => onAction?.(process.action));
    element.append(button);
  }
}

export function renderCosmosExperience(documentRef, presentation, onAction) {
  const root = documentRef.getElementById('tab-content-core');
  if (root) {
    root.dataset.cosmosEra = String(presentation.epoch);
    root.dataset.cosmosMode = presentation.mode;
  }
  renderPrimary(documentRef.getElementById('cosmos-primary-status'), presentation);
  renderCoreContext(documentRef.getElementById('core-context'), presentation.core, documentRef.getElementById('star-core'));
  renderProcess(documentRef.getElementById('cosmos-process-status'), presentation.process, onAction);
}
