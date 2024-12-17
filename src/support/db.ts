import postgres from 'postgres';

import { config } from './config';

export type SqlResult = Record<string, string | number>[];

const sql = postgres({
  host: config.database.HOST,
  port: config.database.PORT as number,
  database: config.database.DATABASE,
  username: config.database.USERNAME,
  password: config.database.PASSWORD,
  ssl: ['localhost', '127.0.0.1'].includes(config.database.HOST) ? false : true,
  debug: process.env.DEBUG_DATABASE ? console.log : undefined,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export default sql;

const COURT_CASE_JOIN = `
darts.court_case cas
join darts.courthouse cth on cth.cth_id = cas.cth_id
`;

const CASE_JUDGE_JOIN = `
darts.courthouse cth
join darts.court_case cas using (cth_id)
left join darts.case_judge_ae using (cas_id)
join darts.judge jud using (jud_id)
`;

export const tableName = (tableName: string): string => {
  switch (tableName) {
    case 'COURTCASE':
      return COURT_CASE_JOIN;
    case 'CASE_JUDGE':
      return CASE_JUDGE_JOIN;
    default:
      return tableName;
  }
};

export const getSingleValueFromResult = (result: SqlResult): string | number =>
  result[0][Object.keys(result[0])[0]];
