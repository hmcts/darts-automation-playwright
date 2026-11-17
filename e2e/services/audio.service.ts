import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect } from '@playwright/test';
import { type CreatedCase } from '../data/case';
import { type AudioPlan } from '../data/audio';
import { type DartsApiClient } from './darts-api-client';
import { createLogger } from '../support/logger';

const log = createLogger('audio');

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

export class AudioService {
  constructor(
    private readonly api: DartsApiClient,
    private readonly uploadRequest: typeof fetch = fetch,
  ) {}

  async sample(): Promise<Buffer> {
    log.debug('Reading the sample audio file');
    return readFile(fileURLToPath(new URL('../../src/testdata/sample1.mp2', import.meta.url)));
  }

  async upload(bytes: Buffer, plan: AudioPlan, sasUrl: string): Promise<void> {
    log.debug(`Uploading ${bytes.byteLength} audio bytes as blob ${plan.storageGuid}`);
    let response: Response;
    try {
      const url = new URL(sasUrl);
      url.pathname = `${url.pathname.replace(/\/$/, '')}/${plan.storageGuid}`;
      response = await this.uploadRequest(url, {
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
    } catch {
      throw new Error(
        'Audio blob upload failed. Check inbound storage access and SAS expiry; SAS details withheld.',
      );
    }
    if (response.status !== 201) {
      throw new Error(
        `Audio blob upload returned HTTP ${response.status}. Check inbound storage access and SAS expiry.`,
      );
    }
    log.debug('Audio upload completed (HTTP 201)');
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

  async waitForMetadata(hearingId: number, plan: AudioPlan): Promise<number> {
    log.debug(`Waiting for linked audio metadata on hearing ${hearingId}`);
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
