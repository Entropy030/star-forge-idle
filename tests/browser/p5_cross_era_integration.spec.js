import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

function getScreenshotPath(testInfo, filename) {
  if (process.env.B1_ARTIFACT_DIR) {
    return `${process.env.B1_ARTIFACT_DIR}/${filename}`;
  }
  return testInfo.outputPath(filename);
}

test.describe('P5.3C: Cross-Era Browser Acceptance & Full Journey Regression', () => {
  test('Complete Live Transition Flow: Era I -> Era II -> Era III -> Supernova -> Second Run', async ({ page }, testInfo) => {
    test.setTimeout(60000);
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // ----------------------------------------------------
    // Era I: Allocation active, Posture & Stellar Machine hidden
    // ----------------------------------------------------
    await loadPlaytestPreset(page, 'Late Era I');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    const controller = page.locator('#cosmos-posture-controller');
    await expect(controller).toBeVisible();
    await expect(controller.locator('.cosmos-allocation-track')).toBeVisible();
    await expect(controller.locator('.cosmos-posture-group')).toBeHidden();

    // Verify Primary Resource is Quantum Fluctuations
    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard.locator('.resource-card-label')).toHaveText('Quantum Fluctuations');

    // Select PROPAGATION
    const propBtn = controller.locator('[data-allocation="PROPAGATION"]');
    await propBtn.click();
    await expect(propBtn).toHaveAttribute('aria-checked', 'true');

    // Load Inflation Ready and transition to Era II
    await loadPlaytestPreset(page, 'Inflation Ready');
    const inflationBtn = page.locator('#btn-inflation');
    await expect(inflationBtn).toBeVisible();
    await inflationBtn.click();

    const transConfirm = page.locator('#btn-trans-confirm');
    await transConfirm.waitFor({ state: 'visible', timeout: 15000 });
    await transConfirm.click();
    await expect(page.locator('#era-transition-overlay')).toBeHidden();

    // ----------------------------------------------------
    // Era II: Posture active, Allocation & Stellar Machine hidden
    // ----------------------------------------------------
    await expect(page.locator('#active-epoch-name')).toContainText('The Primordial Soup');
    await expect(controller).toBeVisible();
    await expect(controller.locator('.cosmos-posture-group')).toBeVisible();
    await expect(controller.locator('.cosmos-allocation-track')).toBeHidden();

    // Select CONDENSE posture
    const condenseBtn = controller.locator('[data-posture="CONDENSE"]');
    await condenseBtn.click();
    await expect(condenseBtn).toHaveAttribute('aria-checked', 'true');

    // Load Recombination Ready and transition to Era III
    await loadPlaytestPreset(page, 'Recombination Ready');
    const recombBtn = page.locator('#btn-recombination');
    await expect(recombBtn).toBeVisible();
    await recombBtn.click();

    await transConfirm.waitFor({ state: 'visible', timeout: 15000 });
    await transConfirm.click();
    await expect(page.locator('#era-transition-overlay')).toBeHidden();

    // ----------------------------------------------------
    // Era III: Stellar Machine active, Posture & Allocation hidden
    // ----------------------------------------------------
    await expect(page.locator('#active-epoch-name')).toContainText('The Stellar Dawn');
    await expect(controller).toBeHidden();

    // Verify Primary Resource is Core Temperature
    await expect(primaryCard.locator('.resource-card-label')).toHaveText('Core Temperature');

    // Verify Process card shows Stellar Machine
    const processCard = page.locator('#cosmos-process-status');
    await expect(processCard).toBeVisible();
    await expect(processCard.locator('.cosmos-eyebrow')).toHaveText('Stellar machine');

    // ----------------------------------------------------
    // Supernova & Second-Run Persistence
    // ----------------------------------------------------
    await loadPlaytestPreset(page, 'Supernova Ready');
    await page.locator('#nav-prestige').click();
    await expect(page.locator('#tab-content-prestige')).toBeVisible();

    const snBtn = page.locator('#btn-supernova');
    await expect(snBtn).toBeVisible();
    await expect(snBtn).toBeEnabled();
    await snBtn.click();

    // Verify post-supernova state: stays in Era III, resets core
    await expect(page.locator('#active-epoch-name')).toContainText('The Stellar Dawn');
    await page.locator('#nav-core').click();
    await expect(controller).toBeHidden();
    await expect(processCard).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mobile 390x844: Zero horizontal overflow and clean layout across Eras I, II, and III', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // Check Era I mobile
    await loadPlaytestPreset(page, 'Late Era I');
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // Check Era II mobile
    await loadPlaytestPreset(page, 'Fresh Era II');
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // Check Era III mobile
    await loadPlaytestPreset(page, 'Fresh Era III');
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    expect(errors).toEqual([]);
  });

  test('Keyboard Accessibility: Arrow keys and roving tabindex in Radiogroups', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // Era I Allocation radiogroup keyboard navigation
    await loadPlaytestPreset(page, 'Late Era I');
    const controller = page.locator('#cosmos-posture-controller');
    const balBtn = controller.locator('[data-allocation="BALANCED"]');
    const stabBtn = controller.locator('[data-allocation="STABILIZATION"]');

    await balBtn.focus();
    await page.keyboard.press('ArrowRight');
    await expect(stabBtn).toBeFocused();
    await expect(stabBtn).toHaveAttribute('aria-checked', 'true');

    // Era II Posture radiogroup keyboard navigation
    await loadPlaytestPreset(page, 'Fresh Era II');
    const balancePostureBtn = controller.locator('[data-posture="BALANCE"]');
    const condensePostureBtn = controller.locator('[data-posture="CONDENSE"]');

    await balancePostureBtn.focus();
    await page.keyboard.press('ArrowRight');
    await expect(condensePostureBtn).toBeFocused();
    await expect(condensePostureBtn).toHaveAttribute('aria-checked', 'true');

    expect(errors).toEqual([]);
  });
});
