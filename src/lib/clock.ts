const DHAKA = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** The time in Dhaka as HH:MM on a 24-hour clock, the way a departures board shows it. */
export function dhakaTime(date: Date): string {
  return DHAKA.format(date);
}

/** Milliseconds from `now` until the next minute begins. Dhaka is a whole six hours ahead of UTC,
 * so its minutes turn over with UTC's. */
export function msToNextMinute(now: number): number {
  return 60_000 - (now % 60_000);
}
