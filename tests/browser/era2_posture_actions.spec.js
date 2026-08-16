import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('Era-II Cosmos Posture Controls & Model-C Contextual Actions (Phase 2)', () => {
  test('390x844 mobile layout: posture selection, touch targets, and contextual action lifecycle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // 1. Load Fresh Era II
    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    // Verify posture controller is visible and properly structured
    const posturePanel = page.locator('#cosmos-posture-controller');
    await expect(posturePanel).toBeVisible();
    await expect(posturePanel).not.toHaveAttribute('hidden', '');

    const radioGroup = posturePanel.locator('[role="radiogroup"]');
    await expect(radioGroup).toHaveAttribute('aria-label', 'Plasma operating posture');

    const postureButtons = posturePanel.locator('.cosmos-posture-btn');
    await expect(postureButtons).toHaveCount(3);

    // Verify touch targets on mobile (>= 44px)
    for (let i = 0; i < 3; i++) {
      const box = await postureButtons.nth(i).boundingBox();
      expect(box, `Posture button ${i} bounding box`).not.toBeNull();
      expect(box.height, `Posture button ${i} height >= 44px`).toBeGreaterThanOrEqual(44);
    }

    // Verify no horizontal overflow
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'Fresh Era II 390px overflow').toBeLessThanOrEqual(0);

    // Default posture is BALANCE
    const balanceBtn = posturePanel.locator('[data-posture="BALANCE"]');
    const accumBtn = posturePanel.locator('[data-posture="ACCUMULATE"]');
    const condenseBtn = posturePanel.locator('[data-posture="CONDENSE"]');

    await expect(balanceBtn).toHaveAttribute('aria-checked', 'true');
    await expect(accumBtn).toHaveAttribute('aria-checked', 'false');
    await expect(condenseBtn).toHaveAttribute('aria-checked', 'false');

    // 2. Select ACCUMULATE
    await accumBtn.click();
    await expect(accumBtn).toHaveAttribute('aria-checked', 'true');
    await expect(balanceBtn).toHaveAttribute('aria-checked', 'false');
    await expect(accumBtn).toHaveClass(/cosmos-posture-btn--active/);

    // 3. Select CONDENSE
    await condenseBtn.click();
    await expect(condenseBtn).toHaveAttribute('aria-checked', 'true');
    await expect(accumBtn).toHaveAttribute('aria-checked', 'false');
    await expect(condenseBtn).toHaveClass(/cosmos-posture-btn--active/);

    // Verify non-color badges exist
    await expect(accumBtn.locator('.cosmos-posture-badge')).toHaveText('Matter Influx');
    await expect(balanceBtn.locator('.cosmos-posture-badge')).toHaveText('Equilibrium');
    await expect(condenseBtn.locator('.cosmos-posture-badge')).toHaveText('Cooling & Binding');

    // 4. Inspect contextual action in Fresh Era II
    const actionBtn = page.locator('#cosmos-current-action-button');
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toHaveText(/Construct Quark Condenser/);

    const actionBox = await actionBtn.boundingBox();
    expect(actionBox, 'Contextual action bounding box').not.toBeNull();
    expect(actionBox.height, 'Contextual action height >= 44px').toBeGreaterThanOrEqual(44);

    // 5. Test keyboard navigation on radiogroup
    await balanceBtn.focus();
    await page.keyboard.press('ArrowRight'); // moves to CONDENSE
    await expect(condenseBtn).toHaveAttribute('aria-checked', 'true');
    await expect(condenseBtn).toBeFocused();

    await page.keyboard.press('ArrowLeft'); // moves to BALANCE
    await expect(balanceBtn).toHaveAttribute('aria-checked', 'true');
    await expect(balanceBtn).toBeFocused();

    await page.keyboard.press('ArrowLeft'); // moves to ACCUMULATE
    await expect(accumBtn).toHaveAttribute('aria-checked', 'true');
    await expect(accumBtn).toBeFocused();

    // 6. Load Recombination Ready -> Baryogenesis Radiator is projected
    await loadPlaytestPreset(page, 'Recombination Ready');
    await expect(posturePanel).toBeVisible();
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toHaveText(/Construct Baryogenesis Radiator/);

    // Purchase the 5th pipeline upgrade -> action completes and becomes absent (null)
    await actionBtn.click();
    await expect(actionBtn).toHaveCount(0); // Quick action cleanly absent

    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'Recombination Ready 390px overflow').toBeLessThanOrEqual(0);

    // 7. Load Era I and Era III -> Posture controller should be hidden
    await loadPlaytestPreset(page, 'Late Era I');
    await expect(posturePanel).toBeHidden();

    await loadPlaytestPreset(page, 'Mid Era III');
    await expect(posturePanel).toBeHidden();

    expect(errors).toEqual([]);
  });

  test('1440x1000 desktop layout: posture controller visual subordination & grid layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Mid Era II');

    const posturePanel = page.locator('#cosmos-posture-controller');
    await expect(posturePanel).toBeVisible();

    const group = posturePanel.locator('.cosmos-posture-group');
    // Desktop layout uses 3-column grid
    const gridCols = await group.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(gridCols, 'Desktop grid columns').toBe(3);

    // Verify DOM sibling hierarchy order in #tab-content-core
    const orderValid = await page.evaluate(() => {
      const tabCore = document.querySelector('#tab-content-core');
      const children = [...tabCore.children];
      const primaryIdx = children.indexOf(document.querySelector('#cosmos-primary-status'));
      const coreCanvasIdx = children.indexOf(document.querySelector('.core-canvas'));
      const coreContextIdx = children.indexOf(document.querySelector('#core-context'));
      const postureIdx = children.indexOf(document.querySelector('#cosmos-posture-controller'));
      const processIdx = children.indexOf(document.querySelector('#cosmos-process-status'));
      return primaryIdx < coreCanvasIdx && coreCanvasIdx < coreContextIdx && coreContextIdx < postureIdx && postureIdx < processIdx;
    });
    expect(orderValid, 'DOM hierarchy order').toBe(true);

    expect(errors).toEqual([]);
  });
});
