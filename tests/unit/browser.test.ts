import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { launchOptions } from '../../scripts/browser';

test('on this computer the PDF and share image are rendered with its own Chrome', async () => {
  expect(await launchOptions({})).toEqual({ channel: 'chrome' });
});

test('on CI they use the Chromium that Playwright installs', async () => {
  expect(await launchOptions({ CI: '1' })).toEqual({});
});

test('on Vercel, which has no browser, they use a Chromium built for its Amazon Linux machines', async () => {
  const options = await launchOptions({ CI: '1', VERCEL: '1' });
  expect(options.channel).toBeUndefined();
  expect(existsSync(options.executablePath!)).toBe(true);
  expect(options.args).toEqual(expect.arrayContaining([expect.stringMatching(/^--/)]));
}, 60_000);
