import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: process.env.DARTS_PORTAL,
    trace: 'retain-on-failure',
  },
});
