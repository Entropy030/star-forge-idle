import { expect } from '@playwright/test';

export const APP_PATH = '/star-forge-idle/';

export function observeBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') {
      const text = message.text();
      const location = message.location()?.url || '';
      if (
        text.includes('fonts.gstatic.com') ||
        text.includes('fonts.googleapis.com') ||
        location.includes('fonts.gstatic.com') ||
        location.includes('fonts.googleapis.com')
      ) {
        return;
      }
      errors.push(`console: ${text}${location ? ` (${location})` : ''}`);
    }
  });
  return errors;
}

export async function openApp(page, query = '') {
  await page.goto(`${APP_PATH}${query}`);
  await page.locator('html.app-ready').waitFor({ state: 'attached' });

  const intro = page.locator('#intro-screen-overlay');
  if (await intro.isVisible()) {
    await page.locator('#intro-story-card').click();
    await page.locator('#btn-intro-complete').click();
  }

  await expect(page.locator('#game-shell')).toBeVisible();
}

export async function loadPlaytestPreset(page, label) {
  await page.locator('#pt-presets').selectOption({ label });
  await page.locator('#pt-load-preset').click();
  await expect(page.locator('#active-epoch-name')).not.toHaveText('');
}
