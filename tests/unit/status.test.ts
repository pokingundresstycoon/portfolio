import { expect, test } from 'vitest';
import { parseSummary } from '../../src/lib/status';

const NOW = 1_794_122_005;
const summary = (overall: string, at = NOW - 30) => ({ overall, at, parts: [], incidents: [], maintenance: [] });

test('a fresh operational summary', () => {
  expect(parseSummary(summary('operational'), NOW)).toEqual({ level: 'operational', text: 'all systems operational' });
});

test.each([
  ['degraded', 'some parts are slow'],
  ['partial', 'partial outage'],
  ['major', 'major outage'],
  ['maintenance', 'planned maintenance'],
])('%s reads "%s"', (level, text) => {
  expect(parseSummary(summary(level), NOW)).toEqual({ level, text });
});

test('a summary more than 10 minutes old is ignored', () => {
  expect(parseSummary(summary('operational', NOW - 601), NOW)).toBeNull();
  expect(parseSummary(summary('operational', NOW - 600), NOW)).not.toBeNull();
});

test.each([['unknown'], ['toString'], ['']])('overall "%s" is ignored', (overall) => {
  expect(parseSummary(summary(overall), NOW)).toBeNull();
});

test.each([[null], [{}], ['operational'], [{ overall: 'operational' }], [{ overall: 'operational', at: '1794122000' }]])(
  'malformed input %j is ignored',
  (input) => {
    expect(parseSummary(input, NOW)).toBeNull();
  },
);
