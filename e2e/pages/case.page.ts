import { expect, type Page } from '@playwright/test';

interface ExpectedCaseDetails {
  id: number;
  number: string;
  defendant: string;
}

export class CasePage {
  constructor(private readonly page: Page) {}

  async open(caseId: number): Promise<void> {
    await this.page.goto(`/case/${caseId}`);
  }

  async expectCaseDetails(expected: ExpectedCaseDetails): Promise<void> {
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
    const hearing = this.page
      .getByRole('table', { name: 'Hearings associated with case' })
      .getByRole('row')
      .filter({
        has: this.page.getByRole('cell', { name: courtroom, exact: true }),
      });
    await hearing.getByRole('link').click();
  }
}
