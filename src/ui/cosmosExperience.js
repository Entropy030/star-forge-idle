import Decimal from 'break_infinity.js';
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

function syncChildren(container, children) {
  const current = [...container.children];
  if (current.length === children.length && current.every((child, index) => child === children[index])) return;
  container.replaceChildren(...children);
}

function updateComparisonValue(documentRef, value, current, comparison, target) {
  let currentNode = value.querySelector('.metric-comparison-current');
  let separatorNode = value.querySelector('.metric-comparison-separator');
  let targetNode = value.querySelector('.metric-comparison-target');
  if (!currentNode || !separatorNode || !targetNode) {
    currentNode = textNode(documentRef, 'span', 'metric-comparison-current', '');
    separatorNode = textNode(documentRef, 'span', 'metric-comparison-separator', '');
    targetNode = textNode(documentRef, 'span', 'metric-comparison-target', '');
    value.replaceChildren(currentNode, separatorNode, targetNode);
  }
  setText(currentNode, current);
  setText(separatorNode, ` ${comparison} `);
  setText(targetNode, target);
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
    updateComparisonValue(
      documentRef,
      value,
      formatHudNumber(check.current),
      comparison,
      formatHudValue(check.target, check.unit || '')
    );
    if (!row.hasChildNodes()) row.append(icon, label, value);
    rows.push(row);
  }
  syncChildren(list, rows);
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
  syncChildren(wrapper, [fill, label]);
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

function renderPostureController(element, posture, onPostureChange) {
  if (!element) return;
  element.hidden = !posture;
  if (!posture) {
    element.replaceChildren();
    delete element.dataset.optionsKey;
    delete element.dataset.activePosture;
    return;
  }

  const documentRef = element.ownerDocument;
  const optionsKey = JSON.stringify(posture.options.map(opt => [opt.id, opt.label, opt.role, opt.description]));

  if (element.dataset.optionsKey !== optionsKey || element.dataset.controllerType !== 'posture') {
    element.dataset.controllerType = 'posture';
    const heading = documentRef.createElement('div');
    heading.className = 'cosmos-posture-heading';
    heading.append(
      textNode(documentRef, 'span', 'cosmos-eyebrow', 'Operating Posture'),
      textNode(documentRef, 'h2', 'cosmos-posture-title', 'Plasma Mode')
    );

    const group = documentRef.createElement('div');
    group.className = 'cosmos-posture-group';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Plasma operating posture');

    for (const option of posture.options) {
      const btn = documentRef.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.className = 'cosmos-posture-btn';
      btn.dataset.posture = option.id;
      btn.setAttribute('aria-checked', 'false');
      btn.tabIndex = -1;

      const header = documentRef.createElement('div');
      header.className = 'cosmos-posture-btn-header';
      header.append(
        textNode(documentRef, 'strong', 'cosmos-posture-name', option.label),
        textNode(documentRef, 'span', 'cosmos-posture-badge', option.role)
      );

      const desc = textNode(documentRef, 'p', 'cosmos-posture-desc', option.description);
      btn.append(header, desc);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onPostureChange?.(option.id);
      });

      group.append(btn);
    }

    group.addEventListener('keydown', (e) => {
      const buttons = [...group.querySelectorAll('.cosmos-posture-btn')];
      const activeId = element.dataset.activePosture || posture.active;
      const focused = buttons.find(b => b === documentRef.activeElement || b === e.target);
      const currentIndex = focused ? buttons.indexOf(focused) : buttons.findIndex(b => b.dataset.posture === activeId);
      if (currentIndex === -1) return;

      let nextIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const focused = buttons.find(b => b === documentRef.activeElement || b === e.target);
        if (focused && focused.dataset.posture) {
          onPostureChange?.(focused.dataset.posture);
        }
        return;
      }

      if (nextIndex !== -1) {
        const targetBtn = buttons[nextIndex];
        targetBtn.focus();
        onPostureChange?.(targetBtn.dataset.posture);
      }
    });

    element.replaceChildren(heading, group);
    element.dataset.optionsKey = optionsKey;
  }

  element.dataset.activePosture = posture.active;
  const buttons = element.querySelectorAll('.cosmos-posture-btn');
  for (const btn of buttons) {
    const isActive = btn.dataset.posture === posture.active;
    btn.setAttribute('aria-checked', String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
    btn.classList.toggle('cosmos-posture-btn--active', isActive);
  }
}


