import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'uat-phase08-trip-builder.mjs',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    headless: false,
    viewport: { width: 1400, height: 900 },
    launchOptions: {
      slowMo: 300,
    },
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporter: [['list']],
  workers: 1,
});
