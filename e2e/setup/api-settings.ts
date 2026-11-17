type Environment = Record<string, string | undefined>;

export interface ApiSettings {
  baseURL: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

function required(env: Environment, name: string): string {
  const value = env[name];
  if (!value?.trim()) throw new Error(`Set ${name} before using the API fixture. See README.md.`);
  return value;
}

export function readApiSettings(env: Environment = process.env): ApiSettings {
  const baseURL = new URL(required(env, 'DARTS_API'));
  if (
    baseURL.protocol !== 'https:' ||
    baseURL.username ||
    baseURL.password ||
    baseURL.pathname !== '/' ||
    baseURL.search ||
    baseURL.hash
  ) {
    throw new Error('DARTS_API must be an HTTPS origin without credentials, path or query.');
  }

  // API-owned PRs must create data in the backend used by the selected portal.
  if (env.DARTS_PORTAL) {
    const portal = new URL(env.DARTS_PORTAL);
    const pr = /^darts-portal-api-pr-(\d+)\.dev\.platform\.hmcts\.net$/.exec(portal.hostname);
    if (pr && baseURL.origin !== `https://darts-api-pr-${pr[1]}.dev.platform.hmcts.net`) {
      throw new Error('DARTS_API must target the same API PR as DARTS_PORTAL.');
    }
  }

  return {
    baseURL: baseURL.origin,
    clientId: required(env, 'AAD_B2C_ROPC_CLIENT_ID'),
    clientSecret: required(env, 'AAD_B2C_ROPC_CLIENT_SECRET'),
    username: required(env, 'AZURE_AD_FUNCTIONAL_TEST_GLOBAL_USERNAME'),
    password: required(env, 'AZURE_AD_FUNCTIONAL_TEST_GLOBAL_PASSWORD'),
  };
}
