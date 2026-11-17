import { test, expect, type Page } from '@playwright/test';
import { signInToPortal } from '../login';

const portal = 'https://portal.example.test';
const microsoft = 'https://login.microsoftonline.com';
const b2c = 'https://hmctsstgextid.b2clogin.com';
const password = 'synthetic-secret-must-not-appear-in-errors';

async function fakeLogin(
  page: Page,
  outcome: 'success' | 'registration' | 'rejected' | 'missing-password' = 'success',
  externalOrigin = b2c,
) {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    let body = '<h1>Unexpected request</h1>';
    if (url.origin === portal && url.pathname === '/login') {
      body = `<form action="${microsoft}/email">
        <label><input type="radio" name="route" onchange="this.form.action='${microsoft}/email'">I'm an employee of HM Courts and Tribunals Service</label>
        <label><input type="radio" name="route" onchange="this.form.action='${externalOrigin}/email'">I work with the HM Courts and Tribunals Service</label>
        <button>Continue</button></form>`;
    } else if (url.origin === microsoft && url.pathname === '/email') {
      body = `<form action="/password"><label>Email<input name="loginfmt"></label><button>Next</button></form>`;
    } else if (url.origin === microsoft && url.pathname === '/password') {
      body = `<form action="/outcome"><label>Password<input type="password" name="passwd"></label><button>Sign in</button></form>`;
    } else if (url.origin === externalOrigin && url.pathname === '/email') {
      body = `<form action="/outcome"><label>Enter your email<input name="email"></label>
        ${outcome === 'missing-password' ? '' : '<label>Enter your password<input type="password" name="password"></label>'}
        <button>Continue</button></form>`;
    } else if (url.pathname === '/outcome') {
      if (outcome === 'registration') body = `<h1>Let's keep your account secure</h1>`;
      else if (outcome === 'rejected') body = '<div id="passwordError">Incorrect password</div>';
      else
        body = `<h1>Stay signed in?</h1><form action="${portal}/search"><button>No</button></form>`;
    } else if (url.origin === portal && url.pathname === '/search') {
      body = '<h1>Search for a case</h1>';
    }
    await route.fulfill({ contentType: 'text/html', body });
  });
}

for (const route of ['internal', 'external'] as const) {
  test(`${route} login reaches authenticated search through the appropriate provider`, async ({
    page,
  }) => {
    await fakeLogin(page);
    await signInToPortal(page, portal, { route, username: 'synthetic@example.test', password });
    await expect(page).toHaveURL((url) => url.origin === portal && url.pathname === '/search');
  });
}

test('security registration fails with an actionable message', async ({ page }) => {
  await fakeLogin(page, 'registration');
  await expect(
    signInToPortal(page, portal, {
      route: 'internal',
      username: 'synthetic@example.test',
      password,
    }),
  ).rejects.toThrow(/security registration/);
});

test('rejected credentials produce a sanitised failure', async ({ page }) => {
  await fakeLogin(page, 'rejected');
  await expect(
    signInToPortal(page, portal, {
      route: 'external',
      username: 'synthetic@example.test',
      password,
    }),
  ).rejects.toThrow(
    'The identity provider rejected sign-in. Check the approved account credentials and identity configuration.',
  );
});

test('raw credential-entry errors never include the supplied password', async ({ page }) => {
  await fakeLogin(page, 'missing-password');
  const attempt = signInToPortal(page, portal, {
    route: 'external',
    username: 'synthetic@example.test',
    password,
  });
  await expect(attempt).rejects.toThrow('Browser authentication failed');
  await expect(attempt).rejects.not.toThrow(password);
});

test('an unexpected provider is rejected before entering credentials', async ({ page }) => {
  await fakeLogin(page, 'success', 'https://unexpected.example.test');
  await expect(
    signInToPortal(page, portal, {
      route: 'external',
      username: 'synthetic@example.test',
      password,
    }),
  ).rejects.toThrow('Login did not reach the expected HTTPS identity provider.');
  await expect(page.getByLabel('Enter your email', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Enter your password', { exact: true })).toHaveValue('');
});
