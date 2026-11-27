import { randomUUID } from 'node:crypto';

export interface NewUserDetails {
  fullName: string;
  email: string;
  description: string;
}

export function newUserDetails(): NewUserDetails {
  const id = randomUUID().replaceAll('-', '');
  return {
    fullName: `PW User ${id}`,
    // example.com is reserved for examples and passes the API's real-TLD email validation.
    email: `pw-e2e-${id}@example.com`,
    description: `PW test user ${id}`,
  };
}
