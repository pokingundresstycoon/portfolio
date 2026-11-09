// After `astro build`: renders the PDF profile from /profile/ and the share image from /og/,
// so both always match the site's own content.
import type { AddressInfo } from 'node:net';
import { chromium } from '@playwright/test';
import { launchOptions } from './browser';
import { serve } from './serve.mjs';

const DIST = 'dist';
const server = await serve(DIST, 0);
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
const browser = await chromium.launch(await launchOptions());

try {
  const page = await browser.newPage();
  await page.goto(`${base}/profile/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: `${DIST}/mushfikur-rahman-profile.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(`${base}/og/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${DIST}/og.png` });
  console.log('Rendered mushfikur-rahman-profile.pdf and og.png');
} finally {
  await browser.close();
  server.close();
}
