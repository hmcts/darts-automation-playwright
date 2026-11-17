import { expect } from '@playwright/test';
import { type DartsApiClient } from './darts-api-client';

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

export class CourthouseService {
  constructor(private readonly api: DartsApiClient) {}

  async get(name: string): Promise<{ name: string; displayName: string }> {
    const response = await this.api.get('/courthouses');
    expect(response.status, 'GET /courthouses before creating the test case').toBe(200);
    const payload: unknown = await response.json();
    return selectCourthouse(payload, name);
  }
}
