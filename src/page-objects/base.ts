import { expect, type Page } from '@playwright/test';
import cache from 'memory-cache';
import path from 'path';
import { fileURLToPath } from 'url';
import { substituteValue } from '../support/substitution';
import { config } from '../support/config';
import wait from '../support/wait';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoUrlPath(path: string): Promise<void> {
    await this.page.goto(config.DARTS_PORTAL + path);
  }

  async refreshPage() {
    await this.page.reload();
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

  async clickLabel(text: string, exact: boolean = false) {
    if (text === 'Assign to me') {
      await this.page.getByLabel(text).first().click();
    } else {
      await this.page.getByLabel(text, { exact }).click();
    }
  }

  async verifyCheckboxIsChecked(checkbox: string, checked: boolean) {
    await expect(this.page.getByLabel(checkbox)).toBeChecked({ checked });
  }

  async clickCheckboxInTableRowWith(value1: string, value2: string) {
    await this.page
      .locator('table tbody tr')
      .filter({ hasText: value1 })
      .filter({ hasText: value2 })
      .locator('.govuk-checkboxes__input')
      .click();
  }

  async clickCheckboxInTableRowWithOneValue(value1: string) {
    await this.page
      .locator('table tbody tr')
      .filter({ hasText: value1 })
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

  async hasValueInTableRowWithValue(text: string, value: string) {
    await expect(
      this.page
        .locator('table tbody tr')
        .filter({ has: this.page.getByText(value, { exact: true }) })
        .getByRole('cell', { name: text, exact: true })
        .filter({ hasNot: this.page.locator('.govuk-checkboxes__item') }),
    ).toBeVisible();
  }

  async hasValueInTableRowWithTwoValues(text: string, value1: string, value2: string) {
    await expect(
      this.page
        .locator('table tbody tr')
        .filter({ has: this.page.getByText(value1, { exact: true }) })
        .filter({ has: this.page.getByText(value2, { exact: true }) })
        .getByRole('cell', { name: text })
        .filter({ hasNot: this.page.locator('.govuk-checkboxes__item') }),
    ).toBeVisible();
  }

  async hasValueInTableRowWith(text: string, values: string[]) {
    if (values.length === 1) {
      await this.hasValueInTableRowWithValue(text, values[0]);
    }
    if (values.length === 2) {
      await this.hasValueInTableRowWithTwoValues(text, values[0], values[1]);
    }
  }

  async fillInputField(field: string, value: string, exactFieldMatch: boolean = false) {
    let matching = this.page.getByLabel(field, { exact: exactFieldMatch });
    if ((await matching.count()) > 1) {
      matching = matching.filter({ has: this.page.locator(':scope.govuk-input') });
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
    text = text.replaceAll('(', '\\(');
    text = text.replaceAll(')', '\\)');
    await this.page.getByRole('button', { name: new RegExp(`^${text}`) }).click();
  }

  async clickLink(text: string, exactMatch: boolean = false) {
    const summaryDetailsLinks = ['Hide restrictions', 'Show restrictions', 'Advanced search'];
    if (summaryDetailsLinks.includes(text)) {
      await this.page.getByText(text).click();
    } else {
      // some links have counts after then, such as "Your audio 21"
      // allow leading 0s in the case of display dates
      await this.page
        .getByRole('link', {
          name: exactMatch ? text : new RegExp(`^0?${text}`),
          exact: exactMatch,
        })
        .click();
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

  async selectOptionFromOnlyDropdown(option: string) {
    await this.page.locator('select').selectOption(option);
  }

  async hasSubNavigationLink(text: string, visible: boolean) {
    const nav = this.page.locator('.moj-sub-navigation');
    await expect(nav.getByRole('link', { name: text }).nth(0)).toBeVisible({ visible });
  }

  async clickSubNavigationLink(text: string) {
    const nav = this.page.locator('.moj-sub-navigation');
    await nav.getByRole('link', { name: text }).nth(0).click();
  }

  async hasButton(text: string) {
    await expect(this.page.getByRole('button', { name: text })).toBeVisible();
  }

  async clickTableHeader(tableHeader: string) {
    await this.page.waitForTimeout(500);
    await this.page.getByLabel(`Sortable column for ${tableHeader}`).first().click();
    await this.page.waitForTimeout(200);
  }

  async clickTableHeaderInTable(tableHeader: string, tableName: string) {
    await this.page.waitForTimeout(500);
    await this.page
      .locator(`#${tableName} .govuk-table`)
      .getByLabel(`Sortable column for ${tableHeader}`)
      .click();
    await this.page.waitForTimeout(200);
  }

  async hasErrorSummaryContainingText(text: string) {
    await wait(
      async () => {
        const summary = this.page.locator('.govuk-error-summary');
        try {
          await expect(summary.getByText(text).first()).toBeVisible();
          return true;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.log(`Error summary message "${text}" not found, retrying...`);
          return false;
        }
      },
      500,
      5,
    );
  }

  async hasFieldWithError(field: string, error: string) {
    this.page
      .locator('.govuk-form-group')
      .filter({ has: this.page.getByLabel(field) })
      .getByText(error);
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

  async hasSummaryRowContaining(rowHeading: string, expectedValue: string) {
    expectedValue = expectedValue.replaceAll('(', '\\(');
    expectedValue = expectedValue.replaceAll(')', '\\)');
    await expect(
      this.page
        .locator('.govuk-summary-list__row')
        .filter({ hasText: rowHeading })
        .locator('.govuk-summary-list__value'),
    ).toContainText(expectedValue);
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

  async clickTextInSummaryRow(rowHeading: string, textToClick: string) {
    if (textToClick === 'Change') {
      textToClick = `${textToClick} ${rowHeading}`;
    }
    await this.page
      .locator('.govuk-summary-list__row')
      .filter({ hasText: rowHeading })
      .getByText(textToClick)
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

  async verifyHtmlTable(
    tableLocator: string,
    headings: string[],
    tableData: string[][],
    exactMatchHeaders: boolean = false,
  ) {
    const tableHeaders = this.page.locator(`${tableLocator} thead tr th`);

    for (const header of headings) {
      if (header !== '*NO-CHECK*' && header !== '*SKIP*') {
        if (exactMatchHeaders) {
          await expect(
            this.page.getByLabel(`${header} column header`, { exact: true }),
          ).toBeVisible();
        } else {
          await expect(tableHeaders.filter({ hasText: header }).nth(0)).toHaveText(header);
        }
      }
    }

    let index = 0;
    for (const rowData of tableData) {
      const tableRow = this.page.locator('.govuk-table tbody tr').nth(index);
      index++;
      for (const cellData of rowData) {
        if (cellData !== '*IGNORE*' && cellData !== '*NO-CHECK*' && cellData !== '*SKIP*') {
          await expect(
            tableRow.filter({
              has: this.page.getByRole('cell', { name: substituteValue(cellData) as string }),
            }),
          ).toContainText(substituteValue(cellData) as string);
        }
      }
    }
  }

  async verifyHtmlTableIncludes(tableLocator: string, headings: string[], tableData: string[][]) {
    for (const header of headings) {
      if (header !== '*NO-CHECK*' && header !== '*SKIP*') {
        await expect(
          this.page.locator(tableLocator).getByLabel(`${header} column header`, { exact: true }),
        ).toBeVisible();
      }
    }

    for (const rowData of tableData) {
      const page1Visible = await this.page
        .getByRole('link', {
          name: new RegExp(`^0?Page 1`),
        })
        .isVisible();
      if (page1Visible) {
        await this.clickLink('Page 1');
      }

      let row = this.page.locator('.govuk-table tbody tr');
      for (const cellData of rowData) {
        if (cellData !== '*IGNORE*' && cellData !== '*NO-CHECK*' && cellData !== '*SKIP*') {
          row = row.filter({ has: this.page.getByRole('cell', { name: cellData }) });
        }
      }

      // check pages for
      await wait(
        async () => {
          try {
            await expect(row).toBeVisible();
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            await this.clickLink('Next');
            return false;
          }
        },
        100,
        2,
      );
    }
  }

  async verifySelectOptions(select: string, options: string[]) {
    for (const option of options) {
      await this.selectOption(option, select);
    }
  }

  async hasSortedTableHeader(tableHeader: string, sort: 'ascending' | 'descending') {
    await expect(
      this.page
        .getByLabel(`${tableHeader} column header`)
        .filter({ has: this.page.locator(`:scope*[aria-sort="${sort}"]`) }),
    ).toBeVisible();
  }

  async downloadFileUsingButton(button: string) {
    const downloadPromise = this.page.waitForEvent('download');
    await this.clickButton(button);
    const download = await downloadPromise;
    cache.put('download_filename', download.suggestedFilename());
  }

  verifyDownloadFilename(expectedFilename: string) {
    const filename = cache.get('download_filename');
    if (!filename) throw new Error('No cached value found for "download_filename"');
    expect(filename).toContain(expectedFilename);
  }

  async hasSearchResultCountGreaterThan(count: number) {
    const content = await this.page!.locator('#search-results .govuk-table__caption').textContent();
    const resultCount = parseInt(content?.trim().split(' ')[0] as string, 10);
    expect(resultCount).toBeGreaterThanOrEqual(count);
  }
}
