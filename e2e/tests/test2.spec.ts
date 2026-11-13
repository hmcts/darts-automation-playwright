import { test } from '@playwright/test';
import { runLogin } from '../run-login';

test('test2 logs in and prints the page title', async () => {
  await runLogin();
});
