import { DateTime } from 'luxon';
import { type SearchableHearing } from '../data/search';
import { type CreatedHearing } from '../data/case';
import { type CaseSearchPage } from '../pages/case-search.page';
import { type CasePage } from '../pages/case.page';
import { createLogger } from '../support/logger';

const log = createLogger('advanced-search');

function hearingDate(hearing: SearchableHearing): string {
  const date = DateTime.fromISO(hearing.timestamp, { zone: 'utc' }).setZone('Europe/London');
  if (!date.isValid) throw new Error('Advanced search requires a valid hearing date.');
  return date.toFormat('dd/MM/yyyy');
}

export class AdvancedSearchFlow {
  constructor(
    private readonly search: CaseSearchPage,
    private readonly casePage: CasePage,
  ) {}

  async refineCourtLogSearch(hearing: SearchableHearing): Promise<void> {
    log.debug(`Refining a court-log keyword search for case ${hearing.id}`);
    await this.search.advancedSearch({
      courthouse: hearing.courthouseDisplayName,
      keywords: hearing.keywords,
    });
    await this.search.expectMoreCriteriaRequired();
    await this.search.refineByCourtroomAndDate(hearing.courtroom, hearingDate(hearing));
    await this.openMatchingHearing(hearing);
  }

  async findByReportingRestriction(hearing: SearchableHearing): Promise<void> {
    log.debug(`Searching reporting-restriction keywords for case ${hearing.id}`);
    const date = hearingDate(hearing);
    await this.search.advancedSearch({
      courthouse: hearing.courthouseDisplayName,
      keywords: hearing.keywords,
      hearingDate: { from: date, to: date },
    });
    await this.search.expectCaseInResults(hearing);
    await this.search.expectReportingRestriction(hearing.number);
    await this.openMatchingHearing(hearing);
  }

  async findByJudgeAndDefendant(hearing: CreatedHearing): Promise<void> {
    log.debug(`Finding case ${hearing.id} using judge and defendant details`);
    await this.searchByPeople(hearing);
    await this.openMatchingHearing(hearing);
  }

  async returnToPreviousSearch(hearing: CreatedHearing): Promise<void> {
    log.debug(`Checking search retention for case ${hearing.id}`);
    await this.searchByPeople(hearing);
    await this.search.visitYourAudioAndReturn();
    await this.search.expectPeopleCriteria(hearing);
    await this.search.expectCaseInResults(hearing);
    await this.search.expectJudgeInResults(hearing.number, hearing.judge);
    await this.search.openCase(hearing.number);
    await this.casePage.expectCaseDetails(hearing);
    await this.casePage.returnToSearch();
  }

  private async searchByPeople(hearing: CreatedHearing): Promise<void> {
    await this.search.advancedSearch({
      courthouse: hearing.courthouseDisplayName,
      judge: hearing.judge,
      defendant: hearing.defendant,
    });
    await this.search.expectCaseInResults(hearing);
    await this.search.expectJudgeInResults(hearing.number, hearing.judge);
  }

  private async openMatchingHearing(hearing: CreatedHearing): Promise<void> {
    await this.search.expectCaseInResults(hearing);
    await this.search.openCase(hearing.number);
    await this.casePage.expectCaseDetails(hearing);
    await this.casePage.openHearing(hearing.courtroom);
  }
}
