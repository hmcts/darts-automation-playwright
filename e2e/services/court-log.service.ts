import { expect } from '@playwright/test';
import { type CreatedHearing } from '../data/case';
import { type DartsApiClient } from './darts-api-client';
import { createLogger } from '../support/logger';

const log = createLogger('court-log');

export class CourtLogService {
  constructor(private readonly api: DartsApiClient) {}

  async create(hearing: CreatedHearing, text: string): Promise<void> {
    log.debug(`Creating a court log for hearing ${hearing.hearingId}`);
    // The controller delegates to eventsPost and returns 201; the YAML says 200.
    const response = await this.api.post('/courtlogs', {
      log_entry_date_time: hearing.timestamp,
      courthouse: hearing.courthouse,
      courtroom: hearing.courtroom,
      case_numbers: [hearing.number],
      text,
    });
    expect(response.status, 'Create the test-owned court log').toBe(201);
    log.info(`Court log created for hearing ${hearing.hearingId}`);
  }
}
