import { defineConfig, devices } from '@playwright/test';

// Synthetic identity pages are fulfilled locally by the tests. No vault or real login is used.
export default defineConfig({
  testDir: './checks',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 15_000,
  outputDir: './test-results/auth-checks',
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    actionTimeout: 2_000,
    navigationTimeout: 2_000,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
});
