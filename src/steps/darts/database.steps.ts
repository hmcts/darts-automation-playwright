import { ICustomWorld } from '../../support/custom-world';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import cache from 'memory-cache';
import sql, { tableName, getSingleValueFromResult, type SqlResult } from '../../support/db';
import { substituteValue } from '../../support/substitution';

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
    expect(returnedColumnValue).toBe(expectedValue);
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
    // wrapped in a string to also perform boolean checks
    expect(`${returnedColumnValue}`).toBe(expectedValue);
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
    // TODO: this isn't getting a result when it should be, it fails when joining case -> hearing
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
