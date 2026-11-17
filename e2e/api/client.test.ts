import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DartsApiClient } from './client';
import { readApiSettings } from './config';

const env = {
  DARTS_API: 'https://api.example.test',
  AAD_B2C_ROPC_CLIENT_ID: 'synthetic-client',
  AAD_B2C_ROPC_CLIENT_SECRET: 'synthetic-client-secret',
  AZURE_AD_FUNCTIONAL_TEST_GLOBAL_USERNAME: 'synthetic@example.test',
  AZURE_AD_FUNCTIONAL_TEST_GLOBAL_PASSWORD: 'synthetic-password',
};
const settings = readApiSettings(env);

test('exchanges the functional-test credentials for a token and sends authenticated API requests', async () => {
  const calls: { url: string; options?: RequestInit }[] = [];
  const send: typeof fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return Response.json(calls.length === 1 ? { access_token: 'synthetic-token' } : [{ id: 1 }]);
  };
  const api = await DartsApiClient.authenticate(settings, send);
  const response = await api.get('/courthouses');
  assert.equal(response.status, 200);
  assert.match(calls[0].url, /B2C_1_ropc_darts_signin\/oauth2\/v2\.0\/token$/);
  const form = new URLSearchParams(String(calls[0].options?.body));
  assert.equal(form.get('grant_type'), 'password');
  assert.equal(form.get('username'), settings.username);
  assert.equal(form.get('password'), settings.password);
  assert.equal(form.get('client_id'), settings.clientId);
  assert.equal(form.get('client_secret'), settings.clientSecret);
  assert.equal(
    form.get('scope'),
    `https://hmctsstgextid.onmicrosoft.com/${settings.clientId}/Functional.Test`,
  );
  assert.equal(calls[1].url, 'https://api.example.test/courthouses');
  assert.equal(
    new Headers(calls[1].options?.headers).get('Authorization'),
    'Bearer synthetic-token',
  );
  assert.equal(calls[1].options?.redirect, 'error');
});

test('rejects credential failures without exposing the identity-provider response', async () => {
  const send: typeof fetch = async () => new Response(settings.password, { status: 400 });
  await assert.rejects(DartsApiClient.authenticate(settings, send), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /HTTP 400/);
    assert.ok(!String(error).includes(settings.password));
    assert.equal(error.cause, undefined);
    return true;
  });
});

for (const payload of [{}, { access_token: '' }, { access_token: 123 }, null]) {
  test(`rejects an unusable token response: ${JSON.stringify(payload)}`, async () => {
    const send: typeof fetch = async () => Response.json(payload);
    await assert.rejects(DartsApiClient.authenticate(settings, send), /no usable access token/);
  });
}

test('rejects non-JSON token responses', async () => {
  const send: typeof fetch = async () => new Response('Gateway error');
  await assert.rejects(DartsApiClient.authenticate(settings, send), /did not return a JSON/);
});

test('sanitises transport failures during authentication and authenticated requests', async () => {
  let calls = 0;
  const send: typeof fetch = async () => {
    if (++calls === 1) return Response.json({ access_token: 'synthetic-token' });
    throw new Error('Request contained synthetic-token and synthetic-password');
  };
  const api = await DartsApiClient.authenticate(settings, send);
  await assert.rejects(api.get('/courthouses'), /^Error: DARTS API GET request failed/);
  await assert.rejects(
    DartsApiClient.authenticate(settings, send),
    /^Error: API token request failed/,
  );
});

test('does not forward the bearer token to another origin', async () => {
  let calls = 0;
  const send: typeof fetch = async () => {
    calls++;
    return Response.json({ access_token: 'synthetic-token' });
  };
  const api = await DartsApiClient.authenticate(settings, send);
  for (const endpoint of [
    'https://other.example.test/cases',
    '//other.example.test/cases',
    '/\\other.example.test/cases',
  ]) {
    await assert.rejects(api.get(endpoint), /relative path/);
  }
  assert.equal(calls, 1);
});

test('sends JSON setup requests and leaves HTTP status assertions to the caller', async () => {
  let calls = 0;
  const send: typeof fetch = async (_url, options) => {
    if (++calls === 1) return Response.json({ access_token: 'synthetic-token' });
    assert.equal(options?.method, 'POST');
    assert.match(new Headers(options?.headers).get('Accept') ?? '', /\*\/\*/);
    assert.equal(new Headers(options?.headers).get('Content-Type'), 'application/json');
    assert.equal(options?.body, JSON.stringify({ case_number: 'synthetic-case' }));
    return new Response(null, { status: 403 });
  };
  const api = await DartsApiClient.authenticate(settings, send);
  assert.equal((await api.post('/cases/addCase', { case_number: 'synthetic-case' })).status, 403);
});

test('requires explicit API credentials and an HTTPS API origin', () => {
  for (const name of Object.keys(env)) {
    assert.throws(() => readApiSettings({ ...env, [name]: '' }), new RegExp(name));
  }
  for (const url of [
    'http://api.example.test',
    'https://user:password@api.example.test',
    'https://api.example.test/cases',
    'https://api.example.test?query=1',
  ]) {
    assert.throws(() => readApiSettings({ ...env, DARTS_API: url }), /HTTPS origin/);
  }
});

test('rejects an API URL belonging to another PR', () => {
  const prEnv = {
    ...env,
    DARTS_PORTAL: 'https://darts-portal-api-pr-123.dev.platform.hmcts.net',
    DARTS_API: 'https://darts-api-pr-456.dev.platform.hmcts.net',
  };
  assert.throws(() => readApiSettings(prEnv), /same API PR/);
  assert.equal(
    readApiSettings({ ...prEnv, DARTS_API: 'https://darts-api-pr-123.dev.platform.hmcts.net' })
      .baseURL,
    'https://darts-api-pr-123.dev.platform.hmcts.net',
  );
});
