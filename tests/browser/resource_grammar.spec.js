import { expect, test } from '@playwright/test';
import { loadPlaytestPreset, observeBrowserErrors, openApp } from './helpers.js';

test.describe('P5.2A Cross-Era Semantic Resource Grammar & D31 Implementation', () => {
  test('Era I maintains Quantum Fluctuations in Primary across fresh start and inflation prep', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // Fresh Era I
    await loadPlaytestPreset(page, 'Fresh Era I');
    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'quantumFluctuations');
    await expect(primaryCard.locator('.resource-card-label')).toHaveText('Quantum Fluctuations');

    // Late Era I (Inflation Prep)
    await loadPlaytestPreset(page, 'Late Era I');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'quantumFluctuations');
    await expect(primaryCard.locator('.resource-card-hint')).toContainText('100,000');

    // Support region contains Energy Density and Vacuum Coherence
    const supportCards = page.locator('#resource-support-region .resource-card');
    await expect(supportCards).toHaveCount(2);
    await expect(supportCards.nth(0)).toHaveAttribute('data-resource-id', 'energyDensity');
    await expect(supportCards.nth(1)).toHaveAttribute('data-resource-id', 'coherence');

    await page.screenshot({ path: 'test-results/p5_2a_era1_late_desktop.png', fullPage: true });
    expect(errors).toEqual([]);
  });

  test('Era II maintains progressive Primary state from Quarks to Protons to Plasma Temperature', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // Fresh Era II -> Quarks Primary
    await loadPlaytestPreset(page, 'Fresh Era II');
    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'quarks');

    // Mid Era II -> Protons Primary
    await loadPlaytestPreset(page, 'Mid Era II');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'protons');
    await page.screenshot({ path: 'test-results/p5_2a_era2_mid_desktop.png', fullPage: true });

    // Recombination Ready -> Plasma Temperature Primary
    await loadPlaytestPreset(page, 'Recombination Ready');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'plasmaTemperature');

    expect(errors).toEqual([]);
  });

  test('Era III implements D31 with Core Temperature in Primary across all stages', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await openApp(page, '?playtest=1');

    // Fresh Era III (Protostar)
    await loadPlaytestPreset(page, 'Fresh Era III');
    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'coreTemperature');
    await expect(primaryCard.locator('.resource-card-label')).toHaveText('Core Temperature');
    await expect(primaryCard.locator('.resource-card-hint')).toHaveText('Heat toward Main Sequence');

    const supportCards = page.locator('#resource-support-region .resource-card');
    await expect(supportCards).toHaveCount(2);
    await expect(supportCards.nth(0)).toHaveAttribute('data-resource-id', 'hydrogen');
    await expect(supportCards.nth(1)).toHaveAttribute('data-resource-id', 'helium');
    await page.screenshot({ path: 'test-results/p5_2a_era3_fresh_desktop.png', fullPage: true });

    // Supernova Ready (Late Iron stage)
    await loadPlaytestPreset(page, 'Supernova Ready');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'coreTemperature');
    await expect(primaryCard.locator('.resource-card-hint')).toHaveText('Collapse readiness');

    // Support shows Iron, Carbon, Helium; Details shows Hydrogen
    await expect(supportCards).toHaveCount(3);
    await expect(supportCards.nth(0)).toHaveAttribute('data-resource-id', 'iron');
    await expect(supportCards.nth(1)).toHaveAttribute('data-resource-id', 'carbon');
    await expect(supportCards.nth(2)).toHaveAttribute('data-resource-id', 'helium');

    const detailsRegion = page.locator('#resource-details-region');
    await expect(detailsRegion).toBeVisible();
    const detailsToggle = page.locator('#resource-details-toggle');
    await detailsToggle.click();
    await expect(page.locator('#resource-details-list .resource-card')).toHaveAttribute('data-resource-id', 'hydrogen');
    await page.screenshot({ path: 'test-results/p5_2a_era3_supernova_desktop.png', fullPage: true });

    expect(errors).toEqual([]);
  });

  test('390x844 mobile layout: Primary card is stable, no horizontal overflow, and details expand cleanly', async ({ page }) => {
    const errors = observeBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await openApp(page, '?playtest=1');

    await loadPlaytestPreset(page, 'Supernova Ready');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    const primaryCard = page.locator('#resource-primary-region .resource-card');
    await expect(primaryCard).toBeVisible();
    await expect(primaryCard).toHaveAttribute('data-resource-id', 'coreTemperature');

    const detailsToggle = page.locator('#resource-details-toggle');
    await expect(detailsToggle).toBeVisible();
    await detailsToggle.click();
    await expect(page.locator('#resource-details-list')).toBeVisible();
    await page.screenshot({ path: 'test-results/p5_2a_era3_supernova_mobile.png' });

    expect(errors).toEqual([]);
  });
});
