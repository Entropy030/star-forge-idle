import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

const ARTIFACT_DIR = '/Users/franziska/.gemini/antigravity/brain/0a5a51c0-c34a-4cd0-97e6-266ff5a61e7a';

async function hidePlaytestOverlay(page) {
  await page.evaluate(() => {
    const el = document.getElementById('playtest-mode-ui');
    if (el) el.style.display = 'none';
  });
}

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

    // Inflow: 10 /s vs Demand: 10.01 /s
    const demandValue = await page.locator('[data-process-label="Fusion Demand"] .cosmos-process-value').textContent();
    expect(demandValue).toMatch(/10(\.01)? \/s/);

    // Hide playtest overlay for unobstructed visual review screenshot
    await hidePlaytestOverlay(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_protostar.png`, fullPage: false });

    // Check Forge Card anchors
    await page.locator('#nav-upgrades').click();
    await page.waitForTimeout(350); // Settle tab transition
    await expect(page.locator('#era3-card-gravity')).toBeVisible();
    await expect(page.locator('#era3-card-fuser')).toBeVisible();
    await expect(page.locator('#era3-card-compress')).toBeVisible();

    // Verify Metric label and value formatting in Forge
    await expect(page.locator('#stellar-core-metrics .mult-display .stellar-metric-label')).toHaveText('Reaction Capability');
    const multVal = await page.locator('#multiplier').textContent();
    expect(multVal).toMatch(/^1\.\d{2}×$/);

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

    await hidePlaytestOverlay(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_fuel_inflow_limited.png`, fullPage: false });
    expect(errors).toEqual([]);
  });

  test('Desktop 1440x1000: Conversion-Throughput-Constrained saturated-buffer state', async ({ page }) => {
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

    // Reaction capability displayed uniformly
    const reactionNode = page.locator('[data-process-label="Reaction Capability"] .cosmos-process-value');
    await expect(reactionNode).toHaveText('2.71×');

    await hidePlaytestOverlay(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_conversion_throughput_limited.png`, fullPage: false });
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
    await page.waitForTimeout(500); // Wait for tab viewFadeIn animation to fully complete
    await expect(page.locator('#era3-card-carbon')).toBeVisible();
    await expect(page.locator('#era3-card-iron')).toBeVisible();

    // Verify Forge container opacity has settled to 1
    const forgeOpacity = await page.locator('#tab-content-upgrades').evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(forgeOpacity)).toBeGreaterThan(0.95);

    // Verify Forge cards contain active yield and thermal capability readouts
    await expect(page.locator('#carbon-level')).toContainText('Yield');
    await expect(page.locator('#iron-level')).toContainText('Yield');
    await expect(page.locator('#compress-effect')).toContainText('Capability: 4.54×');

    // Verify Forge header metric is authoritatively 4.54× (no stale 1x)
    await expect(page.locator('#multiplier')).toHaveText('4.54×');

    await hidePlaytestOverlay(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_desktop_heavy_synthesis_forge.png`, fullPage: false });
    expect(errors).toEqual([]);
  });

  test('Mobile 390x844: Representative B1 mid-era layout, geometry & scrollability', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Mid Era III');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Ensure scrolled to top of Cosmos
    await page.evaluate(() => window.scrollTo(0, 0));

    // Bounding rect verification for top elements
    const primaryStatus = page.locator('#cosmos-primary-status');
    await expect(primaryStatus).toBeVisible();
    const primaryRect = await primaryStatus.boundingBox();
    expect(primaryRect).not.toBeNull();
    expect(primaryRect.y).toBeGreaterThanOrEqual(0);
    expect(primaryRect.width).toBeLessThanOrEqual(390);

    const starCore = page.locator('#star-core');
    await expect(starCore).toBeVisible();
    const starRect = await starCore.boundingBox();
    expect(starRect).not.toBeNull();
    expect(starRect.width).toBeGreaterThan(0);

    // Capture Screenshot 5: Mobile 390x844 top of Cosmos state
    await hidePlaytestOverlay(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_mobile_390x844_top_cosmos.png`, fullPage: false });

    // Scroll down to center Stellar Machine Process Card and support resources
    const processCard = page.locator('#cosmos-process-status');
    await page.evaluate(() => window.scrollBy(0, 300));
    await expect(processCard).toBeVisible();

    // Capture Screenshot 6: Mobile 390x844 Stellar Machine after normal vertical scroll
    await page.screenshot({ path: `${ARTIFACT_DIR}/b1_mobile_390x844_process_scrolled.png`, fullPage: false });

    // Scroll down to Support Resources
    const supportRegion = page.locator('#resource-support-region');
    await supportRegion.scrollIntoViewIfNeeded();
    await expect(supportRegion).toBeVisible();

    // Zero horizontal overflow across all scrolls
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    expect(errors).toEqual([]);
  });
});
