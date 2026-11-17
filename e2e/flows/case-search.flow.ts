import { type CreatedHearing } from '../data/case';
import { type CaseSearchPage } from '../pages/case-search.page';
import { type CasePage } from '../pages/case.page';
import { createLogger } from '../support/logger';

const log = createLogger('case-search');

export async function findCaseAndOpenHearing(
  caseSearch: CaseSearchPage,
  casePage: CasePage,
  courtCase: CreatedHearing,
): Promise<void> {
  log.debug(`Finding case ${courtCase.id} and opening hearing ${courtCase.hearingId}`);
  await caseSearch.search(courtCase.number);
  await caseSearch.expectCaseInResults(courtCase);
  await caseSearch.openCase(courtCase.number);
  await casePage.expectCaseDetails(courtCase);
  await casePage.openHearing(courtCase.courtroom);
  log.debug('Case-search flow completed');
}
