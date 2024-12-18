import { LaunchOptions } from '@playwright/test';

const random = (Math.random() + 1).toString(36).substring(7).toUpperCase();
const build = process.env.BUILD_NUMBER;
const user = (process.env.USER || 'USER').toUpperCase();

const browserOptions: LaunchOptions = {
  slowMo: 0,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true,
  },
};

const generateSeq = (): string => {
  const seq = build ? `${build}-${random}` : `${user.substring(0, 4)}-${random}`;
  console.log('Running with seq =', seq);
  return seq;
};

export const config = {
  browser: process.env.BROWSER ?? 'chromium',
  browserOptions,
  DARTS_PORTAL: process.env.DARTS_PORTAL ?? 'https://darts.staging.apps.hmcts.net',
  DARTS_GATEWAY: process.env.DARTS_GATEWAY ?? 'http://darts-gateway.staging.platform.hmcts.net',
  DARTS_PROXY: process.env.DARTS_PROXY ?? 'http://darts-proxy.staging.platform.hmcts.net',
  DARTS_GATEWAY_SERVICE_PATH: '/service/darts',
  DARTS_PROXY_SERVICE_PATH: '/service/darts/DARTSService',
  usernames: {
    VIQ_USERNAME: process.env.VIQ_EXTERNAL_USERNAME,
    XHIBIT_USERNAME: process.env.XHIBIT_EXTERNAL_USERNAME,
  },
  passwords: {
    AUTOMATION_PASSWORD: process.env.AUTOMATION_PASSWORD,
    AUTOMATION_INTERNAL_PASSWORD: process.env.AUTOMATION_INTERNAL_PASSWORD,
    AUTOMATION_EXTERNAL_PASSWORD: process.env.AUTOMATION_EXTERNAL_PASSWORD,
    AUTOMATION_REQUESTER_APPROVER_PASSWORD: process.env.AUTOMATION_REQUESTER_APPROVER_PASSWORD,
    VIQ_PASSWORD: process.env.VIQ_EXTERNAL_PASSWORD,
    XHIBIT_PASSWORD: process.env.XHIBIT_EXTERNAL_PASSWORD,
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
