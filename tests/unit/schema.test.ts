import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { profileSchema, toolSchema, workSchema } from '../../src/lib/schema';
import { fullProfile, growthEntry } from './fixtures';

const real = (name: string) => JSON.parse(readFileSync(`src/data/${name}`, 'utf8'));

test('accepts the real profile', () => {
  expect(() => profileSchema.parse(real('profile.json'))).not.toThrow();
});

test('rejects a whatsapp number with a plus sign', () => {
  const bad = { ...fullProfile, contact: { ...fullProfile.contact, whatsapp: '+8801000000000' } };
  expect(profileSchema.safeParse(bad).success).toBe(false);
});

test('requires a result for growth work', () => {
  expect(workSchema.safeParse({ ...growthEntry, result: null }).success).toBe(false);
  expect(workSchema.safeParse(growthEntry).success).toBe(true);
});

describe('accepts every real tool', () => {
  test('tools', () => {
    for (const tool of real('tools.json')) expect(() => toolSchema.parse(tool)).not.toThrow();
  });
});

test('the full photo is an image file, or not set yet', () => {
  expect(profileSchema.safeParse({ ...fullProfile, photoFull: null }).success).toBe(true);
  expect(profileSchema.safeParse({ ...fullProfile, photoFull: 'mahi-full.jpg' }).success).toBe(true);
  expect(profileSchema.safeParse({ ...fullProfile, photoFull: 'mahi-full.gif' }).success).toBe(false);
});
