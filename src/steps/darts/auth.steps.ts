import { Given, When } from '@cucumber/cucumber';
import { BrowserContext, expect } from '@playwright/test';
import { ICustomWorld } from '../../support/custom-world';
import {
  getDartsUserCredentials,
  DartsUserCredential,
  ExternalServiceUserTypes,
} from '../../support/credentials';
import { LoginPage, ExternalLoginPage, InternalLoginPage, BasePage } from '../../page-objects';
import DartsSoapService from '../../support/darts-soap-service';

type DartsBrowserContext = BrowserContext & {
  user: DartsUserCredential;
};

When(
  'I am logged on to DARTS as an/a {string} user',
  async function (this: ICustomWorld, role: string) {
    const page = this.page!;
    const loginPage = new LoginPage(page);
    const internalLoginPage = new InternalLoginPage(page);
    const externalLoginPage = new ExternalLoginPage(page);
    // const stubLoginPage = new StubLoginPage(page);

    const userCredentials = getDartsUserCredentials(role);
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

    const userCredentials = getDartsUserCredentials(role);
    await loginPage.goto();

    await externalLoginPage.login(userCredentials);

    await expect(page.getByText('Search for a case')).toBeVisible({ timeout: 10000 });
    await basePage.clickLink('Switch to Admin portal');
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
  async function (this: ICustomWorld, source: ExternalServiceUserTypes) {
    // generate and store token for SOAP request, if required
    await DartsSoapService.register(source);
  },
);
