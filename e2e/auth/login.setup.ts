import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test as setup } from '@playwright/test';
import { login } from '../login';

setup('authenticate the selected account', async ({ page }, testInfo) => {
  const storageState: unknown = testInfo.project.metadata.storageState;
  if (typeof storageState !== 'string') {
    throw new Error('Authentication setup requires a session output path.');
  }
  await login(page, {
    username: process.env.AUTOMATION_USERNAME,
    password: process.env.AUTOMATION_PASSWORD,
  });
  await mkdir(path.dirname(storageState), { recursive: true, mode: 0o700 });
  await writeFile(storageState, JSON.stringify(await page.context().storageState()), {
    mode: 0o600,
    flag: 'wx',
  });
});