function renderAllocationController(element, allocation, onAllocationChange) {
  if (!element) return;
  element.hidden = !allocation;
  if (!allocation) {
    element.replaceChildren();
    delete element.dataset.optionsKey;
    delete element.dataset.activeAllocation;
    delete element.dataset.controllerType;
    return;
  }

  const documentRef = element.ownerDocument;
  const optionsKey = JSON.stringify(allocation.options.map(opt => [opt.id, opt.label, opt.role, opt.meaning]));

  if (element.dataset.optionsKey !== optionsKey || element.dataset.controllerType !== 'allocation') {
    element.dataset.controllerType = 'allocation';
    const heading = documentRef.createElement('div');
    heading.className = 'cosmos-posture-heading cosmos-allocation-heading';
    heading.append(
      textNode(documentRef, 'span', 'cosmos-eyebrow', 'Field Allocation'),
      textNode(documentRef, 'h2', 'cosmos-posture-title', 'Vacuum Dynamic')
    );

    const track = documentRef.createElement('div');
    track.className = 'cosmos-allocation-track';
    track.setAttribute('role', 'radiogroup');
    track.setAttribute('aria-label', 'Vacuum field allocation');

    for (const option of allocation.options) {
      const btn = documentRef.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.className = 'cosmos-allocation-btn';
      btn.dataset.allocation = option.id;
      btn.setAttribute('aria-checked', 'false');
      btn.tabIndex = -1;

      const header = documentRef.createElement('div');
      header.className = 'cosmos-allocation-btn-header';
      header.append(
        textNode(documentRef, 'strong', 'cosmos-allocation-name', option.label),
        textNode(documentRef, 'span', 'cosmos-allocation-badge', option.role)
      );

      btn.append(header);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onAllocationChange?.(option.id);
      });

      track.append(btn);
    }

    track.addEventListener('keydown', (e) => {
      const buttons = [...track.querySelectorAll('.cosmos-allocation-btn')];
      const activeId = element.dataset.activeAllocation || allocation.active;
      const focused = buttons.find(b => b === documentRef.activeElement || b === e.target);
      const currentIndex = focused ? buttons.indexOf(focused) : buttons.findIndex(b => b.dataset.allocation === activeId);
      if (currentIndex === -1) return;

      let nextIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const focusedBtn = buttons.find(b => b === documentRef.activeElement || b === e.target);
        if (focusedBtn && focusedBtn.dataset.allocation) {
          onAllocationChange?.(focusedBtn.dataset.allocation);
        }
        return;
      }

      if (nextIndex !== -1) {
        const targetBtn = buttons[nextIndex];
        targetBtn.focus();
        onAllocationChange?.(targetBtn.dataset.allocation);
      }
    });

    const meaning = textNode(documentRef, 'p', 'cosmos-allocation-meaning', '');

    const readout = documentRef.createElement('div');
    readout.className = 'cosmos-allocation-readout';

    const itemThroughput = documentRef.createElement('span');
    itemThroughput.className = 'cosmos-readout-item';
    itemThroughput.append(
      textNode(documentRef, 'span', 'cosmos-readout-label', 'Law Throughput: '),
      textNode(documentRef, 'strong', 'cosmos-readout-val readout-throughput', '')
    );

    const itemStabilization = documentRef.createElement('span');
    itemStabilization.className = 'cosmos-readout-item';
    itemStabilization.append(
      textNode(documentRef, 'span', 'cosmos-readout-label', 'Stabilization: '),
      textNode(documentRef, 'strong', 'cosmos-readout-val readout-stabilization', '')
    );

    const itemQuality = documentRef.createElement('span');
    itemQuality.className = 'cosmos-readout-item';
    itemQuality.append(
      textNode(documentRef, 'span', 'cosmos-readout-label', 'Field Quality: '),
      textNode(documentRef, 'strong', 'cosmos-readout-val readout-quality', '')
    );

    readout.append(itemThroughput, itemStabilization, itemQuality);

    element.replaceChildren(heading, track, meaning, readout);
    element.dataset.optionsKey = optionsKey;
  }

  element.dataset.activeAllocation = allocation.active;
  const buttons = element.querySelectorAll('.cosmos-allocation-btn');
  for (const btn of buttons) {
    const isActive = btn.dataset.allocation === allocation.active;
    btn.setAttribute('aria-checked', String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
    btn.classList.toggle('cosmos-allocation-btn--active', isActive);
  }

  const activeOption = allocation.options.find(opt => opt.id === allocation.active);
  setText(element.querySelector('.cosmos-allocation-meaning'), activeOption?.meaning || '');

  const throughputEl = element.querySelector('.readout-throughput');
  if (throughputEl) setText(throughputEl, `${allocation.throughputMultiplier.toFixed(1)}x`);

  const stabilizationEl = element.querySelector('.readout-stabilization');
  if (stabilizationEl) {
    const rateVal = allocation.passiveCoherenceRate instanceof Decimal ? allocation.passiveCoherenceRate.toNumber() : Number(allocation.passiveCoherenceRate);
    setText(stabilizationEl, `+${rateVal.toFixed(2)}%/s`);
  }

  const qualityEl = element.querySelector('.readout-quality');
  if (qualityEl) setText(qualityEl, `${allocation.quality.toFixed(2)}x`);
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
  const structureKey = JSON.stringify([
    process.eyebrow,
    process.title,
    process.summary,
    process.bottleneck,
    process.action?.id,
    process.action?.label,
    process.action?.cost ? String(process.action.cost) : null,
    process.action?.currency,
    process.nodes?.map(({ role, label, state, unit }) => [role, label, state, unit])
  ]);

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
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.className = 'cosmos-current-action';
      button.id = 'cosmos-current-action-button';
      button.disabled = !process.action.enabled;
      button.dataset.actionKind = process.action.kind;
      button.dataset.actionId = process.action.id;

      const labelSpan = textNode(documentRef, 'span', 'cosmos-action-label', process.action.label);
      button.append(labelSpan);

      if (process.action.cost !== undefined && process.action.currency) {
        const costSpan = textNode(
          documentRef,
          'span',
          'cosmos-action-cost',
          ` · Cost: ${formatHudNumber(process.action.cost)} ${process.action.currency}`
        );
        button.append(costSpan);
      }

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const liveAction = element._currentAction;
        if (liveAction && liveAction.enabled) {
          onAction?.(liveAction);
        }
      });
      element.append(button);
    }
    element.dataset.structureKey = structureKey;
  }
  element._currentAction = process.action;
  if (process.action) {
    const button = element.querySelector('#cosmos-current-action-button');
    if (button) {
      button.disabled = !process.action.enabled;
      button.dataset.actionKind = process.action.kind;
      button.dataset.actionId = process.action.id;
      const labelSpan = button.querySelector('.cosmos-action-label');
      if (labelSpan) setText(labelSpan, process.action.label);
      const costSpan = button.querySelector('.cosmos-action-cost');
      if (costSpan && process.action.cost !== undefined && process.action.currency) {
        setText(costSpan, ` · Cost: ${formatHudNumber(process.action.cost)} ${process.action.currency}`);
      }
    }
  }
  for (const model of process.nodes || []) {
    const value = typeof model.value === 'string' ? model.value : formatHudValue(model.value, model.unit || '');
    setText(element.querySelector(`[data-process-label="${model.label}"] .cosmos-process-value`), value);
  }
}

