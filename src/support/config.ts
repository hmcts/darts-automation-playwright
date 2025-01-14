import { LaunchOptions } from '@playwright/test';

const randomNumber = Math.floor(Math.random() * 1000000)
  .toString()
  .padStart(6, '0');
const build = process.env.BUILD_NUMBER;

const browserOptions: LaunchOptions = {
  headless: process.env.SHOW_BROWSER === 'true' ? false : true,
  slowMo: process.env.SHOW_BROWSER === 'true' ? 100 : 0,
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
  DARTS_TEST_HARNESS:
    process.env.DARTS_TEST_HARNESS ?? 'http://darts-ucf-test-harness.staging.platform.hmcts.net',
  DARTS_GATEWAY: process.env.DARTS_GATEWAY ?? 'http://darts-gateway.staging.platform.hmcts.net',
  DARTS_PROXY: process.env.DARTS_PROXY ?? 'http://darts-proxy.staging.platform.hmcts.net',
  DARTS_GATEWAY_SERVICE_PATH: '/service/darts',
  DARTS_PROXY_SERVICE_PATH: '/service/darts/DARTSService',
  features: {
    useTestHarnessForAudio: process.env.USE_TEST_HARNESS_FOR_AUDIO === 'true' ? true : false,
  },
  apiAuthentication: {
    external: {
      endpoint:
        'https://hmctsstgextid.b2clogin.com/hmctsstgextid.onmicrosoft.com/B2C_1_ropc_darts_signin',
      clientId: process.env.AAD_B2C_ROPC_CLIENT_ID,
      clientSecret: process.env.AAD_CLIENT_SECRET,
      scope: `https://hmctsstgextid.onmicrosoft.com/${process.env.AAD_B2C_ROPC_CLIENT_ID}/Functional.Test`,
    },
    internal: {
      endpoint: `https://login.microsoftonline.com/${process.env.AAD_TENANT_ID}`,
      clientId: process.env.AAD_CLIENT_ID,
      clientSecret: process.env.AAD_CLIENT_SECRET,
      scope: `api://${process.env.AAD_CLIENT_ID}/Functional.Test`,
    },
  },
  usernames: {
    VIQ_USERNAME: process.env.VIQ_EXTERNAL_USERNAME,
    XHIBIT_USERNAME: process.env.XHIBIT_EXTERNAL_USERNAME,
    CPP_USERNAME: process.env.CP_EXTERNAL_USERNAME,
    FUNC_TEST_ROPC_GLOBAL_USERNAME: process.env.FUNC_TEST_ROPC_GLOBAL_USERNAME,
  },
  passwords: {
    AUTOMATION_PASSWORD: process.env.AUTOMATION_PASSWORD,
    AUTOMATION_INTERNAL_PASSWORD: process.env.AUTOMATION_INTERNAL_PASSWORD,
    AUTOMATION_EXTERNAL_PASSWORD: process.env.AUTOMATION_EXTERNAL_PASSWORD,
    AUTOMATION_REQUESTER_APPROVER_PASSWORD: process.env.AUTOMATION_REQUESTER_APPROVER_PASSWORD,
    VIQ_PASSWORD: process.env.VIQ_EXTERNAL_PASSWORD,
    XHIBIT_PASSWORD: process.env.XHIBIT_EXTERNAL_PASSWORD,
    CPP_PASSWORD: process.env.CP_EXTERNAL_PASSWORD,
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
  azure: {
    storage: {
      INBOUND_CONTAINER_NAME: 'darts-inbound-container',
      AZURE_STORAGE_CONNECTION_STRING:
        process.env.AZURE_STORAGE_CONNECTION_STRING ?? 'some-connection-string',
    },
  },
  seq: generateSeq(),
};
