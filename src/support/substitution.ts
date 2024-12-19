import { config } from './config';
import cache from 'memory-cache';
import { DateTime } from 'luxon';

const handleDate = (value: string, format?: string): string => {
  if (value.lastIndexOf('+') >= 0) {
    const plusDays = value.substring(value.lastIndexOf('+') + 1, value.indexOf('}}'));
    return DateTime.now()
      .plus({ days: plusDays as unknown as number })
      .toFormat(format ?? 'y-MM-dd');
  }

  if (value.lastIndexOf('-') >= 0) {
    const minusDays = value.substring(value.lastIndexOf('-') + 1, value.indexOf('}}'));
    return DateTime.now()
      .minus({ days: minusDays as unknown as number })
      .toFormat(format ?? 'y-MM-dd');
  }

  return DateTime.now().toFormat(format ?? 'y-MM-dd');
};

const handleDateTime = (value: string): string => {
  value = value.replace('{{db-timestamp-', '');
  value = value.replace('{{date-yyyymmdd-0}}', DateTime.now().toFormat('y-MM-dd'));
  value = value.replace('}}', '');
  return value;
};

// This stuff has been inherited from darts-automation.
// IMHO, it should be removed as it's breeding ground for bugs.
// I'd favour the tests being much more literal rather than having lots of magic like this.
export const substituteValue = (value: string): string | boolean => {
  if (['true', 'false', 'null'].includes(value)) {
    return JSON.parse(value);
  }
  // eg. {{date-0}} or {{date+0}} or {{date-yyyymmdd-0}}
  if (
    (value.startsWith('{{date-') ||
      value.startsWith('{{date+') ||
      value.startsWith('{{date-yyyymmdd-')) &&
    value.endsWith('}}')
  ) {
    return handleDate(value);
  }
  // eg. {{db-timestamp-{{date-yyyymmdd-0}} 10:00:01}}
  if (value.startsWith('{{db-timestamp-') && value.endsWith('}}')) {
    return handleDateTime(value);
  }
  // eg. {{yyyy-{{date-0}}}}
  if (value.startsWith('{{yyyy-') && value.endsWith('}}')) {
    return handleDate(value, 'y');
  }
  if (value.startsWith('{{mm-') && value.endsWith('}}')) {
    return handleDate(value, 'MM');
  }
  if (value.startsWith('{{dd-') && value.endsWith('}}')) {
    return handleDate(value, 'dd');
  }

  value =
    value.indexOf('{{yyyy-{{date-0}}}}') >= 0
      ? value.replaceAll('{{yyyy-{{date-0}}}}', handleDate('{{yyyy-{{date-0}}}}', 'y'))
      : value;
  value =
    value.indexOf('{{mm-{{date-0}}}}') >= 0
      ? value.replaceAll('{{mm-{{date-0}}}}', handleDate('{{mm-{{date-0}}}}', 'MM'))
      : value;
  value =
    value.indexOf('{{dd-{{date-0}}}}') >= 0
      ? value.replaceAll('{{dd-{{date-0}}}}', handleDate('{{dd-{{date-0}}}}', 'dd'))
      : value;
  value = value.replaceAll('{{date+0/}}', DateTime.now().toFormat('y-MM-dd'));
  value = value.replaceAll('{{timestamp}}', DateTime.now().toISO());

  value = value.replaceAll('{{cas.cas_id}}', cache.get('cas.cas_id'));
  value = value.replaceAll('{{eve_id}}', cache.get('eve_id'));
  value = value.replaceAll('{{eve.eve_id}}', cache.get('eve.eve_id'));
  value = value.replaceAll('{{hea_id}}', cache.get('hea_id'));
  value = value.replaceAll('{{jud_id}}', cache.get('jud_id'));

  if (value.startsWith('{{upper-case-')) {
    const upperCaseString = value.substring(
      value.indexOf('{{upper-case-') + 13,
      value.lastIndexOf('}}'),
    );
    return upperCaseString.replaceAll('{{seq}}', config.seq).toUpperCase();
  }

  return value.replaceAll('{{seq}}', config.seq);
};
