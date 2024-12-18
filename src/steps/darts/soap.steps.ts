import { ICustomWorld } from '../../support/custom-world';
import { XMLBuilder } from 'fast-xml-parser';
import xmlescape from 'xml-escape';
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DataTable, dataTableToObject, dataTableToObjectArray } from '../../support/data-table';
import { substituteValue } from '../../support/substitution';
import DartsSoapService from '../../support/darts-soap-service';
import { AddCaseObject, AddLogEntryObject } from '../../support/soap';
import { DateTime } from 'luxon';

interface AddCaseDataTable {
  courthouse: string;
  case_number: string;
  defendants: string;
  judges: string;
  prosecutors: string;
  defenders: string;
}

interface AddCourtLogDataTable {
  courthouse: string;
  courtroom: string;
  case_numbers: string;
  text: string;
  date: string;
  time: string;
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
  await DartsSoapService.addCase(xmlescape(caseXml));
});

When('I add courtlogs', async function (this: ICustomWorld, dataTable: DataTable) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    oneListGroup: true,
  });

  const courtLogData = dataTableToObjectArray<AddCourtLogDataTable>(dataTable);
  console.log('courtLogData', courtLogData);

  await Promise.all(
    courtLogData.map((courtLog) => {
      const dateObj = DateTime.fromFormat(courtLog.date, 'y-MM-dd');
      const time = courtLog.time.split(':');
      const addLogEntry: AddLogEntryObject = {
        log_entry: {
          $Y: dateObj.year.toString(),
          $M: dateObj.month.toString(),
          $D: dateObj.day.toString(),
          $H: time[0],
          $MIN: time[1],
          $S: time[2],
          courthouse: courtLog.courthouse,
          courtroom: courtLog.courtroom,
          case_numbers:
            courtLog.case_numbers !== null
              ? courtLog.case_numbers.split('~').map((case_number) => ({ case_number }))
              : [],
          text: courtLog.text,
        },
      };

      const addLogEntryXml = builder.build(addLogEntry) as string;
      DartsSoapService.addLogEntry(xmlescape(addLogEntryXml));
    }),
  );
});

When(
  'I call POST SOAP API using soap action {string} and body:',
  async function (this: ICustomWorld, soapAction: string, soapBody: string) {
    // TODO: these should not use the gateway, addCase should go via the proxy,
    // however the soapBody uses CDATA and the proxy rejects this as invalid XML.
    // darts-automation uses the gateway which is why this passes there.
    const useGateway = true;
    if (soapAction === 'addCase') {
      await DartsSoapService.addCase(soapBody, { includesDocumentTag: true, useGateway });
    }
    if (soapAction === 'addLogEntry') {
      await DartsSoapService.addLogEntry(substituteValue(soapBody) as string, {
        includesDocumentTag: true,
        useGateway,
      });
    }
  },
);

Then('the API status code is {int}', async function (this: ICustomWorld, statusCode: number) {
  const response = DartsSoapService.getResponseCodeAndMessage();
  if (!response) {
    throw new Error('API status code could not be found.');
  }
  expect(response.code).toBe(statusCode);
});
