import { LaunchOptions } from '@playwright/test';
const browserOptions: LaunchOptions = {
  slowMo: 0,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true,
  },
};

const generateSeq = (): string => {
  // TODO: use Jenkins build number, if present
  const envUser = process.env.USER || 'user';
  const r = (Math.random() + 1).toString(36).substring(7);
  const seq = `${envUser.substring(0, 4)}-${r}`;
  console.log('Running with seq =', seq);
  return seq;
};

export const config = {
  browser: process.env.BROWSER ?? 'chromium',
  browserOptions,
  DARTS_PORTAL: process.env.DARTS_PORTAL ?? 'https://darts.staging.apps.hmcts.net',
  DARTS_GATEWAY: process.env.DARTS_GATEWAY ?? 'http://darts-gateway.staging.platform.hmcts.net',
  usernames: {
    VIQ_EXTERNAL_USERNAME: process.env.VIQ_EXTERNAL_USERNAME,
  },
  passwords: {
    AUTOMATION_PASSWORD: process.env.AUTOMATION_PASSWORD,
    AUTOMATION_INTERNAL_PASSWORD: process.env.AUTOMATION_INTERNAL_PASSWORD,
    AUTOMATION_EXTERNAL_PASSWORD: process.env.AUTOMATION_EXTERNAL_PASSWORD,
    AUTOMATION_REQUESTER_APPROVER_PASSWORD: process.env.AUTOMATION_REQUESTER_APPROVER_PASSWORD,
    VIQ_EXTERNAL_PASSWORD: process.env.VIQ_EXTERNAL_PASSWORD,
  },

  database: {
    HOST: process.env.DARTS_API_DB_HOST ?? 'localhost',
    PORT: process.env.DARTS_API_DB_PORT ?? 5432,
    SCHEMA: process.env.DARTS_API_DB_SCHEMA ?? 'darts',
    DATABASE: process.env.DARTS_API_DB_DATABASE ?? 'darts',
    USERNAME: process.env.DARTS_API_DB_USERNAME ?? 'darts',
    PASSWORD: process.env.DARTS_API_DB_PASSWORD ?? 'darts',
  },
  seq: generateSeq(),
};
