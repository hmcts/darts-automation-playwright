import { ICustomWorld } from '../../support/custom-world';
import { XMLBuilder } from 'fast-xml-parser';
import xmlescape from 'xml-escape';
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DataTable, dataTableToObject } from '../../support/data-table';
import { substituteValue } from '../../support/substitution';
import DartsGateway from '../../support/darts-gateway';

interface AddCaseDataTable {
  courthouse: string;
  case_number: string;
  defendants: string;
  judges: string;
  prosecutors: string;
  defenders: string;
}

interface Defendant {
  defendant: string;
}
interface Judge {
  judge: string;
}
interface Prosecutor {
  prosecutor: string;
}
interface Defender {
  defender: string;
}

interface AddCaseObject {
  case: {
    $type: string;
    $id: string;
    courthouse: string;
    defendants: Defendant[];
    judges: Judge[];
    prosecutors: Prosecutor[];
    defenders: Defender[];
  };
}

When('I create a case', async function (this: ICustomWorld, dataTable: DataTable) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    oneListGroup: true,
  });

  const caseData = dataTableToObject<AddCaseDataTable>(dataTable);
  const addCase: AddCaseObject = {
    case: {
      $type: '',
      $id: substituteValue(caseData.case_number) as string,
      courthouse: caseData.courthouse,
      defendants:
        caseData.defendants !== null
          ? caseData.defendants.split('~').map((defendant) => ({ defendant }))
          : [],
      judges:
        caseData.judges !== null ? caseData.judges.split('~').map((judge) => ({ judge })) : [],
      prosecutors:
        caseData.prosecutors !== null
          ? caseData.prosecutors.split('~').map((prosecutor) => ({ prosecutor }))
          : [],
      defenders:
        caseData.defenders !== null
          ? caseData.defenders.split('~').map((defender) => ({ defender }))
          : [],
    },
  };

  const caseXml = builder.build(addCase) as string;
  await DartsGateway.addCase(xmlescape(caseXml));
});

When(
  'I call POST SOAP API using soap action {string} and body:',
  async function (this: ICustomWorld, soapAction: string, soapBody: string) {
    if (soapAction === 'addCase') {
      await DartsGateway.addCase(soapBody, { includesDocumentTag: true });
    }
  },
);

Then('the API status code is {int}', async function (this: ICustomWorld, statusCode: number) {
  const response = DartsGateway.getResponseCodeAndMessage();
  expect(response.code).toBe(statusCode);
});
