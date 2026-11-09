import { expect, test } from '@playwright/test';

const SITE = 'https://mushfikurahmaan.com/';
const section = (page: import('@playwright/test').Page) => page.locator('[data-pdf]');

test('copy link puts the page URL on the clipboard and says so', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only here');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await section(page).getByRole('button', { name: 'Copy link' }).click();
  await expect(section(page).getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(section(page).getByRole('status')).toHaveText('Link copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(SITE);
});

test('copy link falls back without the Clipboard API', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await page.goto('/');
  await section(page).getByRole('button', { name: 'Copy link' }).click();
  const field = page.getByRole('textbox', { name: 'Link to this page' });
  await expect(field).toBeVisible();
  await expect(field).toHaveValue(SITE);
  await expect(field).toBeFocused();
  expect(await field.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([0, SITE.length]);
});

test('WhatsApp sends the page link', async ({ page }) => {
  await page.goto('/');
  await expect(section(page).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
    'href',
    'https://wa.me/?text=' + encodeURIComponent(`Mushfikur Rahman's work profile: ${SITE}`),
  );
});

test('each send link has one underline, on its label only', async ({ page }) => {
  await page.goto('/');
  for (const link of [section(page).getByRole('link', { name: 'WhatsApp' }), section(page).getByRole('button', { name: 'Copy link' })]) {
    expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
    expect(await link.locator('span').first().evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('underline');
  }
});

test('the page holds the promise, what is on it, and the download', async ({ page }) => {
  await page.goto('/');
  await expect(section(page).getByRole('heading', { name: 'Need it as a PDF?' })).toBeVisible();
  const sheet = section(page).locator('[data-sheet]');
  await expect(sheet).toContainText('Everything above, on one page.');
  expect((await sheet.locator('li').allTextContents()).map((t) => t.trim())).toEqual([
    'What I do',
    'Results',
    'Selected work',
    'Tools',
    'How to reach me',
  ]);
  const link = sheet.getByRole('link', { name: 'Download the PDF' });
  await expect(link).toHaveAttribute('href', '/mushfikur-rahman-profile.pdf');
  await expect(link).toHaveAttribute('download', '');
});

test('the page is drawn to A4 scale and labelled', async ({ page }) => {
  await page.goto('/');
  const box = (await section(page).locator('[data-sheet]').boundingBox())!;
  expect(box.height / box.width).toBeCloseTo(297 / 210, 2);
  await expect(section(page).getByText('A4, 210 × 297 mm', { exact: true })).toBeVisible();
});

test('four corner brackets frame the page, 10px clear of its corners, at every width', async ({ page }) => {
  for (const width of [1280, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const sheet = (await section(page).locator('[data-sheet]').boundingBox())!;
    const corners = section(page).locator('[data-corner]');
    await expect(corners).toHaveCount(4);
    const at = async (name: string) => (await section(page).locator(`[data-corner="${name}"]`).boundingBox())!;
    const [tl, tr, bl, br] = await Promise.all(['tl', 'tr', 'bl', 'br'].map(at));
    const near = (a: number, b: number, what: string) => expect(Math.abs(a - b), `${what} at ${width}px`).toBeLessThanOrEqual(1);
    near(tl.x, sheet.x - 10, 'top left x');
    near(tl.y, sheet.y - 10, 'top left y');
    near(tr.x + tr.width, sheet.x + sheet.width + 10, 'top right x');
    near(tr.y, sheet.y - 10, 'top right y');
    near(bl.x, sheet.x - 10, 'bottom left x');
    near(bl.y + bl.height, sheet.y + sheet.height + 10, 'bottom left y');
    near(br.x + br.width, sheet.x + sheet.width + 10, 'bottom right x');
    near(br.y + br.height, sheet.y + sheet.height + 10, 'bottom right y');
    const spill = await section(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(spill, `section at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test('the size is printed once, under the bottom right corner of the page, clear of the brackets', async ({ page }) => {
  await page.goto('/');
  const sheet = (await section(page).locator('[data-sheet]').boundingBox())!;
  const size = (await section(page).getByText('A4, 210 × 297 mm', { exact: true }).boundingBox())!;
  expect(Math.abs(size.x + size.width - (sheet.x + sheet.width))).toBeLessThanOrEqual(1);
  expect(size.y).toBeGreaterThan(sheet.y + sheet.height + 10);
  await expect(section(page).locator('[data-ruler], .crop')).toHaveCount(0);
});

test('nothing promises more than the one page there is', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).not.toContainText(/two pages|2 pages/i);
});

test('on a laptop the page sits beside the heading', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'side by side on wide screens');
  await page.goto('/');
  const heading = (await section(page).getByRole('heading', { name: 'Need it as a PDF?' }).boundingBox())!;
  const sheet = (await section(page).locator('[data-sheet]').boundingBox())!;
  expect(sheet.x).toBeGreaterThan(heading.x + heading.width);
});

test('the section never scrolls the page sideways', async ({ page }) => {
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await section(page).scrollIntoViewIfNeeded();
    const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scroll, `page width at ${width}px`).toBe(client);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('no-js hides the copy button but keeps the rest', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-copy]')).toBeHidden();
    await expect(section(page).getByRole('link', { name: 'WhatsApp' })).toBeVisible();
    await expect(section(page).getByRole('link', { name: 'Download the PDF' })).toBeVisible();
  });
});

test('on a phone the section has room above its heading and below its links', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const growth = await box('[data-growth]');
  const title = await box('#pdf-title');
  const links = await box('.pdf__links');
  const tools = await box('#tools-title');
  expect(title.y - (growth.y + growth.height), 'space above the heading').toBeGreaterThanOrEqual(96);
  expect(tools.y - (links.y + links.height), 'space below the links').toBeGreaterThanOrEqual(96);
});

// The page behind is dark; where two pale sections meet at a fractional pixel, a dark hairline can
// show through. Sample the empty gutter across each join at a few phone zoom levels.
test('no hairline shows where the pale sections meet', async ({ browser }) => {
  const sharp = (await import('sharp')).default;
  for (const deviceScaleFactor of [1.25, 1.29, 1.5, 2.625]) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const pale = await page.locator('.tools').evaluate((el) => getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number));
    for (const sel of ['[data-pdf]', '.tools']) {
      const top = await page.locator(sel).evaluate((el) => el.getBoundingClientRect().top + scrollY);
      const png = await page.screenshot({ fullPage: true, clip: { x: 0, y: top - 6, width: 10, height: 12 } });
      const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      let worst = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        worst = Math.max(worst, Math.abs(data[i] - pale[0]), Math.abs(data[i + 1] - pale[1]), Math.abs(data[i + 2] - pale[2]));
      }
      expect(worst, `${sel} join at ${deviceScaleFactor}x`).toBeLessThanOrEqual(4);
    }
    await context.close();
  }
});
