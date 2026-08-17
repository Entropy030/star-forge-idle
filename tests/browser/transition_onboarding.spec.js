import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('P5.2B Cosmic Transition Onboarding & First Supernova Contract', () => {
  test('Cosmic Inflation displays non-prestige transition preview and transitions into Era II', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Inflation Ready');

    const preview = page.locator('#era1-transition-preview');
    await expect(preview).toBeVisible();
    await expect(preview.locator('.cosmos-eyebrow')).toContainText('ERA TRANSITION · NOT A PRESTIGE RESET');
    await expect(preview.locator('.cosmos-transition-title')).toHaveText('Cosmic Inflation');
    await expect(preview).toContainText('leaves Quantum Foam to enter the Primordial Plasma');

    const inflationBtn = page.locator('#btn-inflation');
    await expect(inflationBtn).toBeVisible();
    await expect(inflationBtn).toBeEnabled();

    await page.screenshot({ path: 'test-results/p5_2b_inflation_ready_desktop.png', fullPage: true });

    // Trigger Inflation and complete transition overlay if present
    await inflationBtn.click();
    const transConfirm = page.locator('#btn-trans-confirm');
    await transConfirm.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await transConfirm.isVisible()) {
      await transConfirm.click();
    }

    // Verify Era II arrival
    await expect(page.locator('#active-epoch-name')).toContainText('The Primordial Soup');
    expect(errors).toEqual([]);
  });

  test('Cosmic Recombination communicates Stellar Dawn seed with 250 H and arrives in Era III', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Recombination Ready');

    const preview = page.locator('#era2-transition-preview');
    await expect(preview).toBeVisible();
    await expect(preview.locator('.cosmos-eyebrow')).toContainText('ERA TRANSITION · THE STELLAR DAWN');
    await expect(preview.locator('.cosmos-transition-title')).toHaveText('Cosmic Recombination');
    await expect(preview).toContainText('250 Hydrogen');

    const recombBtn = page.locator('#btn-recombination');
    await expect(recombBtn).toBeVisible();
    await expect(recombBtn).toBeEnabled();

    await page.screenshot({ path: 'test-results/p5_2b_recombination_ready_desktop.png', fullPage: true });

    // Trigger Recombination and complete transition overlay if present
    await recombBtn.click();
    const transConfirm = page.locator('#btn-trans-confirm');
    await transConfirm.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await transConfirm.isVisible()) {
      await transConfirm.click();
    }

    // Verify Era III arrival & starting conditions
    await expect(page.locator('#active-epoch-name')).toContainText('The Stellar Dawn');
    await expect(page.locator('#resource-primary-region .resource-card-label')).toHaveText('Core Temperature');
    expect(errors).toEqual([]);
  });

  test('First Supernova displays comprehensive transformation preview (RESET / PERSISTS / NEXT) and executes clean stellar reset', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Supernova Ready');

    // Switch to Legacy tab
    await page.locator('#nav-prestige').click();
    await expect(page.locator('#tab-content-prestige')).toBeVisible();

    const displayBox = page.locator('#supernova-outcome-display');
    await expect(displayBox).toBeVisible();

    // Verify Remnant and Archetype
    await expect(page.locator('#supernova-outcome-type')).not.toHaveText('');
    await expect(page.locator('#supernova-outcome-archetype')).not.toHaveText('');
    await expect(page.locator('#supernova-outcome-yields')).toContainText('Stardust');

    // Verify Transformation Preview Structure
    const previewContainer = page.locator('#supernova-transformation-preview');
    await expect(previewContainer).toBeVisible();
    await expect(previewContainer.locator('.supernova-preview-badge')).toContainText('Transformation Preview');
    await expect(previewContainer.locator('.supernova-preview-group--reset')).toContainText('Current Run Reset');
    await expect(previewContainer.locator('.supernova-preview-group--persists')).toContainText('Permanent Legacy');
    await expect(previewContainer.locator('.supernova-preview-group--next')).toContainText('Next Stellar Cycle');
    await expect(previewContainer.locator('.supernova-preview-distinction')).toContainText('Supernova does NOT advance to Era IV');

    // Verify Button
    const supernovaBtn = page.locator('#btn-supernova');
    await expect(supernovaBtn).toBeVisible();
    await expect(supernovaBtn).toBeEnabled();
    await expect(supernovaBtn).toHaveText('TRIGGER SUPERNOVA RESET SEQUENCE');

    await page.screenshot({ path: 'test-results/p5_2b_first_supernova_legacy_desktop.png', fullPage: true });

    // Trigger Supernova
    await supernovaBtn.click();

    // Verify post-supernova state: remains in Era III, resets core to protostar
    await expect(page.locator('#active-epoch-name')).toContainText('The Stellar Dawn');
    await page.screenshot({ path: 'test-results/p5_2b_post_supernova_desktop.png', fullPage: true });

    expect(errors).toEqual([]);
  });

  test('Supernova Terminal maintains legible, overflow-free responsive layout on 390x844 mobile viewport', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Supernova Ready');
    await page.locator('#nav-prestige').click();

    const displayBox = page.locator('#supernova-outcome-display');
    await expect(displayBox).toBeVisible();

    const supernovaBtn = page.locator('#btn-supernova');
    await expect(supernovaBtn).toBeVisible();

    // Check button height >= 44px
    const btnBox = await supernovaBtn.boundingBox();
    expect(btnBox.height).toBeGreaterThanOrEqual(44);

    // Verify no horizontal overflow in body
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    await page.screenshot({ path: 'test-results/p5_2b_first_supernova_legacy_mobile.png', fullPage: true });
    expect(errors).toEqual([]);
  });

  test('Zero-currency owned Legacy upgrade persists and keeps Legacy shop section discoverable across Supernova', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Supernova Ready');

    // Inject an owned legacy upgrade (fusionDiscount: level 2) with 0 stardust balance
    await page.evaluate(() => {
      window.gameState.upgrades.stardust.fusionDiscount.level = 2;
      window.gameState.currencies.stardust.amount = new window.Decimal(0);
      window.Viewport.renderPrestigeVisibility();
    });

    // Switch to Legacy tab
    await page.locator('#nav-prestige').click();
    const sdSection = page.locator('#prestige-stardust-section');
    await expect(sdSection).toBeVisible();

    // Trigger Supernova
    const supernovaBtn = page.locator('#btn-supernova');
    await supernovaBtn.click();

    // Return to Legacy tab
    await page.locator('#nav-prestige').click();

    // Verify Stardust Forge remains visible and level 2 is retained
    await expect(sdSection).toBeVisible();
    const lvlDisplay = page.locator('#stardust-row-fusionDiscount .lvl-display');
    await expect(lvlDisplay).toContainText('Lvl 2');

    expect(errors).toEqual([]);
  });
});
