import { type ApiSettings } from '../setup/api-settings';
import { createLogger } from '../support/logger';

const log = createLogger('api');

const tokenEndpoint =
  'https://hmctsstgextid.b2clogin.com/hmctsstgextid.onmicrosoft.com/B2C_1_ropc_darts_signin/oauth2/v2.0/token';

export class ApiAuthenticationError extends Error {}

const transportCodes = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ENOTFOUND',
  'ETIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_SOCKET',
]);

function transportFailureCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return 'UNKNOWN_TRANSPORT_ERROR';
  const cause = 'cause' in error ? error.cause : undefined;
  for (const value of [error, cause]) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'code' in value &&
      typeof value.code === 'string' &&
      transportCodes.has(value.code)
    ) {
      return value.code;
    }
  }
  if (error instanceof Error && error.name === 'TimeoutError') return 'REQUEST_TIMEOUT';
  if (error instanceof Error && error.name === 'AbortError') return 'REQUEST_ABORTED';
  return 'UNKNOWN_TRANSPORT_ERROR';
}

// Node's HTTP client keeps credential forms and bearer headers out of Playwright traces.
// Transport injection lets local checks exercise failures without contacting Azure/DARTS.
export class DartsApiClient {
  private constructor(
    private readonly baseURL: string,
    private readonly token: string,
    private readonly send: typeof fetch,
  ) {}

  static async authenticate(
    settings: ApiSettings,
    send: typeof fetch = fetch,
  ): Promise<DartsApiClient> {
    log.debug('Authenticating the API setup account');
    let response: Response;
    try {
      response = await send(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: settings.clientId,
          client_secret: settings.clientSecret,
          username: settings.username,
          password: settings.password,
          scope: `https://hmctsstgextid.onmicrosoft.com/${settings.clientId}/Functional.Test`,
        }),
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error: unknown) {
      // Do not include underlying errors: they can contain credential forms or headers.
      throw new ApiAuthenticationError(
        `API token request failed (${transportFailureCode(error)}). Check Azure connectivity.`,
      );
    }
    if (!response.ok) {
      throw new ApiAuthenticationError(
        `API authentication returned HTTP ${response.status}. Check the functional-test credentials and B2C configuration.`,
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ApiAuthenticationError('API authentication did not return a JSON token response.');
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      !('access_token' in body) ||
      typeof body.access_token !== 'string' ||
      !body.access_token.trim()
    ) {
      throw new ApiAuthenticationError('API authentication returned no usable access token.');
    }
    log.debug('API setup account authenticated');
    return new DartsApiClient(settings.baseURL, body.access_token, send);
  }

  get(endpoint: string): Promise<Response> {
    return this.request('GET', endpoint);
  }

  post(endpoint: string, body: unknown): Promise<Response> {
    return this.request('POST', endpoint, body);
  }

  private async request(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: unknown,
  ): Promise<Response> {
    const url = new URL(endpoint, this.baseURL);
    if (!endpoint.startsWith('/') || endpoint.startsWith('//') || url.origin !== this.baseURL) {
      throw new Error('API requests must use a relative path on the configured DARTS_API origin.');
    }
    const started = Date.now();
    log.debug(`${method} ${url.pathname}`);
    try {
      const response = await this.send(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          // Some setup endpoints return an empty body rather than a JSON representation.
          Accept: 'application/json, */*;q=0.8',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
      });
      log.debug(`${method} ${url.pathname} -> ${response.status} (${Date.now() - started}ms)`);
      return response;
    } catch (error: unknown) {
      // Only allowlisted codes are exposed; raw fetch errors can contain secrets.
      const failure = `${method} ${url.pathname} failed after ${Date.now() - started}ms (${transportFailureCode(error)})`;
      log.info(failure);
      throw new Error(`DARTS API ${failure}. Check API connectivity and redirects.`);
    }
  }
}
