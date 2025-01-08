import { ICustomWorld } from '../../support/custom-world';
import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../../page-objects/login';
import { BasePage, ExternalLoginPage } from '../../page-objects';
import { DataTable } from '../../support/data-table';
import { substituteValue } from '../../support/substitution';

Given('I am on the landing page', async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
});

Given('I am on the portal page', async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
});

When('I see {string} on the page', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.containsText(text);
});

Then('I do not see {string} on the page', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.containsText(text, false);
});

When('I select the {string} radio button', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickLabel(text);
});

When(
  'I select the {string} radio button with label {string}',
  async function (this: ICustomWorld, _: string, label: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickLabel(label);
  },
);

When('I press the {string} button', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  if (this.feature?.uri.includes('DARTS_External_Login.feature')) {
    const externalLoginPage = new ExternalLoginPage(this.page!);
    await externalLoginPage.clickButton(text);
  } else {
    await basePage.clickButton(text);
  }
});

When(
  'I press the {string} button on my browser',
  async function (this: ICustomWorld, text: string) {
    if (text === 'back') {
      await this.page!.goBack();
    } else {
      throw new Error(`Clicking browser "${text}" button is not implemented`);
    }
  },
);

When('I click on the {string} link', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickLink(substituteValue(text) as string);
});

When('I click on the breadcrumb link {string}', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickBreadcrumbLink(substituteValue(text) as string);
});

When('I see link with text {string}', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.hasLink(text);
});

Then('I do not see link with text {string}', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.hasLink(text, false);
});

Then('I see links with text:', async function (this: ICustomWorld, dataTable: DataTable) {
  const basePage = new BasePage(this.page!);
  for (let i = 0; i < dataTable.rawTable[0].length; i++) {
    const linkText = dataTable.rawTable[0][i];
    const linkExpected = dataTable.rawTable[1][i] === 'Y';
    await basePage.hasNavigationLink(linkText, linkExpected);
  }
});

When('I verify links with text:', async function (this: ICustomWorld, dataTable: DataTable) {
  const basePage = new BasePage(this.page!);
  for (let i = 0; i < dataTable.rawTable[0].length; i++) {
    const linkText = dataTable.rawTable[0][i];
    const linkValue = dataTable.rawTable[1][i];
    if (!linkValue) {
      continue;
    }
    const linkExpected = linkValue !== 'N';
    await basePage.hasNavigationLink(linkText, linkExpected);
    if (linkExpected && linkValue !== 'Y') {
      await basePage.clickNavigationLink(linkText);
      await basePage.containsText(linkValue);
    }
  }
});

Then(
  'I verify sub-menu links for {string}:',
  async function (this: ICustomWorld, linkText: string, dataTable: DataTable) {
    const basePage = new BasePage(this.page!);
    await basePage.clickNavigationLink(linkText);

    for (let i = 0; i < dataTable.rawTable[0].length; i++) {
      const subMenuLinkText = dataTable.rawTable[0][i];
      const subMenuHeader = dataTable.rawTable[1][i];
      if (!subMenuHeader) {
        continue;
      }
      if (subMenuHeader === 'Y') {
        await basePage.hasSubNavigationLink(subMenuLinkText, true);
      } else {
        await basePage.clickSubNavigationLink(subMenuLinkText);
        await basePage.hasHeader(subMenuHeader);
      }
    }
  },
);

Then(
  'I verify the HTML table {string} contains the following values',
  async function (this: ICustomWorld, tableCssId: string, dataTable: DataTable) {
    const data = dataTable.rawTable;
    const headings = data[0];
    const tableData = data.slice(1, data.length);

    const basePage = new BasePage(this.page!);
    await basePage.verifyHtmlTable(this.page!.locator(`#${tableCssId} table`), headings, tableData);
  },
);

When(
  'I click on the {string} sub-menu link',
  async function (this: ICustomWorld, linkText: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickSubNavigationLink(linkText);
  },
);

Then('I see an error message {string}', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.hasErrorSummaryContainingText(text);
});

When(
  'I set {string} to {string}',
  async function (this: ICustomWorld, field: string, value: string) {
    const basePage = new BasePage(this.page!);
    if (this.feature?.uri.includes('DARTS_External_Login.feature')) {
      const externalLoginPage = new ExternalLoginPage(this.page!);
      await externalLoginPage.fillInputField(field, substituteValue(value) as string);
    } else {
      await basePage.fillInputField(field, substituteValue(value) as string);
    }
  },
);

When('I enter the security code', async function (this: ICustomWorld) {
  const externalLoginPage = new ExternalLoginPage(this.page!);
  await externalLoginPage.enterSecurityCode();
});

Then(
  'Cookie {string} {string} value is {string}',
  async function (this: ICustomWorld, cookieName: string, key: string, value: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasCookieWithKeyValue(cookieName, key, value);
  },
);

Then(
  'I upload the file {string} at {string}',
  async function (this: ICustomWorld, fileName: string, fileUploadField: string) {
    const basePage = new BasePage(this.page!);
    await basePage.uploadFile(fileName, fileUploadField);
  },
);
