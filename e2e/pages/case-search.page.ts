import { createLogger } from '../support/logger';
import { expect, type Locator, type Page } from '@playwright/test';

export interface AdvancedSearchCriteria {
  courthouse: string;
  courtroom?: string;
  keywords?: string;
  judge?: string;
  defendant?: string;
  hearingDate?: { specific: string } | { from: string; to: string };
}

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

  async advancedSearch(criteria: AdvancedSearchCriteria): Promise<void> {
    log.debug('Search with advanced courthouse, person, keyword and hearing filters');
    // This asynchronously populated widget is rebuilt when its reference data arrives.
    const courthousesLoaded = this.page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/courthouses',
    );
    await Promise.all([this.open(), courthousesLoaded.then((response) => response.finished())]);
    await this.page.getByText('Advanced search', { exact: true }).click();
    const courthouse = this.page.locator('#courthouse-autocomplete');
    // accessible-autocomplete needs keyboard events to update its suggestions.
    await courthouse.pressSequentially(criteria.courthouse);
    await this.page.getByRole('option', { name: criteria.courthouse, exact: true }).click();
    await expect(this.page.getByLabel('Courthouse name', { exact: true })).toHaveText(
      criteria.courthouse,
    );
    if (criteria.keywords) await this.page.locator('#keywords').fill(criteria.keywords);
    if (criteria.judge) await this.page.locator('#judge').fill(criteria.judge);
    if (criteria.defendant) await this.page.locator('#defendant').fill(criteria.defendant);
    if (criteria.courtroom) await this.page.locator('#courtroom').fill(criteria.courtroom);
    if (criteria.hearingDate) {
      if ('specific' in criteria.hearingDate) {
        await this.page.getByRole('radio', { name: 'Specific date', exact: true }).check();
        await this.page.locator('#specific').fill(criteria.hearingDate.specific);
        await this.page.locator('#specific').blur();
      } else {
        await this.page.getByRole('radio', { name: 'Date range', exact: true }).check();
        await this.page.locator('#from').fill(criteria.hearingDate.from);
        await this.page.locator('#from').blur();
        await this.page.locator('#to').fill(criteria.hearingDate.to);
        await this.page.locator('#to').blur();
      }
    }
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  async refineByCourtroomAndDate(courtroom: string, date: string): Promise<void> {
    log.debug('Refine advanced search with courtroom and hearing date');
    await this.page.locator('#courtroom').fill(courtroom);
    await this.page.getByRole('radio', { name: 'Specific date', exact: true }).check();
    await this.page.locator('#specific').fill(date);
    await this.page.locator('#specific').blur();
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  async expectMoreCriteriaRequired(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: 'We need more information to search for a case',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByText('Refine your search by adding more information and try again.', {
        exact: true,
      }),
    ).toBeVisible();
  }

  async expectReportingRestriction(caseNumber: string): Promise<void> {
    // The warning is a sibling row, so tie it to this case rather than any warning.
    const warning = this.resultRow(caseNumber).locator('xpath=following-sibling::tr[1]');
    await expect(warning).toContainText('There are restrictions against this case');
  }

  async expectCaseInResults(expected: ExpectedSearchResult): Promise<void> {
    log.debug('Verify the matching search result');
    const row = this.resultRow(expected.number);
    await expect(row).toHaveCount(1);
    for (const value of [expected.courthouseDisplayName, expected.courtroom, expected.defendant]) {
      await expect(row.getByRole('cell', { name: value, exact: true })).toBeVisible();
    }
  }

  async expectJudgeInResults(caseNumber: string, judge: string): Promise<void> {
    log.debug('Verify the judge in the matching result');
    await expect(
      this.resultRow(caseNumber).getByRole('cell', { name: judge, exact: true }),
    ).toBeVisible();
  }

  async visitYourAudioAndReturn(): Promise<void> {
    log.debug('Visit Your audio and return through the Search navigation link');
    const navigation = this.page.getByRole('navigation', {
      name: 'Primary navigation',
      exact: true,
    });
    await navigation.getByRole('link', { name: 'Your audio', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Your audio', exact: true })).toBeVisible();
    await navigation.getByRole('link', { name: 'Search', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Search for a case', exact: true }),
    ).toBeVisible();
  }

  async expectPeopleCriteria(criteria: {
    courthouseDisplayName: string;
    judge: string;
    defendant: string;
  }): Promise<void> {
    log.debug('Verify the original advanced-search criteria are retained');
    await expect(this.page.locator('app-case-search-form details')).toHaveAttribute('open', '');
    await expect(this.page.getByLabel('Courthouse name', { exact: true })).toHaveText(
      criteria.courthouseDisplayName,
    );
    await expect(this.page.locator('#judge')).toHaveValue(criteria.judge);
    await expect(this.page.locator('#defendant')).toHaveValue(criteria.defendant);
    await expect(this.page.locator('#case_number')).toHaveValue('');
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
