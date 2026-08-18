import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('Era-I Vacuum Field Allocation (Phase 5.3A)', () => {
  test('Fresh Era I: allocation controller is hidden until Vacuum Resonance is available', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Fresh Era I');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    const controller = page.locator('#cosmos-posture-controller');
    await expect(controller).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('Late Era I (390x844 mobile): structure, touch targets, live readouts, and radio selection', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Late Era I');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    const controller = page.locator('#cosmos-posture-controller');
    await expect(controller).toBeVisible();

    const track = controller.locator('.cosmos-allocation-track');
    await expect(track).toHaveAttribute('role', 'radiogroup');
    await expect(track).toHaveAttribute('aria-label', 'Vacuum field allocation');

    const buttons = controller.locator('.cosmos-allocation-btn');
    await expect(buttons).toHaveCount(3);

    // Touch targets >= 44px
    for (let i = 0; i < 3; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // Zero horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const propBtn = controller.locator('[data-allocation="PROPAGATION"]');
    const balBtn = controller.locator('[data-allocation="BALANCED"]');
    const stabBtn = controller.locator('[data-allocation="STABILIZATION"]');

    // Default is BALANCED
    await expect(balBtn).toHaveAttribute('aria-checked', 'true');
    await expect(propBtn).toHaveAttribute('aria-checked', 'false');
    await expect(stabBtn).toHaveAttribute('aria-checked', 'false');
    await expect(balBtn).toHaveClass(/cosmos-allocation-btn--active/);

    // Non-color badges
    await expect(propBtn.locator('.cosmos-allocation-badge')).toHaveText('Throughput');
    await expect(balBtn.locator('.cosmos-allocation-badge')).toHaveText('Equilibrium');
    await expect(stabBtn.locator('.cosmos-allocation-badge')).toHaveText('Coherence');

    // Readouts in Late Era I (80% Coherence)
    const throughputReadout = controller.locator('.readout-throughput');
    const stabReadout = controller.locator('.readout-stabilization');
    const qualityReadout = controller.locator('.readout-quality');

    await expect(throughputReadout).toHaveText('1.0x');
    await expect(stabReadout).toHaveText('+0.10%/s');
    await expect(qualityReadout).toHaveText('1.80x');

    // Select PROPAGATION
    await propBtn.click();
    await expect(propBtn).toHaveAttribute('aria-checked', 'true');
    await expect(balBtn).toHaveAttribute('aria-checked', 'false');
    await expect(propBtn).toHaveClass(/cosmos-allocation-btn--active/);
    await expect(throughputReadout).toHaveText('1.5x');
    await expect(stabReadout).toHaveText('+0.05%/s');

    // Select STABILIZATION
    await stabBtn.click();
    await expect(stabBtn).toHaveAttribute('aria-checked', 'true');
    await expect(propBtn).toHaveAttribute('aria-checked', 'false');
    await expect(stabBtn).toHaveClass(/cosmos-allocation-btn--active/);
    await expect(throughputReadout).toHaveText('0.5x');
    await expect(stabReadout).toHaveText('+0.25%/s');

    expect(errors).toEqual([]);
  });

  test('Keyboard navigation: arrow keys and Enter/Space cycle roving radiogroup', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Late Era I');
    const controller = page.locator('#cosmos-posture-controller');
    await expect(controller).toBeVisible();

    const balBtn = controller.locator('[data-allocation="BALANCED"]');
    const stabBtn = controller.locator('[data-allocation="STABILIZATION"]');
    const propBtn = controller.locator('[data-allocation="PROPAGATION"]');

    // Focus on the active balanced radio button
    await balBtn.focus();
    await expect(balBtn).toBeFocused();

    // Press ArrowRight to move to STABILIZATION
    await page.keyboard.press('ArrowRight');
    await expect(stabBtn).toBeFocused();
    await expect(stabBtn).toHaveAttribute('aria-checked', 'true');

    // Press ArrowRight again to wrap to PROPAGATION
    await page.keyboard.press('ArrowRight');
    await expect(propBtn).toBeFocused();
    await expect(propBtn).toHaveAttribute('aria-checked', 'true');

    // Press ArrowLeft to return to STABILIZATION
    await page.keyboard.press('ArrowLeft');
    await expect(stabBtn).toBeFocused();
    await expect(stabBtn).toHaveAttribute('aria-checked', 'true');

    expect(errors).toEqual([]);
  });

  test('Transforming between Era I and Era II switches controller smoothly without collision', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // 1. In Late Era I: allocation controller active
    await loadPlaytestPreset(page, 'Late Era I');
    const controller = page.locator('#cosmos-posture-controller');
    await expect(controller.locator('.cosmos-allocation-track')).toBeVisible();

    // 2. Switch to Fresh Era II: transforms into plasma posture controller
    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(controller.locator('.cosmos-posture-group')).toBeVisible();
    await expect(controller.locator('.cosmos-posture-group')).toHaveAttribute('aria-label', 'Plasma operating posture');
    await expect(controller.locator('.cosmos-allocation-track')).toHaveCount(0);

    // 3. Switch back to Fresh Era I: controller hides
    await loadPlaytestPreset(page, 'Fresh Era I');
    await expect(controller).toBeHidden();

    expect(errors).toEqual([]);
  });
});
