import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

const ARTIFACT_DIR = '/Users/franziska/.gemini/antigravity/brain/0a5a51c0-c34a-4cd0-97e6-266ff5a61e7a';

test.describe('Era-III Hydrostatic Stellar Engine Model B1 (Phase 5.3B1)', () => {
  test('Desktop 1440x1000: Protostar with Fuser active and B1 Flow card visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Fresh Era III');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Verify Primary Resource is Core Temperature
    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard.locator('.resource-card-label')).toHaveText('Core Temperature');

    // Unlock Auto-Fuser via state injection for clean Protostar bootstrap
    await page.evaluate(() => {
      window.gameState.era3.fusersEnabled = true;
      window.gameState.era3.fusionYield = new (window.gameState.era3.gravity.constructor)(1);
      window.gameState.resources.hydrogen.amount = new (window.gameState.era3.gravity.constructor)(100);
      window.Viewport.update();
    });

    // Check Process Card (Stellar Machine Flow)
    const processCard = page.locator('#cosmos-process-status');
    await expect(processCard).toBeVisible();
    await expect(processCard.locator('.cosmos-process-title')).toBeVisible();

    // Check Diagnostic Flow Nodes
    await expect(page.locator('.cosmos-process-node')).toHaveCount(4);
    await expect(page.locator('.cosmos-process-label', { hasText: 'Hydrogen Inflow' })).toBeVisible();
    await expect(page.locator('.cosmos-process-label', { hasText: 'Fusion Demand' })).toBeVisible();
    await expect(page.locator('.cosmos-process-label', { hasText: 'Fuel Buffer' })).toBeVisible();
    await expect(page.locator('.cosmos-process-label', { hasText: 'Reaction Capability' })).toBeVisible();

    // Take Desktop Protostar Screenshot in Cosmos tab
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_protostar_fuser.png`, fullPage: false });

    // Check Forge Card anchors
    await page.locator('#nav-upgrades').click();
    await expect(page.locator('#era3-card-gravity')).toBeVisible();
    await expect(page.locator('#era3-card-fuser')).toBeVisible();
    await expect(page.locator('#era3-card-compress')).toBeVisible();

    // Verify Metric label in Forge
    await expect(page.locator('#stellar-core-metrics .mult-display .stellar-metric-label')).toHaveText('Reaction Capability');

    expect(errors).toEqual([]);
  });

  test('Desktop 1440x1000: Fuel-Inflow-Limited diagnostic state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Mid Era III');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Inject Fuel-Inflow-Limited state: Low gravity inflow, high fuser demand, buffer draining
    await page.evaluate(() => {
      const Decimal = window.gameState.era3.gravity.constructor;
      window.gameState.era3.gravity = new Decimal(1); // 10 H/s
      window.gameState.era3.fusersEnabled = true;
      window.gameState.era3.fusionYield = new Decimal(5); // 50+ H/s demand
      window.gameState.resources.hydrogen.amount = new Decimal(20); // Draining
      window.Viewport.update();
    });

    const processCard = page.locator('#cosmos-process-status');
    await expect(processCard).toBeVisible();
    await expect(processCard.locator('.cosmos-process-title')).toHaveText('Fuel Inflow Constrained');
    await expect(processCard.locator('.cosmos-process-summary')).toContainText('Hydrogen inflow is below fuser demand');

    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_fuel_inflow_limited.png`, fullPage: false });
    expect(errors).toEqual([]);
  });

  test('Desktop 1440x1000: Fusion-Capacity-Limited saturated-buffer state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Mid Era III');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Inject Fusion-Capacity-Limited state: High gravity inflow, low fuser throughput, saturated buffer
    await page.evaluate(() => {
      const Decimal = window.gameState.era3.gravity.constructor;
      window.gameState.era3.gravity = new Decimal(10); // 105 H/s, Cap 1050 H
      window.gameState.era3.fusersEnabled = true;
      window.gameState.era3.fusionYield = new Decimal(1); // Demand 10 H/s
      window.gameState.resources.hydrogen.amount = new Decimal(1050); // Saturated at cap
      window.Viewport.update();
    });

    const processCard = page.locator('#cosmos-process-status');
    await expect(processCard).toBeVisible();
    await expect(processCard.locator('.cosmos-process-title')).toHaveText('Conversion Throughput Constrained');

    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_fusion_capacity_limited.png`, fullPage: false });
    expect(errors).toEqual([]);
  });

  test('Desktop 1440x1000: Heavy Synthesis (Carbon/Iron) thermal capability in Forge', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Supernova Ready');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Switch to Forge tab to inspect Carbon & Iron cards with active thermal capability
    await page.locator('#nav-upgrades').click();
    await expect(page.locator('#era3-card-carbon')).toBeVisible();
    await expect(page.locator('#era3-card-iron')).toBeVisible();

    // Verify Forge cards contain active yield and thermal capability readouts
    await expect(page.locator('#carbon-level')).toContainText('Yield');
    await expect(page.locator('#iron-level')).toContainText('Yield');
    await expect(page.locator('#compress-effect')).toContainText('Capability:');

    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_heavy_synthesis_carbon_iron.png`, fullPage: false });
    expect(errors).toEqual([]);
  });

  test('Mobile 390x844: Representative B1 mid-era state layout & touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Mid Era III');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Verify Primary Region
    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard.locator('.resource-card-label')).toHaveText('Core Temperature');

    // Verify Process Card
    const processCard = page.locator('#cosmos-process-status');
    await expect(processCard).toBeVisible();

    // Zero horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // Switch to Forge and verify mobile layout stability
    await page.locator('#nav-upgrades').click();
    await expect(page.locator('#era3-card-gravity')).toBeVisible();
    await expect(page.locator('#era3-card-compress')).toBeVisible();

    const forgeOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(forgeOverflow).toBeLessThanOrEqual(0);

    // Return to Cosmos for mobile screenshot
    await page.locator('#nav-core').click();
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_mobile_390x844_mid_era.png`, fullPage: false });

    expect(errors).toEqual([]);
  });
});
