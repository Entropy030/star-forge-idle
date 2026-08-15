import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

const NUMBER_BOUNDARIES = [
  '98', '99', '100', '101',
  '998', '999', '1,000', '1,001',
  '99,998', '99,999', '100,000', '100,001',
  '999,998', '999,999', '1.00M', '1.01M',
];

async function measureContracts(page, contracts) {
  return page.evaluate(contractDefinitions => {
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    };
    const rect = element => {
      const bounds = element.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    };

    return contractDefinitions.map(contract => {
      const anchor = document.querySelector(contract.anchor);
      const target = document.querySelector(contract.target);
      if (!visible(anchor) || !visible(target)) {
        throw new Error(`Geometry contract is not visible: ${contract.name}`);
      }
      const originalText = target.textContent;
      const samples = contract.values.map(value => {
        target.textContent = value;
        return rect(anchor);
      });
      target.textContent = originalText;
      const baseline = samples[0];
      return {
        name: contract.name,
        maxDx: Math.max(...samples.map(sample => Math.abs(sample.x - baseline.x))),
        maxDy: Math.max(...samples.map(sample => Math.abs(sample.y - baseline.y))),
        maxDw: Math.max(...samples.map(sample => Math.abs(sample.width - baseline.width))),
        maxDh: Math.max(...samples.map(sample => Math.abs(sample.height - baseline.height))),
      };
    });
  }, contracts);
}

function expectStable(results) {
  for (const result of results) {
    expect(result.maxDx, `${result.name} Δx`).toBeLessThanOrEqual(0.25);
    expect(result.maxDy, `${result.name} Δy`).toBeLessThanOrEqual(0.25);
    expect(result.maxDw, `${result.name} Δwidth`).toBeLessThanOrEqual(0.25);
    expect(result.maxDh, `${result.name} Δheight`).toBeLessThanOrEqual(0.25);
  }
}

