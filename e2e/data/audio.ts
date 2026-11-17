import { createHash, randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import { type CreatedCase } from './case';

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
