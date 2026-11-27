import { randomInt, randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import { type CreatedHearing, type TestCaseData } from './case';

export interface HistoryHearing {
  id: number;
  date: string;
  courtroom: string;
}

export interface HearingHistory {
  courtCase: CreatedHearing;
  hearings: readonly HistoryHearing[];
}

export function hearingDay(timestamp: string): string {
  const date = DateTime.fromISO(timestamp, { zone: 'utc' }).setZone('Europe/London');
  if (!date.isValid) throw new Error('Hearing history requires a valid event timestamp.');
  return date.toISODate()!;
}

export function planEarlierHearings(courtCase: CreatedHearing): TestCaseData[] {
  const date = DateTime.fromISO(hearingDay(courtCase.timestamp), { zone: 'Europe/London' });
  // Creation order, date order and courtroom order deliberately differ.
  return [
    { daysAgo: 2, suffix: '-A' },
    { daysAgo: 1, suffix: '-Z' },
  ].map(({ daysAgo, suffix }) => ({
    ...courtCase,
    courtroom: `${courtCase.courtroom}${suffix}`,
    timestamp: date.minus({ days: daysAgo }).set({ hour: 10 }).toUTC().toISO()!,
    messageId: randomUUID(),
    eventId: String(randomInt(1, 2_147_483_647)),
  }));
}
