import { test as base } from '@playwright/test';
import { CaseSearchPage } from './pages/case-search.page';
import { CasePage } from './pages/case.page';
import { HearingPage } from './pages/hearing.page';
import { TranscriptRequestPage } from './pages/transcript-request.page';
import { DartsApiClient } from './api/client';
import { readApiSettings } from './api/config';
import { randomUUID } from 'node:crypto';
import {
  AudioDataService,
  planAudio,
  readInboundStorageUrl,
  type HearingWithAudio,
} from './api/audio-data';
import {
  CaseDataService,
  newCaseData,
  requireCaseCreationTarget,
  type CreatedCase,
} from './api/case-data';

export const test = base.extend<{
  caseSearch: CaseSearchPage;
  casePage: CasePage;
  hearingPage: HearingPage;
  transcriptRequest: TranscriptRequestPage;
  api: DartsApiClient;
  createdCase: CreatedCase;
  caseWithInterpreter: CreatedCase;
  hearingWithAudio: HearingWithAudio;
}>({
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
  // Lazy and test-scoped: UI-only tests need no API credentials, and each API test
  // gets a fresh token without sharing mutable authentication or response caches.
  // Playwright requires fixture dependencies to be expressed as object destructuring.
  // eslint-disable-next-line no-empty-pattern
  api: async ({}, use) => {
    const api = await base.step('Authenticate the API functional-test account', () =>
      DartsApiClient.authenticate(readApiSettings()),
    );
    await use(api);
  },
  createdCase: async ({ api, caseSearch, baseURL }, use, testInfo) => {
    requireCaseCreationTarget(baseURL, process.env.DARTS_API);
    // Confirm the UI session works before making the first write.
    await caseSearch.open();
    const service = new CaseDataService(api);
    const courthouse = await base.step('Check the Crown Court reference data', () =>
      service.courthouse(process.env.E2E_DATA_COURTHOUSE?.trim() || 'HARROW CROWN COURT'),
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
    const createdCase = await base.step('Create a unique case through the API', () =>
      service.createCase(data),
    );
    await testInfo.attach('created-case', {
      body: JSON.stringify(createdCase),
      contentType: 'application/json',
    });
    await base.step('Create its actual hearing through the API', () => service.createHearing(data));
    await use(createdCase);
    // Do not use /functional-tests/clean: it deletes data belonging to other runs.
  },
  caseWithInterpreter: async ({ api, createdCase }, use) => {
    await base.step(
      'Record interpreter use so the translation-QA account can search the case',
      () => new CaseDataService(api).recordInterpreterUse(createdCase),
    );
    await use(createdCase);
  },
  hearingWithAudio: async ({ api, createdCase }, use, testInfo) => {
    const sasUrl = readInboundStorageUrl();
    const service = new AudioDataService(api);
    const bytes = await service.sample();
    const plan = planAudio(createdCase, bytes);
    await testInfo.attach('audio-setup-identifiers', {
      body: JSON.stringify({ caseId: createdCase.id, ...plan }),
      contentType: 'application/json',
    });
    await base.step('Upload a fresh copy of the sample audio to inbound storage', () =>
      service.upload(bytes, plan, sasUrl),
    );
    await base.step('Register the audio against the test hearing through the API', () =>
      service.register(createdCase, plan),
    );
    const hearingId = await service.hearingId(createdCase);
    const mediaId = await base.step('Wait for the hearing audio metadata to be available', () =>
      service.waitForMetadata(hearingId, plan),
    );
    await testInfo.attach('created-audio', {
      body: JSON.stringify({ caseId: createdCase.id, hearingId, mediaId, ...plan }),
      contentType: 'application/json',
    });
    await use({ courtCase: createdCase, hearingId, mediaId, ...plan });
  },
});

export { expect } from '@playwright/test';
