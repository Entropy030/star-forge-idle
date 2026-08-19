import { defineConfig, devices } from '@playwright/test';

const APP_PATH = '/star-forge-idle/';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: process.env.CI ? 4 : 2,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  outputDir: 'test-results/browser',
  use: {
    baseURL: `http://127.0.0.1:4173${APP_PATH}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: `http://127.0.0.1:4173${APP_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
