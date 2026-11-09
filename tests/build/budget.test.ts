import { gzipSync } from 'node:zlib';
import { expect, test } from 'vitest';
import { distBytes, homeAssets } from './dist';

const gz = (path: string) => gzipSync(distBytes(path), { level: 9 }).length;

test('home first load ≤ 100 KB', () => {
  const a = homeAssets();
  const total =
    gz(a.html) +
    a.css.reduce((n, p) => n + gz(p), 0) +
    a.js.reduce((n, p) => n + gz(p), 0) +
    a.fonts.reduce((n, p) => n + distBytes(p).length, 0);
  expect(total).toBeLessThanOrEqual(102400);
});

test('JS ≤ 15 KB', () => {
  const js = homeAssets().js.reduce((n, p) => n + gz(p), 0);
  expect(js).toBeLessThanOrEqual(15360);
});
