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
    addCaseData.map(async (addCase, index) => {
      const body = {
        courthouse: addCase.courthouse,
        case_number: addCase.case_number,
        defendants: [addCase.defendants],
        judges: [addCase.judges],
        prosecutors: [addCase.prosecutors],
        defenders: [addCase.defenders],
      };

      await new Promise((r) => setTimeout(r, 200 * index));
      await DartsApiService.sendApiPostRequest('/cases', body, {}, 201);
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
