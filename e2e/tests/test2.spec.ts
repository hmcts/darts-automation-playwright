import { test, expect } from '@playwright/test';

test('test2 logs in and prints the page title', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByRole('heading', { name: 'Search for a case', exact: true })).toBeVisible();
  console.log(`Authenticated page title: ${await page.title()}`);
});
