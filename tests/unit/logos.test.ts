import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import type { Tool } from '../../src/lib/schema';

const makers: Tool[] = JSON.parse(readFileSync('src/data/tools.json', 'utf8'));
const logos = [...new Set(makers.map((m) => m.logo).filter((l): l is string => l !== null))];

test('each maker appears once, so no logo repeats', () => {
  expect(logos.length).toBe(makers.filter((m) => m.logo).length);
  expect(new Set(makers.map((m) => m.name)).size).toBe(makers.length);
});

test('every maker shows a real logo', () => {
  expect(makers.filter((m) => !m.logo).map((m) => m.name)).toEqual([]);
});

test.each(logos)('%s.svg exists, is small and safe to serve', (logo) => {
  const path = `public/logos/${logo}.svg`;
  expect(existsSync(path), path).toBe(true);
  const svg = readFileSync(path, 'utf8');
  expect(svg).toMatch(/<svg[\s>]/);
  expect(svg.length).toBeLessThanOrEqual(12 * 1024);
  // Served under the site's CSP, so no scripts, handlers, outside links or inline styles.
  expect(svg).not.toMatch(/<script|<foreignObject|<style|\sstyle=|\son[a-z]+=|href="(?!#)/i);
});

test('every logo file in public/logos is used', async () => {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync('public/logos').filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''));
  expect(files.sort()).toEqual([...logos].sort());
});

test('Claude Code is listed under Claude, with its logo, on the infrastructure side', () => {
  const claude = makers.find((m) => m.name === 'Claude');
  expect(claude).toMatchObject({ side: 'infra', logo: 'claude', tools: ['Claude Code'] });
});
