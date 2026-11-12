import { expect, test } from '@playwright/test';

test('test2', async () => {
  const message = 'Hello from test2';
  console.log(`${message} (worker ${test.info().workerIndex})`);
  expect(message).toContain('test2');
});
