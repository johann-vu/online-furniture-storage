// PocketBase dates look like "2026-10-23 21:21:05.387Z", which not every browser parses
export function parseDate(value: string): Date {
  return new Date(value.replace(' ', 'T'));
}

const pad = (n: number) => String(n).padStart(2, '0');

// dd.MM.yyyy
export function formatDate(value: string): string {
  const d = parseDate(value);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// "heute, 14:05", "gestern, 09:30" or "21.10.2026, 18:12"
export function formatDateTime(value: string): string {
  const d = parseDate(value);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === new Date().toDateString()) return `heute, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `gestern, ${time}`;
  return `${formatDate(value)}, ${time}`;
}

// whole calendar days from today until the date, 0 on the date itself
export function remainingDays(value: string): number {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // round, a daylight saving switch makes a day 23 or 25 hours long
  return Math.round((new Date(year, month - 1, day).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// offers that run out within this many days are marked as urgent
export const URGENT_DAYS = 7;

export function remainingDaysLabel(days: number): string {
  if (days < 0) return 'abgelaufen';
  if (days === 0) return 'läuft heute ab';
  return days === 1 ? 'noch 1 Tag' : `noch ${days} Tage`;
}
