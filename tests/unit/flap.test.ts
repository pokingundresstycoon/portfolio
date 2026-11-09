import { expect, test } from 'vitest';
import { FLAP_ALPHABET, rollSequence } from '../../src/lib/flap';

test('a roll ends on the target letter after the given number of steps', () => {
  const seq = rollSequence('S', 6, () => 0.5);
  expect(seq).toHaveLength(6);
  expect(seq.at(-1)).toBe('S');
});

test('the letters before the target come from the flap alphabet', () => {
  const seq = rollSequence('A', 8, () => 0.99);
  for (const ch of seq.slice(0, -1)) expect(FLAP_ALPHABET).toContain(ch);
});

test('a blank flap stays blank, with no roll', () => {
  expect(rollSequence(' ', 6)).toEqual([' ']);
});
