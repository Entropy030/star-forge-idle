import { formatHudRate, formatHudValue, getRateDirection } from './resourceFormatters.js';

function createResourceCard(documentRef, id) {
  const card = documentRef.createElement('article');
  card.className = 'resource-card';
  card.dataset.resourceId = id;

  const level = documentRef.createElement('span');
  level.className = 'resource-card-level';
  const label = documentRef.createElement('span');
  label.className = 'resource-card-label';
  const value = documentRef.createElement('strong');
  value.className = 'resource-card-value';
  const rate = documentRef.createElement('span');
  rate.className = 'resource-card-rate';
  const hint = documentRef.createElement('span');
  hint.className = 'resource-card-hint';

  card.append(level, label, value, rate, hint);
  return card;
}

function updateResourceCard(card, item, hierarchy, rates) {
  card.className = `resource-card resource-card--${hierarchy}`;
  const levelNode = card.querySelector('.resource-card-level');
  const levelText = hierarchy === 'primary' ? 'PRIMARY' : hierarchy === 'support' ? 'SUPPORT' : '';
  if (levelNode.textContent !== levelText) levelNode.textContent = levelText;
  const labelNode = card.querySelector('.resource-card-label');
  if (labelNode.textContent !== item.label) labelNode.textContent = item.label;
  card.querySelector('.resource-card-value').textContent = item.displayValue || formatHudValue(item.value, item.unit);

  const rateValue = rates[item.id];
  const rateNode = card.querySelector('.resource-card-rate');
  rateNode.textContent = rateValue === undefined ? '' : formatHudRate(rateValue, item.unit);
  rateNode.dataset.direction = rateValue === undefined ? 'idle' : getRateDirection(rateValue);
  rateNode.hidden = !rateNode.textContent;

  const hintNode = card.querySelector('.resource-card-hint');
  hintNode.textContent = item.roleHint || item.status || '';
  hintNode.hidden = !hintNode.textContent;
}

function initializeDetailsToggle(container) {
  const button = container.querySelector('#resource-details-toggle');
  const list = container.querySelector('#resource-details-list');
  if (!button || !list || button.dataset.initialized === 'true') return;

  button.dataset.initialized = 'true';
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    list.hidden = expanded;
  });
}

function renderMetaSummary(container, items) {
  const summary = container.querySelector('#meta-resource-summary');
  const label = container.querySelector('#meta-resource-label');
  const list = container.querySelector('#meta-resource-list');
  if (!summary || !label || !list) return;

  summary.hidden = items.length === 0;
  if (items.length === 0) {
    summary.open = false;
    list.replaceChildren();
    return;
  }

  label.textContent = `Legacy resources · ${items.length}`;
  const rows = items.map((item) => {
    const row = container.ownerDocument.createElement('span');
    row.className = 'meta-resource-row';
    row.textContent = `${item.label} ${formatHudValue(item.value)}`;
    return row;
  });
  list.replaceChildren(...rows);
}

export function renderResourceHud(container, presentation, rates = {}) {
  if (!container) return;
  initializeDetailsToggle(container);

  const primaryRegion = container.querySelector('#resource-primary-region');
  const supportRegion = container.querySelector('#resource-support-region');
  const detailsRegion = container.querySelector('#resource-details-region');
  const detailsButton = container.querySelector('#resource-details-toggle');
  const detailsList = container.querySelector('#resource-details-list');
  if (!primaryRegion || !supportRegion || !detailsRegion || !detailsButton || !detailsList) return;

  const existing = new Map(
    [...container.querySelectorAll('.resource-card')].map((card) => [card.dataset.resourceId, card])
  );
  const cardsFor = (items, hierarchy) => items.map((item) => {
    const card = existing.get(item.id) || createResourceCard(container.ownerDocument, item.id);
    updateResourceCard(card, item, hierarchy, rates);
    return card;
  });

  primaryRegion.replaceChildren(...cardsFor(presentation.primary, 'primary'));
  supportRegion.replaceChildren(...cardsFor(presentation.support, 'support'));
  detailsList.replaceChildren(...cardsFor(presentation.details, 'detail'));
  supportRegion.hidden = presentation.support.length === 0;

  const hasDetails = presentation.details.length > 0;
  detailsRegion.hidden = !hasDetails;
  if (!hasDetails) {
    detailsButton.setAttribute('aria-expanded', 'false');
    detailsList.hidden = true;
  }
  detailsButton.querySelector('span').textContent = `Details · ${presentation.details.length}`;

  renderMetaSummary(container, presentation.meta);
}
