import { expect, test } from '@playwright/test';

test('test1 opens the login page and prints its title', async ({ page }) => {
  const response = await page.goto('/login');
  expect(response?.ok(), 'Login page must return a successful HTTP response').toBe(true);
  await expect(
    page.getByRole('heading', { name: 'Sign in to the DARTS Portal', exact: true }),
  ).toBeVisible();
  console.log(`test1 page title: ${await page.title()}`);
});
