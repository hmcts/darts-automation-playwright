import { expect, type Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { substituteValue } from '../support/substitution';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async containsText(text: string, visible = true) {
    if (!visible) {
      await expect(this.page.getByText(text).nth(0)).toBeVisible({
        visible: false,
      });
    } else {
      const allMatchingLocators = this.page.getByText(text);
      const visibleLocators = allMatchingLocators.locator('visible=true');
      const firstVisibleItem1 = visibleLocators.first();
      await expect(firstVisibleItem1).toBeVisible();
    }
  }

  async clickLabel(text: string) {
    await this.page.getByLabel(text).click();
  }

  async clickCheckboxInTableRowWith(value1: string, value2: string) {
    await this.page
      .locator('table tbody tr')
      .filter({ hasText: value1 })
      .filter({ hasText: value2 })
      .locator('.govuk-checkboxes__input')
      .click();
  }

  async clickValueInTableRowWith(clickOn: string, value: string) {
    await this.page
      .locator('table tbody tr')
      .filter({ has: this.page.getByText(value, { exact: true }) })
      .getByText(clickOn)
      .click();
  }

  async hasValueInTableRowWith(text: string, values: string[]) {
    const locator = this.page.locator('table tbody tr');
    values.forEach((value) => locator.filter({ hasText: value }));
    await expect(locator.getByText(text)).toBeVisible();
  }

  async fillInputField(field: string, value: string) {
    let matching = this.page.getByLabel(field);
    if ((await matching.count()) > 1) {
      matching = matching.filter({ has: this.page.locator('//*[type="input"]') });
    }
    await matching.fill(value);
  }

  async fillTimeFields(label: string, timeValue: string) {
    const timeData = timeValue.split(':');
    const timeField = this.page.locator(`//*[text() = "${label}"]/following-sibling::*`);
    await timeField.locator('input').nth(0).fill(timeData[0]);
    await timeField.locator('input').nth(1).fill(timeData[1]);
    await timeField.locator('input').nth(2).fill(timeData[2]);
  }

  async clickButton(text: string) {
    await this.page.getByRole('button', { name: new RegExp(`^${text}`) }).click();
  }

  async clickLink(text: string) {
    const summaryDetailsLinks = ['Hide restrictions', 'Show restrictions', 'Advanced search'];
    if (summaryDetailsLinks.includes(text)) {
      await this.page.getByText(text).click();
    } else {
      // some links have counts after then, such as "Your audio 21"
      // allow leading 0s in the case of display dates
      await this.page.getByRole('link', { name: new RegExp(`^0?${text}`) }).click();
    }
  }

  async clickBreadcrumbLink(text: string) {
    await this.page.locator('app-breadcrumb').getByRole('link', { name: text }).click();
  }

  async inputHasValue(field: string, value: string) {
    await expect(this.page.getByLabel(field)).toHaveValue(value);
  }

  async hasHeader(text: string, visible = true) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible({ visible });
  }

  async hasLink(text: string, visible = true) {
    await expect(this.page.getByRole('link', { name: text })).toBeVisible({ visible });
  }

  async hasNavigationLink(text: string, visible: boolean) {
    const nav = this.page.locator('.moj-primary-navigation');
    await expect(nav.getByRole('link', { name: text }).nth(0)).toBeVisible({ visible });
  }

  async clickNavigationLink(text: string) {
    const nav = this.page.locator('.moj-primary-navigation');
    await nav.getByRole('link', { name: text }).nth(0).click();
  }

  async selectOption(option: string, dropdown: string) {
    await this.page.getByLabel(dropdown).selectOption(option);
  }

  async hasSubNavigationLink(text: string, visible: boolean) {
    const nav = this.page.locator('.moj-sub-navigation');
    await expect(nav.getByRole('link', { name: text }).nth(0)).toBeVisible({ visible });
  }

  async clickSubNavigationLink(text: string) {
    const nav = this.page.locator('.moj-sub-navigation');
    await nav.getByRole('link', { name: text }).nth(0).click();
  }

  async clickTableHeader(tableHeader: string) {
    await this.page.waitForTimeout(200);
    await this.page.getByLabel(`Sortable column for ${tableHeader}`).click();
    await this.page.waitForTimeout(200);
  }

  async hasErrorSummaryContainingText(text: string) {
    const summary = this.page.locator('.govuk-error-summary');
    await expect(summary.getByText(text).first()).toBeVisible();
  }

  async hasSummaryRow(rowHeading: string, expectedValue: string) {
    expectedValue = expectedValue.replaceAll('(', '\\(');
    expectedValue = expectedValue.replaceAll(')', '\\)');
    await expect(
      this.page
        .locator('.govuk-summary-list__row')
        .filter({ hasText: rowHeading })
        .locator('.govuk-summary-list__value'),
    ).toHaveText(new RegExp(`^\\s?0?${expectedValue}\\s?`)); // optional leading/trailing whitespace, optional leading 0
  }

  async hasTableRow(tableRowText: string, expectedValue: string) {
    await expect(
      this.page
        .locator('.govuk-table__row')
        .filter({
          has: this.page.getByRole('cell', { name: tableRowText }),
        })
        .getByRole('cell', { name: expectedValue }),
    ).toBeVisible();
  }

  async clickTextInTableRow(tableRowText: string, textToClick: string) {
    await this.page
      .locator('.govuk-table__row')
      .filter({
        has: this.page.getByRole('cell', { name: tableRowText }),
      })
      .getByRole('cell', { name: textToClick })
      .click();
  }

  async hasCookieWithKeyValue(cookieName: string, key: string, value: string) {
    const cookies = await this.page.context().cookies();
    const matchingCookie = cookies.find((c) => c.name === cookieName);
    expect(matchingCookie).toBeDefined();
    if (matchingCookie) {
      const decodedCookie = JSON.parse(decodeURIComponent(matchingCookie.value));
      expect(`${decodedCookie[key]}`).toBe(value);
    }
  }

  async uploadFile(fileName: string, fileUploadField: string) {
    const __filename = fileURLToPath(import.meta.url);

    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByText(fileUploadField).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(path.dirname(__filename), '../testdata/', fileName));
  }

  async verifyHtmlTable(tableLocator: string, headings: string[], tableData: string[][]) {
    const tableHeaders = this.page.locator(`${tableLocator} thead tr th`);

    for (const header of headings) {
      if (header !== '*NO-CHECK*') {
        await expect(tableHeaders.filter({ hasText: header }).nth(0)).toHaveText(header);
      }
    }

    let index = 0;
    for (const rowData of tableData) {
      const tableRow = this.page.locator('.govuk-table tbody tr').nth(index);
      index++;
      for (const cellData of rowData) {
        if (cellData !== '*IGNORE*' && cellData !== '*NO-CHECK*') {
          await expect(
            tableRow.filter({
              has: this.page.getByRole('cell', { name: substituteValue(cellData) as string }),
            }),
          ).toContainText(substituteValue(cellData) as string);
        }
      }
    }
  }
}
