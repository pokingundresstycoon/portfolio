import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { DIST, distBytes, htmlFiles, readDist } from './dist';

test('the PDF profile is built, small, and exactly one page, as the site promises', () => {
  expect(existsSync(join(DIST, 'mushfikur-rahman-profile.pdf'))).toBe(true);
  const pdf = distBytes('mushfikur-rahman-profile.pdf');
  expect(pdf.length).toBeLessThanOrEqual(500 * 1024);
  expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? [];
  expect(pages).toHaveLength(1);
});

test('no CV ships with the site', () => {
  expect(existsSync(join(DIST, 'mushfikur-rahman-cv.pdf'))).toBe(false);
});

test('the share image is 1200×630', () => {
  const png = distBytes('og.png');
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test.each(htmlFiles())('%s has an absolute share image', (page) => {
  const tag = readDist(page).match(/<meta[^>]*property="og:image"[^>]*>/)?.[0] ?? '';
  expect(tag).toMatch(/content="https:\/\/[^"]+\/og\.png"/);
});
