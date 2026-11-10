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

test('About shows the real photo, small and light, and it cannot be dragged off the page', async () => {
  const { statSync } = await import('node:fs');
  const { DIST } = await import('./dist');
  const img = html.match(/<img\b[^>]*alt="Mushfikur Rahman"[^>]*>/)?.[0];
  expect(img, 'the photo is on the page').toBeTruthy();
  const src = img!.match(/\ssrc="([^"]+)"/)![1];
  expect(src).toMatch(/^\/_astro\/.+\.webp$/);
  expect(img).toContain('loading="lazy"');
  expect(img, 'the photo cannot be dragged off the page').toContain('draggable="false"');
  expect(statSync(`${DIST}${src}`).size, 'photo bytes').toBeLessThan(40_000);
  expect(html).not.toContain('Your photo');
});

test('the whole picture for the pop-up ships as a light WebP', async () => {
  const { statSync } = await import('node:fs');
  const { DIST } = await import('./dist');
  const img = html.match(/<img\b[^>]*alt="Mushfikur Rahman, chin resting on one hand"[^>]*>/)?.[0];
  expect(img, 'the full photo is in the pop-up').toBeTruthy();
  const src = img!.match(/\ssrc="([^"]+)"/)![1];
  expect(src).toMatch(/^\/_astro\/.+\.webp$/);
  expect(img).toContain('draggable="false"');
  expect(statSync(`${DIST}${src}`).size, 'full photo bytes').toBeLessThan(200_000);
});

// Phone photos carry the camera, the time and where they were taken. None of that ships.
test('no image on the site carries hidden photo data, and no original photo ships', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { DIST } = await import('./dist');
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
  const images = walk(DIST).filter((p) => /\.(jpe?g|png|webp|avif)$/i.test(p));
  expect(images.filter((p) => /IMG_\d+/i.test(p) || /\.jpe?g$/i.test(p))).toEqual([]);
  const withData = images.filter((p) => {
    const bytes = readFileSync(p);
    return bytes.includes('Exif') || bytes.includes('EXIF') || bytes.includes('GPS');
  });
  expect(withData).toEqual([]);
});
