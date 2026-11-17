import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AudioDataService,
  findHearingId,
  findMediaId,
  planAudio,
  readInboundStorageUrl,
} from './audio-data';
import { type CreatedCase } from './case-data';
import { DartsApiClient } from './client';

const courtCase: CreatedCase = {
  id: 123,
  number: 'PW-EXAMPLE',
  courthouse: 'HARROW CROWN COURT',
  courthouseDisplayName: 'Harrow Crown Court',
  courtroom: 'PW-EXAMPLE',
  defendant: 'Synthetic defendant',
  judge: 'Synthetic judge',
  timestamp: '2026-07-12T23:30:00Z',
  messageId: 'synthetic-message',
  eventId: '1',
};

test('plans sample audio on the hearing local date with actual file size/checksum and unique blob IDs', () => {
  const plan = planAudio(courtCase, Buffer.from('abc'));
  assert.equal(plan.size, 3);
  assert.equal(plan.checksum, '900150983cd24fb0d6963f7d28e17f72');
  assert.equal(plan.startedAt, '2026-07-13T09:00:00.000Z');
  assert.equal(plan.endedAt, '2026-07-13T09:01:00.000Z');
  assert.equal(plan.startTime, '10:00:00');
  assert.equal(plan.endTime, '10:01:00');
  assert.notEqual(plan.storageGuid, planAudio(courtCase, Buffer.from('abc')).storageGuid);
  assert.throws(
    () => planAudio({ ...courtCase, timestamp: 'invalid' }, Buffer.from('abc')),
    /valid case timestamp/,
  );
});

test('requires an inbound container SAS URL without exposing invalid signatures', () => {
  const url = 'https://synthetic.blob.core.windows.net/inbound?sig=fake-signature';
  assert.equal(readInboundStorageUrl({ E2E_AUDIO_INBOUND_SAS_URL: url }), url);
  for (const value of [
    '',
    'not-a-url?sig=fake-signature',
    url.replace('https:', 'http:'),
    url.replace('/inbound?', '/inbound/blob?'),
  ]) {
    assert.throws(
      () => readInboundStorageUrl({ E2E_AUDIO_INBOUND_SAS_URL: value }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /E2E_AUDIO_INBOUND_SAS_URL/);
        assert.ok(!error.message.includes('fake-signature'));
        return true;
      },
    );
  }
});

test('selects only one hearing in the test-owned courtroom', () => {
  assert.equal(
    findHearingId(
      [
        { id: 1, courtroom: 'OTHER' },
        { id: 2, courtroom: courtCase.courtroom },
      ],
      courtCase.courtroom,
    ),
    2,
  );
  assert.throws(() => findHearingId([], courtCase.courtroom), /exactly one hearing/);
  assert.throws(
    () =>
      findHearingId(
        [
          { id: 1, courtroom: courtCase.courtroom },
          { id: 2, courtroom: courtCase.courtroom },
        ],
        courtCase.courtroom,
      ),
    /exactly one hearing/,
  );
});

test('recognises the registered audio interval without requiring optional fields or background playback processing', () => {
  const plan = planAudio(courtCase, Buffer.from('abc'));
  const media = {
    id: 42,
    media_start_timestamp: '2026-07-13T10:00:00+01:00',
    media_end_timestamp: plan.endedAt,
    is_available: false,
  };
  assert.equal(findMediaId([media], plan), 42);
  assert.equal(findMediaId([{ ...media, id: 0 }], plan), undefined);
  assert.equal(findMediaId([{ ...media, media_end_timestamp: plan.startedAt }], plan), undefined);
  assert.equal(findMediaId([], plan), undefined);
});

async function syntheticApi(): Promise<DartsApiClient> {
  return DartsApiClient.authenticate(
    {
      baseURL: 'https://api.example.test',
      clientId: 'synthetic-client',
      clientSecret: 'synthetic-secret',
      username: 'synthetic-user',
      password: 'synthetic-password',
    },
    async () => Response.json({ access_token: 'synthetic-token' }),
  );
}

test('uploads the sample as a new block blob without following redirects or overwriting data', async () => {
  const bytes = Buffer.from('abc');
  const plan = planAudio(courtCase, bytes);
  const sasUrl = 'https://synthetic.blob.core.windows.net/inbound?sig=fake-signature';
  const send: typeof fetch = async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, `/inbound/${plan.storageGuid}`);
    assert.equal(url.searchParams.get('sig'), 'fake-signature');
    assert.equal(options?.method, 'PUT');
    assert.equal(options?.redirect, 'error');
    const headers = new Headers(options?.headers);
    assert.equal(headers.get('x-ms-blob-type'), 'BlockBlob');
    assert.equal(headers.get('If-None-Match'), '*');
    assert.deepEqual(options?.body, new Uint8Array(bytes));
    return new Response(null, { status: 201 });
  };
  await new AudioDataService(await syntheticApi(), send).upload(bytes, plan, sasUrl);
});

test('upload errors never expose the SAS signature or transport error', async () => {
  const bytes = Buffer.from('abc');
  const plan = planAudio(courtCase, bytes);
  const sasUrl = 'https://synthetic.blob.core.windows.net/inbound?sig=fake-signature';
  const send: typeof fetch = async () => {
    throw new Error(sasUrl);
  };
  await assert.rejects(
    new AudioDataService(await syntheticApi(), send).upload(bytes, plan, sasUrl),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Audio blob upload failed/);
      assert.ok(!String(error).includes('fake-signature'));
      assert.equal(error.cause, undefined);
      return true;
    },
  );
  const denied: typeof fetch = async () => new Response('fake-signature', { status: 403 });
  await assert.rejects(
    new AudioDataService(await syntheticApi(), denied).upload(bytes, plan, sasUrl),
    /^Error: Audio blob upload returned HTTP 403/,
  );
});
