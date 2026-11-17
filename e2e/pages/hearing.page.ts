import { createLogger } from '../support/logger';
import { expect, type Page } from '@playwright/test';
import { type CreatedCase } from '../data/case';

const log = createLogger('hearing');

export class HearingPage {
  constructor(private readonly page: Page) {}

  async expectHearing(caseId: number, hearingId: number): Promise<void> {
    log.debug('Verify the selected hearing');
    await expect(this.page).toHaveURL(
      (url) => url.pathname === `/case/${caseId}/hearing/${hearingId}`,
    );
  }

  async openTranscripts(): Promise<void> {
    log.debug('Open hearing transcripts');
    await this.page
      .getByRole('navigation', { name: 'Sub navigation', exact: true })
      .getByRole('link', { name: /^Transcripts/ })
      .click();
  }

  async expectDetails(expected: CreatedCase): Promise<void> {
    log.debug('Verify hearing details');
    // hearing-file.component.html owns the hearing's courthouse/courtroom details.
    const details = this.page.locator('app-hearing-file');
    await expect(details.getByText(expected.courthouseDisplayName, { exact: true })).toBeVisible();
    await expect(details.getByText(expected.courtroom, { exact: true })).toBeVisible();
  }

  async expectEvent(text: string): Promise<void> {
    log.debug('Verify the expected court event');
    await expect(
      this.page.locator('#eventAudioTable').getByRole('cell', { name: text, exact: true }),
    ).toBeVisible();
  }

  async requestTranscript(): Promise<void> {
    log.debug('Start a transcript request');
    await this.page.getByRole('button', { name: 'Request a new transcript', exact: true }).click();
  }

  async expectTranscriptRequest(type: string, status: string): Promise<void> {
    log.debug('Verify the transcript request and status');
    await expect(
      this.page.getByRole('heading', { name: 'Transcripts for this hearing', exact: true }),
    ).toBeVisible();
    const request = this.page
      .locator('#transcriptsTable')
      .getByRole('table', { name: 'Transcripts from this hearing', exact: true })
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: type, exact: true }) });
    await expect(request).toHaveCount(1);
    await expect(request.getByRole('cell', { name: status, exact: true })).toBeVisible();
  }
}
