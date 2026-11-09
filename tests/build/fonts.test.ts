import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { DIST, distBytes, homeAssets, readDist } from './dist';

const LIMITS: Record<string, number> = {
  'fonts/archivo-condensed-900.woff2': 25 * 1024,
  'fonts/manrope.woff2': 40 * 1024,
  'fonts/taka-900.woff2': 4 * 1024,
};

test.each(Object.entries(LIMITS))('%s exists within its size limit', (path, limit) => {
  expect(existsSync(join(DIST, path))).toBe(true);
  expect(distBytes(path).length).toBeLessThanOrEqual(limit);
});

test('the home page preloads the two text fonts', () => {
  const html = readDist('index.html');
  for (const font of ['archivo-condensed-900.woff2', 'manrope.woff2']) {
    const tag = html.match(new RegExp(`<link[^>]*href="/fonts/${font}"[^>]*>`))?.[0] ?? '';
    expect(tag, font).toMatch(/rel="preload"/);
    expect(tag, font).toMatch(/as="font"/);
    expect(tag, font).toMatch(/type="font\/woff2"/);
    expect(tag, font).toMatch(/crossorigin/);
  }
});

test('the CSS declares all three faces, swapping, with Taka only for ৳', () => {
  const css = homeAssets().css.map(readDist).join('\n');
  const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
  expect(faces).toHaveLength(3);
  for (const face of faces) expect(face).toMatch(/font-display:\s*swap/);
  const taka = faces.find((f) => f.includes('taka-900.woff2')) ?? '';
  expect(taka).toMatch(/unicode-range:\s*u\+0?9f3/i);
});
