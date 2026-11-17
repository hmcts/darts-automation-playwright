import { test as base } from '@playwright/test';
import { DartsApiClient } from '../services/darts-api-client';
import { CaseService } from '../services/case.service';
import { AudioService } from '../services/audio.service';
import { CourthouseService } from '../services/courthouse.service';
import { readApiSettings } from '../setup/api-settings';

export const test = base.extend<{
  api: DartsApiClient;
  cases: CaseService;
  audio: AudioService;
  courthouses: CourthouseService;
}>({
  // Lazy: importing this fixture for an API-only check never starts a browser.
  // Node fetch keeps token exchanges and bearer headers out of Playwright traces.
  // eslint-disable-next-line no-empty-pattern
  api: async ({}, use) => {
    await use(await DartsApiClient.authenticate(readApiSettings()));
  },
  cases: async ({ api }, use) => {
    await use(new CaseService(api));
  },
  audio: async ({ api }, use) => {
    await use(new AudioService(api));
  },
  courthouses: async ({ api }, use) => {
    await use(new CourthouseService(api));
  },
});
