import { LaunchOptions } from '@playwright/test';
const browserOptions: LaunchOptions = {
  slowMo: 0,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true,
  },
};

export const config = {
  browser: process.env.BROWSER ?? 'chromium',
  browserOptions,
  DARTS_PORTAL: process.env.DARTS_PORTAL ?? 'https://darts.staging.apps.hmcts.net',
  passwords: {
    AUTOMATION_PASSWORD: process.env.AUTOMATION_PASSWORD,
    AUTOMATION_INTERNAL_PASSWORD: process.env.AUTOMATION_INTERNAL_PASSWORD,
    AUTOMATION_EXTERNAL_PASSWORD: process.env.AUTOMATION_EXTERNAL_PASSWORD,
    AUTOMATION_REQUESTER_APPROVER_PASSWORD: process.env.AUTOMATION_REQUESTER_APPROVER_PASSWORD,
  },
};
