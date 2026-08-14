import { formatHudNumber, formatHudValue } from './resourceFormatters.js';

function textNode(documentRef, tag, className, text) {
  const node = documentRef.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function setText(node, value) {
  const text = String(value ?? '');
  if (node && node.textContent !== text) node.textContent = text;
}

function renderChecks(documentRef, checks, mode, list = null) {
  if (!list) {
    list = documentRef.createElement('ul');
    list.className = 'cosmos-check-list';
  }
  list.setAttribute('aria-label', mode === 'any' ? 'Complete either requirement' : 'Complete all requirements');
  const existing = new Map([...list.children].map((row) => [row.dataset.requirementId, row]));
  const rows = [];
  for (const check of checks) {
    const row = existing.get(check.id) || documentRef.createElement('li');
    row.className = `cosmos-check cosmos-check--${check.met ? 'met' : 'missing'}`;
    row.dataset.requirementId = check.id;
    const comparison = check.comparison === 'lte' ? '≤' : '/';
    const icon = row.querySelector('.cosmos-check-icon') || textNode(documentRef, 'span', 'cosmos-check-icon', '');
    icon.setAttribute('aria-label', check.met ? 'Requirement met' : 'Requirement not met');
    setText(icon, check.met ? '✓' : '○');
    const label = row.querySelector('.cosmos-check-label') || textNode(documentRef, 'span', 'cosmos-check-label', check.label);
    const value = row.querySelector('.cosmos-check-value') || textNode(documentRef, 'span', 'cosmos-check-value', '');
    setText(value, `${formatHudNumber(check.current)} ${comparison} ${formatHudValue(check.target, check.unit || '')}`);
    if (!row.hasChildNodes()) row.append(icon, label, value);
    rows.push(row);
  }
  list.replaceChildren(...rows);
  return list;
}

function renderProgress(documentRef, progress, wrapper = null) {
  if (!progress) return null;
  const current = Number(progress.current?.toNumber?.() ?? progress.current);
  const target = Number(progress.target?.toNumber?.() ?? progress.target);
  const percent = target > 0 ? Math.max(0, Math.min(100, (current / target) * 100)) : 0;
  wrapper ||= documentRef.createElement('div');
  wrapper.className = 'cosmos-progress';
  wrapper.setAttribute('role', 'progressbar');
  wrapper.setAttribute('aria-label', progress.label);
  wrapper.setAttribute('aria-valuemin', '0');
  wrapper.setAttribute('aria-valuemax', String(target));
  wrapper.setAttribute('aria-valuenow', String(Math.min(current, target)));
  const fill = wrapper.querySelector('.cosmos-progress-fill') || textNode(documentRef, 'span', 'cosmos-progress-fill', '');
  fill.style.width = `${percent}%`;
  const label = wrapper.querySelector('.cosmos-progress-label') || textNode(documentRef, 'span', 'cosmos-progress-label', '');
  setText(label, progress.label);
  wrapper.replaceChildren(fill, label);
  return wrapper;
}

function renderPrimary(element, presentation) {
  if (!element) return;
  const model = presentation.primary;
  element.hidden = !model;
  if (!model) {
    element.replaceChildren();
    delete element.dataset.structureKey;
    return;
  }
  element.dataset.ready = String(Boolean(model.ready));
  const documentRef = element.ownerDocument;
  const structureKey = JSON.stringify([model.eyebrow, model.title, model.summary, model.mode, model.progress?.target, model.checks?.map(({ id, label, unit, comparison }) => [id, label, unit, comparison])]);
  if (element.dataset.structureKey !== structureKey) {
    const heading = documentRef.createElement('div');
    heading.className = 'cosmos-status-heading';
    heading.append(textNode(documentRef, 'span', 'cosmos-eyebrow', model.eyebrow), textNode(documentRef, 'h2', 'cosmos-status-title', model.title));
    if (model.value !== undefined) heading.append(textNode(documentRef, 'strong', 'cosmos-status-value', ''));
    element.replaceChildren(heading, textNode(documentRef, 'p', 'cosmos-status-summary', model.summary));
    if (model.progress) element.append(renderProgress(documentRef, model.progress));
    if (model.checks?.length) element.append(renderChecks(documentRef, model.checks, model.mode));
    element.dataset.structureKey = structureKey;
  }
  if (model.value !== undefined) setText(element.querySelector('.cosmos-status-value'), formatHudValue(model.value, model.unit || ''));
  if (model.progress) renderProgress(documentRef, model.progress, element.querySelector('.cosmos-progress'));
  if (model.checks?.length) renderChecks(documentRef, model.checks, model.mode, element.querySelector('.cosmos-check-list'));
}

function renderCoreContext(element, core, coreButton) {
  if (!element) return;
  element.hidden = !core;
  if (!core) {
    element.replaceChildren();
    delete element.dataset.structureKey;
    coreButton?.setAttribute('aria-label', 'Cosmic Core');
    return;
  }
  const documentRef = element.ownerDocument;
  const structureKey = JSON.stringify([core.eyebrow, core.title, core.instruction, core.metrics?.map(metric => [metric.label, metric.unit, metric.prefix])]);
  if (element.dataset.structureKey !== structureKey) {
    element.replaceChildren(
      textNode(documentRef, 'span', 'cosmos-eyebrow', core.eyebrow),
      textNode(documentRef, 'h2', 'core-context-title', core.title),
      textNode(documentRef, 'p', 'core-context-instruction', core.instruction)
    );
    if (core.metrics?.length) {
      const metrics = documentRef.createElement('div');
      metrics.className = 'cosmos-live-metrics';
      for (const metric of core.metrics) {
        const row = documentRef.createElement('div');
        row.className = 'cosmos-live-metric';
        row.dataset.metricLabel = metric.label;
        row.append(textNode(documentRef, 'span', 'cosmos-live-metric-label', metric.label), textNode(documentRef, 'strong', 'cosmos-live-metric-value', ''));
        metrics.append(row);
      }
      element.append(metrics);
    }
    element.dataset.structureKey = structureKey;
  }
  for (const metric of core.metrics || []) {
    const value = element.querySelector(`[data-metric-label="${metric.label}"] .cosmos-live-metric-value`);
    setText(value, `${metric.prefix || ''}${formatHudValue(metric.value, metric.unit || '')}`);
  }
  coreButton?.setAttribute('aria-label', core.ariaLabel);
}

function renderProcess(element, process, onAction) {
  if (!element) return;
  element.hidden = !process;
  if (!process) {
    element.replaceChildren();
    delete element.dataset.structureKey;
    return;
  }
  const documentRef = element.ownerDocument;
  const structureKey = JSON.stringify([process.eyebrow, process.title, process.summary, process.bottleneck, process.action?.label, process.nodes?.map(({ role, label, state, unit }) => [role, label, state, unit])]);
  if (element.dataset.structureKey !== structureKey) {
    element.replaceChildren(
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
        node.dataset.processLabel = model.label;
      node.append(
        textNode(documentRef, 'span', 'cosmos-process-role', model.role),
        textNode(documentRef, 'strong', 'cosmos-process-label', model.label),
          textNode(documentRef, 'span', 'cosmos-process-value', '')
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
    element.dataset.structureKey = structureKey;
  }
  for (const model of process.nodes || []) {
    const value = typeof model.value === 'string' ? model.value : formatHudValue(model.value, model.unit || '');
    setText(element.querySelector(`[data-process-label="${model.label}"] .cosmos-process-value`), value);
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
