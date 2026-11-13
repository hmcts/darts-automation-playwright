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
    trace: 'retain-on-failure',
  },
});
