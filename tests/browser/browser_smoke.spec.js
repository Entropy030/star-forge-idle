import { expect, test } from '@playwright/test';
import { observeBrowserErrors, openApp } from './helpers.js';

test('production preview boots the playable shell without browser errors', async ({ page }) => {
  const errors = observeBrowserErrors(page);

  await openApp(page, '?playtest=1');

  await expect(page.getByRole('heading', { name: 'STAR FORGE' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Observe the quantum core/ })).toBeEnabled();
  await expect(page.locator('#playtest-mode-ui')).toBeVisible();
  expect(errors).toEqual([]);
});
