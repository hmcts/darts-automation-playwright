import { DartsUserCredential } from '../support/credentials';
import { BasePage } from '.';
import { expect } from '@playwright/test';

export class InternalLoginPage extends BasePage {
  async login(userCredentials: DartsUserCredential): Promise<void> {
    await this.clickLabel(`I'm an employee of HM Courts and Tribunals Service`);
    await this.clickButton('Continue');

    await this.page.waitForTimeout(500);
    const useAnotherAccount = await this.page.getByText('Use another account').isVisible();
    console.log('useAnotherAccount is visible', useAnotherAccount);
    if (useAnotherAccount) {
      console.log('Clicking use another account');
      await this.page.getByText('Use another account').click();
    }

    await this.containsText('Sign in');
    await this.fillInputField('email', userCredentials.username);
    await this.clickNextButton();
    await this.containsText('Enter password');
    await this.fillInputField('password', userCredentials.password);
    await this.clickButton('Sign in');
    await this.page.waitForTimeout(500);
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
    try {
      await expect(this.page.getByText('Search for a case')).toBeVisible({ timeout: 15000 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      await this.clickButton('No');
      await expect(this.page.getByText('Search for a case')).toBeVisible({ timeout: 10000 });
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
