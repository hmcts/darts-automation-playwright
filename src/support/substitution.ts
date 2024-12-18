import { config } from './config';
import cache from 'memory-cache';
import { DateTime } from 'luxon';

const handleDate = (_: string, format?: string): string => {
  // only working with current date
  return DateTime.now().toFormat(format ?? 'y-MM-dd');
};

const handleDateTime = (value: string): string => {
  value = value.replace('{{db-timestamp-', '');
  value = value.replace('{{date-yyyymmdd-0}}', DateTime.now().toFormat('y-MM-dd'));
  value = value.replace('}}', '');
  return value;
};

export const substituteValue = (value: string): string | boolean => {
  if (['true', 'false'].includes(value)) {
    return JSON.parse(value);
  }
  // eg. {{date-0}}
  if (value.startsWith('{{date-')) {
    return handleDate(value);
  }
  // eg. {{db-timestamp-{{date-yyyymmdd-0}} 10:00:01}}
  if (value.startsWith('{{db-timestamp-')) {
    return handleDateTime(value);
  }
  // eg. {{yyyy-{{date-0}}}}
  if (value.startsWith('{{yyyy-')) {
    return handleDate(value, 'y');
  }
  if (value.startsWith('{{mm-')) {
    return handleDate(value, 'MM');
  }
  if (value.startsWith('{{dd-')) {
    return handleDate(value, 'dd');
  }

  value = value.replaceAll('{{yyyy-{{date-0}}}}', handleDate(value, 'y'));
  value = value.replaceAll('{{mm-{{date-0}}}}', handleDate(value, 'MM'));
  value = value.replaceAll('{{dd-{{date-0}}}}', handleDate(value, 'dd'));

  value = value.replaceAll('{{cas.cas_id}}', cache.get('cas.cas_id'));
  value = value.replaceAll('{{eve_id}}', cache.get('eve_id'));
  return value.replaceAll('{{seq}}', config.seq);
};
