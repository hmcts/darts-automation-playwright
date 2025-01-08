import { expect, Locator, type Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async containsText(text: string, visible = true) {
    await expect(this.page.getByText(text).nth(0)).toBeVisible({
      visible,
    });
  }

  async clickLabel(text: string) {
    await this.page.getByLabel(text).click();
  }

  async fillInputField(field: string, value: string) {
    await this.page?.getByLabel(field).fill(value);
  }

  async clickButton(text: string) {
    await this.page.getByRole('button', { name: new RegExp(`^${text}`) }).click();
  }

  async clickLink(text: string) {
    // some links have counts after then, such as "Your audio 21"
    await this.page.getByRole('link', { name: new RegExp(`^${text}`) }).click();
  }

  async clickBreadcrumbLink(text: string) {
    await this.page.locator('app-breadcrumb').getByRole('link', { name: text }).click();
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

  async hasSubNavigationLink(text: string, visible: boolean) {
    const nav = this.page.locator('.moj-sub-navigation');
    await expect(nav.getByRole('link', { name: text }).nth(0)).toBeVisible({ visible });
  }

  async clickSubNavigationLink(text: string) {
    const nav = this.page.locator('.moj-sub-navigation');
    await nav.getByRole('link', { name: text }).nth(0).click();
  }

  async hasErrorSummaryContainingText(text: string) {
    const summary = this.page.locator('.govuk-error-summary');
    await expect(summary.getByText(text)).toBeVisible();
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

    const fileChooserPromise = this.page!.waitForEvent('filechooser');
    await this.page.getByText(fileUploadField).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(path.dirname(__filename), '../testdata/', fileName));
  }

  async verifyHtmlTable(tableLocator: Locator, headings: string[], tableData: string[][]) {
    const tableHeaders = tableLocator.locator(`thead tr th`);
    headings.forEach(async (header, index) => {
      await expect(tableHeaders.nth(index)).toHaveText(header);
    });
    tableData.forEach(async (rowData, rowIndex) => {
      const tableRow = tableLocator.locator(`tbody tr`).nth(rowIndex);
      rowData.forEach(async (cellData, cellIndex) => {
        if (cellData !== '*IGNORE*') {
          await expect(tableRow.locator('td').nth(cellIndex)).toHaveText(cellData);
        }
      });
    });
  }
}
