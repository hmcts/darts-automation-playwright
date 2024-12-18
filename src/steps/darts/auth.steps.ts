import { ICustomWorld } from '../../support/custom-world';
import {
  getDartsPortalUserCredentials,
  DartsPortalUserCredential,
} from '../../support/credentials';
import { Given, When } from '@cucumber/cucumber';
import { BrowserContext, expect } from '@playwright/test';
import { LoginPage, ExternalLoginPage, InternalLoginPage, BasePage } from '../../page-objects';

type DartsBrowserContext = BrowserContext & {
  user: DartsPortalUserCredential;
};

When(
  'I am logged on to DARTS as an/a {string} user',
  async function (this: ICustomWorld, role: string) {
    const page = this.page!;
    const loginPage = new LoginPage(page);
    const internalLoginPage = new InternalLoginPage(page);
    const externalLoginPage = new ExternalLoginPage(page);
    // const stubLoginPage = new StubLoginPage(page);

    const userCredentials = getDartsPortalUserCredentials(role);
    await loginPage.goto();

    // await stubLoginPage.login(userCredentials.role);

    if (userCredentials.type === 'INTERNAL') {
      await internalLoginPage.login(userCredentials);
    }
    if (userCredentials.type === 'EXTERNAL') {
      await externalLoginPage.login(userCredentials);
    }

    await expect(page.getByText('Search for a case')).toBeVisible({ timeout: 10000 });

    if (this.context) {
      (this.context as DartsBrowserContext).user = userCredentials;
    }
    console.log('Logging in user:', (this.context as DartsBrowserContext).user.username);
  },
);

When(
  'I am logged on to the admin portal as an/a {string} user',
  async function (this: ICustomWorld, role: string) {
    const page = this.page!;
    const basePage = new BasePage(page);
    const loginPage = new LoginPage(page);
    const externalLoginPage = new ExternalLoginPage(page);

    const userCredentials = getDartsPortalUserCredentials(role);
    await loginPage.goto();

    await externalLoginPage.login(userCredentials);

    await expect(page.getByText('Search for a case')).toBeVisible({ timeout: 10000 });
    await basePage.clickLink('Admin portal');
    await expect(
      page.getByText('You can search for cases, hearings, events and audio.'),
    ).toBeVisible();

    if (this.context) {
      (this.context as DartsBrowserContext).user = userCredentials;
    }
    console.log('Logging in user:', (this.context as DartsBrowserContext).user.username);
  },
);

When('I Sign out', async function (this: ICustomWorld) {
  const basePage = new BasePage(this.page!);
  const internalLoginPage = new InternalLoginPage(this.page!);

  console.log('Signing out user:', (this.context as DartsBrowserContext).user.username);
  await basePage.clickLink('Sign out');

  const authenticatedUser = (this.context as DartsBrowserContext).user;
  if (authenticatedUser.type === 'INTERNAL') {
    await internalLoginPage.signOutUser(authenticatedUser.username);
  }
});

Given(
  'I authenticate from the {string} source system',
  async function (this: ICustomWorld, source: 'VIQ') {
    if (source === 'VIQ') {
      // do nothing
    }
  },
);
