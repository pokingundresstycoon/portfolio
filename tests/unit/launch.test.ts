import { expect, test } from 'vitest';
import { launchProblems } from '../../src/lib/launch';
import { fullProfile, growthEntry, infraEntry } from './fixtures';

test('a complete profile with a growth story is ready', () => {
  expect(launchProblems(fullProfile, [infraEntry, growthEntry])).toEqual([]);
});

test('lists every missing piece, in order', () => {
  const bare = {
    ...fullProfile,
    photo: null,
    contact: { ...fullProfile.contact, whatsapp: null, telegram: null },
  };
  expect(launchProblems(bare, [infraEntry])).toEqual([
    'Missing profile photo',
    'Missing WhatsApp number',
    'Missing Telegram handle',
    'No growth story yet',
  ]);
});
