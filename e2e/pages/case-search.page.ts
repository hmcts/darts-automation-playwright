import { expect, type Locator, type Page } from '@playwright/test';

interface ExpectedSearchResult {
  number: string;
  courthouseDisplayName: string;
  courtroom: string;
  defendant: string;
}

export class CaseSearchPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/search');
    await expect(
      this.page.getByRole('heading', { name: 'Search for a case', exact: true }),
    ).toBeVisible();
  }

  async search(caseNumber: string): Promise<void> {
    await this.page.getByLabel('Case ID', { exact: true }).fill(caseNumber);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  async expectCaseInResults(expected: ExpectedSearchResult): Promise<void> {
    const row = this.resultRow(expected.number);
    await expect(row).toHaveCount(1);
    for (const value of [expected.courthouseDisplayName, expected.courtroom, expected.defendant]) {
      await expect(row.getByRole('cell', { name: value, exact: true })).toBeVisible();
    }
  }

  async openCase(caseNumber: string): Promise<void> {
    await this.resultRow(caseNumber).getByRole('link', { name: caseNumber, exact: true }).click();
  }

  private resultRow(caseNumber: string): Locator {
    // Scope all checks to the matching row so another case cannot satisfy them.
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: caseNumber, exact: true }),
    });
  }
}
