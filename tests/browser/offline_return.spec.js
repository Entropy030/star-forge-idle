import { expect, test } from '@playwright/test';
import { ACTIVE_SAVE_KEY, APP_PATH, observeBrowserErrors } from './helpers.js';

test('cold return renders an accessible one-time briefing at 390px without auto-transition', async ({ page }) => {
  const errors = observeBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(APP_PATH);
  await page.locator('html.app-ready').waitFor({ state: 'attached' });
  await page.waitForTimeout(5200);

  await page.evaluate(key => {
    const initialSave = JSON.parse(localStorage.getItem(key));
    initialSave.gameState.unfold.introCompleted = true;
    initialSave.gameState.upgrades.quantum.gravityForce.level = 1;
    initialSave.gameState.upgrades.quantum.gravityForce.cost = { __type: 'Decimal', value: '10' };
    initialSave.lastSavedTime = Date.now() - 60_000;
    localStorage.setItem(key, JSON.stringify(initialSave));
  }, ACTIVE_SAVE_KEY);

  await page.reload();
  await page.locator('html.app-ready').waitFor({ state: 'attached' });
  await expect(page.locator('#game-shell')).toBeVisible();
  const briefing = page.locator('#offline-return-briefing');
  await expect(briefing).toBeVisible();
  await expect(briefing).toContainText('While You Were Away');
  await expect(briefing).toContainText('Universe simulated');
  await expect(briefing).toContainText('Quantum Fluctuations');
  await expect(page.locator('#active-epoch-name')).toContainText('Era I');

  const stateContract = await page.evaluate(key => {
    const stored = JSON.parse(localStorage.getItem(key));
    return {
      activeId: document.activeElement?.id || null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      summaryPersisted: Object.hasOwn(stored.gameState, 'offlineSummary')
    };
  }, ACTIVE_SAVE_KEY);
  expect(stateContract.activeId).not.toBe('offline-return-briefing');
  expect(stateContract.overflow).toBeLessThanOrEqual(0);
  expect(stateContract.summaryPersisted).toBe(false);

  const dismiss = page.locator('.offline-briefing-dismiss');
  await dismiss.focus();
  await page.keyboard.press('Enter');
  await expect(briefing).toBeHidden();

  await page.reload();
  await page.locator('html.app-ready').waitFor({ state: 'attached' });
  await expect(page.locator('#offline-return-briefing')).toBeHidden();
  expect(errors).toEqual([]);
});
