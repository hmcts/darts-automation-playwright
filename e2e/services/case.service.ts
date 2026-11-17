import { randomInt, randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { type DartsApiClient } from './darts-api-client';
import { type TestCaseData, type CreatedCase } from '../data/case';

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

export function findHearingId(payload: unknown, courtroom: string): number {
  if (!Array.isArray(payload)) throw new Error('Case hearings must be a JSON array.');
  const matches = (payload as unknown[]).filter(
    (item): item is { id: number; courtroom: string } =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      typeof item.id === 'number' &&
      Number.isSafeInteger(item.id) &&
      item.id > 0 &&
      'courtroom' in item &&
      item.courtroom === courtroom,
  );
  if (matches.length !== 1)
    throw new Error('Expected exactly one hearing in the test-owned courtroom.');
  return matches[0].id;
}

export class CaseService {
  constructor(private readonly api: DartsApiClient) {}

  async get(id: number): Promise<{ id: number; number: string; defendants: string[] }> {
    const response = await this.api.get(`/cases/${id}`);
    expect(response.status, 'GET the test-owned case').toBe(200);
    const payload: unknown = await response.json();
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('case_id' in payload) ||
      payload.case_id !== id ||
      !('case_number' in payload) ||
      typeof payload.case_number !== 'string' ||
      !('defendants' in payload) ||
      !Array.isArray(payload.defendants) ||
      !payload.defendants.every((value: unknown) => typeof value === 'string')
    ) {
      throw new Error('GET case returned invalid case details.');
    }
    return { id, number: payload.case_number, defendants: payload.defendants };
  }

  async getHearingId(courtCase: CreatedCase): Promise<number> {
    const response = await this.api.get(`/cases/${courtCase.id}/hearings`);
    expect(response.status, 'GET hearings for the API-created case').toBe(200);
    const payload: unknown = await response.json();
    return findHearingId(payload, courtCase.courtroom);
  }

  async create(data: TestCaseData): Promise<CreatedCase> {
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
