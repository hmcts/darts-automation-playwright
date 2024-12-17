import { ICustomWorld } from '../../support/custom-world';
import { Given, Then } from '@cucumber/cucumber';
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
