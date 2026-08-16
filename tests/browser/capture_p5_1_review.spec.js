import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, openApp } from './helpers.js';
import fs from 'fs';
import path from 'path';

test.describe('P5.1 Human UI Review Screenshot Package', () => {
  const outputDir = path.resolve(process.cwd(), 'tmp/p5-1-human-review');

  test.beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  test('captures desktop 1440x1000 and mobile 390x844 review package', async ({ page }) => {
    // -------------------------------------------------------------
    // Desktop 1440x1000 Captures
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 1440, height: 1000 });

    // 01: Era I Cosmos
    await openApp(page, '?playtest=1');
    await loadPlaytestPreset(page, 'Late Era I');
    await page.locator('#nav-core').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outputDir, '01_era1_cosmos.png'), fullPage: false });

    // 02: Era II Cosmos
    await loadPlaytestPreset(page, 'Mid Era II');
    await page.locator('#nav-core').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outputDir, '02_era2_cosmos.png'), fullPage: false });

    // 03: Era III Cosmos
    await loadPlaytestPreset(page, 'Mid Era III');
    await page.locator('#nav-core').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outputDir, '03_era3_cosmos.png'), fullPage: false });

    // 04 & 05: Codex Short vs Long Article on Settings Tab
    await page.locator('#nav-settings').click();
    await expect(page.locator('#codex-entry-list')).toBeVisible();

    const codexButtons = page.locator('#codex-entry-list button');
    const btnCount = await codexButtons.count();
    expect(btnCount).toBeGreaterThanOrEqual(2);

    // Short article (first entry)
    await codexButtons.first().click();
    await page.waitForTimeout(200);
    const navBoxShort = await page.locator('#codex-entry-list').boundingBox();
    await page.screenshot({ path: path.join(outputDir, '04_codex_short_article.png'), fullPage: false });

    // Long article (click second or later entry)
    await codexButtons.nth(1).click();
    await page.waitForTimeout(200);
    const navBoxLong = await page.locator('#codex-entry-list').boundingBox();
    await page.screenshot({ path: path.join(outputDir, '05_codex_long_article.png'), fullPage: false });

    console.log(`[EVIDENCE] Desktop Codex Nav Width (Short): ${navBoxShort?.width}px`);
    console.log(`[EVIDENCE] Desktop Codex Nav Width (Long): ${navBoxLong?.width}px`);
    if (navBoxShort && navBoxLong) {
      expect(Math.abs(navBoxShort.width - navBoxLong.width)).toBeLessThanOrEqual(0.5);
    }

    // -------------------------------------------------------------
    // Mobile 390x844 Captures
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 390, height: 844 });

    // 06: Mobile Era I
    await loadPlaytestPreset(page, 'Late Era I');
    await page.locator('#nav-core').click();
    await page.waitForTimeout(300);
    let overflow1 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow1, 'Mobile Era 1 horizontal overflow').toBeLessThanOrEqual(0);
    await page.screenshot({ path: path.join(outputDir, '06_mobile_era1.png'), fullPage: false });

    // 07: Mobile Era II
    await loadPlaytestPreset(page, 'Mid Era II');
    await page.locator('#nav-core').click();
    await page.waitForTimeout(300);
    let overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow2, 'Mobile Era 2 horizontal overflow').toBeLessThanOrEqual(0);
    await page.screenshot({ path: path.join(outputDir, '07_mobile_era2.png'), fullPage: false });

    // 08: Mobile Era III
    await loadPlaytestPreset(page, 'Mid Era III');
    await page.locator('#nav-core').click();
    await page.waitForTimeout(300);
    let overflow3 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow3, 'Mobile Era 3 horizontal overflow').toBeLessThanOrEqual(0);
    await page.screenshot({ path: path.join(outputDir, '08_mobile_era3.png'), fullPage: false });
  });
});
