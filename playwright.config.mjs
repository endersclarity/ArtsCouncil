import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /test_phase09_directory_uat\.js|uat-phase08-trip-builder\.mjs|uat-phase08-live-chatbot\.mjs/,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    headless: true,
    viewport: { width: 1400, height: 900 },
    launchOptions: {
      slowMo: 0,
    },
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporter: [['list']],
  workers: 1,
});
