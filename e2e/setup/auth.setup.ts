import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type Browser } from '@playwright/test';
import { signInToPortal } from './login';
import { type AuthUser, readBrowserAccount } from './users';

// Called by the worker fixture, outside the traced test context. Each worker/user
// owns its file, so parallel workers and shards never refresh each other's session.
export async function captureStorageState(
  browser: Pick<Browser, 'newContext'>,
  user: AuthUser,
  storageState: string,
): Promise<void> {
  const portal = process.env.DARTS_PORTAL;
  if (!portal) throw new Error('Set DARTS_PORTAL before browser authentication.');
  const account = readBrowserAccount(user);
  const context = await browser.newContext({ storageState: undefined });
  try {
    const page = await context.newPage();
    await signInToPortal(page, portal, account);
    await mkdir(path.dirname(storageState), { recursive: true, mode: 0o700 });
    await writeFile(storageState, JSON.stringify(await context.storageState()), {
      mode: 0o600,
      flag: 'wx',
    });
  } finally {
    await context.close();
  }
}
