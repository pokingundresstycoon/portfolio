import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

type Rule = { source: string; headers: { key: string; value: string }[] };
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as { framework: string; buildCommand: string; outputDirectory: string; headers: Rule[] };

// _headers is Cloudflare's format: a path line, then indented "Name: value" lines.
function cloudflareRules(): Rule[] {
  const rules: Rule[] = [];
  for (const line of readFileSync('public/_headers', 'utf8').split('\n')) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) rules.push({ source: line.trim(), headers: [] });
    else {
      const at = line.indexOf(':');
      rules.at(-1)!.headers.push({ key: line.slice(0, at).trim(), value: line.slice(at + 1).trim() });
    }
  }
  return rules;
}

test('Vercel builds the Astro site and serves dist', () => {
  expect(vercel.framework).toBe('astro');
  expect(vercel.buildCommand).toBe('npm run build');
  expect(vercel.outputDirectory).toBe('dist');
});

test('Vercel sends the same security and cache headers as _headers', () => {
  const asVercel = cloudflareRules().map((r) => ({ ...r, source: r.source.replace(/\*$/, '(.*)') }));
  expect(vercel.headers).toEqual(asVercel);
});
