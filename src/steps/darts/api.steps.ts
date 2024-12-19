import { ICustomWorld } from '../../support/custom-world';
import { When } from '@cucumber/cucumber';
import DartsApiService from '../../support/darts-api-service';

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

    // check every 3 seconds, up to 30 times
    for (let i = 0; i < 30; i++) {
      const done = await runDailyList();
      if (done) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  },
);
