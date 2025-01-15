import { expect } from '@playwright/test';
import { BasePage } from '.';
import { DartsUserCredential } from '../support/credentials';

export class ExternalLoginPage extends BasePage {
  async login(userCredentials: DartsUserCredential): Promise<void> {
    await this.clickLabel('I work with the HM Courts and Tribunals Service');
    await super.clickButton('Continue');

    await this.fillInputField('Enter your email', userCredentials.username);
    await this.fillInputField('Enter your password', userCredentials.password);
    await this.clickButton('Continue');
    try {
      await expect(this.page.getByText('Search for a case')).toBeVisible({ timeout: 15000 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      await this.clickButton('Continue');
      await expect(this.page.getByText('Search for a case')).toBeVisible({ timeout: 10000 });
    }
  }

  async clickButton(text: string) {
    console.log('clicking button on external login page');
    await this.page.waitForTimeout(500);
    await this.page.locator('button').getByText(text).isVisible();
    await this.page.locator('button').getByText(text).click();
  }

  async fillInputField(field: string, value: string) {
    const input = this.page.getByLabel(field, { exact: true });
    await input.fill('');
    await input.pressSequentially(value);
  }

  async enterSecurityCode() {
    const input = this.page.getByLabel('Enter your verification code below', { exact: true });
    await input.fill('');
    await input.pressSequentially('Enter Security Code');
  }
  async signOutUser() {
    await expect(
      this.page.getByRole('heading', { name: 'Sign in to the DARTS Portal' }),
    ).toBeVisible();
  }
}
