import { expect, test } from 'vitest';
import { dhakaTime, msToNextMinute } from '../../src/lib/clock';

test('reads the time in Dhaka, six hours ahead of UTC', () => {
  expect(dhakaTime(new Date('2026-11-08T04:42:30Z'))).toBe('10:42');
});

test('runs on a 24-hour clock, through midnight', () => {
  expect(dhakaTime(new Date('2026-11-08T13:30:00Z'))).toBe('19:30');
  expect(dhakaTime(new Date('2026-11-08T18:05:00Z'))).toBe('00:05');
});

test('counts the wait until the next minute begins', () => {
  expect(msToNextMinute(Date.UTC(2026, 10, 8, 4, 42, 30, 250))).toBe(29_750);
  expect(msToNextMinute(Date.UTC(2026, 10, 8, 4, 42, 0, 0))).toBe(60_000);
});
