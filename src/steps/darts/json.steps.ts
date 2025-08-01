import { ICustomWorld } from '../../support/custom-world';
import { Given, Then, When } from '@cucumber/cucumber';
import { DataTable, dataTableToObject, dataTableToObjectArray } from '../../support/data-table';
import { AddCaseDataTable, GetCasesDataTable } from '../../support/types';
import DartsApiService from '../../support/darts-api-service';
import { expect } from '@playwright/test';
import { substituteValue } from '../../support/substitution';

When('I create a case using json', async function (this: ICustomWorld, dataTable: DataTable) {
  const addCaseData = dataTableToObjectArray<AddCaseDataTable>(dataTable);

  await Promise.all(
    addCaseData.map(async (addCase) => {
      const body = {
        courthouse: addCase.courthouse,
        case_number: addCase.case_number,
        defendants: [addCase.defendants],
        judges: [addCase.judges],
        prosecutors: [addCase.prosecutors],
        defenders: [addCase.defenders],
      };
      await DartsApiService.sendApiPostRequest('/cases/addCase', body, {}, 201);
    }),
  );
});

Given(
  'I call POST {string} API using json body:',
  async function (this: ICustomWorld, endpoint: string, body: string) {
    await DartsApiService.sendApiPostRequest(endpoint, JSON.parse(body), {}, null);
  },
);

When('I call GET {string} API', async function (this: ICustomWorld, endpoint: string) {
  await DartsApiService.sendApiGetRequest(substituteValue(endpoint) as string);
});

Then(
  'I call GET {string} API with query params:',
  async function (this: ICustomWorld, endpoint: string, dataTable: DataTable) {
    const getCasesData = dataTableToObject<GetCasesDataTable>(dataTable) as unknown as {
      [key: string]: string;
    };
    await DartsApiService.sendApiGetRequest(substituteValue(endpoint) as string, getCasesData);
  },
);

Then('the DARTS API status code is {int}', function (this: ICustomWorld, statusCode: number) {
  expect(DartsApiService.getResponseStatus()).toBe(statusCode);
});

Then('the API response contains:', function (this: ICustomWorld, expectedResponse: string) {
  const response = JSON.parse(DartsApiService.getResponse());
  expect(response).toEqual(JSON.parse(expectedResponse));
});

Then(
  'the API response contains in array:',
  function (this: ICustomWorld, expectedResponse: string) {
    const response = JSON.parse(DartsApiService.getResponse());
    expect(response).toEqual(expect.arrayContaining([JSON.parse(expectedResponse)]));
  },
);

When('I get audios for hearing {string}', async function (hearingId: string) {
  await DartsApiService.sendApiGetRequest(`/audio/hearings/${substituteValue(hearingId)}/audios`);
});

Then(
  'I see {string} in the json response is {string}',
  async function (this: ICustomWorld, responseKey: string, expectedValue: string) {
    const response: Record<typeof responseKey, string | number | boolean>[] = JSON.parse(
      DartsApiService.getResponse(),
    );
    const found = response.find(
      (i) => i[responseKey].toString() === substituteValue(expectedValue),
    );
    console.log('found', found);
    expect(found).toBeDefined();
  },
);

Then('I see that the json response is empty', async function (this: ICustomWorld) {
  const response: Record<string, string | number | boolean>[] = JSON.parse(
    DartsApiService.getResponse(),
  );
  expect(response).toHaveLength(0);
});
