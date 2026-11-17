import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { AuthUser, type AuthOptions } from './setup/users';
import { type LogLevel } from './support/logger';

const envResult = loadEnv({ path: fileURLToPath(new URL('.env', import.meta.url)) });
if (envResult.error && (!('code' in envResult.error) || envResult.error.code !== 'ENOENT')) {
  throw envResult.error;
}

export default defineConfig<object, AuthOptions>({
  testDir: './tests',
  expect: { timeout: 15_000 },
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  metadata: {
    logLevel: 'INFO' satisfies LogLevel,
  },
  outputDir: './test-results',
  use: {
    // Specs may select another named account with test.use({ authUser: ... }).
    authUser: AuthUser.AUTOMATION,
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    baseURL: process.env.DARTS_PORTAL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
});
