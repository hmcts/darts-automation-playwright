import { ICustomWorld } from '../../support/custom-world';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import cache from 'memory-cache';
import sql, { tableName, getSingleValueFromResult, type SqlResult } from '../../support/db';
import { substituteValue } from '../../support/substitution';
import { DateTime } from 'luxon';
import wait from '../../support/wait';
import { DataTable, dataTableToObject } from '../../support/data-table';
import { getDartsUserCredentials } from '../../support/credentials';

Then(
  'I see table {string} column {string} is {string} where {string} = {string} and {string} = {string} and {string} = {string} and {string} = {string}',
  async function (
    this: ICustomWorld,
    table: string,
    column: string,
    expectedValue: string,
    whereColName1: string,
    whereColValue1: string,
    whereColName2: string,
    whereColValue2: string,
    whereColName3: string,
    whereColValue3: string,
    whereColName4: string,
    whereColValue4: string,
  ) {
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}
and ${sql.unsafe(whereColName3)} = ${substituteValue(whereColValue3)}
and ${sql.unsafe(whereColName4)} = ${substituteValue(whereColValue4)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    if (expectedValue === 'not null') {
      expect(returnedColumnValue).not.toBeNull();
    } else {
      expect(returnedColumnValue).toEqual(substituteValue(expectedValue));
    }
  },
);

Given(
  'I see table {string} column {string} is {string} where {string} = {string} and {string} = {string} and {string} = {string}',
  async function (
    this: ICustomWorld,
    table: string,
    column: string,
    expectedValue: string,
    whereColName1: string,
    whereColValue1: string,
    whereColName2: string,
    whereColValue2: string,
    whereColName3: string,
    whereColValue3: string,
  ) {
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}
and ${sql.unsafe(whereColName3)} = ${substituteValue(whereColValue3)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    if (expectedValue === 'not null') {
      expect(returnedColumnValue).not.toBeNull();
    } else {
      expect(returnedColumnValue).toEqual(substituteValue(expectedValue));
    }
  },
);

Given(
  'I see table {string} column {string} is {string} where {string} = {string} and {string} = {string}',
  async function (
    this: ICustomWorld,
    table: string,
    column: string,
    expectedValue: string,
    whereColName1: string,
    whereColValue1: string,
    whereColName2: string,
    whereColValue2: string,
  ) {
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    if (expectedValue === 'not null') {
      expect(returnedColumnValue).not.toBeNull();
    } else {
      expect(returnedColumnValue).toEqual(substituteValue(expectedValue));
    }
  },
);

Then(
  'I see table {string} column {string} is {string} where {string} = {string}',
  async function (
    this: ICustomWorld,
    table: string,
    column: string,
    expectedValue: string,
    whereColName1: string,
    whereColValue1: string,
  ) {
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    if (expectedValue === 'not null') {
      expect(returnedColumnValue).not.toBeNull();
    } else {
      expect(returnedColumnValue).toEqual(substituteValue(expectedValue));
    }
  },
);

Given(
  'I select column {string} from table {string} where {string} = {string}',
  async function (
    this: ICustomWorld,
    column: string,
    table: string,
    whereColName1: string,
    whereColValue1: string,
  ) {
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    cache.put(column, returnedColumnValue);
  },
);

Then(
  'I select column {string} from table {string} where {string} = {string} and {string} = {string}',
  async function (
    this: ICustomWorld,
    column: string,
    table: string,
    whereColName1: string,
    whereColValue1: string,
    whereColName2: string,
    whereColValue2: string,
  ) {
    const runQuery = async () => {
      const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}`;
      try {
        const returnedColumnValue = getSingleValueFromResult(result) as string | number;
        cache.put(column, returnedColumnValue);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return false;
      }
    };
    // if we check right away, sometimes the data isn't found ¯\_(ツ)_/¯
    // retry running the the query
    const done = await wait(runQuery, 200, 20);
    if (!done) {
      throw new Error(`Failed selecting column in scenario: ${this.testName}`);
    }
  },
);

Then(
  'I select column {string} from table {string} where {string} = {string} and {string} = {string} and {string} = {string}',
  async function (
    this: ICustomWorld,
    column: string,
    table: string,
    whereColName1: string,
    whereColValue1: string,
    whereColName2: string,
    whereColValue2: string,
    whereColName3: string,
    whereColValue3: string,
  ) {
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}
and ${sql.unsafe(whereColName3)} = ${substituteValue(whereColValue3)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    cache.put(column, returnedColumnValue);
  },
);

When(
  'I select column {string} from table {string} where {string} = {string} and {string} = {string} and {string} = {string} and {string} = {string}',
  async function (
    this: ICustomWorld,
    column: string,
    table: string,
    whereColName1: string,
    whereColValue1: string,
    whereColName2: string,
    whereColValue2: string,
    whereColName3: string,
    whereColValue3: string,
    whereColName4: string,
    whereColValue4: string,
  ) {
    const runQuery = async () => {
      const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}
and ${sql.unsafe(whereColName3)} = ${substituteValue(whereColValue3)}
and ${sql.unsafe(whereColName4)} = ${substituteValue(whereColValue4)}`;
      try {
        const returnedColumnValue = getSingleValueFromResult(result) as string | number;
        cache.put(column, returnedColumnValue);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return false;
      }
    };

    // if we check right away, sometimes the data isn't found ¯\_(ツ)_/¯
    // retry running the the query
    const done = await wait(runQuery, 200, 20);
    if (!done) {
      throw new Error(`Failed selecting column in scenario: ${this.testName}`);
    }
  },
);

