import { test } from '@playwright/test';
import { login } from '../login';

test('test2 logs in and prints the page title', async ({ page }) => {
  await login(page, {
    username: process.env.AUTOMATION_USERNAME,
    password: process.env.AUTOMATION_PASSWORD,
  });
  console.log(`test2 page title: ${await page.title()}`);
});
