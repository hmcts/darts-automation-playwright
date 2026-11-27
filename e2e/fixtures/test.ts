import { expect, mergeTests } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { test as authTest } from './auth.fixture';
import { test as serviceTest } from './services.fixture';
import { CaseSearchPage } from '../pages/case-search.page';
import { CasePage } from '../pages/case.page';
import { HearingPage } from '../pages/hearing.page';
import { TranscriptRequestPage } from '../pages/transcript-request.page';
import { planAudio, type HearingWithAudio } from '../data/audio';
import { newCaseData, type CreatedHearing } from '../data/case';
import { requireCaseCreationTarget } from '../services/case.service';
import { readInboundStorageUrl } from '../services/audio.service';
import { TranscriptRequestFlow } from '../flows/transcript-request.flow';
import { createLogger } from '../support/logger';
import { type SearchableHearing } from '../data/search';
import { AdvancedSearchFlow } from '../flows/advanced-search.flow';
import { hearingDay, planEarlierHearings, type HearingHistory } from '../data/hearing-history';
import { HearingHistoryFlow } from '../flows/hearing-history.flow';
import { newUserDetails, type NewUserDetails } from '../data/user';
import { AdminUsersPage } from '../pages/admin-users.page';
import { CreateUserFlow } from '../flows/create-user.flow';
import { UpdateUserFlow } from '../flows/update-user.flow';
import { AssignUserGroupFlow } from '../flows/assign-user-group.flow';
import { UserAccessFlow } from '../flows/user-access.flow';
import { approverGroup, type SecurityGroupDetails } from '../data/security-group';
import { AuthUser } from '../setup/users';

const log = createLogger('setup');

