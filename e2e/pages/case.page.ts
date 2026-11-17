import { createLogger } from '../support/logger';
import { expect, type Page } from '@playwright/test';

const log = createLogger('case');

interface ExpectedCaseDetails {
  id: number;
  number: string;
  defendant: string;
}

export class CasePage {
  constructor(private readonly page: Page) {}

  async open(caseId: number): Promise<void> {
    log.debug('Open case details');
    await this.page.goto(`/case/${caseId}`);
  }

  async expectCaseDetails(expected: ExpectedCaseDetails): Promise<void> {
    log.debug('Verify case details');
    // Verify the API's numeric record ID as well as the user-facing case ID.
    await expect(this.page).toHaveURL((url) => url.pathname === `/case/${expected.id}`);
    await expect(
      this.page.getByRole('heading', {
        level: 1,
        name: `Case ID ${expected.number}`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(this.page.getByText(expected.defendant, { exact: true })).toBeVisible();
  }

  async openHearing(courtroom: string): Promise<void> {
    log.debug('Open the scenario hearing');
    const hearing = this.page
      .locator('#hearingsTable')
      .getByRole('table', { name: 'Hearings associated with case' })
      .getByRole('row')
      .filter({
        has: this.page.getByRole('cell', { name: courtroom, exact: true }),
      });
    await hearing.getByRole('link').click();
  }
}
