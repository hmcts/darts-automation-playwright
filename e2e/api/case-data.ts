import { randomInt, randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { type DartsApiClient } from './client';

export interface TestCaseData {
  number: string;
  courthouse: string;
  courthouseDisplayName: string;
  courtroom: string;
  defendant: string;
  judge: string;
  timestamp: string;
  messageId: string;
  eventId: string;
}

export interface CreatedCase extends TestCaseData {
  id: number;
}

async function expectCreated(response: Response, operation: string): Promise<void> {
  // These setup responses contain synthetic test data, not authentication payloads.
  const problem = response.status === 201 ? '' : await response.text();
  expect(response.status, `${operation} must return 201. ${problem.slice(0, 2000)}`).toBe(201);
}

export function requireCaseCreationTarget(
  portalUrl: string | undefined,
  apiUrl: string | undefined,
): void {
  if (!portalUrl || !apiUrl) throw new Error('Case creation requires DARTS_PORTAL and DARTS_API.');
  const portal = new URL(portalUrl);
  const api = new URL(apiUrl);
  const pr = /^darts-portal-api-pr-(\d+)\.dev\.platform\.hmcts\.net$/.exec(portal.hostname);
  if (
    !pr ||
    portal.protocol !== 'https:' ||
    portal.username ||
    portal.password ||
    api.href !== `https://darts-api-pr-${pr[1]}.dev.platform.hmcts.net/`
  ) {
    throw new Error('Case creation is limited to a matching API-owned dev PR portal and API.');
  }
}

export function selectCourthouse(
  payload: unknown,
  name: string,
): { name: string; displayName: string } {
  if (!Array.isArray(payload)) throw new Error('GET /courthouses must return a JSON array.');
  for (const value of payload as unknown[]) {
    if (typeof value !== 'object' || value === null) continue;
    if (
      'courthouse_name' in value &&
      value.courthouse_name === name &&
      'display_name' in value &&
      typeof value.display_name === 'string' &&
      value.display_name.trim()
    ) {
      return { name, displayName: value.display_name };
    }
  }
  throw new Error(
    `Test courthouse ${name} is unavailable. Set E2E_DATA_COURTHOUSE to an existing Crown Court.`,
  );
}

export function newCaseData(
  courthouse: { name: string; displayName: string },
  courtroom: string,
): TestCaseData {
  const id = randomUUID().replaceAll('-', '').toUpperCase();
  return {
    // /events limits case_numbers to 25 characters, even though /cases/addCase accepts more.
    number: `PW-${id.slice(0, 22)}`,
    courthouse: courthouse.name,
    courthouseDisplayName: courthouse.displayName,
    courtroom,
    defendant: `PW defendant ${id.slice(0, 12)}`,
    judge: 'PW test judge',
    timestamp: new Date().toISOString(),
    messageId: randomUUID(),
    // The API stores source event IDs as signed 32-bit integers, despite its string contract.
    eventId: String(randomInt(1, 2_147_483_647)),
  };
}

export class CaseDataService {
  constructor(private readonly api: DartsApiClient) {}

  async courthouse(name: string): Promise<{ name: string; displayName: string }> {
    const response = await this.api.get('/courthouses');
    expect(response.status, 'GET /courthouses before creating the test case').toBe(200);
    const payload: unknown = await response.json();
    return selectCourthouse(payload, name);
  }

  async createCase(data: TestCaseData): Promise<CreatedCase> {
    const response = await this.api.post('/cases/addCase', {
      courthouse: data.courthouse,
      case_number: data.number,
      defendants: [data.defendant],
      judges: [data.judge],
      prosecutors: ['PW test prosecutor'],
      defenders: ['PW test defender'],
    });
    await expectCreated(response, 'POST /cases/addCase');
    const payload: unknown = await response.json();
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('case_id' in payload) ||
      typeof payload.case_id !== 'number' ||
      !Number.isSafeInteger(payload.case_id) ||
      payload.case_id <= 0
    ) {
      throw new Error('POST /cases/addCase returned no valid case_id.');
    }
    expect(payload).toMatchObject({
      case_number: data.number,
      courthouse: data.courthouseDisplayName,
      defendants: [data.defendant],
    });
    return { ...data, id: payload.case_id };
  }

  async createHearing(data: TestCaseData): Promise<void> {
    // Portal search only returns cases with an actual hearing. This is the hearing-start
    // event used by the existing Crown Court case-search Cucumber scenario.
    const response = await this.api.post('/events', {
      message_id: data.messageId,
      type: '1100',
      event_id: data.eventId,
      courthouse: data.courthouse,
      courtroom: data.courtroom,
      case_numbers: [data.number],
      event_text: `PW case-search setup ${data.number}`,
      date_time: data.timestamp,
    });
    await expectCreated(response, 'POST /events');
  }

  async recordInterpreterUse(data: TestCaseData): Promise<void> {
    // The automation account has TRANSLATION_QA: case search intentionally filters
    // its results to interpreter-used cases. Use the application's normal event flow.
    const response = await this.api.post('/events', {
      message_id: randomUUID(),
      type: '20917',
      event_id: String(randomInt(1, 2_147_483_647)),
      courthouse: data.courthouse,
      courtroom: data.courtroom,
      case_numbers: [data.number],
      event_text: `PW interpreter sworn in for ${data.number}`,
      date_time: data.timestamp,
    });
    await expectCreated(response, 'POST /events interpreter sworn-in');
  }
}
