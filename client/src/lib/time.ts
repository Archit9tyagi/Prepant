import { DateTime } from 'luxon';

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

export function formatDateTime(iso: string, tz = getUserTimezone()): string {
  return (
    DateTime.fromISO(iso, { zone: 'utc' }).setZone(tz).toFormat('d LLL yyyy, h:mm a (ZZZZ)') || ''
  );
}

export function formatDate(iso: string, tz = getUserTimezone()): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).setZone(tz).toFormat('d LLL yyyy') || '';
}

export function formatTime(iso: string, tz = getUserTimezone()): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).setZone(tz).toFormat('h:mm a') || '';
}

export function getRelativeTime(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).toRelative() || '';
}

export function formatTimezone(tz: string): string {
  const dt = DateTime.now().setZone(tz);
  return `${tz} (GMT${dt.toFormat('ZZ')})`;
}
