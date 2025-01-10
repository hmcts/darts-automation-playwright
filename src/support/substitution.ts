import { config } from './config';
import cache from 'memory-cache';
import { DateTime, Duration } from 'luxon';

const handleDate = (value: string, overrideFormat?: string): string => {
  let format = 'y-MM-dd';
  if (value.indexOf('/') >= 0) {
    value = value.replace('/', '');
    format = 'dd/MM/y';
  }
  if (value.lastIndexOf('+') >= 0) {
    const plusDays = value.substring(value.lastIndexOf('+') + 1, value.indexOf('}}'));
    return DateTime.now()
      .plus({ days: plusDays as unknown as number })
      .toFormat(overrideFormat ?? format);
  }

  if (value.lastIndexOf('-') >= 0) {
    const minusDays = value.substring(value.lastIndexOf('-') + 1, value.indexOf('}}'));
    return DateTime.now()
      .minus({ days: minusDays as unknown as number })
      .toFormat(overrideFormat ?? format);
  }

  return DateTime.now().toFormat(overrideFormat ?? format);
};

const handleDateTime = (value: string): string => {
  value = value.replace('{{db-timestamp-', '');
  value = value.replace('{{date-yyyymmdd-0}}', DateTime.now().toFormat('y-MM-dd'));
  value = value.replace('}}', '');
  return value;
};

const handleDuration = (value: string): Date | string => {
  const durationString = value.substring(value.lastIndexOf('-') + 1, value.indexOf('}}'));
  const durationParts = durationString.match(/(\d+)Y(\d+)M(\d+)D/);

  if (durationParts) {
    const years = parseInt(durationParts[1]);
    const months = parseInt(durationParts[2]);
    const days = parseInt(durationParts[3]);
    const duration = Duration.fromObject({ years, months, days });
    return DateTime.now().setZone('UTC').plus(duration).startOf('day').toJSDate();
  }
  return value;
};

// This stuff has been inherited from darts-automation.
// IMHO, it should be removed as it's breeding ground for bugs.
// I'd favour the tests being much more literal rather than having lots of magic like this.
export const substituteValue = (value: string): Date | number | string | boolean => {
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
  // eg. {{timestamp-10:00:00}}
  if (value.startsWith('{{timestamp-') && value.endsWith('}}')) {
    const time = value.substring(value.indexOf('{{timestamp-') + 12, value.indexOf('}}'));
    return `${DateTime.now().toFormat('y-MM-dd')} ${time}`;
  }
  if (value.startsWith('{{db-timestamp-') && value.endsWith('}}')) {
    // eg. {{db-timestamp-{{date-yyyymmdd-0}} 10:00:01}}
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
  // eg. {{retention-7Y0M0D}}
  if (value.startsWith('{{retention-')) {
    return handleDuration(value);
  }
  value =
    value.indexOf('{{yyyy-{{date-0}}}}') >= 0
      ? value.replaceAll('{{yyyy-{{date-0}}}}', handleDate('{{yyyy-{{date-0}}}}', 'y'))
      : value;
  value =
    value.indexOf('{{date-yyyy}}') >= 0
      ? value.replaceAll('{{date-yyyy}}', DateTime.now().toFormat('y'))
      : value;
  value =
    value.indexOf('{{date-mm}}') >= 0
      ? value.replaceAll('{{date-mm}}', DateTime.now().toFormat('MM'))
      : value;
  value =
    value.indexOf('{{date-dd}}') >= 0
      ? value.replaceAll('{{date-dd}}', DateTime.now().toFormat('dd'))
      : value;
  value =
    value.indexOf('{{mm-{{date-0}}}}') >= 0
      ? value.replaceAll('{{mm-{{date-0}}}}', handleDate('{{mm-{{date-0}}}}', 'MM'))
      : value;
  value =
    value.indexOf('{{dd-{{date-0}}}}') >= 0
      ? value.replaceAll('{{dd-{{date-0}}}}', handleDate('{{dd-{{date-0}}}}', 'dd'))
      : value;
  value = value.replaceAll('{{yyyymmdd}}', DateTime.now().toFormat('y-MM-dd'));
  value = value.replaceAll('{{dd/MM/y}}', DateTime.now().toFormat('dd/MM/y'));

  // {{displayDate0-{{date+1 years}}}}
  value = value.replaceAll(
    '{{displayDate0-{{date+1 years}}}}',
    DateTime.now().plus({ year: 1 }).toFormat('d MMM y'),
  );
  // {{displayDate0-{{date+7 years}}}}
  value = value.replaceAll(
    '{{displayDate0-{{date+7 years}}}}',
    DateTime.now().plus({ years: 7 }).toFormat('d MMM y'),
  );
  // {{displayDate0-{{date+8 years}}}}
  value = value.replaceAll(
    '{{displayDate0-{{date+8 years}}}}',
    DateTime.now().plus({ years: 8 }).toFormat('d MMM y'),
  );
  // {{displaydate0{{date+99years}}}}
  value = value.replaceAll(
    '{{displaydate0{{date+99years}}}}',
    DateTime.now().plus({ years: 99 }).toFormat('d MMM y'),
  );
  // {{displayDate0-{{date+99 years}}}}
  value = value.replaceAll(
    '{{displayDate0-{{date+99 years}}}}',
    DateTime.now().plus({ years: 99 }).toFormat('d MMM y'),
  );
  value = value.replaceAll('{{displaydate}}', DateTime.now().toFormat('d MMM y'));
  value = value.replaceAll('{{date+0/}}', DateTime.now().toFormat('y/MM/dd'));
  value = value.replaceAll('{{timestamp}}', DateTime.now().toISO());

  value = value.replaceAll('{{caseNumber}}', cache.get('caseNumber'));
  value = value.replaceAll('{{cas.cas_id}}', cache.get('cas.cas_id'));
  value = value.replaceAll('{{cas_id}}', cache.get('cas_id'));
  value = value.replaceAll('{{eve_id}}', cache.get('eve_id'));
  value = value.replaceAll('{{eve.eve_id}}', cache.get('eve.eve_id'));
  value = value.replaceAll('{{hea_id}}', cache.get('hea_id'));
  value = value.replaceAll('{{jud_id}}', cache.get('jud_id'));
  value = value.replaceAll('{{cmr_id}}', cache.get('cmr_id'));
  value = value.replaceAll('{{node_id}}', cache.get('node_id'));

  if (value.startsWith('{{upper-case-')) {
    const upperCaseString = value.substring(
      value.indexOf('{{upper-case-') + 13,
      value.lastIndexOf('}}'),
    );
    return upperCaseString.replaceAll('{{seq}}', config.seq).toUpperCase();
  }

  return value.replaceAll('{{seq}}', config.seq);
};
