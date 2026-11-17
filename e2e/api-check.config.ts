import { defineConfig } from '@playwright/test';

// Read-only environment check, separate from the sharded UI demo and its browser login.
export default defineConfig({
  testDir: './api-checks',
  timeout: 75_000,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  outputDir: './test-results/api-checks',
  reporter: 'list',
  use: { trace: 'off', screenshot: 'off', video: 'off' },
});
