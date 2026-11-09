import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const DIST = process.env.DIST_DIR ?? 'dist';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Every built HTML page, as paths relative to the dist folder. */
export function htmlFiles(): string[] {
  return walk(DIST)
    .filter((p) => p.endsWith('.html'))
    .map((p) => relative(DIST, p));
}

export function readDist(path: string): string {
  return readFileSync(join(DIST, path), 'utf8');
}

export function distBytes(path: string): Buffer {
  return readFileSync(join(DIST, path));
}

function tags(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return m ? m[1] : null;
}

/** Same-origin files the home page loads up front, as paths inside dist. */
export function homeAssets(): { html: string; css: string[]; js: string[]; fonts: string[] } {
  const html = readDist('index.html');
  const local = (href: string | null): href is string => !!href && href.startsWith('/');
  const links = tags(html, 'link');
  const css = links.filter((t) => attr(t, 'rel') === 'stylesheet').map((t) => attr(t, 'href')).filter(local);
  const fonts = links
    .filter((t) => attr(t, 'rel') === 'preload' && attr(t, 'as') === 'font')
    .map((t) => attr(t, 'href'))
    .filter(local);
  const js = [
    ...tags(html, 'script').map((t) => attr(t, 'src')),
    ...links.filter((t) => attr(t, 'rel') === 'modulepreload').map((t) => attr(t, 'href')),
  ].filter(local);
  const strip = (p: string) => p.replace(/^\//, '');
  return { html: 'index.html', css: css.map(strip), js: [...new Set(js)].map(strip), fonts: fonts.map(strip) };
}

/** Text a visitor can read: tags, scripts and styles removed. */
export function visibleText(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}
