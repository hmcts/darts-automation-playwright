import { type CreatedHearing } from './case';

export interface SearchableHearing extends CreatedHearing {
  keywords: string;
}
