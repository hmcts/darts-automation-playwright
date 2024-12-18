import { expect, type Page } from '@playwright/test';

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
    await this.page.locator('button').getByText(text).click();
  }

  async clickLink(text: string) {
    await this.page.locator('a').getByText(text).click();
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
}
