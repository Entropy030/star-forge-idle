import { test, expect } from '@playwright/test';
import { openApp, loadPlaytestPreset } from './helpers.js';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'tmp/p4-phase3-visual-review');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

test.describe('P4 Phase 3 Human Visual Review Screenshots', () => {
  test('Capture all 8 visual review artifacts', async ({ page }) => {
    // -------------------------------------------------------------
    // DESKTOP SUITE (1440x1000)
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openApp(page, '?playtest=1');

    // 01_hot_balance.png
    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();
    await page.locator('#cosmos-posture-controller [data-posture="BALANCE"]').click();
    await page.waitForTimeout(400); // Allow canvas frame stabilization
    await page.screenshot({ path: path.join(outDir, '01_hot_balance.png') });

    // 02_hot_accumulate.png
    await page.locator('#cosmos-posture-controller [data-posture="ACCUMULATE"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '02_hot_accumulate.png') });

    // 03_hot_condense.png
    await page.locator('#cosmos-posture-controller [data-posture="CONDENSE"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '03_hot_condense.png') });

    // 04_late_cooled_era2.png
    await loadPlaytestPreset(page, 'Mid Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();
    await page.locator('#cosmos-posture-controller [data-posture="CONDENSE"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '04_late_cooled_era2.png') });

    // 05_recombination_ready.png
    await loadPlaytestPreset(page, 'Recombination Ready');
    await expect(page.locator('#tab-content-core')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '05_recombination_ready.png') });

    // 06_reduced_motion_condense.png
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();
    await page.locator('#cosmos-posture-controller [data-posture="CONDENSE"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '06_reduced_motion_condense.png') });

    // -------------------------------------------------------------
    // MOBILE SUITE (390x844)
    // -------------------------------------------------------------
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 390, height: 844 });

    // 07_mobile_era2_overview.png
    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();
    await page.locator('#cosmos-posture-controller [data-posture="BALANCE"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '07_mobile_era2_overview.png') });

    // 08_mobile_recombination_ready.png
    await loadPlaytestPreset(page, 'Recombination Ready');
    await expect(page.locator('#tab-content-core')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '08_mobile_recombination_ready.png') });

    expect(fs.readdirSync(outDir).length).toBeGreaterThanOrEqual(8);
  });
});
