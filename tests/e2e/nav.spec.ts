import { expect, test, type Page } from '@playwright/test';

const nav = (page: Page) => page.locator('header.nav');
const scrollTo = (page: Page, y: number) => page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
// Out of sight means faded out and moved above the screen; the links stay reachable by keyboard.
const away = (page: Page) =>
  nav(page).evaluate((el) => getComputedStyle(el).opacity === '0' && el.querySelector('.nav__bar')!.getBoundingClientRect().bottom <= 0);
const shown = (page: Page) =>
  nav(page).evaluate((el) => getComputedStyle(el).opacity === '1' && el.querySelector('.nav__bar')!.getBoundingClientRect().top >= 0);

test('at the top of the page the nav is out of sight and takes no room', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => away(page)).toBe(true);
  const hero = (await page.locator('#top').boundingBox())!;
  expect(hero.y).toBeLessThanOrEqual(1);
});

test('once you scroll the nav comes into view, and goes again back at the top', async ({ page }) => {
  await page.goto('/');
  await scrollTo(page, 700);
  await expect.poll(() => shown(page)).toBe(true);
  await scrollTo(page, 0);
  await expect.poll(() => away(page)).toBe(true);
});

test('tabbing to the nav at the top of the page shows it', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(nav(page).getByRole('link', { name: 'Mahi.' })).toBeFocused();
  await expect.poll(() => shown(page)).toBe(true);
});

test('the nav links still take you to their sections', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the section links show on wide screens');
  await page.goto('/');
  await scrollTo(page, 700);
  await nav(page).getByRole('link', { name: 'Process' }).click();
  await expect(page).toHaveURL(/#process$/);
});

test('with reduced motion the nav is simply there once you scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect.poll(() => away(page)).toBe(true);
  await scrollTo(page, 30);
  await expect.poll(() => shown(page)).toBe(true);
});

test('after clicking a nav link, scrolling back to the top still hides the nav', async ({ page }) => {
  await page.goto('/');
  await scrollTo(page, 700);
  await expect.poll(() => shown(page)).toBe(true);
  await nav(page).getByRole('link', { name: 'Book a seat' }).click();
  await expect(page).toHaveURL(/#contact$/);
  // Let the smooth scroll down to Contact finish, as a visitor would, before going back up.
  let last = -1;
  await expect.poll(async () => {
    const y = await page.evaluate(() => scrollY);
    const settled = y === last;
    last = y;
    return settled;
  }).toBe(true);
  await scrollTo(page, 0);
  await expect.poll(() => away(page)).toBe(true);
});

test('the nav button books a seat: it takes you to the contact section', async ({ page }) => {
  await page.goto('/');
  await expect(nav(page).getByRole('link', { name: 'Book a seat' })).toHaveAttribute('href', '/#contact');
  await expect(nav(page)).not.toContainText('CV');
  expect((await page.request.get('/mushfikur-rahman-cv.pdf')).status()).toBe(404);
});

test('the nav has no Contact link: "Book a seat" is the way to get in touch', async ({ page }) => {
  await page.goto('/');
  await expect(nav(page).locator('.nav__links a')).toHaveText(['About', 'Work', 'Process']);
  await expect(nav(page).getByRole('link', { name: 'Contact', exact: true })).toHaveCount(0);
});

test('the Mahi mark is set large in the pill, and the pill stays the same height', async ({ page }) => {
  await page.goto('/');
  const mark = nav(page).getByRole('link', { name: 'Mahi.' });
  expect(await mark.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBe(32);
  const markBox = (await mark.boundingBox())!;
  const cta = (await nav(page).getByRole('link', { name: 'Book a seat' }).boundingBox())!;
  const bar = (await nav(page).locator('.nav__bar').boundingBox())!;
  expect(markBox.height).toBeLessThanOrEqual(cta.height);
  expect(bar.height).toBeLessThanOrEqual(cta.height + 14);
});
