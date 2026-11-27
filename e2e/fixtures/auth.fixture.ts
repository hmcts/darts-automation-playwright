import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test as base } from '@playwright/test';
import { AuthUser, type AuthOptions, readBrowserAccount } from '../setup/users';
import { createLogger } from '../support/logger';

const execFileAsync = promisify(execFile);
const log = createLogger('auth');

interface AuthWorkerFixtures extends AuthOptions {
  authenticatedStorageState: string;
  authStateFor: (user: AuthUser) => Promise<string>;
}

export const test = base.extend<{ storageState: string }, AuthWorkerFixtures>({
  authUser: [AuthUser.AUTOMATION, { scope: 'worker', option: true }],
  authStateFor: [
    async ({ browserName }, use, workerInfo) => {
      const states = new Map<AuthUser, Promise<string>>();
      const paths: string[] = [];
      const capture = async (authUser: AuthUser): Promise<string> => {
        readBrowserAccount(authUser);
        log.debug(`Starting fresh ${authUser} authentication in a separate process`);
        const storageState = fileURLToPath(
          new URL(
            `../.auth/${authUser}-${workerInfo.workerIndex}-${randomUUID()}.json`,
            import.meta.url,
          ),
        );
        // A separate process has no Playwright Test artifact recorder. This keeps
        // credential-entry API parameters out of traces even when setup fails.
        paths.push(storageState);
        try {
          await execFileAsync(
            process.execPath,
            [
              '--import',
              'tsx',
              fileURLToPath(new URL('../setup/auth-runner.ts', import.meta.url)),
              authUser,
              storageState,
              browserName,
            ],
            { timeout: 55_000 },
          );
        } catch (error: unknown) {
          const code =
            typeof error === 'object' &&
            error !== null &&
            'stderr' in error &&
            typeof error.stderr === 'string'
              ? error.stderr.trim()
              : '';
          // Node warnings may precede the runner's safe sentinel on stderr.
          const codes = code.split(/\r?\n/);
          if (codes.includes('DARTS_AUTH_ACCOUNT_ACTION_REQUIRED')) {
            throw new Error(
              `The ${authUser} account requires security registration or MFA. Ask the account owner for an account suitable for unattended testing.`,
            );
          }
          if (codes.includes('DARTS_AUTH_REJECTED')) {
            throw new Error(
              `The identity provider rejected the ${authUser} account. Check its credentials and identity configuration.`,
            );
          }
          throw new Error(
            `Authentication failed for ${authUser}. Check portal connectivity, account access and login route.`,
          );
        }
        log.debug('Fresh authentication completed; storage state ready');
        return storageState;
      };
      try {
        await use((user) => {
          let state = states.get(user);
          if (!state) {
            state = capture(user);
            states.set(user, state);
          }
          return state;
        });
      } finally {
        await Promise.allSettled(states.values());
        await Promise.all(paths.map((path) => rm(path, { force: true })));
        log.debug('Temporary storage states removed');
      }
    },
    { scope: 'worker', timeout: 60_000 },
  ],
  authenticatedStorageState: [
    async ({ authStateFor, authUser }, use) => {
      await use(await authStateFor(authUser));
    },
    { scope: 'worker', timeout: 60_000 },
  ],
  storageState: async ({ authenticatedStorageState }, use) => {
    await use(authenticatedStorageState);
  },
});