export const test = mergeTests(authTest, serviceTest).extend<{
  scenarioLog: void;
  caseSearch: CaseSearchPage;
  casePage: CasePage;
  hearingPage: HearingPage;
  transcriptRequest: TranscriptRequestPage;
  transcriptRequestFlow: TranscriptRequestFlow;
  createdCase: CreatedHearing;
  caseWithInterpreter: CreatedHearing;
  hearingWithAudio: HearingWithAudio;
  hearingWithAudioEvents: HearingWithAudio;
  courtLogHearing: SearchableHearing;
  restrictedEventHearing: SearchableHearing;
  advancedSearchFlow: AdvancedSearchFlow;
  hearingHistory: HearingHistory;
  hearingHistoryFlow: HearingHistoryFlow;
  userToCreate: NewUserDetails;
  adminUsers: AdminUsersPage;
  createUserFlow: CreateUserFlow;
  userChanges: NewUserDetails;
  updateUserFlow: UpdateUserFlow;
  groupToAssign: SecurityGroupDetails;
  assignUserGroupFlow: AssignUserGroupFlow;
  userAccessFlow: UserAccessFlow;
}>({
  hearingWithAudioEvents: async ({ hearingWithAudio, events }, use) => {
    await events.recordTranscriptBoundaryEvents(
      hearingWithAudio.courtCase,
      hearingWithAudio.startedAt,
      hearingWithAudio.endedAt,
    );
    await use(hearingWithAudio);
  },
  userAccessFlow: async ({ adminUsers }, use) => {
    await use(new UserAccessFlow(adminUsers));
  },
  groupToAssign: approverGroup,
  assignUserGroupFlow: async ({ adminUsers }, use) => {
    await use(new AssignUserGroupFlow(adminUsers));
  },
  userChanges: async ({ userToCreate }, use) => {
    const changes = newUserDetails();
    await use({ ...changes, fullName: `${userToCreate.fullName} Updated` });
  },
  updateUserFlow: async ({ adminUsers }, use) => {
    await use(new UpdateUserFlow(adminUsers));
  },
  userToCreate: async ({ authUser, baseURL }, use, testInfo) => {
    if (authUser !== AuthUser.ADMIN) throw new Error('User creation requires AuthUser.ADMIN.');
    requireCaseCreationTarget(baseURL, process.env.DARTS_API);
    const user = newUserDetails();
    await testInfo.attach('planned-user', {
      body: JSON.stringify(user),
      contentType: 'application/json',
    });
    await use(user);
  },
  adminUsers: async ({ page }, use, testInfo) => {
    const users = new AdminUsersPage(page);
    try {
      await use(users);
    } finally {
      await testInfo.attach('created-user-identifiers', {
        body: JSON.stringify(users.createdUsers),
        contentType: 'application/json',
      });
    }
  },
  createUserFlow: async ({ adminUsers }, use) => {
    await use(new CreateUserFlow(adminUsers));
  },
  hearingHistory: async ({ createdCase, cases }, use, testInfo) => {
    const hearings = [
      {
        id: createdCase.hearingId,
        date: hearingDay(createdCase.timestamp),
        courtroom: createdCase.courtroom,
      },
    ];
    const plan = planEarlierHearings(createdCase);
    await testInfo.attach('hearing-history-plan', {
      body: JSON.stringify({ caseId: createdCase.id, hearings, planned: plan }),
      contentType: 'application/json',
    });
    for (const data of plan) {
      await cases.createHearing(data);
      const id = await cases.getHearingId({ ...createdCase, ...data });
      hearings.push({ id, date: hearingDay(data.timestamp), courtroom: data.courtroom });
    }
    log.info(`Hearing history ready for case ${createdCase.id} (${hearings.length} hearings)`);
    await testInfo.attach('hearing-history-identifiers', {
      body: JSON.stringify({ caseId: createdCase.id, hearings }),
      contentType: 'application/json',
    });
    await use({ courtCase: createdCase, hearings });
  },
  hearingHistoryFlow: async ({ casePage }, use) => {
    await use(new HearingHistoryFlow(casePage));
  },
  courtLogHearing: async ({ createdCase, courtLogs }, use, testInfo) => {
    const keywords = `PW court log ${createdCase.number}`;
    await courtLogs.create(createdCase, keywords);
    await testInfo.attach('court-log-search-data', {
      body: JSON.stringify({ caseId: createdCase.id, hearingId: createdCase.hearingId, keywords }),
      contentType: 'application/json',
    });
    await use({ ...createdCase, keywords });
  },
  restrictedEventHearing: async ({ createdCase, events }, use, testInfo) => {
    const keywords = `PW reporting restriction ${createdCase.number}`;
    await events.recordReportingRestriction(createdCase, keywords);
    await testInfo.attach('event-search-data', {
      body: JSON.stringify({ caseId: createdCase.id, hearingId: createdCase.hearingId, keywords }),
      contentType: 'application/json',
    });
    await use({ ...createdCase, keywords });
  },
  advancedSearchFlow: async ({ caseSearch, casePage }, use) => {
    await use(new AdvancedSearchFlow(caseSearch, casePage));
  },
  scenarioLog: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      const scenario = createLogger('scenario');
      const started = Date.now();
      scenario.info(`Started: ${testInfo.title}`);
      try {
        await use();
      } finally {
        scenario.info(`Finished: ${testInfo.status ?? 'unknown'} (${Date.now() - started}ms)`);
      }
    },
    { auto: true },
  ],
  caseSearch: async ({ page }, use) => {
    await use(new CaseSearchPage(page));
  },
  casePage: async ({ page }, use) => {
    await use(new CasePage(page));
  },
  hearingPage: async ({ page }, use) => {
    await use(new HearingPage(page));
  },
  transcriptRequest: async ({ page }, use) => {
    await use(new TranscriptRequestPage(page));
  },
  transcriptRequestFlow: async ({ casePage, hearingPage, transcriptRequest }, use, testInfo) => {
    const flow = new TranscriptRequestFlow(casePage, hearingPage, transcriptRequest);
    try {
      await use(flow);
    } finally {
      // Keep created IDs even when a later UI check fails, without reporting code in the spec.
      for (const request of flow.submittedRequests) {
        await testInfo.attach('created-transcript-request', {
          body: JSON.stringify(request),
          contentType: 'application/json',
        });
      }
    }
  },
  createdCase: async ({ cases, courthouses, caseSearch, baseURL }, use, testInfo) => {
    log.debug('Preparing a unique case and actual hearing');
    requireCaseCreationTarget(baseURL, process.env.DARTS_API);
    // Confirm the UI session works before making the first write.
    await caseSearch.open();
    const courthouse = await courthouses.get(
      process.env.E2E_DATA_COURTHOUSE?.trim() || 'HARROW CROWN COURT',
    );
    // A unique courtroom prevents audio/event linking from crossing between test runs.
    const data = newCaseData(
      courthouse,
      `PW-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`,
    );
    // Capture identifiers before writing, including when case/event setup partially fails.
    await testInfo.attach('case-setup-identifiers', {
      body: JSON.stringify({
        ...data,
        cleanup: 'Retained in PR database; scoped cleanup not available',
      }),
      contentType: 'application/json',
    });
    const createdCase = await cases.create(data);
    log.debug(`Created case ${createdCase.id} (${createdCase.number})`);
    await testInfo.attach('created-case', {
      body: JSON.stringify(createdCase),
      contentType: 'application/json',
    });
    // Case details are available only after at least one actual hearing exists.
    await cases.createHearing(data);
    expect(await cases.get(createdCase.id)).toEqual({
      id: createdCase.id,
      number: createdCase.number,
      defendants: [createdCase.defendant],
    });
    const hearingId = await cases.getHearingId(createdCase);
    log.info(`Case ${createdCase.id} and hearing ${hearingId} ready`);
    await use({ ...createdCase, hearingId });
    // Do not use /functional-tests/clean: it deletes data belonging to other runs.
  },
  caseWithInterpreter: async ({ cases, createdCase }, use) => {
    log.debug(`Recording interpreter use for case ${createdCase.id}`);
    await cases.recordInterpreterUse(createdCase);
    await use(createdCase);
  },
  hearingWithAudio: async ({ audio, createdCase }, use, testInfo) => {
    log.debug(`Preparing audio for hearing ${createdCase.hearingId}`);
    const sasUrl = readInboundStorageUrl();
    const bytes = await audio.sample();
    const plan = planAudio(createdCase, bytes);
    await testInfo.attach('audio-setup-identifiers', {
      body: JSON.stringify({ caseId: createdCase.id, ...plan }),
      contentType: 'application/json',
    });
    await audio.upload(bytes, plan, sasUrl);
    await audio.register(createdCase, plan);
    const hearingId = createdCase.hearingId;
    const mediaId = await audio.waitForMetadata(hearingId, plan);
    log.info(`Audio ${mediaId} ready for hearing ${hearingId}`);
    await testInfo.attach('created-audio', {
      body: JSON.stringify({ caseId: createdCase.id, hearingId, mediaId, ...plan }),
      contentType: 'application/json',
    });
    await use({ courtCase: createdCase, hearingId, mediaId, ...plan });
  },
});

export { expect } from '@playwright/test';
