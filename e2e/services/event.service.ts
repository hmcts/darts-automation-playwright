import { randomInt, randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { type CreatedCase, type CreatedHearing } from '../data/case';
import { type DartsApiClient } from './darts-api-client';
import { createLogger } from '../support/logger';

const log = createLogger('event');

export class EventService {
  constructor(private readonly api: DartsApiClient) {}

  async recordTranscriptBoundaryEvents(
    courtCase: CreatedCase,
    startedAt: string,
    endedAt: string,
  ): Promise<void> {
    for (const [type, timestamp, text] of [
      ['1100', startedAt, `PW transcript start ${courtCase.number}`],
      ['1200', endedAt, `PW transcript end ${courtCase.number}`],
    ] as const) {
      const response = await this.api.post('/events', {
        message_id: randomUUID(),
        type,
        event_id: String(randomInt(1, 2_147_483_647)),
        courthouse: courtCase.courthouse,
        courtroom: courtCase.courtroom,
        case_numbers: [courtCase.number],
        event_text: text,
        date_time: timestamp,
      });
      expect(response.status, 'Create the test-owned transcript boundary event').toBe(201);
    }
    log.info(`Transcript boundary events ready for case ${courtCase.id}`);
  }

  async recordReportingRestriction(hearing: CreatedHearing, text: string): Promise<void> {
    log.debug(`Recording a reporting restriction for hearing ${hearing.hearingId}`);
    const response = await this.api.post('/events', {
      message_id: randomUUID(),
      type: '21200',
      sub_type: '11000',
      event_id: String(randomInt(1, 2_147_483_647)),
      courthouse: hearing.courthouse,
      courtroom: hearing.courtroom,
      case_numbers: [hearing.number],
      event_text: text,
      date_time: hearing.timestamp,
      is_mid_tier: true,
    });
    expect(response.status, 'Record the test-owned reporting restriction').toBe(201);
    log.info(`Reporting restriction recorded for hearing ${hearing.hearingId}`);
  }
}