export function renderCosmosExperience(documentRef, presentation, onAction, onPostureChange, onAllocationChange) {
  const root = documentRef.getElementById('tab-content-core');
  if (root) {
    root.dataset.cosmosEra = String(presentation.epoch);
    root.dataset.cosmosMode = presentation.mode;
  }
  const starCoreEl = documentRef.getElementById('star-core');
  if (starCoreEl) {
    if (presentation.epoch === 1) {
      delete starCoreEl.dataset.posture;
      delete starCoreEl.dataset.thermalState;
      delete starCoreEl.dataset.transitionReady;
      if (presentation.allocation) {
        starCoreEl.dataset.allocation = presentation.allocation.active;
        starCoreEl.dataset.semanticLabel = `Vacuum Field: ${presentation.allocation.active}`;
      } else {
        delete starCoreEl.dataset.allocation;
        delete starCoreEl.dataset.semanticLabel;
      }
    } else if (presentation.epoch === 2 && presentation.visualSemantics) {
      delete starCoreEl.dataset.allocation;
      const vs = presentation.visualSemantics;
      starCoreEl.dataset.posture = vs.posture;
      starCoreEl.dataset.thermalState = vs.thermalCategory;
      starCoreEl.dataset.transitionReady = String(vs.recombinationReady);
      starCoreEl.dataset.semanticLabel = vs.semanticLabel;
      starCoreEl.setAttribute('aria-label', vs.ariaLabel);
    } else {
      delete starCoreEl.dataset.allocation;
      delete starCoreEl.dataset.posture;
      delete starCoreEl.dataset.thermalState;
      delete starCoreEl.dataset.transitionReady;
      delete starCoreEl.dataset.semanticLabel;
    }
  }
  renderPrimary(documentRef.getElementById('cosmos-primary-status'), presentation);
  renderCoreContext(documentRef.getElementById('core-context'), presentation.core, starCoreEl);
  if (presentation.epoch === 1) {
    renderAllocationController(documentRef.getElementById('cosmos-posture-controller'), presentation.allocation, onAllocationChange);
  } else if (presentation.epoch === 2) {
    renderPostureController(documentRef.getElementById('cosmos-posture-controller'), presentation.posture, onPostureChange);
  } else {
    const controllerEl = documentRef.getElementById('cosmos-posture-controller');
    if (controllerEl) {
      controllerEl.hidden = true;
      controllerEl.replaceChildren();
      delete controllerEl.dataset.optionsKey;
      delete controllerEl.dataset.activePosture;
      delete controllerEl.dataset.activeAllocation;
      delete controllerEl.dataset.controllerType;
    }
  }
  renderProcess(documentRef.getElementById('cosmos-process-status'), presentation.process, onAction);
}
