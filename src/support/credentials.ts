import { config } from './config';

export interface UserCredentials {
  username: string;
  password: string;
  type: 'INTERNAL' | 'EXTERNAL';
  role: string;
}

const credentials: Record<string, UserCredentials> = {
  EXTERNAL: {
    username: 'dartsautomationuser@HMCTS.net',
    password: config.passwords.AUTOMATION_PASSWORD!,
    type: 'EXTERNAL',
    role: 'EXTERNAL',
  },
  REQUESTER: {
    username: 'darts.requester@hmcts.net',
    password: config.passwords.AUTOMATION_INTERNAL_PASSWORD!,
    type: 'INTERNAL',
    role: 'REQUESTER',
  },
  APPROVER: {
    username: 'darts.approver@hmcts.net',
    password: config.passwords.AUTOMATION_INTERNAL_PASSWORD!,
    type: 'INTERNAL',
    role: 'APPROVER',
  },
  REQUESTERAPPROVER: {
    username: 'darts.requester.approver@hmcts.net',
    password: config.passwords.AUTOMATION_REQUESTER_APPROVER_PASSWORD!,
    type: 'INTERNAL',
    role: 'REQUESTERAPPROVER',
  },
  JUDGE: {
    username: 'darts.judge@hmcts.net',
    password: config.passwords.AUTOMATION_INTERNAL_PASSWORD!,
    type: 'INTERNAL',
    role: 'JUDGE',
  },
  APPEALCOURT: {
    username: 'darts.appealcourt@hmcts.net',
    password: config.passwords.AUTOMATION_INTERNAL_PASSWORD!,
    type: 'INTERNAL',
    role: 'APPEALCOURT',
  },
  TRANSCRIBER: {
    username: 'darts.transcriber@hmcts.net',
    password: config.passwords.AUTOMATION_EXTERNAL_PASSWORD!,
    type: 'EXTERNAL',
    role: 'TRANSCRIBER',
  },
  LANGUAGESHOP: {
    username: 'darts.languageshop@hmcts.net',
    password: config.passwords.AUTOMATION_EXTERNAL_PASSWORD!,
    type: 'EXTERNAL',
    role: 'LANGUAGESHOP',
  },
  ADMIN: {
    username: 'darts.admin@hmcts.net',
    password: config.passwords.AUTOMATION_EXTERNAL_PASSWORD!,
    type: 'EXTERNAL',
    role: 'ADMIN',
  },
  SUPERUSER: {
    username: 'darts.superuser@hmcts.net',
    password: config.passwords.AUTOMATION_EXTERNAL_PASSWORD!,
    type: 'EXTERNAL',
    role: 'SUPERUSER',
  },
};

export const getCredentials = (userType: string): UserCredentials => {
  return credentials[userType.toUpperCase()];
};
