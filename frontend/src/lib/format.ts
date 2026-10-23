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

// dd.MM HH:mm
export function formatDateTime(value: string): string {
  const d = parseDate(value);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function remainingDays(value: string): number {
  const diff = parseDate(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
