import { describe, expect, test } from 'vitest';
import { htmlFiles, readDist, visibleText } from './dist';

const pages = htmlFiles();

test('there are pages to check', () => {
  expect(pages).toContain('index.html');
});

test('no favicon file is shipped', async () => {
  const { existsSync } = await import('node:fs');
  const { DIST } = await import('./dist');
  expect(existsSync(`${DIST}/favicon.svg`)).toBe(false);
});

describe.each(pages)('%s', (page) => {
  const html = readDist(page);

  test('no inline scripts', () => {
    const scripts = html.match(/<script\b[^>]*>/gi) ?? [];
    for (const tag of scripts) expect(tag).toMatch(/\ssrc="/);
  });

  test('no style elements or attributes', () => {
    expect(html).not.toMatch(/<style[\s>]/i);
    expect(html).not.toMatch(/<[^>]*\sstyle=/i);
  });

  test('no inline handlers', () => {
    expect(html).not.toMatch(/<[^>]*\son[a-z]+=/i);
  });

  test('no favicon', () => {
    expect(html).not.toMatch(/<link\b[^>]*\brel="(shortcut )?icon"/i);
  });

  test('no Google Fonts', () => {
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });

  test('no forbidden words or links', () => {
    const lower = html.toLowerCase();
    for (const banned of ['devops', 'manage ads', 'dash.paperbase.me', 'demo-shop.paperbase.me', 'discord', 'https://paperbase.me']) {
      expect(lower, banned).not.toContain(banned);
    }
  });

  // "Shared" reads as cheap, like shared hosting; the platform is one platform, not a shared one.
  test('never calls the work "shared"', () => {
    expect(visibleText(html)).not.toMatch(/\bshared\b/i);
  });

  test('no placeholders', () => {
    expect(visibleText(html)).not.toMatch(/\[[A-Z][^\]]{0,20}\]/);
  });
});

test('no colour from the old navy and orange palette is left in the built pages or styles', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { DIST } = await import('./dist');
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
  const old = ['0b1747', '16245f', 'e9edff', 'ff5b1f', 'ffa477', 'c3ccf5', '46507a', 'c9d0f0', '1a2766', '141f57', '060d2e', '3b4ba0', 'ff8a5b', 'd9450f', '7c86b2', '050a26', '03071e', '233, 237, 255', '255, 91, 31', '5, 10, 38', '3, 7, 30'];
  const found = walk(DIST)
    .filter((p) => /\.(css|html)$/.test(p))
    .flatMap((p) => {
      const text = readFileSync(p, 'utf8').toLowerCase().replace(/,\s*/g, ', ');
      return old.filter((c) => text.includes(c)).map((c) => `${c} in ${p}`);
    });
  expect(found).toEqual([]);
});
