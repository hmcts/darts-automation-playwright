import { LaunchOptions } from '@playwright/test';

const randomNumber = Math.floor(Math.random() * 1000000)
  .toString()
  .padStart(6, '0');
const build = process.env.BUILD_NUMBER;

const browserOptions: LaunchOptions = {
  slowMo: 0,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true,
  },
};

const generateSeq = (): string => {
  const seq = build ? `${build}${randomNumber.substring(3)}` : randomNumber;
  console.log('Running with seq =', seq);
  return seq;
};

export const config = {
  browser: process.env.BROWSER ?? 'chromium',
  browserOptions,
  DARTS_PORTAL: process.env.DARTS_PORTAL ?? 'https://darts.staging.apps.hmcts.net',
  DARTS_API: process.env.DARTS_GATEWAY ?? 'https://darts-api.staging.platform.hmcts.net',
  DARTS_GATEWAY: process.env.DARTS_GATEWAY ?? 'http://darts-gateway.staging.platform.hmcts.net',
  DARTS_PROXY: process.env.DARTS_PROXY ?? 'http://darts-proxy.staging.platform.hmcts.net',
  DARTS_GATEWAY_SERVICE_PATH: '/service/darts',
  DARTS_PROXY_SERVICE_PATH: '/service/darts/DARTSService',
  apiAuthentication: {
    endpoint:
      'https://hmctsstgextid.b2clogin.com/hmctsstgextid.onmicrosoft.com/B2C_1_ropc_darts_signin/oauth2/v2.0/token',
    clientId: process.env.AAD_B2C_ROPC_CLIENT_ID,
    clientSecret: process.env.AAD_CLIENT_SECRET,
    scope: `https://hmctsstgextid.onmicrosoft.com/${process.env.AAD_B2C_ROPC_CLIENT_ID}/Functional.Test`,
  },
  usernames: {
    VIQ_USERNAME: process.env.VIQ_EXTERNAL_USERNAME,
    XHIBIT_USERNAME: process.env.XHIBIT_EXTERNAL_USERNAME,
    CPP_USERNAME: process.env.CPP_USERNAME,
    FUNC_TEST_ROPC_GLOBAL_USERNAME: process.env.FUNC_TEST_ROPC_GLOBAL_USERNAME,
  },
  passwords: {
    AUTOMATION_PASSWORD: process.env.AUTOMATION_PASSWORD,
    AUTOMATION_INTERNAL_PASSWORD: process.env.AUTOMATION_INTERNAL_PASSWORD,
    AUTOMATION_EXTERNAL_PASSWORD: process.env.AUTOMATION_EXTERNAL_PASSWORD,
    AUTOMATION_REQUESTER_APPROVER_PASSWORD: process.env.AUTOMATION_REQUESTER_APPROVER_PASSWORD,
    VIQ_PASSWORD: process.env.VIQ_EXTERNAL_PASSWORD,
    XHIBIT_PASSWORD: process.env.XHIBIT_EXTERNAL_PASSWORD,
    CPP_USERNAME: process.env.CPP_PASSWORD,
    FUNC_TEST_ROPC_GLOBAL_PASSWORD: process.env.FUNC_TEST_ROPC_GLOBAL_PASSWORD,
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
