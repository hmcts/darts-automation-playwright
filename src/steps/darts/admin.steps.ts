import { Given, Then } from "@cucumber/cucumber";
import { BasePage } from "../../page-objects";
import { ICustomWorld } from "../../support/custom-world";


Given('I obfuscate event text for an event', async function (this: ICustomWorld) {
  const basePage = new BasePage(this.page!);
  await basePage.clickButton('Obfuscate event text');
  await basePage.clickButton('Continue');
});

Then('I should see the event obfuscation banners', async function (this: ICustomWorld) {
  const basePage = new BasePage(this.page!);
  await basePage.containsText('Event text successfully obfuscated');
  await basePage.containsText('This event text has been anonymised in line with HMCTS policy.');
});

