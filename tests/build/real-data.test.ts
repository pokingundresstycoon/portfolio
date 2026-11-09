import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { readDist } from './dist';

// dist/ is only written by the real build, from src/data.
const profile = JSON.parse(readFileSync('src/data/profile.json', 'utf8'));
const faq = JSON.parse(readFileSync('src/data/faq.json', 'utf8'));
const tools = JSON.parse(readFileSync('src/data/tools.json', 'utf8'));
const html = readDist('index.html');

test.skipIf(profile.contact.whatsapp)('no WhatsApp contact link while the number is unset', () => {
  expect(html).not.toMatch(/href="https:\/\/wa\.me\/\d/);
});

test.skipIf(profile.contact.telegram)('no Telegram link while the handle is unset', () => {
  expect(html).not.toContain('https://t.me/');
});

test('the gates use the real email, number and handle', () => {
  expect(html).toContain('href="mailto:mushfikurahmaan@gmail.com"');
  expect(html).toContain('href="https://wa.me/8801601571480"');
  expect(html).toContain('href="tel:+8801601571480"');
  expect(html).toContain('href="https://t.me/decayedusk"');
  expect(html).not.toContain('hello@mushfikurahmaan.com');
});

test('the PDF lists the real email, and the number once for phone and WhatsApp', () => {
  const pdf = readDist('profile/index.html');
  expect(pdf).toContain('mushfikurahmaan@gmail.com');
  expect(pdf).toContain('Phone and WhatsApp +880 1601-571480');
  expect(pdf).not.toContain('hello@mushfikurahmaan.com');
});

test('there is no Messenger link anywhere', () => {
  expect(html).not.toContain('https://m.me/');
});

test.skipIf(faq.length > 0)('no FAQ section while there are no answers', () => {
  expect(html).not.toContain('id="faq"');
});

test('the PDF page names every tool of every maker', () => {
  const pdf = readDist('profile/index.html');
  const names: string[] = tools.flatMap((m: { tools: string[] }) => m.tools);
  expect(names.length).toBeGreaterThanOrEqual(23);
  for (const name of names) expect(pdf, name).toContain(name);
});
