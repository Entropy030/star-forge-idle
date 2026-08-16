import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test('production preview boots the playable shell without browser errors', async ({ page }) => {
  const errors = observeBrowserErrors(page);

  await openApp(page, '?playtest=1');

  await expect(page.getByRole('heading', { name: 'STAR FORGE' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Observe the quantum core/ })).toBeEnabled();
  await expect(page.locator('#playtest-mode-ui')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Era III Forge Buy Max button executes multi-level purchase in browser', async ({ page }) => {
  const errors = observeBrowserErrors(page);
  await openApp(page, '?playtest=1');
  await loadPlaytestPreset(page, 'Fresh Era III');

  await page.locator('#nav-upgrades').click();
  const buyMaxBtn = page.locator('#forge-buy-mode [data-buy-mode="max"]');
  await expect(buyMaxBtn).toBeVisible();
  await buyMaxBtn.click();
  await expect(buyMaxBtn).toHaveClass(/active/);

  // In Fresh Era III, Starting Hydrogen is 250.
  // Click Gravity node (base cost 10) with Buy Max
  const gravBtn = page.locator('#btn-gravity');
  await expect(gravBtn).toBeVisible();
  await expect(gravBtn).toBeEnabled();
  await gravBtn.click();

  // Verify multiple levels purchased in one click
  const gravLvl = page.locator('#gravity-lvl');
  await expect(async () => {
    const text = await gravLvl.innerText();
    expect(parseInt(text, 10)).toBeGreaterThan(1);
  }).toPass();

  expect(errors).toEqual([]);
});
