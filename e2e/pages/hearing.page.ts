import { expect, type Page } from '@playwright/test';

export class HearingPage {
  constructor(private readonly page: Page) {}

  async expectHearing(caseId: number, hearingId: number): Promise<void> {
    await expect(this.page).toHaveURL(
      (url) => url.pathname === `/case/${caseId}/hearing/${hearingId}`,
    );
  }

  async openTranscripts(): Promise<void> {
    await this.page
      .getByRole('navigation', { name: 'Sub navigation', exact: true })
      .getByRole('link', { name: /^Transcripts/ })
      .click();
  }

  async requestTranscript(): Promise<void> {
    await this.page.getByRole('button', { name: 'Request a new transcript', exact: true }).click();
  }

  async expectTranscriptRequest(type: string, status: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Transcripts for this hearing', exact: true }),
    ).toBeVisible();
    const request = this.page
      .getByRole('table', { name: 'Transcripts from this hearing', exact: true })
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: type, exact: true }) });
    await expect(request).toHaveCount(1);
    await expect(request.getByRole('cell', { name: status, exact: true })).toBeVisible();
  }
}
