import { createLogger } from '../support/logger';
import { expect, type Page } from '@playwright/test';

const log = createLogger('transcript-request');

export type TranscriptRequestType = 'Court Log' | 'Sentencing remarks' | 'Specified Times';

interface ExpectedTranscriptRequest {
  caseNumber: string;
  type: TranscriptRequestType;
  urgency: string;
  interval?: { startTime: string; endTime: string };
}

export class TranscriptRequestPage {
  constructor(private readonly page: Page) {}

  async expectAudioInterval(startTime: string, endTime: string): Promise<void> {
    log.debug('Verify the available audio interval');
    await expect(
      this.page
        .locator('app-request-transcript > #audio-table')
        .getByRole('row')
        .filter({ has: this.page.getByRole('cell', { name: startTime, exact: true }) })
        .filter({ has: this.page.getByRole('cell', { name: endTime, exact: true }) }),
    ).toBeVisible();
  }

  async selectRequest(type: TranscriptRequestType, urgency: string): Promise<void> {
    log.debug('Select transcript type and urgency');
    await this.page.locator('#transcription-type').selectOption({ label: type });
    await this.page.locator('#urgency').selectOption({ label: urgency });
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(
      this.page.getByRole('heading', {
        name:
          type === 'Sentencing remarks'
            ? 'Check and confirm your transcript request'
            : 'Events, audio and specific times requests',
        exact: true,
      }),
    ).toBeVisible();
  }

  async selectInterval(startTime: string, endTime: string): Promise<void> {
    log.debug('Select the transcript time interval');
    // Stable IDs distinguish the repeated Hour/Minutes/Seconds labels in this form.
    for (const [prefix, time] of [
      ['start', startTime],
      ['end', endTime],
    ] as const) {
      const [hour, minutes, seconds] = time.split(':');
      await this.page.locator(`#${prefix}-hour-input`).fill(hour);
      await this.page.locator(`#${prefix}-minutes-input`).fill(minutes);
      await this.page.locator(`#${prefix}-seconds-input`).fill(seconds);
    }
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  async selectIntervalFromEvents(startTime: string, endTime: string): Promise<void> {
    log.debug('Select hearing events to populate the transcript time interval');
    const events = this.page.locator('app-request-times #event-table');
    for (const [time, name] of [
      [startTime, 'Hearing started'],
      [endTime, 'Hearing ended'],
    ] as const) {
      const row = events
        .getByRole('row')
        .filter({ has: this.page.getByRole('cell', { name: time, exact: true }) })
        .filter({ has: this.page.getByRole('cell', { name, exact: true }) });
      await expect(row).toHaveCount(1);
      await row.getByRole('checkbox').check();
    }
    for (const [prefix, time] of [
      ['start', startTime],
      ['end', endTime],
    ] as const) {
      const [hour, minutes, seconds] = time.split(':');
      await expect(this.page.locator(`#${prefix}-hour-input`)).toHaveValue(hour);
      await expect(this.page.locator(`#${prefix}-minutes-input`)).toHaveValue(minutes);
      await expect(this.page.locator(`#${prefix}-seconds-input`)).toHaveValue(seconds);
    }
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  async expectDetails(expected: ExpectedTranscriptRequest): Promise<void> {
    log.debug('Verify the request summary');
    await expect(
      this.page.getByRole('heading', {
        name: 'Check and confirm your transcript request',
        exact: true,
      }),
    ).toBeVisible();
    for (const value of [expected.caseNumber, expected.type, expected.urgency]) {
      await expect(this.page.getByRole('definition').filter({ hasText: value })).toHaveText(value);
    }
    if (expected.interval) {
      const { startTime, endTime } = expected.interval;
      await expect(
        this.page.getByRole('definition').filter({ hasText: `Start time ${startTime}` }),
      ).toHaveText(`Start time ${startTime} - End time ${endTime}`);
    }
  }

  async submit(): Promise<number> {
    log.debug('Confirm judge authorisation and submit the request');
    await this.page.locator('#authorisation').check();
    const submitted = this.page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/transcriptions' &&
        response.request().method() === 'POST',
    );
    await this.page.getByRole('button', { name: 'Submit request', exact: true }).click();
    const response = await submitted;
    expect(response.status(), 'UI transcript submission must succeed').toBe(200);
    const payload: unknown = await response.json();
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('transcription_id' in payload) ||
      typeof payload.transcription_id !== 'number' ||
      !Number.isSafeInteger(payload.transcription_id) ||
      payload.transcription_id <= 0
    ) {
      throw new Error('Transcript submission returned no valid transcription_id.');
    }
    return payload.transcription_id;
  }

  async expectSubmitted(requestId: number): Promise<void> {
    log.debug('Verify request submission confirmation');
    await expect(
      this.page.getByRole('heading', { name: 'Transcript request submitted', exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(String(requestId), { exact: true })).toBeVisible();
  }

  async returnToHearing(): Promise<void> {
    log.debug('Return to the hearing');
    await this.page.getByRole('link', { name: 'Return to hearing date', exact: true }).click();
  }
}
