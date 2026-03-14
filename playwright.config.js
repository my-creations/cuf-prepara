import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never' }],
    [process.env.CI ? 'line' : 'list'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    testIdAttribute: 'data-testid',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4173',
    port: 4173,
    reuseExistingServer: true,
    cwd: '.',
    timeout: 15000,
  },
});
