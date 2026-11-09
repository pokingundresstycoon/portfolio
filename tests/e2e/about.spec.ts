import { expect, test, type Page } from '@playwright/test';

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const about = (page: Page) => page.locator('#about');
const halves = (page: Page) => about(page).locator('[data-half]');
const photo = (page: Page) => about(page).locator('[data-photo]');

test('two crafts, one operator: a half for each craft', async ({ page }) => {
  await page.goto('/');
  await expect(about(page).getByRole('heading', { level: 2 })).toHaveText('Two crafts. One operator.');
  await expect(halves(page)).toHaveCount(2);
  await expect(halves(page).nth(0).getByRole('heading', { level: 3 })).toHaveText('The engineer');
  await expect(halves(page).nth(0)).toContainText('I build the systems online shops run on.');
  await expect(halves(page).nth(0)).toContainText('Most engineers stop at the server.');
  await expect(halves(page).nth(1).getByRole('heading', { level: 3 })).toHaveText('The marketer');
  await expect(halves(page).nth(1)).toContainText('I run the ads and pages that fill them with buyers.');
  await expect(halves(page).nth(1)).toContainText('Most marketers stop at the click.');
  await expect(about(page)).toContainText('I don’t stop. I follow every order all the way to the confirmed sale.');
  await expect(about(page)).toContainText('I’m Mushfikur. Most people call me Mahi. Founder of Paperbase, based in Dhaka, working worldwide.');
});

test('the photo has no name tag', async ({ page }) => {
  await page.goto('/');
  await expect(photo(page)).toBeVisible();
  await expect(about(page).getByText('Mahi', { exact: true })).toHaveCount(0);
});

test('the photo sits on the seam: between the halves on wide screens, between them stacked on narrow ones', async ({ page }) => {
  for (const [width, side] of [
    [1280, true],
    [1024, true],
    [768, false],
    [375, false],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const [a, b] = [(await halves(page).nth(0).boundingBox())!, (await halves(page).nth(1).boundingBox())!];
    const p = (await photo(page).boundingBox())!;
    if (side) {
      expect(Math.abs(a.y - b.y), `halves side by side at ${width}px`).toBeLessThanOrEqual(1);
      expect(Math.abs(p.x + p.width / 2 - (a.x + a.width)), `photo on the seam at ${width}px`).toBeLessThanOrEqual(2);
    } else {
      expect(b.y, `halves stacked at ${width}px`).toBeGreaterThanOrEqual(a.y + a.height - 1);
      expect(Math.abs(p.y + p.height / 2 - (a.y + a.height)), `photo on the seam at ${width}px`).toBeLessThanOrEqual(2);
    }
  }
});

test('no words run under the photo, and nothing spills, at any width', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const p = (await photo(page).boundingBox())!;
    for (const text of await halves(page).locator('h3, p').all()) {
      const t = (await text.boundingBox())!;
      expect(overlaps(t, p), `"${await text.textContent()}" vs photo at ${width}px`).toBe(false);
    }
    const spill = await about(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(spill, `about at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test('links go to the work and the profile', async ({ page }) => {
  await page.goto('/');
  await expect(about(page).getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#work');
  await expect(about(page).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/8801000000000');
  await expect(about(page).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/h8b2ckrx');
  await expect(about(page).getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:hello@mushfikurahmaan.com');
});

test('until there is a photo, its placeholder fits inside the circle at every width', async ({ page }) => {
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // Every corner of the icon and of each line of text lies inside the circle.
    const fits = await photo(page).evaluate((el) => {
      const c = el.getBoundingClientRect();
      const [cx, cy, r] = [c.x + c.width / 2, c.y + c.height / 2, el.clientWidth / 2];
      const range = document.createRange();
      range.selectNodeContents(el.querySelector('.about__placeholder span')!);
      const rects = [...range.getClientRects(), el.querySelector('.about__placeholder svg')!.getBoundingClientRect()];
      return rects.every((b) =>
        [[b.left, b.top], [b.right, b.top], [b.left, b.bottom], [b.right, b.bottom]].every(([x, y]) => Math.hypot(x - cx, y - cy) <= r),
      );
    });
    expect(fits, `placeholder at ${width}px`).toBe(true);
  }
});
