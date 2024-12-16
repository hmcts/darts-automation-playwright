import { UserCredentials } from '../support/credentials';
import { BasePage } from '.';

export class InternalLoginPage extends BasePage {
  async login(userCredentials: UserCredentials): Promise<void> {
    await this.clickLabel(`I'm an employee of HM Courts and Tribunals Service`);
    await this.clickButton('Continue');

    await this.page.waitForTimeout(300);
    const userAnotherAccount = await this.page.getByText('Use another account').isVisible();
    console.log('userAnotherAccount is visible', userAnotherAccount);
    if (userAnotherAccount) {
      console.log('Clicking user another account');
      await this.page.getByText('Use another account').click();
    }

    await this.containsText('Sign in');
    await this.fillInputField('email', userCredentials.username);
    await this.clickNextButton();
    await this.containsText('Enter password');
    await this.fillInputField('password', userCredentials.password);
    await this.clickButton('Sign in');
    await this.page.waitForTimeout(300);
    const staySignedIn = await this.page
      .getByRole('heading', { name: 'Stay signed in?' })
      .isVisible();
    console.log('staySignedIn is visible', staySignedIn);
    if (staySignedIn) {
      console.log('stay signed is visible');
      await this.clickButton('No');
    } else {
      console.log('stay signed is NOT visible');
    }
  }

  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click();
  }

  async clickNextButton() {
    await this.page.locator('input').getByText('Next').click();
  }

  async signOutUser(username: string) {
    await this.page.locator('small').getByText(username).isVisible();
    await this.page.locator('small').getByText(username).click();

    // it takes this long for Microsoft to sign out and return the user to the login page
    await this.page.waitForTimeout(4000);
  }
}
