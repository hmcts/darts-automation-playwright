import { When } from '@cucumber/cucumber';
import { ICustomWorld } from '../../support/custom-world';
import DartsApiService from '../../support/darts-api-service';
import wait from '../../support/wait';
import { DataTable, dataTableToObjectArray } from '../../support/data-table';
import DartsTestHarness from '../../support/darts-test-harness';
import { config } from '../../support/config';
import { AddAudioRequest } from '../../support/types';
import { substituteValue } from '../../support/substitution';

When(
  'I process the daily list for courthouse {string}',
  async function (this: ICustomWorld, courthouse: string) {
    const runDailyList = async () => {
      try {
        await DartsApiService.sendApiPostRequest(
          '/dailylists/run',
          undefined,
          { listing_courthouse: substituteValue(courthouse) as string },
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

When('I load an audio file', async function (this: ICustomWorld, dataTable: DataTable) {
  const addAudioData = dataTableToObjectArray<AddAudioRequest>(dataTable);

  if (config.features.useTestHarnessForAudio) {
    await Promise.all(
      addAudioData.map(async (addAudio, index) => {
        await new Promise((r) => setTimeout(r, 200 * index));
        await DartsTestHarness.addAudio(addAudio);
      }),
    );
  } else {
    await Promise.all(
      addAudioData.map(async (addAudio, index) => {
        await new Promise((r) => setTimeout(r, 200 * index));
        await DartsApiService.sendAddAudioRequest(addAudio);
      }),
    );
  }
});
