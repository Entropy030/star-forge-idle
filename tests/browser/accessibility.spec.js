import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('keyboard and semantic browser contracts', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Supernova Ready');
  });

  test('Core and every primary destination remain keyboard operable', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    const core = page.locator('#star-core');
    await core.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.floating-text-particle').filter({ hasText: '+10,000 K' })).toBeVisible();
    await expect(core).toBeFocused();

    const destinations = [
      ['nav-upgrades', 'tab-content-upgrades'],
      ['nav-prestige', 'tab-content-prestige'],
      ['nav-settings', 'tab-content-settings'],
      ['nav-core', 'tab-content-core'],
    ];

    for (const [navigationId, panelId] of destinations) {
      const navigation = page.locator(`#${navigationId}`);
      await navigation.focus();
      await page.keyboard.press('Enter');
      await expect(navigation).toHaveAttribute('aria-current', 'page');
      await expect(page.locator(`#${panelId}`)).toBeVisible();
      await expect(navigation).toBeFocused();
    }

    expect(errors).toEqual([]);
  });

  test('progress, readiness and grouped controls expose meaning without color alone', async ({ page }) => {
    await expect(page.locator('#nav-core')).toHaveAttribute('aria-current', 'page');
    await loadPlaytestPreset(page, 'Late Era I');
    await expect(page.locator('.coherence-banner')).toBeVisible();
    await expect(page.locator('#coherence-label')).toHaveText('Vacuum Coherence');
    await loadPlaytestPreset(page, 'Mid Era III');
    await expect(page.locator('.coherence-banner')).toBeHidden();
    expect(await page.locator('body').innerText()).not.toContain('Coherence');
    await expect(page.locator('#cosmos-primary-status [role="progressbar"]').first()).toHaveAttribute('aria-valuenow');
    await expect(page.locator('#btn-trigger-hypernova')).toBeDisabled();
    await loadPlaytestPreset(page, 'Supernova Ready');

    for (const requirement of ['#gateway-temp-status', '#gateway-iron-status']) {
      await expect(page.locator(`${requirement} .cosmos-check-label`)).not.toHaveText('');
      await expect(page.locator(`${requirement} .cosmos-check-value`)).not.toHaveText('');
      await expect(page.locator(`${requirement} .cosmos-check-icon`)).toHaveAttribute('aria-label', 'Requirement met');
    }

    await page.locator('#nav-upgrades').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('group', { name: 'Upgrade purchase quantity' })).toBeVisible();
    await expect(page.locator('[data-buy-mode="1"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.forge-card button, .forge-card summary').first()).toBeVisible();

    const forgeButton = page.locator('#btn-gravity');
    await forgeButton.focus();
    await page.keyboard.press('Enter');
    await expect(forgeButton).toBeFocused();

    const details = page.locator('.forge-details').first();
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');

    await page.locator('#nav-settings').focus();
    await page.keyboard.press('Enter');
    const exportButton = page.locator('#btn-export');
    await exportButton.focus();
    await expect(exportButton).toBeFocused();

    const codexButton = page.locator('#codex-entry-list button').first();
    const codexTitleBefore = await page.locator('#codex-detail-title').textContent();
    await codexButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#codex-detail-title')).not.toHaveText(codexTitleBefore);

    const importField = page.locator('#import-string');
    await importField.focus();
    await page.keyboard.press('Tab');
    await expect(importField).not.toBeFocused();
  });

  test('focus-visible indication survives desktop and narrow layouts', async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => document.activeElement?.blur());
      for (let step = 0; step < 20; step += 1) {
        await page.keyboard.press('Tab');
        if (await page.locator('#star-core').evaluate(element => element === document.activeElement)) break;
      }
      await expect(page.locator('#star-core')).toBeFocused();
      const focusStyle = await page.locator('#star-core').evaluate(element => {
        const computed = getComputedStyle(element);
        return { outlineStyle: computed.outlineStyle, outlineWidth: computed.outlineWidth };
      });
      expect(focusStyle.outlineStyle).not.toBe('none');
      expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(2);
    }
  });

  test('system reduced motion preserves visible and live controls', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const core = page.locator('#star-core');
    const styles = await core.evaluate(element => {
      const computed = getComputedStyle(element);
      return {
        animationDuration: computed.animationDuration,
        transitionDuration: computed.transitionDuration,
        visibility: computed.visibility,
      };
    });

    const durationMs = value => value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
    expect(durationMs(styles.animationDuration)).toBeLessThanOrEqual(0.01);
    expect(durationMs(styles.transitionDuration)).toBeLessThanOrEqual(0.01);
    expect(styles.visibility).toBe('visible');

    await core.focus();
    await page.keyboard.press(' ');
    await expect(page.locator('.floating-text-particle').filter({ hasText: '+10,000 K' })).toBeVisible();
  });
});
