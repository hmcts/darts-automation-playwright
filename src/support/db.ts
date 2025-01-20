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

const CASE_HEARING_JOIN = `
darts.courthouse cth
join darts.courtroom ctr using (cth_id)
join darts.hearing hea using (ctr_id)
join darts.court_case cas using (cas_id)
`;

const CASE_HEARING_JUDGE_JOIN = `
darts.courthouse cth
join darts.courtroom ctr using(cth_id)
join darts.hearing hea using (ctr_id)
join darts.court_case cas using (cas_id)
left join darts.hearing_judge_ae using (hea_id)
join darts.judge jud using (jud_id)
`;

const CASE_MANAGEMENT_RETENTION_JOIN = `
darts.case_management_retention cmr
join darts.retention_policy_type rpt using(rpt_id)
`;

const CASE_RETENTION_JOIN = `
darts.case_retention car
join darts.retention_policy_type rpt using(rpt_id)
`;

const CASE_TRANSCRIPTION_JOIN = `
darts.court_case cas
left join darts.hearing hea using(cas_id)
join darts.courtroom ctr using(ctr_id)
left join darts.courthouse cth on ctr.cth_id = cth.cth_id
left join darts.hearing_transcription_ae using(hea_id)
left join darts.transcription tra using(tra_id)
left join darts.transcription_status trs using (trs_id)
left join darts.transcription_urgency tru using (tru_id)
left join darts.transcription_type trt using (trt_id)
`;

const NODE_REGISTER_JOIN = `
darts.node_register
left join darts.courtroom using(ctr_id)
left join darts.courthouse using(cth_id)
`;

const HEARING_MEDIA_REQUEST_JOIN = `
darts.court_case cas
join darts.hearing hea using (cas_id)
join darts.courtroom ctr using (ctr_id)
join darts.courthouse cth on ctr.cth_id = cth.cth_id
left join darts.media_request mer using (hea_id)
left join darts.user_account usr on usr.usr_id = mer.requestor
`;

const CASE_AUDIO_JOIN = `
darts.courthouse cth
join darts.courtroom ctr using(cth_id)
join darts.hearing hea using (ctr_id)
join darts.court_case cas using (cas_id)
join darts.hearing_media_ae hm using (hea_id)
left join darts.media med using (med_id)
`;

const USER_GROUP_JOIN = `
darts.user_account
left join darts.security_group_user_account_ae using(usr_id)
left join darts.security_group using(grp_id)
`;

export const tableName = (tableName: string): string => {
  switch (tableName) {
    case 'COURTCASE':
      return COURT_CASE_JOIN;
    case 'CASE_JUDGE':
      return CASE_JUDGE_JOIN;
    case 'EVENT':
      return EVENT_JOIN;
    case 'CASE_HEARING':
      return CASE_HEARING_JOIN;
    case 'CASE_HEARING_JUDGE':
      return CASE_HEARING_JUDGE_JOIN;
    case 'CASE_MANAGEMENT_RETENTION':
      return CASE_MANAGEMENT_RETENTION_JOIN;
    case 'CASE_RETENTION':
      return CASE_RETENTION_JOIN;
    case 'CASE_TRANSCRIPTION':
      return CASE_TRANSCRIPTION_JOIN;
    case 'NODE_REGISTER':
      return NODE_REGISTER_JOIN;
    case 'HEARING_MEDIA_REQUEST':
      return HEARING_MEDIA_REQUEST_JOIN;
    case 'CASE_AUDIO':
      return CASE_AUDIO_JOIN;
    case 'USER_GROUP':
      return USER_GROUP_JOIN;
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
