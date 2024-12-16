import { BasePage } from '.';

export class StubLoginPage extends BasePage {
  async login(role: string): Promise<void> {
    await this.page.getByLabel(`I'm an employee of HM Courts and Tribunals Service`).click();
    await this.page.locator('button').getByText('Continue').click();
    await this.page
      .locator(`#login-${role.replace('REQUESTERAPPROVER', 'REQUESTER-APPROVER').toLowerCase()}`)
      .click();
  }
}
