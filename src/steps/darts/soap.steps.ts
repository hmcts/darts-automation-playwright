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
import { AddCaseObject, AddLogEntryObject, DailyListObject, EventObject } from '../../support/soap';
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

interface EventDataTable {
  message_id: string;
  type: string;
  sub_type: string;
  event_id: string;
  courthouse: string;
  courtroom: string;
  case_numbers: string;
  event_text: string;
  date_time: string;
  case_retention_fixed_policy: string;
  case_total_sentence: string;
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
  if (dailyListData.judge) {
    sitting['cs:Judiciary']['cs:Judge']['apd:CitizenNameRequestedName'] = dailyListData.judge;
  }

  const hearing = sitting['cs:Hearings']['cs:Hearing'];
  hearing['cs:HearingDetails']['cs:HearingDate'] = dailyListData.startDate;
  hearing['cs:TimeMarkingNote'] = dailyListData.startTime.substring(0, 5) + ' AM';
  hearing['cs:CaseNumber'] = dailyListData.caseNumber;

  // prosecution
  if (dailyListData.prosecution) {
    hearing['cs:Prosecution']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
      'apd:CitizenNameForename'
    ] = splitString(dailyListData.prosecution, 0);
    hearing['cs:Prosecution']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
      'apd:CitizenNameSurname'
    ] = splitString(dailyListData.prosecution, 1);
  }

  // defendant
  let defendant = hearing['cs:Defendants']['cs:Defendant'];
  if (Array.isArray(defendant)) {
    defendant = defendant[0];
  }
  defendant['cs:URN'] = dailyListData.caseNumber;
  if (dailyListData.defendant) {
    defendant['cs:PersonalDetails']['cs:Name']['apd:CitizenNameForename'] = splitString(
      dailyListData.defendant,
      0,
    );
    defendant['cs:PersonalDetails']['cs:Name']['apd:CitizenNameSurname'] = splitString(
      dailyListData.defendant,
      1,
    );
  }

  // defence
  if (dailyListData.defence) {
    defendant['cs:Counsel']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
      'apd:CitizenNameForename'
    ] = splitString(dailyListData.defence, 0);
    defendant['cs:Counsel']['cs:Advocate']['cs:PersonalDetails']['cs:Name'][
      'apd:CitizenNameSurname'
    ] = splitString(dailyListData.defence, 1);
  }

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
    courtLogData.map(async (courtLog, index) => {
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

      await new Promise((r) => setTimeout(r, 200 * index));
      await DartsSoapService.addLogEntry(xmlescape(builder.build(addLogEntry) as string));
    }),
  );
});

When('I create (an )event(s)', async function (this: ICustomWorld, dataTable: DataTable) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    oneListGroup: true,
  });

  const eventData = dataTableToObjectArray<EventDataTable>(dataTable);

  await Promise.all(
    eventData.map(async (event, index) => {
      const dateTimeObj = DateTime.fromFormat(event.date_time, 'y-MM-dd HH:mm:ss');
      const dartsEvent: EventObject = {
        'be:DartsEvent': {
          '$xmlns:be': 'urn:integration-cjsonline-gov-uk:pilot:entities',
          $ID: event.event_id,
          $Y: dateTimeObj.year.toString(),
          $M: dateTimeObj.month.toString(),
          $D: dateTimeObj.day.toString(),
          $H: dateTimeObj.hour.toString().padStart(2, '0'),
          $MIN: dateTimeObj.minute.toString().padStart(2, '0'),
          $S: dateTimeObj.second.toString().padStart(2, '0'),
          'be:CourtHouse': event.courthouse,
          'be:CourtRoom': event.courtroom,
          'be:CaseNumbers':
            event.case_numbers !== null
              ? event.case_numbers
                  .split('~')
                  .map((case_number) => ({ 'be:CaseNumber': case_number }))
              : [],
          'be:EventText': event.event_text,
        },
      };

      if (event.case_retention_fixed_policy || event.case_total_sentence) {
        dartsEvent['be:DartsEvent']['be:RetentionPolicy'] = {
          'be:CaseRetentionFixedPolicy': event.case_retention_fixed_policy,
          'be:CaseTotalSentence': event.case_total_sentence,
        };
      }
      // TODO: we shouldn't need to stagger the requests slightly, but this was causing an issue creating courtrooms if they didn't exist
      // The error was as follows
      //   ERROR: duplicate key value violates unique constraint "ctr_chr_crn_unq"
      //   Detail: Key (cth_id, courtroom_name)=(1356, ROOM 437390Z) already exists.
      await new Promise((r) => setTimeout(r, 200 * index));
      await DartsSoapService.addDocument(
        event.message_id,
        event.type,
        event.sub_type,
        builder.build(dartsEvent) as string,
      );
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
    if (soapAction === 'addDocument') {
      await DartsSoapService.addDocument(
        undefined,
        undefined,
        undefined,
        undefined,
        substituteValue(soapBody) as string,
      );
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
