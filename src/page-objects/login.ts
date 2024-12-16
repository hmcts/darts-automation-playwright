import { config } from '../support/config';
import { BasePage } from '.';

export class LoginPage extends BasePage {
  async goto() {
    await this.page.goto(config.DARTS_PORTAL);
  }
}
