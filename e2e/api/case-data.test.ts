import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CaseDataService,
  newCaseData,
  requireCaseCreationTarget,
  selectCourthouse,
} from './case-data';
import { DartsApiClient } from './client';

test('allows case creation only against a matching API-owned PR deployment', () => {
  const portal = 'https://darts-portal-api-pr-123.dev.platform.hmcts.net';
  const api = 'https://darts-api-pr-123.dev.platform.hmcts.net';
  assert.doesNotThrow(() => requireCaseCreationTarget(portal, api));
  for (const [portalUrl, apiUrl] of [
    [undefined, api],
    [portal, undefined],
    ['https://darts.staging.apps.hmcts.net', api],
    [portal, 'https://darts-api-pr-456.dev.platform.hmcts.net'],
    [portal, `${api}/cases`],
    [portal, api.replace('https:', 'http:')],
  ]) {
    assert.throws(() => requireCaseCreationTarget(portalUrl, apiUrl));
  }
});

test('requires the requested courthouse and its display name before creating data', () => {
  const courthouse = { courthouse_name: 'HARROW CROWN COURT', display_name: 'Harrow Crown Court' };
  assert.deepEqual(selectCourthouse([null, {}, courthouse], courthouse.courthouse_name), {
    name: courthouse.courthouse_name,
    displayName: courthouse.display_name,
  });
  assert.throws(() => selectCourthouse({}, courthouse.courthouse_name), /JSON array/);
  assert.throws(() => selectCourthouse([], courthouse.courthouse_name), /unavailable/);
  assert.throws(
    () => selectCourthouse([{ ...courthouse, display_name: '' }], courthouse.courthouse_name),
    /unavailable/,
  );
});

test('accepts the API display-name response and preserves its numeric case ID for UI verification', async () => {
  const data = newCaseData(
    { name: 'HARROW CROWN COURT', displayName: 'Harrow Crown Court' },
    'PW-E2E',
  );
  assert.ok(data.number.length <= 25, 'Generated case numbers must fit the event API contract');
  let calls = 0;
  const send: typeof fetch = async () => {
    if (++calls === 1) return Response.json({ access_token: 'synthetic-token' });
    return Response.json(
      {
        case_id: 123,
        case_number: data.number,
        courthouse: 'Harrow Crown Court',
        defendants: [data.defendant],
      },
      { status: 201 },
    );
  };
  const api = await DartsApiClient.authenticate(
    {
      baseURL: 'https://api.example.test',
      clientId: 'synthetic-client',
      clientSecret: 'synthetic-secret',
      username: 'synthetic-user',
      password: 'synthetic-password',
    },
    send,
  );
  const created = await new CaseDataService(api).createCase(data);
  assert.equal(created.id, 123);
  assert.equal(created.number, data.number);
});
