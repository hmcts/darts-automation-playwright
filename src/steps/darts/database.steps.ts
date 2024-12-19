import { ICustomWorld } from '../../support/custom-world';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import cache from 'memory-cache';
import sql, { tableName, getSingleValueFromResult, type SqlResult } from '../../support/db';
import { substituteValue } from '../../support/substitution';
import { DateTime } from 'luxon';

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
    expect(returnedColumnValue).toBe(substituteValue(expectedValue));
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
    expect(returnedColumnValue).toBe(substituteValue(expectedValue));
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
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    cache.put(column, returnedColumnValue);
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
    // if this is removed, the data isn't found ¯\_(ツ)_/¯
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result: SqlResult = await sql`
select ${sql.unsafe(column)}
from ${sql.unsafe(tableName(table))}
where ${sql.unsafe(whereColName1)} = ${substituteValue(whereColValue1)}
and ${sql.unsafe(whereColName2)} = ${substituteValue(whereColValue2)}
and ${sql.unsafe(whereColName3)} = ${substituteValue(whereColValue3)}
and ${sql.unsafe(whereColName4)} = ${substituteValue(whereColValue4)}`;

    const returnedColumnValue = getSingleValueFromResult(result) as string | number;
    cache.put(column, returnedColumnValue);
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
