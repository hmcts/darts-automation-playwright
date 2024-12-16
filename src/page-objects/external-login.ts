import { BasePage } from '.';
import { UserCredentials } from '../support/credentials';

export class ExternalLoginPage extends BasePage {
  async login(userCredentials: UserCredentials): Promise<void> {
    await this.clickLabel('I work with the HM Courts and Tribunals Service');
    await super.clickButton('Continue');

    await this.fillInputField('Enter your email', userCredentials.username);
    await this.fillInputField('Enter your password', userCredentials.password);
    await this.clickButton('Continue');
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
}
