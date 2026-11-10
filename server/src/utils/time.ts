import { DateTime, IANAZone } from 'luxon';

export function nowUTC(): DateTime {
  return DateTime.utc();
}

export function toUserZone(date: Date | string | DateTime, tz = 'Asia/Kolkata'): DateTime {
  if (date instanceof DateTime) {
    return date.setZone(tz);
  }
  if (typeof date === 'string') {
    return DateTime.fromISO(date, { zone: 'utc' }).setZone(tz);
  }
  return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(tz);
}

export function formatISO(date: Date | DateTime): string {
  if (date instanceof DateTime) {
    return date.toUTC().toISO() ?? '';
  }
  return DateTime.fromJSDate(date, { zone: 'utc' }).toISO() ?? '';
}

export function isValidTimezone(tz: string): boolean {
  if (!tz) return false;
  return IANAZone.isValidZone(tz);
}
