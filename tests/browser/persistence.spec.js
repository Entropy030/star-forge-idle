import { expect, test } from '@playwright/test';
import { ACTIVE_SAVE_KEY, ACTIVE_SAVE_VERSION, APP_PATH, loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('real-browser persistence and failure recovery', () => {
  test('normal autosave survives reload with typed state serialization', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page);

    const core = page.locator('#star-core');
    await core.focus();
    for (let count = 0; count < 10; count += 1) await page.keyboard.press('Enter');
    await page.waitForTimeout(5200);

    const saved = await page.evaluate(key => localStorage.getItem(key), ACTIVE_SAVE_KEY);
    expect(saved).toBeTruthy();
    expect(saved).not.toBe('[object Object]');
    const parsed = JSON.parse(saved);
    expect(parsed.version).toBe(ACTIVE_SAVE_VERSION);
    expect(parsed.gameState.resources.quantumFluctuations.amount.__type).toBe('Decimal');
    expect(parsed.gameState.discoveries.__type).toBe('Set');

    await page.reload();
    await page.locator('html.app-ready').waitFor({ state: 'attached' });
    await expect(page.locator('#game-shell')).toBeVisible();
    await expect(page.locator('.resource-card[data-resource-id="quantumFluctuations"] .resource-card-value')).not.toHaveText('0');
    expect(errors).toEqual([]);
  });

  test('playtest export, restore and UI import preserve save ownership and engine authority', async ({ page, context }) => {
    const errors = observeBrowserErrors(page);
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
    await openApp(page);

    const core = page.locator('#star-core');
    await core.focus();
    for (let count = 0; count < 10; count += 1) await page.keyboard.press('Enter');
    await page.waitForTimeout(5200);
    const normalSaveBefore = await page.evaluate(key => localStorage.getItem(key), ACTIVE_SAVE_KEY);

    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Mid Era III');
    await page.locator('#pt-export').click();
    await expect(page.locator('#playtest-inline-status')).toContainText('clipboard');
    const exported = await page.evaluate(() => navigator.clipboard.readText());
    expect(exported.length).toBeGreaterThan(100);
    expect(await page.evaluate(key => localStorage.getItem(key), ACTIVE_SAVE_KEY)).toBe(normalSaveBefore);

    await page.locator('#pt-restore').click();
    await expect(page.locator('#playtest-mode-ui')).toHaveCount(0);
    await expect(page.locator('#active-epoch-name')).toContainText('Era I');

    await page.locator('#nav-settings').focus();
    await page.keyboard.press('Enter');
    await page.locator('#import-string').fill(exported);
    await page.locator('#btn-import').click();
    await expect(page.locator('#system-status')).toContainText('loaded successfully');
    await expect(page.locator('#active-epoch-name')).toContainText('Era III');

    await page.locator('#nav-core').focus();
    await page.keyboard.press('Enter');
    await page.locator('#star-core').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.floating-text-particle').filter({ hasText: '+10,000 K' })).toBeVisible();

    await page.goto(APP_PATH);
    await page.locator('html.app-ready').waitFor({ state: 'attached' });
    await expect(page.locator('#active-epoch-name')).toContainText('Era III');
    expect(errors).toEqual([]);
  });

  test('corrupt-save matrix boots fresh, removes the active slot and caps quarantine', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await page.goto(APP_PATH);
    await page.locator('html.app-ready').waitFor({ state: 'attached' });

    const corruptPayloads = [
      '[object Object]',
      '{invalid-json',
      '',
      JSON.stringify({ version: ACTIVE_SAVE_VERSION, gameState: null }),
      JSON.stringify({ version: 999, gameState: { activeEpoch: 3 } }),
    ];

    for (const payload of corruptPayloads) {
      await page.evaluate(([key, value]) => localStorage.setItem(key, value), [ACTIVE_SAVE_KEY, payload]);
      await page.reload();
      await page.locator('html.app-ready').waitFor({ state: 'attached' });
      await expect(page.locator('#active-epoch-name')).toContainText('Era I');
      expect(await page.evaluate(key => localStorage.getItem(key), ACTIVE_SAVE_KEY)).toBeNull();
    }

    const quarantineKeys = await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('starForgeCorruptSave_')));
    expect(quarantineKeys).toHaveLength(3);
    expect(errors).toEqual([]);
  });

  test('quota denial and unavailable clipboard produce contextual feedback without stopping play', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Mid Era III');

    await page.evaluate(() => {
      const originalSetItem = Storage.prototype.setItem;
      window.__restoreStorageSetItem = () => { Storage.prototype.setItem = originalSetItem; };
      Storage.prototype.setItem = function deniedSetItem(key, value) {
        if (String(key).startsWith('starForge')) throw new DOMException('quota', 'QuotaExceededError');
        return originalSetItem.call(this, key, value);
      };
    });

    await page.waitForTimeout(5200);
    await page.locator('#nav-settings').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#system-status')).toContainText('Save failed');

    await page.locator('#nav-core').focus();
    await page.keyboard.press('Enter');
    await page.locator('#star-core').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.floating-text-particle').filter({ hasText: '+10,000 K' })).toBeVisible();

    await page.evaluate(() => {
      window.__restoreStorageSetItem();
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    });
    await page.locator('#pt-export').click();
    await expect(page.locator('#playtest-inline-status')).toContainText('Clipboard access is unavailable');
    expect(errors).toEqual([]);
  });
});
