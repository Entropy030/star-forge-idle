import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('Era-II Star Core Semantic Visual Causality & Accessibility (Phase 3)', () => {
  test('390x844 mobile: verifies Star Core semantic attributes, posture causality, and Recombination readiness', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // 1. Load Fresh Era II
    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    const starCore = page.locator('#star-core');
    await expect(starCore).toBeVisible();

    // Verify initial semantic data attributes in Fresh Era II (BALANCE posture, 10M K hot)
    await expect(starCore).toHaveAttribute('data-posture', 'BALANCE');
    await expect(starCore).toHaveAttribute('data-thermal-state', 'hot');
    await expect(starCore).toHaveAttribute('data-transition-ready', 'false');
    await expect(starCore).toHaveAttribute('data-semantic-label', /Primordial Plasma \[BALANCE\] · High Thermal Activity/);

    const initialAria = await starCore.getAttribute('aria-label');
    expect(initialAria).toContain('Primordial plasma core. Balance posture.');

    // Verify zero horizontal overflow at 390x844
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'Fresh Era II 390px mobile horizontal overflow').toBeLessThanOrEqual(0);

    // 2. Switch posture to ACCUMULATE -> check immediate semantic attribute causality
    const posturePanel = page.locator('#cosmos-posture-controller');
    const accumBtn = posturePanel.locator('[data-posture="ACCUMULATE"]');
    await accumBtn.click();

    await expect(starCore).toHaveAttribute('data-posture', 'ACCUMULATE');
    await expect(starCore).toHaveAttribute('data-semantic-label', /Primordial Plasma \[ACCUMULATE\] · High Thermal Activity/);
    const accumAria = await starCore.getAttribute('aria-label');
    expect(accumAria).toContain('Accumulate posture');

    // 3. Switch posture to CONDENSE -> check immediate semantic attribute causality
    const condenseBtn = posturePanel.locator('[data-posture="CONDENSE"]');
    await condenseBtn.click();

    await expect(starCore).toHaveAttribute('data-posture', 'CONDENSE');
    await expect(starCore).toHaveAttribute('data-semantic-label', /Primordial Plasma \[CONDENSE\] · High Thermal Activity/);
    const condenseAria = await starCore.getAttribute('aria-label');
    expect(condenseAria).toContain('Condense posture');

    // 4. Load Mid Era II (cooling in progress)
    await loadPlaytestPreset(page, 'Mid Era II');
    await expect(starCore).toBeVisible();

    // Verify thermal progression is reflected in DOM attributes
    const midThermal = await starCore.getAttribute('data-thermal-state');
    expect(['hot', 'cooling', 'stabilized']).toContain(midThermal);

    // 5. Load Era II Ready (Recombination Ready)
    await loadPlaytestPreset(page, 'Recombination Ready');
    await expect(starCore).toBeVisible();

    // Recombination readiness causality on Star Core
    await expect(starCore).toHaveAttribute('data-transition-ready', 'true');
    await expect(starCore).toHaveAttribute('data-thermal-state', 'recombination-ready');
    await expect(starCore).toHaveAttribute('data-semantic-label', /Recombination Ready/);

    const readyAria = await starCore.getAttribute('aria-label');
    expect(readyAria).toContain('Cosmic Recombination is ready');

    // 6. Verify Fresh Era III baseline enforces Handoff A (250 H starting Hydrogen)
    await loadPlaytestPreset(page, 'Fresh Era III');
    await expect(page.locator('#active-epoch-name')).toContainText('Era III');
    await expect(page.locator('.resource-card[data-resource-id="hydrogen"] .resource-card-value')).toHaveText('250');

    // Verify no browser errors
    expect(errors).toEqual([]);
  });

  test('Reduced Motion compliance: verifies animation suppression and semantic preservation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Fresh Era II');
    await expect(page.locator('#tab-content-core')).toBeVisible();

    const starCore = page.locator('#star-core');
    await expect(starCore).toBeVisible();

    // Verify CSS animation duration is suppressed (<= 0.01ms) under reduced motion
    const durationMs = (value) => value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
    const animDuration = await starCore.evaluate((el) => window.getComputedStyle(el).animationDuration);
    expect(durationMs(animDuration)).toBeLessThanOrEqual(0.01);

    // Verify semantic attributes remain fully accessible under reduced motion
    await expect(starCore).toHaveAttribute('data-posture', 'BALANCE');
    await expect(starCore).toHaveAttribute('data-thermal-state', 'hot');
    await expect(starCore).toHaveAttribute('data-transition-ready', 'false');

    // Verify canvas element exists and renders without throwing errors
    const canvas = page.locator('#core-fx-canvas');
    await expect(canvas).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Era-I and Era-III invariant regression isolation', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // 1. Era I check
    await loadPlaytestPreset(page, 'Fresh Era I');
    const starCore = page.locator('#star-core');
    await expect(starCore).toBeVisible();
    // Era II datasets should NOT exist on Era I core
    await expect(starCore).not.toHaveAttribute('data-posture', /.+/);
    await expect(starCore).not.toHaveAttribute('data-thermal-state', /.+/);
    await expect(starCore).not.toHaveAttribute('data-transition-ready', /.+/);

    // 2. Era III check
    await loadPlaytestPreset(page, 'Fresh Era III');
    await expect(starCore).toBeVisible();
    await expect(starCore).not.toHaveAttribute('data-posture', /.+/);
    await expect(starCore).not.toHaveAttribute('data-thermal-state', /.+/);
    await expect(starCore).not.toHaveAttribute('data-transition-ready', /.+/);

    expect(errors).toEqual([]);
  });
});
