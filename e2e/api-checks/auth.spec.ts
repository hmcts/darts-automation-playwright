import { test, expect } from '../fixtures';

test('functional-test account can read courthouse reference data', async ({ api }) => {
  const response = await test.step('GET /courthouses from the selected API', () =>
    api.get('/courthouses'));
  expect(response.status, 'Authenticated GET /courthouses').toBe(200);
  const courthouses: unknown = await response.json();
  expect(Array.isArray(courthouses), 'Courthouse response must be a JSON array').toBe(true);
});
