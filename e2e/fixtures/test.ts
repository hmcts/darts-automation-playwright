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
}>({
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
