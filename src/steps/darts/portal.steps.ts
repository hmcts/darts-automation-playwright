import { Given, Then, When } from '@cucumber/cucumber';
import { BasePage, ExternalLoginPage } from '../../page-objects';
import { LoginPage } from '../../page-objects/login';
import { ICustomWorld } from '../../support/custom-world';
import { DataTable } from '../../support/data-table';
import { substituteValue } from '../../support/substitution';
import wait from '../../support/wait';

Given('I am on the landing page', async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
});

Given('I am on the portal page', async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.goto();
});

Given('I navigate to the url {string}', async function (this: ICustomWorld, urlPath: string) {
  const basePage = new BasePage(this.page!);
  await basePage.gotoUrlPath(substituteValue(urlPath) as string);
});

When('I see {string} on the page', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.containsText(substituteValue(text) as string);
});

When('I see heading {string}', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.hasHeader(substituteValue(text) as string);
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
  'I select the {string} radio button with exact name',
  async function (this: ICustomWorld, text: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickLabel(text, true);
  },
);

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
    await basePage.clickButton(substituteValue(text) as string);
  }
});

When(
  'I press the {string} button with exact name',
  async function (this: ICustomWorld, text: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickButton(substituteValue(text) as string, true);
  },
);

Then(
  'I press the {string} button and see {string} on the page',
  async function (this: ICustomWorld, text: string, expectedText: string) {
    const basePage = new BasePage(this.page!);
    await wait(
      async () => {
        try {
          await basePage.clickButton(substituteValue(text) as string);
          await basePage.containsText(expectedText);
          return true;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.error('Press button and see text not completed, retrying...');
          return false;
        }
      },
      500,
      10,
    );
  },
);

When('I press the {string} button and pause', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickButton(substituteValue(text) as string);
  await this.page!.waitForTimeout(500);
});

When(
  'I press the {string} button to download the file',
  async function (this: ICustomWorld, text: string) {
    const basePage = new BasePage(this.page!);
    await basePage.downloadFileUsingButton(substituteValue(text) as string);
  },
);

Then(
  'I verify the download file matches {string}',
  async function (this: ICustomWorld, expectedFilename: string) {
    const basePage = new BasePage(this.page!);
    basePage.verifyDownloadFilename(substituteValue(expectedFilename) as string);
  },
);

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

When('I click on the {string} link exact', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickLink(substituteValue(text) as string, true);
});

When('I click on the {string} button', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickButton(substituteValue(text) as string);
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
    await basePage.verifyHtmlTable(`#${tableCssId} .govuk-table`, headings, tableData);
  },
);

Then(
  'I verify the HTML table {string} includes the following values',
  async function (this: ICustomWorld, tableCssId: string, dataTable: DataTable) {
    const data = dataTable.rawTable;
    const headings = data[0];
    const tableData = data.slice(1, data.length);

    const basePage = new BasePage(this.page!);
    await basePage.verifyHtmlTableIncludes(`#${tableCssId} .govuk-table`, headings, tableData);
  },
);

Then(
  'I verify the HTML table contains the following values',
  async function (this: ICustomWorld, dataTable: DataTable) {
    const data = dataTable.rawTable;
    const headings = data[0];
    const tableData = data.slice(1, data.length);

    const basePage = new BasePage(this.page!);
    await basePage.verifyHtmlTable('.govuk-table', headings, tableData);
  },
);

Then(
  'I verify the HTML table includes the following values',
  async function (this: ICustomWorld, dataTable: DataTable) {
    const data = dataTable.rawTable;
    const headings = data[0];
    const tableData = data.slice(1, data.length);

    const basePage = new BasePage(this.page!);
    await basePage.verifyHtmlTableIncludes('.govuk-table', headings, tableData);
  },
);

