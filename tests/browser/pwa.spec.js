import { expect, test } from '@playwright/test';
import { APP_PATH, observeBrowserErrors, openApp } from './helpers.js';

test('production PWA registers at the app scope and exposes a valid manifest', async ({ page }) => {
  const errors = observeBrowserErrors(page);
  await openApp(page);

  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    await ready.update();
    return {
      scope: ready.scope,
      scriptURL: ready.active?.scriptURL,
    };
  });
  expect(registration.scope).toBe('http://127.0.0.1:4173/star-forge-idle/');
  expect(registration.scriptURL).toBe('http://127.0.0.1:4173/star-forge-idle/sw.js');

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    const response = await fetch(link.href);
    const payload = await response.json();
    return {
      ok: response.ok,
      url: response.url,
      startURL: new URL(payload.start_url, response.url).href,
      scope: new URL(payload.scope, response.url).href,
      display: payload.display,
    };
  });
  expect(manifest.ok).toBe(true);
  expect(manifest.url).toContain('/star-forge-idle/assets/manifest-');
  expect(manifest.startURL).toBe('http://127.0.0.1:4173/star-forge-idle/');
  expect(manifest.scope).toBe('http://127.0.0.1:4173/star-forge-idle/');
  expect(manifest.display).toBe('standalone');
  expect(errors).toEqual([]);
});

test('service-worker caches stay same-origin and the installed shell boots offline', async ({ page, context }) => {
  const errors = observeBrowserErrors(page);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await openApp(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(5200);
  await page.reload();
  await page.locator('html.app-ready').waitFor({ state: 'attached' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  const cacheAudit = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const requestURLs = [];
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      requestURLs.push(...(await cache.keys()).map(request => request.url));
    }
    return { cacheNames, requestURLs, origin: location.origin };
  });
  expect(cacheAudit.cacheNames.some(name => name.includes('star-forge-idle'))).toBe(true);
  expect(cacheAudit.requestURLs.length).toBeGreaterThan(0);
  expect(cacheAudit.requestURLs.every(url => new URL(url).origin === cacheAudit.origin)).toBe(true);
  expect(errors).toEqual([]);

  await context.setOffline(true);
  await page.goto(APP_PATH);
  await page.locator('html.app-ready').waitFor({ state: 'attached' });
  await expect(page.locator('#game-shell')).toBeVisible();
  expect(pageErrors).toEqual([]);
  await context.setOffline(false);
});

test('generated worker declares immediate updates and old-cache cleanup', async ({ page }) => {
  await openApp(page);
  const workerSource = await page.evaluate(async () => (await fetch('sw.js', { cache: 'no-store' })).text());
  for (const contract of ['skipWaiting', 'clientsClaim', 'cleanupOutdatedCaches', 'precacheAndRoute', 'NavigationRoute']) {
    expect(workerSource).toContain(contract);
  }
});
