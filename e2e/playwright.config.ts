import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { defineConfig } from '@playwright/test';

// All workers in this invocation use the same session path; concurrent shards get distinct IDs.
const authRunId = process.env._DARTS_E2E_AUTH_RUN_ID ?? randomUUID();
process.env._DARTS_E2E_AUTH_RUN_ID = authRunId;
const storageState = path.resolve('e2e/test-results/.auth', `${authRunId}.json`);

export default defineConfig({
  testDir: './tests',
  expect: { timeout: 15_000 },
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  outputDir: './test-results',
  use: {
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    baseURL: process.env.DARTS_PORTAL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'authenticate',
      testDir: './auth',
      testMatch: 'login.setup.ts',
      metadata: { storageState },
      // Keep credential-entry actions and their parameters out of all test artifacts.
      use: { trace: 'off', screenshot: 'off', video: 'off' },
    },
    {
      name: 'chromium',
      dependencies: ['authenticate'],
      use: { storageState },
    },
  ],
});
