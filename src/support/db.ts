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

const EVENT_JOIN = `
darts.court_case cas
left join darts.hearing hea on hea.cas_id = cas.cas_id
left join darts.hearing_event_ae he on he.hea_id = hea.hea_id
left join darts.event eve on eve.eve_id = he.eve_id
left join darts.event_handler evh on evh.evh_id = eve.evh_id
left join darts.courtroom ctr on ctr.ctr_id = hea.ctr_id
left join darts.courthouse cth on ctr.cth_id = cth.cth_id
`;

export const tableName = (tableName: string): string => {
  switch (tableName) {
    case 'COURTCASE':
      return COURT_CASE_JOIN;
    case 'CASE_JUDGE':
      return CASE_JUDGE_JOIN;
    case 'EVENT':
      return EVENT_JOIN;
    default:
      return tableName;
  }
};

export const getSingleValueFromResult = (result: SqlResult): string | number => {
  if (result.length === 0) {
    throw new Error('Single value result expected, none found');
  }
  return result[0][Object.keys(result[0])[0]];
};
