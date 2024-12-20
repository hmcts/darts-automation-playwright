import { When } from '@cucumber/cucumber';
import { ICustomWorld } from '../../support/custom-world';
import DartsApiService from '../../support/darts-api-service';
import wait from '../../support/wait';

When(
  'I process the daily list for courthouse {string}',
  async function (this: ICustomWorld, courthouse: string) {
    const runDailyList = async () => {
      try {
        await DartsApiService.sendApiPostRequest(
          '/dailylists/run',
          undefined,
          { listing_courthouse: courthouse },
          202,
        );
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        return false;
      }
    };

    const done = await wait(runDailyList, 3000, 30);
    if (!done) {
      throw new Error(`Failed to process daily list for courthouse ${courthouse}`);
    }
  },
);
