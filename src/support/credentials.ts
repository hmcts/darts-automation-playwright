import { config } from './config';

export interface DartsUserCredential {
  username: string;
  password: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'API';
  role?: string;
}

export interface ExternalServiceUserCredential {
  username: string;
  password: string;
  useToken: boolean;
}

const externalServiceUserCredentials: Record<string, ExternalServiceUserCredential> = {
  VIQ: {
    username: config.usernames.VIQ_USERNAME!,
    password: config.passwords.VIQ_PASSWORD!,
    useToken: false,
  },
  XHIBIT: {
    username: config.usernames.XHIBIT_USERNAME!,
    password: config.passwords.XHIBIT_PASSWORD!,
    useToken: true,
  },
  CPP: {
    username: config.usernames.CPP_USERNAME!,
    password: config.passwords.CPP_PASSWORD!,
    useToken: true,
  },
};

const dartsUserCredentials: Record<string, DartsUserCredential> = {
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
  ROPC_GLOBAL: {
    username: config.usernames.FUNC_TEST_ROPC_GLOBAL_USERNAME!,
    password: config.passwords.FUNC_TEST_ROPC_GLOBAL_PASSWORD!,
    type: 'API',
  },
};

export type DartsUserTypes = keyof typeof externalServiceUserCredentials;

export const getDartsUserCredentials = (
  userType: keyof typeof dartsUserCredentials,
): DartsUserCredential => dartsUserCredentials[userType.toUpperCase()];

export type ExternalServiceUserTypes = keyof typeof externalServiceUserCredentials;

export const getExternalUserCredentials = (
  userType: keyof typeof externalServiceUserCredentials,
): ExternalServiceUserCredential => externalServiceUserCredentials[userType.toUpperCase()];
