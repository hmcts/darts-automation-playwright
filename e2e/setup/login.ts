import { type Locator, type Page } from '@playwright/test';

export type LoginRoute = 'internal' | 'external';

interface BrowserCredentials {
  route: LoginRoute;
  username: string;
  password: string;
}

export class AuthenticationError extends Error {}

// Only enter credentials on the expected HTTPS identity-provider origins after redirects.
function verifyProvider(page: Page, route: BrowserCredentials['route']): void {
  const expectedOrigin =
    route === 'internal'
      ? 'https://login.microsoftonline.com'
      : 'https://hmctsstgextid.b2clogin.com';
  if (new URL(page.url()).origin !== expectedOrigin) {
    throw new AuthenticationError('Login did not reach the expected HTTPS identity provider.');
  }
}

function securityPrompt(page: Page): Locator {
  return page
    .getByText(
      /^(Let['’]s keep your account secure|More information required|Verify your identity|Approve sign in request|Enter code)$/i,
    )
    .filter({ visible: true });
}

function providerError(page: Page): Locator {
  return page.locator(
    '#usernameError:visible, #passwordError:visible, #claimVerificationServerError:visible, .error.pageLevel:visible',
  );
}

async function checkPrompt(page: Page): Promise<void> {
  // Registration/MFA needs the account owner; resubmitting credentials cannot fix it.
  if (await securityPrompt(page).first().isVisible()) {
    throw new AuthenticationError(
      'Microsoft requires security registration or an additional verification step. Ask the account owner to confirm an account suitable for unattended testing.',
    );
  }
  if (await providerError(page).first().isVisible()) {
    throw new AuthenticationError(
      'The identity provider rejected sign-in. Check the approved account credentials and identity configuration.',
    );
  }
}

export async function signInToPortal(
  page: Page,
  portalUrl: string,
  credentials: BrowserCredentials,
): Promise<void> {
  const origin = new URL(portalUrl).origin;
  let stage = 'opening the portal login page';
  try {
    await page.goto(new URL('/login', origin).toString());
    const internal = credentials.route === 'internal';
    await page
      .getByRole('radio', {
        name: internal
          ? /I'm an employee of HM Courts and Tribunals Service/
          : /I work with the HM Courts and Tribunals Service/,
      })
      .check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    stage = 'entering identity-provider credentials';
    if (internal) {
      const email = page.locator('input[name="loginfmt"]');
      const anotherAccount = page.getByText('Use another account', { exact: true });
      await email.or(anotherAccount).first().waitFor({ state: 'visible' });
      if (await anotherAccount.isVisible()) await anotherAccount.click();
      verifyProvider(page, credentials.route);
      await email.fill(credentials.username);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      const password = page.locator('input[name="passwd"]');
      await password
        .or(providerError(page))
        .or(securityPrompt(page))
        .first()
        .waitFor({ state: 'visible' });
      await checkPrompt(page);
      verifyProvider(page, credentials.route);
      await password.fill(credentials.password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    } else {
      await page.getByLabel('Enter your email', { exact: true }).waitFor({ state: 'visible' });
      verifyProvider(page, credentials.route);
      await page.getByLabel('Enter your email', { exact: true }).fill(credentials.username);
      await page.getByLabel('Enter your password', { exact: true }).fill(credentials.password);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    }

    // Wait for observable outcomes rather than sleeping or resubmitting the login form.
    stage = 'waiting for the authenticated portal';
    const search = page.getByRole('heading', { name: 'Search for a case', exact: true });
    const staySignedIn = page.getByRole('heading', { name: 'Stay signed in?', exact: true });
    const outcome = search.or(staySignedIn).or(securityPrompt(page)).or(providerError(page));
    await outcome.first().waitFor({ state: 'visible' });
    await checkPrompt(page);
    if (await staySignedIn.isVisible()) {
      await page.getByRole('button', { name: 'No', exact: true }).click();
    }
    await search
      .or(securityPrompt(page))
      .or(providerError(page))
      .first()
      .waitFor({ state: 'visible' });
    await checkPrompt(page);
    await search.waitFor({ state: 'visible' });
    await page.waitForURL((url) => url.origin === origin && url.pathname === '/search');
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) throw error;
    // Playwright's raw fill errors may contain the password. Do not attach their cause/logs.
    throw new AuthenticationError(
      `Browser authentication failed while ${stage}. Check account access and the target login configuration.`,
    );
  }
}