test.describe('live layout geometry contracts', () => {
  test('desktop static anchors stay fixed across required number and state boundaries', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Late Era I');

    expectStable(await measureContracts(page, [
      { name: 'header Era label', anchor: '.timeline-banner .context-label', target: '#active-epoch-name', values: ['Era I: The Quantum Foam', 'Era III: The Stellar Dawn'] },
      { name: 'header phase label', anchor: '.cosmic-phase-banner .context-label', target: '#stage', values: ['Observation', 'Inflation Preparation'] },
      { name: 'header Vacuum Coherence label', anchor: '.coherence-banner .context-label', target: '#coherence-display', values: ['9.9%', '10.0%', '99.9%', '100.0%'] },
      { name: 'support resource label', anchor: '#resource-support-region .resource-card-label', target: '#resource-support-region .resource-card-value', values: NUMBER_BOUNDARIES },
      { name: 'Cosmos live metric label', anchor: '.cosmos-live-metric-label', target: '.cosmos-live-metric-value', values: NUMBER_BOUNDARIES },
      { name: 'objective title', anchor: '#objective-title', target: '#objective-progress-text', values: NUMBER_BOUNDARIES },
      { name: 'objective instruction', anchor: '#objective-instruction', target: '#objective-progress-text', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Mid Era II');
    expectStable(await measureContracts(page, [
      { name: 'primary resource label', anchor: '#resource-primary-region .resource-card-label', target: '#resource-primary-region .resource-card-value', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Mid Era III');
    expectStable(await measureContracts(page, [
      { name: 'Era III support resource label', anchor: '#resource-support-region .resource-card-label', target: '#resource-support-region .resource-card-value', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Supernova Ready');
    expectStable(await measureContracts(page, [
      { name: 'Cosmos requirement label', anchor: '#gateway-temp-status .cosmos-check-label', target: '#gateway-temp-status .cosmos-check-value', values: NUMBER_BOUNDARIES },
      { name: 'Cosmos requirement icon', anchor: '#gateway-temp-status .cosmos-check-icon', target: '#gateway-temp-status .cosmos-check-icon', values: ['○', '✓'] },
    ]));

    await loadPlaytestPreset(page, 'Mid Era III');
    await page.locator('#nav-upgrades').focus();
    await page.keyboard.press('Enter');
    expectStable(await measureContracts(page, [
      { name: 'Era III Core Temperature label', anchor: '.temp-display .stellar-metric-label', target: '#temp', values: ['999.99M', '1.00B', '1.01B'] },
      { name: 'Forge level', anchor: '#era3-card-gravity .lvl-display', target: '#era3-card-gravity .lvl-display', values: ['Lv 98', 'Lv 99', 'Lv 100', 'Lv 101'] },
      { name: 'Forge status neighbor', anchor: '#era3-card-gravity .forge-state-badge', target: '#era3-card-gravity .forge-state-badge', values: ['Needs resources', 'Ready'] },
      { name: 'Forge requirement label', anchor: '#carbon-requirements .forge-requirement-label', target: '#carbon-requirements .forge-requirement-value', values: NUMBER_BOUNDARIES },
      { name: 'Forge requirement icon', anchor: '#carbon-requirements .forge-requirement-icon', target: '#carbon-requirements .forge-requirement-icon', values: ['○', '✓'] },
    ]));
  });

  test('narrow layout keeps representative live surfaces fixed and never overflows', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    for (const preset of ['Late Era I', 'Mid Era II', 'Mid Era III', 'Supernova Ready']) {
      await loadPlaytestPreset(page, preset);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${preset} horizontal overflow`).toBeLessThanOrEqual(0);
    }

    await loadPlaytestPreset(page, 'Mid Era III');
    expectStable(await measureContracts(page, [
      { name: 'mobile header Era field', anchor: '.timeline-banner', target: '#active-epoch-name', values: ['Era I', 'Era III'] },
      { name: 'mobile support resource label', anchor: '#resource-support-region .resource-card-label', target: '#resource-support-region .resource-card-value', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Supernova Ready');
    expectStable(await measureContracts(page, [
      { name: 'mobile requirement label', anchor: '#gateway-temp-status .cosmos-check-label', target: '#gateway-temp-status .cosmos-check-value', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Late Era I');
    expectStable(await measureContracts(page, [
      { name: 'mobile Cosmos live metric label', anchor: '.cosmos-live-metric-label', target: '.cosmos-live-metric-value', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Mid Era II');
    expectStable(await measureContracts(page, [
      { name: 'mobile primary resource label', anchor: '#resource-primary-region .resource-card-label', target: '#resource-primary-region .resource-card-value', values: NUMBER_BOUNDARIES },
    ]));

    await loadPlaytestPreset(page, 'Mid Era III');

    await page.locator('#nav-upgrades').focus();
    await page.keyboard.press('Enter');
    expectStable(await measureContracts(page, [
      { name: 'mobile Core Temperature label', anchor: '.temp-display .stellar-metric-label', target: '#temp', values: ['999.99M', '1.00B', '1.01B'] },
      { name: 'mobile Forge level', anchor: '#era3-card-gravity .lvl-display', target: '#era3-card-gravity .lvl-display', values: ['Lv 98', 'Lv 99', 'Lv 100', 'Lv 101'] },
      { name: 'mobile Forge status', anchor: '#era3-card-gravity .forge-state-badge', target: '#era3-card-gravity .forge-state-badge', values: ['Needs resources', 'Ready'] },
      { name: 'mobile Forge requirement', anchor: '#carbon-requirements .forge-requirement-label', target: '#carbon-requirements .forge-requirement-value', values: NUMBER_BOUNDARIES },
    ]));
    expect(errors).toEqual([]);
  });

  test('continuous simulation produces effectively zero unexpected CLS', async ({ page }) => {
    await page.addInitScript(() => {
      window.__s5Cls = 0;
      if ('PerformanceObserver' in window) {
        new PerformanceObserver(entries => {
          for (const entry of entries.getEntries()) {
            if (!entry.hadRecentInput) window.__s5Cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      }
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Mid Era III');
    await page.evaluate(() => { window.__s5Cls = 0; });
    await page.waitForTimeout(1500);

    const cls = await page.evaluate(() => window.__s5Cls);
    expect(cls).toBeLessThanOrEqual(0.005);
  });
});
