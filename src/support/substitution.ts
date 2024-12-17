import { config } from './config';
import cache from 'memory-cache';

export const substituteValue = (value: string): string | boolean => {
  if (['true', 'false'].includes(value)) {
    return JSON.parse(value);
  }
  value = value.replace('{{cas.cas_id}}', cache.get('cas.cas_id'));
  return value.replace('{{seq}}', config.seq);
};
