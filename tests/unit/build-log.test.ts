import { expect, test } from 'vitest';
import { monthsSince } from '../../src/lib/build-log';
import { loadBuildLog } from '../../src/lib/load';

test('counts months to the nearest whole month', () => {
  expect(monthsSince('2026-03-16', new Date('2026-11-08T12:00:00Z'))).toBe(8);
  expect(monthsSince('2026-03-16', new Date('2026-03-20T00:00:00Z'))).toBe(0);
  expect(monthsSince('2026-03-16', new Date('2027-03-16T00:00:00Z'))).toBe(12);
});

test('the real build log parses, every milestone dated and told', () => {
  const log = loadBuildLog();
  expect(log.milestones.length).toBeGreaterThanOrEqual(5);
  for (const m of log.milestones) {
    expect(m.when, m.title).not.toBe('');
    expect(m.text, m.title).not.toBe('');
  }
});
