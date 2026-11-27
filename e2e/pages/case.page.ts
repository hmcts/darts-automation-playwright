import { createLogger } from '../support/logger';
import { expect, type Page } from '@playwright/test';
import { DateTime } from 'luxon';
import { type HearingHistory } from '../data/hearing-history';

export type HearingSortColumn = 'Hearing date' | 'Courtroom';
export type SortDirection = 'ascending' | 'descending';

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

  async returnToSearch(): Promise<void> {
    log.debug('Return to the previous search through the case breadcrumb');
    await this.page
      .locator('app-breadcrumb')
      .getByRole('link', { name: 'Search', exact: true })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Search for a case', exact: true }),
    ).toBeVisible();
  }

  async sortHearings(column: HearingSortColumn, direction: SortDirection): Promise<void> {
    log.debug(`Sort hearing history by ${column} ${direction}`);
    const table = this.page.locator('#hearingsTable');
    const header = table.getByRole('columnheader', {
      name: `${column} column header`,
      exact: true,
    });
    const button = header.getByRole('button', {
      name: `Sortable column for ${column}`,
      exact: true,
    });
    for (let attempt = 0; attempt < 2; attempt++) {
      const previous = await header.getAttribute('aria-sort');
      if (previous === direction) break;
      await button.click();
      await expect(header).not.toHaveAttribute('aria-sort', previous ?? 'none');
    }
    await expect(header).toHaveAttribute('aria-sort', direction);
  }

  async expectHearingsLoaded(history: HearingHistory): Promise<void> {
    log.debug('Wait for the complete test-owned hearing history');
    const table = this.page.locator('#hearingsTable');
    await expect(table.locator('tbody tr')).toHaveCount(history.hearings.length);
    for (const hearing of history.hearings) {
      await expect(
        table.locator(`a[href="/case/${history.courtCase.id}/hearing/${hearing.id}"]`),
      ).toBeVisible();
    }
  }

  async expectHearingOrder(
    history: HearingHistory,
    column: HearingSortColumn,
    direction: SortDirection,
  ): Promise<void> {
    log.debug(`Verify hearing rows ordered by ${column} ${direction}`);
    const expected = [...history.hearings].sort((left, right) =>
      column === 'Hearing date'
        ? left.date.localeCompare(right.date)
        : left.courtroom.localeCompare(right.courtroom),
    );
    if (direction === 'descending') expected.reverse();
    const rows = this.page.locator('#hearingsTable tbody tr');
    await expect(rows).toHaveCount(expected.length);
    for (const [index, hearing] of expected.entries()) {
      const row = rows.nth(index);
      const date = DateTime.fromISO(hearing.date).toFormat('dd MMM yyyy');
      const link = row.getByRole('link', { name: date, exact: true });
      await expect(link).toHaveAttribute(
        'href',
        `/case/${history.courtCase.id}/hearing/${hearing.id}`,
      );
      await expect(row.getByRole('cell').nth(2)).toHaveText(hearing.courtroom);
    }
  }
}
