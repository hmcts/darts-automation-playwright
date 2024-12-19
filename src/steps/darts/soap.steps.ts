import { ICustomWorld } from '../../support/custom-world';
import fs from 'node:fs';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import xmlescape from 'xml-escape';
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DateTime } from 'luxon';
import { DataTable, dataTableToObject, dataTableToObjectArray } from '../../support/data-table';
import { substituteValue } from '../../support/substitution';
import DartsSoapService from '../../support/darts-soap-service';
import { AddCaseObject, AddLogEntryObject, DailyListObject } from '../../support/soap';
import { splitString } from '../../support/split';

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

interface DailyListDataTable {
  messageId: string;
  type: string;
  subType: string;
  documentName: string;
  courthouse: string;
  courtroom: string;
  caseNumber: string;
  startDate: string;
  startTime: string;
  endDate: string;
  timeStamp: string;
  defendant: string;
  judge: string;
  prosecution: string;
  defence: string;
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

When('I add a daily list', async function (this: ICustomWorld, dataTable: DataTable) {
  const dailyListBaseXml = fs.readFileSync('./src/resources/dailylist.xml', 'utf8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
  });
  const dailyList: DailyListObject = parser.parse(dailyListBaseXml);
  const now = DateTime.now();

  const dailyListData = dataTableToObject<DailyListDataTable>(dataTable);
  // documentID
  const docId = dailyList['cs:DailyList']['cs:DocumentID'];
  docId['cs:DocumentName'] = dailyListData.documentName;
  docId['cs:UniqueID'] = dailyListData.documentName;
  docId['cs:TimeStamp'] = now.toISO();

  // list header
  const listHeader = dailyList['cs:DailyList']['cs:ListHeader'];
  listHeader['cs:StartDate'] = dailyListData.startDate;
  listHeader['cs:EndDate'] = dailyListData.endDate;
  listHeader['cs:PublishedTime'] = now.toISO();

  // TODO: change CrownCourt section for different courthouses
  const sitting =
    dailyList['cs:DailyList']['cs:CourtLists']['cs:CourtList']['cs:Sittings']['cs:Sitting'];
  sitting['cs:CourtRoomNumber'] = dailyListData.courtroom;
  sitting['cs:SittingAt'] = dailyListData.startTime + ':00';
  sitting['cs:Judiciary']['cs:Judge']['apd:CitizenNameRequestedName'] = dailyListData.judge;

  const hearing = sitting['cs:Hearings']['cs:Hearing'];
  hearing['cs:HearingDetails']['cs:HearingDate'] = dailyListData.startDate;
  hearing['cs:TimeMarkingNote'] = dailyListData.startTime.substring(0, 5) + ' AM';
  hearing['cs:CaseNumber'] = dailyListData.caseNumber;

  // prosecution
  hearing['cs:Prosecution']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
    'apd:CitizenNameForename'
  ] = splitString(dailyListData.prosecution, 0);
  hearing['cs:Prosecution']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
    'apd:CitizenNameSurname'
  ] = splitString(dailyListData.prosecution, 1);

  // defendant
  let defendant = hearing['cs:Defendants']['cs:Defendant'];
  if (Array.isArray(defendant)) {
    defendant = defendant[0];
  }
  defendant['cs:PersonalDetails']['cs:Name']['apd:CitizenNameForename'] = splitString(
    dailyListData.defendant,
    0,
  );
  defendant['cs:PersonalDetails']['cs:Name']['apd:CitizenNameSurname'] = splitString(
    dailyListData.defendant,
    1,
  );
  defendant['cs:URN'] = dailyListData.caseNumber;

  // defence
  defendant['cs:Counsel']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
    'apd:CitizenNameForename'
  ] = splitString(dailyListData.defence, 0);
  defendant['cs:Counsel']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
    'apd:CitizenNameSurname'
  ] = splitString(dailyListData.defence, 1);

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    oneListGroup: true,
  });

  const dailyListXml = builder.build(dailyList) as string;
  await DartsSoapService.addDocument(
    dailyListData.messageId,
    dailyListData.type,
    dailyListData.subType,
    dailyListXml,
  );
});

When('I add courtlogs', async function (this: ICustomWorld, dataTable: DataTable) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    oneListGroup: true,
  });

  const courtLogData = dataTableToObjectArray<AddCourtLogDataTable>(dataTable);

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
