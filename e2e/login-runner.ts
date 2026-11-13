import { chromium } from '@playwright/test';
import { login } from './login';

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await login(page, {
      username: process.env.AUTOMATION_USERNAME,
      password: process.env.AUTOMATION_PASSWORD,
    });
    console.log(`Authenticated page title: ${await page.title()}`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  const errorType = error instanceof Error ? error.name : 'UnknownError';
  console.error(
    `External login failed (${errorType}). Check portal access and account configuration.`,
  );
  process.exitCode = 1;
});
