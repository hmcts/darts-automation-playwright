import { randomInt, randomUUID } from 'node:crypto';

export interface TestCaseData {
  number: string;
  courthouse: string;
  courthouseDisplayName: string;
  courtroom: string;
  defendant: string;
  judge: string;
  timestamp: string;
  messageId: string;
  eventId: string;
}

export interface CreatedCase extends TestCaseData {
  id: number;
}

export interface CreatedHearing extends CreatedCase {
  hearingId: number;
}

export function newCaseData(
  courthouse: { name: string; displayName: string },
  courtroom: string,
): TestCaseData {
  const id = randomUUID().replaceAll('-', '').toUpperCase();
  return {
    // /events limits case_numbers to 25 characters, even though /cases/addCase accepts more.
    number: `PW-${id.slice(0, 22)}`,
    courthouse: courthouse.name,
    courthouseDisplayName: courthouse.displayName,
    courtroom,
    defendant: `PW defendant ${id.slice(0, 12)}`,
    judge: `PW JUDGE ${id.slice(0, 12)}`,
    timestamp: new Date().toISOString(),
    messageId: randomUUID(),
    // The API stores source event IDs as signed 32-bit integers, despite its string contract.
    eventId: String(randomInt(1, 2_147_483_647)),
  };
}