Then(
  'the dropdown {string} contains the options',
  async function (this: ICustomWorld, dropdown: string, dataTable: DataTable) {
    const options: string[] = dataTable.rawTable.flat();
    const basePage = new BasePage(this.page!);
    await basePage.verifySelectOptions(dropdown, options);
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

Then(
  'I see {string} has error message {string}',
  async function (this: ICustomWorld, field: string, error: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasFieldWithError(field, error);
  },
);

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

When(
  'I set {string} to {string} with exact field name',
  async function (this: ICustomWorld, field: string, value: string) {
    const basePage = new BasePage(this.page!);
    await basePage.fillInputField(field, substituteValue(value) as string, true);
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

When(
  'I select {string} from the {string} dropdown',
  async function (this: ICustomWorld, option: string, dropdown: string) {
    const basePage = new BasePage(this.page!);
    await basePage.selectOption(option, dropdown);
  },
);

When('I click option {string}', async function (this: ICustomWorld, option: string) {
  const basePage = new BasePage(this.page!);
  await basePage.selectOptionOnly(option);
});

Then('I select {string} from the dropdown', async function (this: ICustomWorld, option: string) {
  const basePage = new BasePage(this.page!);
  await basePage.selectOptionFromOnlyDropdown(option);
});

When(
  'I set the time fields below {string} to {string}',
  async function (this: ICustomWorld, label: string, timeString: string) {
    const basePage = new BasePage(this.page!);
    await basePage.fillTimeFields(label, timeString);
  },
);

When(
  'I set the time fields of {string} to {string}',
  async function (this: ICustomWorld, label: string, timeString: string) {
    const basePage = new BasePage(this.page!);
    await basePage.fillTimeFields(label, timeString);
  },
);

Then(
  'I see {string} in summary row for {string}',
  async function (this: ICustomWorld, expectedText: string, summaryRowHeading: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasSummaryRow(summaryRowHeading, substituteValue(expectedText) as string);
  },
);

Then(
  'I click {string} link in summary row for {string}',
  async function (this: ICustomWorld, linkText: string, summaryRowHeading: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickSummaryListActionLink(
      summaryRowHeading,
      substituteValue(linkText) as string,
    );
  },
);

Then(
  'I see {string} as one of many in summary row for {string}',
  async function (this: ICustomWorld, expectedText: string, summaryRowHeading: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasSummaryRowContaining(
      summaryRowHeading,
      substituteValue(expectedText) as string,
    );
  },
);

Then('I see the {string} button', async function (this: ICustomWorld, text: string) {
  const basePage = new BasePage(this.page!);
  await basePage.hasButton(text);
});

Then(
  'I see {string} in the same table row as {string}',
  async function (this: ICustomWorld, expectedText: string, tableRowText: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasTableRow(tableRowText, substituteValue(expectedText) as string);
  },
);

When(
  'I click on {string} in the same table row as {string}',
  async function (this: ICustomWorld, textToClick: string, tableRowText: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickTextInTableRow(
      substituteValue(tableRowText) as string,
      substituteValue(textToClick) as string,
    );
  },
);

When('I check the {string} checkbox', async function (this: ICustomWorld, checkboxLabel: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickLabel(checkboxLabel);
});

When(
  'checkbox with name {string} is checked',
  async function (this: ICustomWorld, checkboxLabel: string) {
    const basePage = new BasePage(this.page!);
    await basePage.verifyCheckboxIsChecked(checkboxLabel, true);
  },
);

When(
  'checkbox with name {string} is unchecked',
  async function (this: ICustomWorld, checkboxLabel: string) {
    const basePage = new BasePage(this.page!);
    await basePage.verifyCheckboxIsChecked(checkboxLabel, false);
  },
);

When('I click on the pagination link {string}', async function (this: ICustomWorld, page: string) {
  const basePage = new BasePage(this.page!);
  if (page === 'Previous' || page === 'Next') {
    await basePage.clickLink(page);
  } else {
    await basePage.clickLabel(`Page ${page}`, true);
  }
});

When('I click on the last pagination link', async function () {
  const basePage = new BasePage(this.page!);
  const lastPage = await this.page
    .locator('.govuk-pagination__item .govuk-pagination__link')
    .last()
    .textContent();

  await basePage.clickLabel(`Page ${lastPage}`);
});

Given(
  'I click on {string} in the table header',
  async function (this: ICustomWorld, tableHeader: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickTableHeader(tableHeader);
  },
);

When('{string} is {string}', async function (this: ICustomWorld, field: string, value: string) {
  const basePage = new BasePage(this.page!);
  await basePage.inputHasValue(field, substituteValue(value) as string);
});

Then(
  'I check the checkbox in the same row as {string} {string}',
  async function (this: ICustomWorld, rowValue1: string, rowValue2: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickCheckboxInTableRowWith(
      substituteValue(rowValue1) as string,
      substituteValue(rowValue2) as string,
    );
  },
);

Then(
  'I click on {string} in the same row as {string}',
  async function (this: ICustomWorld, clickOn: string, rowValue: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickValueInTableRowWith(
      substituteValue(clickOn) as string,
      substituteValue(rowValue) as string,
    );
  },
);

Then(
  'I see {string} in the same row as {string} {string}',
  async function (this: ICustomWorld, text: string, rowValue1: string, rowValue2: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasValueInTableRowWith(substituteValue(text) as string, [
      substituteValue(rowValue1) as string,
      substituteValue(rowValue2) as string,
    ]);
  },
);

When(
  'I press the {string} button in the same row as {string} {string}',
  async function (this: ICustomWorld, button: string, rowValue1: string, rowValue2: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickButtonInTableRowWithTwoValues(
      substituteValue(button) as string,
      substituteValue(rowValue1) as string,
      substituteValue(rowValue2) as string,
    );
  },
);

Then(
  'I see {string} in the same row as {string}',
  async function (this: ICustomWorld, text: string, rowValue: string) {
    const basePage = new BasePage(this.page!);
    await basePage.hasValueInTableRowWith(substituteValue(text) as string, [
      substituteValue(rowValue) as string,
    ]);
  },
);

Then(
  '{string} has sort {string} icon',
  async function (this: ICustomWorld, tableHeader: string, sort: 'ascending' | 'descending') {
    const basePage = new BasePage(this.page!);
    await basePage.hasSortedTableHeader(tableHeader, sort);
  },
);

Then(
  'I wait for text {string} on the same row as link {string}',
  { timeout: 60 * 1000 * 6 }, // 6 minutes
  async function (this: ICustomWorld, waitForText: string, rowValue: string) {
    // check every 10s for up to 6 minutes
    await wait(
      async () => {
        const basePage = new BasePage(this.page!);
        try {
          console.log(`Waiting for text "${waitForText}", on row with value "${rowValue}"`);
          await basePage.hasValueInTableRowWith(substituteValue(waitForText) as string, [
            substituteValue(rowValue) as string,
          ]);
          console.log('Found');
          return true;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.log('Not found, reloading page');
          await basePage.refreshPage();
          return false;
        }
      },
      10000,
      36,
    );
  },
);

Given('I refresh the page', async function (this: ICustomWorld) {
  const basePage = new BasePage(this.page!);
  await basePage.refreshPage();
});

Given(
  'I add user {string} to group {string}',
  async function (this: ICustomWorld, username: string, group: string) {
    const basePage = new BasePage(this.page!);
    await basePage.clickLink('Users');
    await basePage.containsText('Search for user');
    await basePage.clickLink('Clear search');
    await basePage.fillInputField('Full name', username);
    await basePage.clickButton('Search');

    await basePage.clickValueInTableRowWith(
      substituteValue('View') as string,
      substituteValue(username) as string,
    );

    await basePage.hasHeader(username);
    await basePage.clickLink('User Groups');

    try {
      await basePage.hasLink(group);
      console.log(`User ${username} already in group ${group}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // group not found, add assign user to group
      await basePage.clickButton('Assign groups');
      await basePage.containsText('Assign groups');

      await basePage.fillInputField('Filter by group name', group);
      await basePage.clickCheckboxInTableRowWithOneValue(group);
      await basePage.clickButton('Assign groups');
      await basePage.hasHeader(username);
      await basePage.hasLink(group);
      console.log(`User ${username} assigned to group ${group}`);
    }
  },
);

Then('I see at least {int} search results', async function (this: ICustomWorld, count: string) {
  const basePage = new BasePage(this.page!);
  await basePage.containsText('result');
  await basePage.hasSearchResultCountGreaterThan(parseInt(count, 10));
});

Given('I reactivate user {string}', async function (this: ICustomWorld, username: string) {
  const basePage = new BasePage(this.page!);
  await basePage.clickLink('Users');
  await basePage.fillInputField('Full name', username, true);
  await basePage.clickLabel('All');
  await basePage.clickButton('Search');

  await basePage.clickValueInTableRowWith(
    substituteValue('View') as string,
    substituteValue(username) as string,
  );

  await basePage.hasHeader(username);

  try {
    await basePage.containsText('Active user');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    await basePage.clickButton('Activate user');
    await basePage.hasHeader(username);
    await basePage.clickButton('Reactivate user');
    await basePage.containsText('User record activated');
  }
});

Given('I click on the first link in the results table', async function (this: ICustomWorld) {
  const basePage = new BasePage(this.page!);
  await basePage.clickFirstTableLink();
});
