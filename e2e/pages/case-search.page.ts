import { createLogger } from '../support/logger';
import { expect, type Locator, type Page } from '@playwright/test';

const log = createLogger('case-search');

interface ExpectedSearchResult {
  number: string;
  courthouseDisplayName: string;
  courtroom: string;
  defendant: string;
}

export class CaseSearchPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    log.debug('Open case search');
    await this.page.goto('/search');
    await expect(
      this.page.getByRole('heading', { name: 'Search for a case', exact: true }),
    ).toBeVisible();
  }

  async search(caseNumber: string): Promise<void> {
    log.debug('Search for the scenario case');
    // case-search-form.component.html: label[for=case_number].
    await this.page.locator('#case_number').fill(caseNumber);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  async expectCaseInResults(expected: ExpectedSearchResult): Promise<void> {
    log.debug('Verify the matching search result');
    const row = this.resultRow(expected.number);
    await expect(row).toHaveCount(1);
    for (const value of [expected.courthouseDisplayName, expected.courtroom, expected.defendant]) {
      await expect(row.getByRole('cell', { name: value, exact: true })).toBeVisible();
    }
  }

  async openCase(caseNumber: string): Promise<void> {
    log.debug('Open the matching case');
    await this.resultRow(caseNumber).getByRole('link', { name: caseNumber, exact: true }).click();
  }

  private resultRow(caseNumber: string): Locator {
    // Scope all checks to the matching row so another case cannot satisfy them.
    return this.page
      .locator('#search-results')
      .getByRole('row')
      .filter({
        has: this.page.getByRole('link', { name: caseNumber, exact: true }),
      });
  }
}
