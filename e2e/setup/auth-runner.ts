import { chromium, firefox, webkit } from '@playwright/test';
import { captureStorageState } from './auth.setup';
import { AuthUser } from './users';
import { AuthenticationError } from './login';

async function main(): Promise<void> {
  const [user, storageState, browserName] = process.argv.slice(2);
  if (!Object.values(AuthUser).some((value) => value === user) || !storageState) {
    throw new Error('Authentication runner requires a supported user and storage-state path.');
  }
  if (browserName !== 'chromium' && browserName !== 'firefox' && browserName !== 'webkit') {
    throw new Error('Authentication runner requires a supported browser.');
  }
  const browser = await { chromium, firefox, webkit }[browserName].launch();
  try {
    await captureStorageState(browser, user as AuthUser, storageState);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  // Child-process errors can contain transport details; the parent reports a safe message.
  if (error instanceof AuthenticationError) {
    if (error.message.includes('security registration')) {
      console.error('DARTS_AUTH_ACCOUNT_ACTION_REQUIRED');
    } else if (error.message.includes('provider rejected')) {
      console.error('DARTS_AUTH_REJECTED');
    }
  }
  process.exitCode = 1;
});
