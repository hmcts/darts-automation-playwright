import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect } from '@playwright/test';
import { DateTime } from 'luxon';
import { type CreatedCase } from './case-data';
import { type DartsApiClient } from './client';

export interface AudioPlan {
  storageGuid: string;
  filename: string;
  checksum: string;
  size: number;
  startedAt: string;
  endedAt: string;
  startTime: string;
  endTime: string;
}

export interface HearingWithAudio extends AudioPlan {
  courtCase: CreatedCase;
  hearingId: number;
  mediaId: number;
}

class AudioUploadError extends Error {}

export function readInboundStorageUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const value = env.E2E_AUDIO_INBOUND_SAS_URL;
  if (!value)
    throw new Error('Set E2E_AUDIO_INBOUND_SAS_URL to the target API inbound container SAS URL.');
  try {
    const url = new URL(value ?? '');
    if (
      url.protocol === 'https:' &&
      url.hostname.endsWith('.blob.core.windows.net') &&
      /^\/[^/]+\/?$/.test(url.pathname) &&
      url.searchParams.has('sig') &&
      !url.username &&
      !url.password &&
      !url.hash
    )
      return value;
  } catch {
    // Never include a malformed SAS URL in errors or Playwright artifacts.
  }
  throw new Error('Set E2E_AUDIO_INBOUND_SAS_URL to the target API inbound container SAS URL.');
}

export function planAudio(courtCase: CreatedCase, bytes: Buffer): AudioPlan {
  // The checked-in 128 kbps MP2 sample is 60 seconds long. Use a fixed local time
  // on this hearing's day so DST and runs near midnight cannot split the hearing.
  const start = DateTime.fromISO(courtCase.timestamp, { zone: 'utc' })
    .setZone('Europe/London')
    .startOf('day')
    .set({ hour: 10 });
  if (!start.isValid) throw new Error('Audio setup requires a valid case timestamp.');
  const end = start.plus({ minutes: 1 });
  const storageGuid = randomUUID();
  return {
    storageGuid,
    filename: `PW-${storageGuid}.mp2`,
    checksum: createHash('md5').update(bytes).digest('hex'),
    size: bytes.byteLength,
    startedAt: start.toJSDate().toISOString(),
    endedAt: end.toJSDate().toISOString(),
    startTime: start.toFormat('HH:mm:ss'),
    endTime: end.toFormat('HH:mm:ss'),
  };
}

export function findHearingId(payload: unknown, courtroom: string): number {
  if (!Array.isArray(payload)) throw new Error('Case hearings must be a JSON array.');
  const matches = (payload as unknown[]).filter(
    (item): item is { id: number; courtroom: string } =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      typeof item.id === 'number' &&
      Number.isSafeInteger(item.id) &&
      item.id > 0 &&
      'courtroom' in item &&
      item.courtroom === courtroom,
  );
  if (matches.length !== 1)
    throw new Error('Expected exactly one hearing in the test-owned courtroom.');
  return matches[0].id;
}

export function findMediaId(payload: unknown, plan: AudioPlan): number | undefined {
  if (!Array.isArray(payload)) throw new Error('Hearing audio must be a JSON array.');
  for (const item of payload as unknown[]) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('id' in item) ||
      typeof item.id !== 'number' ||
      !Number.isSafeInteger(item.id) ||
      item.id <= 0
    )
      continue;
    if (
      'media_start_timestamp' in item &&
      typeof item.media_start_timestamp === 'string' &&
      'media_end_timestamp' in item &&
      typeof item.media_end_timestamp === 'string' &&
      Date.parse(item.media_start_timestamp) === Date.parse(plan.startedAt) &&
      Date.parse(item.media_end_timestamp) === Date.parse(plan.endedAt)
    )
      return item.id;
  }
  return undefined;
}

export class AudioDataService {
  constructor(
    private readonly api: DartsApiClient,
    private readonly uploadRequest: typeof fetch = fetch,
  ) {}

  async sample(): Promise<Buffer> {
    return readFile(fileURLToPath(new URL('../../src/testdata/sample1.mp2', import.meta.url)));
  }

  async upload(bytes: Buffer, plan: AudioPlan, sasUrl: string): Promise<void> {
    try {
      const url = new URL(sasUrl);
      url.pathname = `${url.pathname.replace(/\/$/, '')}/${plan.storageGuid}`;
      const response = await this.uploadRequest(url, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'x-ms-version': '2021-12-02',
          'Content-Type': 'audio/mpeg',
          'If-None-Match': '*',
        },
        body: new Uint8Array(bytes),
        signal: AbortSignal.timeout(30_000),
        redirect: 'error',
      });
      if (response.status !== 201) {
        throw new AudioUploadError(
          `Audio blob upload returned HTTP ${response.status}. Check inbound storage access and SAS expiry.`,
        );
      }
    } catch (error: unknown) {
      if (error instanceof AudioUploadError) throw error;
      throw new Error(
        'Audio blob upload failed. Check inbound storage access and SAS expiry; SAS details withheld.',
      );
    }
  }

  async register(courtCase: CreatedCase, plan: AudioPlan): Promise<void> {
    const response = await this.api.post('/audios/metadata', {
      started_at: plan.startedAt,
      ended_at: plan.endedAt,
      channel: 1,
      total_channels: 1,
      format: 'mp2',
      filename: plan.filename,
      courthouse: courtCase.courthouse,
      courtroom: courtCase.courtroom,
      file_size: plan.size,
      checksum: plan.checksum,
      cases: [courtCase.number],
      storage_guid: plan.storageGuid,
    });
    const problem = response.status === 200 ? '' : await response.text();
    expect(
      response.status,
      `POST /audios/metadata must register the sample. ${problem.slice(0, 2000)}`,
    ).toBe(200);
  }

  async hearingId(courtCase: CreatedCase): Promise<number> {
    const response = await this.api.get(`/cases/${courtCase.id}/hearings`);
    expect(response.status, 'GET hearings for the API-created case').toBe(200);
    const payload: unknown = await response.json();
    return findHearingId(payload, courtCase.courtroom);
  }

  async waitForMetadata(hearingId: number, plan: AudioPlan): Promise<number> {
    let mediaId: number | undefined;
    await expect
      .poll(
        async () => {
          const response = await this.api.get(`/audio/hearings/${hearingId}/audios`);
          expect(response.status, 'GET audio metadata for the test hearing').toBe(200);
          const payload: unknown = await response.json();
          mediaId = findMediaId(payload, plan);
          return mediaId ?? 0;
        },
        { timeout: 20_000, message: 'Uploaded audio must be linked to the test hearing' },
      )
      .toBeGreaterThan(0);
    if (mediaId === undefined) throw new Error('Uploaded audio was not linked to the hearing.');
    return mediaId;
  }
}
