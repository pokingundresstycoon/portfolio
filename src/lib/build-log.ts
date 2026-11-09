const DAY_MS = 86_400_000;
const MONTH_DAYS = 365.25 / 12;

/** Whole months from `start` (YYYY-MM-DD) to `now`, rounded to the nearest month. */
export function monthsSince(start: string, now: Date = new Date()): number {
  return Math.round((now.getTime() - Date.parse(start)) / DAY_MS / MONTH_DAYS);
}
