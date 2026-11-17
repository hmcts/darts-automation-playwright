import { type LoginRoute } from './login';

export const AuthUser = {
  AUTOMATION: 'automation',
  REQUESTER: 'requester',
  APPROVER: 'approver',
  TRANSCRIBER: 'transcriber',
} as const;

export type AuthUser = (typeof AuthUser)[keyof typeof AuthUser];

export interface AuthOptions {
  authUser: AuthUser;
}

type Environment = Record<string, string | undefined>;

const accounts = {
  automation: {
    username: 'AUTOMATION_USERNAME',
    password: 'AUTOMATION_PASSWORD',
    route: 'external',
  },
  requester: {
    username: 'AUTOMATION_REQUESTER_USERNAME',
    password: 'AUTOMATION_INTERNAL_PASSWORD',
    route: 'internal',
  },
  approver: {
    username: 'AUTOMATION_APPROVER_USERNAME',
    password: 'AUTOMATION_INTERNAL_PASSWORD',
    route: 'internal',
  },
  transcriber: {
    username: 'AUTOMATION_TRANSCRIBER_USERNAME',
    password: 'AUTOMATION_EXTERNAL_PASSWORD',
    route: 'external',
  },
} as const;

export function readBrowserAccount(
  user: AuthUser,
  env: Environment = process.env,
): {
  username: string;
  password: string;
  route: LoginRoute;
} {
  const account = accounts[user];
  if (!account) throw new Error('Choose a supported AuthUser in the test or Playwright config.');
  const username = env[account.username];
  const password = env[account.password];
  if (!username?.trim() || !password?.trim()) {
    throw new Error(`Set ${account.username} and ${account.password} for the ${user} account.`);
  }
  // The generic automation profile keeps the existing route override for local users.
  const route =
    user === AuthUser.AUTOMATION ? (env.E2E_LOGIN_ROUTE ?? account.route) : account.route;
  if (route !== 'external' && route !== 'internal') {
    throw new Error('E2E_LOGIN_ROUTE must be internal or external.');
  }
  return { username, password, route };
}
