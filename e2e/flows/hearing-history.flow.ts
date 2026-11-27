import { type HearingHistory } from '../data/hearing-history';
import { type CasePage, type HearingSortColumn, type SortDirection } from '../pages/case.page';

export class HearingHistoryFlow {
  constructor(private readonly casePage: CasePage) {}

  async sort(
    history: HearingHistory,
    column: HearingSortColumn,
    direction: SortDirection,
  ): Promise<void> {
    await this.casePage.open(history.courtCase.id);
    await this.casePage.expectCaseDetails(history.courtCase);
    await this.casePage.expectHearingsLoaded(history);
    const opposite = direction === 'ascending' ? 'descending' : 'ascending';
    // Establish the opposite order first so a correct initial order cannot mask a broken control.
    await this.casePage.sortHearings(column, opposite);
    await this.casePage.expectHearingOrder(history, column, opposite);
    await this.casePage.sortHearings(column, direction);
  }
}
