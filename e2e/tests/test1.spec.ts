import { expect, test } from '@playwright/test';

test('test1', async () => {
  const message = 'Hello from test1';
  console.log(`${message} (worker ${test.info().workerIndex})`);
  expect(message).toContain('test1');
});