Given(
  'that courthouse {string} case {string} does not exist',
  async function (this: ICustomWorld, courthouse: string, caseNumber: string) {
    const result: SqlResult = await sql`
select count(cas_id)
from ${sql.unsafe(tableName('COURTCASE'))}
where courthouse_name = ${substituteValue(courthouse)}
and case_number = ${substituteValue(caseNumber)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string;
    expect(parseInt(returnedColumnValue, 10)).toBe(0);
  },
);

Given(
  'I wait until there is not a daily list waiting for {string}',
  async function (this: ICustomWorld, courthouse: string) {
    const getDailyListNewCount = async () => {
      const result: SqlResult = await sql`
select count(dal_id)
from darts.daily_list
where UPPER(listing_courthouse) = UPPER(${courthouse})
and job_status = 'NEW'
and start_dt = ${DateTime.now().toFormat('y-MM-dd')}
    `;
      return getSingleValueFromResult(result) as string;
    };

    let dailyListWaiting = true;
    for (let i = 0; i < 10; i++) {
      const result = await getDailyListNewCount();
      if (parseInt(result, 10) === 0) {
        dailyListWaiting = false;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (dailyListWaiting) {
      throw new Error(`Daily list waiting to be processed for courthouse "${courthouse}"`);
    }
  },
);

When(
  'I wait for case {string} courthouse {string}',
  async function (this: ICustomWorld, caseNumber: string, courthouse: string) {
    const getCaseAtCourthouse = async (): Promise<null | string | number> => {
      const result: SqlResult = await sql`
select cas.case_number
from ${sql.unsafe(tableName('CASE_HEARING'))}
where cas.case_number = ${substituteValue(caseNumber)}
and cth.courthouse_name = ${substituteValue(courthouse)}
    `;
      try {
        return getSingleValueFromResult(result) as string;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return null;
      }
    };

    let resolved = false;
    for (let i = 0; i < 10; i++) {
      const result = await getCaseAtCourthouse();
      if (result === substituteValue(caseNumber)) {
        resolved = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    if (!resolved) {
      throw new Error(
        `Failed waiting for case "${substituteValue(caseNumber)}" at courthouse "${substituteValue(courthouse)}"`,
      );
    }
  },
);

Given(
  'I set table {string} column {string} to {string} where {string} = {string}',
  async function (
    this: ICustomWorld,
    table: string,
    column: string,
    value: string,
    whereColName1: string,
    whereColValue1: string,
  ) {
    await sql`
update ${sql.unsafe(tableName(table))}
set ${sql.unsafe(column)} = ${substituteValue(value)}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}`;
  },
);

interface AudioFileDataTable {
  user: string;
  courthouse: string;
  case_number: string;
  hearing_date: string;
}

When(
  'I wait for the requested audio file to be ready',
  { timeout: 60 * 1000 * 6 + 30000 }, // 6.5 minutes
  async function (this: ICustomWorld, dataTable: DataTable) {
    const audioFileData = dataTableToObject<AudioFileDataTable>(dataTable);
    const userCredentials = getDartsUserCredentials(audioFileData.user);

    const runQuery = async () => {
      const result: SqlResult = await sql`
select mer.request_status
from ${sql.unsafe(tableName('HEARING_MEDIA_REQUEST'))}
where courthouse_name = ${substituteValue(audioFileData.courthouse)}
and case_number = ${substituteValue(audioFileData.case_number)}
and hearing_date = ${substituteValue(audioFileData.hearing_date)}
and lower(user_email_address) = ${userCredentials.username}`;
      try {
        const requestStatus = getSingleValueFromResult(result) as string | number;
        if (requestStatus === 'COMPLETED') {
          return true;
        } else {
          console.log('Media request has status', requestStatus);
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return false;
      }
    };
    const done = await wait(runQuery, 30000, 15);
    if (!done) {
      throw new Error(`Failed selecting column in scenario: ${this.testName}`);
    }
  },
);
