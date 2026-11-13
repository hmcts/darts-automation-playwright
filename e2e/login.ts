import { expect, type Page } from '@playwright/test';

interface LoginCredentials {
  username: string | undefined;
  password: string | undefined;
}

export async function login(page: Page, { username, password }: LoginCredentials): Promise<void> {
  const portal = process.env.DARTS_PORTAL;

  if (!portal || !username || !password) {
    throw new Error('DARTS_PORTAL, AUTOMATION_USERNAME and AUTOMATION_PASSWORD must be set.');
  }

  await page.goto(new URL('/login', portal).href);
  await page.getByLabel('I work with the HM Courts and Tribunals Service', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Enter your email', { exact: true }).fill(username);
  await page.getByLabel('Enter your password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Search for a case', exact: true })).toBeVisible({
    timeout: 15_000,
  });
}
