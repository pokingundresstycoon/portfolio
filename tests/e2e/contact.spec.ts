import { expect, test } from '@playwright/test';

const contact = (page: import('@playwright/test').Page) => page.locator('#contact');
const GATES = [
  ['WA', 'WhatsApp', 'https://wa.me/8801000000000'],
  ['EM', 'Email', 'mailto:hello@mushfikurahmaan.com'],
  ['TG', 'Telegram', 'https://t.me/example_handle'],
  ['PH', 'Phone', 'tel:+8801000000000'],
] as const;

test('Book a seat: one gate per way to reach me, each from the profile', async ({ page }) => {
  await page.goto('/');
  await expect(contact(page).getByRole('heading', { level: 2 })).toHaveText('Book a seat');
  await expect(contact(page)).toContainText('Pick the way you’d like to talk. Every gate comes to me.');
  const gates = contact(page).locator('[data-gate]');
  expect(await gates.evaluateAll((els) => els.map((e) => e.getAttribute('data-gate')))).toEqual(GATES.map(([code]) => code));
  for (const [code, name, href] of GATES) {
    const gate = contact(page).locator(`[data-gate="${code}"]`);
    await expect(gate.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    expect((await gate.locator('.flap').allTextContents()).join('')).toBe(code);
  }
  await expect(contact(page).locator('[data-gate="EM"]')).toContainText('hello@mushfikurahmaan.com');
  await expect(contact(page).locator('[data-gate="PH"]')).toContainText('+880 1000-000000');
  await expect(contact(page).getByText('© 2026 Mushfikur Rahman · Built and hosted by me')).toBeVisible();
  await expect(contact(page).getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#top');
});

test('the whole gate card is its link', async ({ page }) => {
  await page.goto('/');
  for (const [code, , href] of GATES) {
    const gate = contact(page).locator(`[data-gate="${code}"]`);
    await gate.scrollIntoViewIfNeeded();
    const hit = await gate.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 3)?.closest('a') as HTMLAnchorElement | null)?.getAttribute('href');
    });
    expect(hit, code).toBe(href);
  }
});

test('copy puts the email address on the clipboard and says so', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only here');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await contact(page).getByRole('button', { name: 'Copy email address' }).click();
  await expect(contact(page).getByRole('status')).toHaveText('Email address copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('hello@mushfikurahmaan.com');
});

test('without the Clipboard API, copy selects the address instead', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await page.goto('/');
  await contact(page).getByRole('button', { name: 'Copy email address' }).click();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('hello@mushfikurahmaan.com');
});

test('the clock here shows the time in Dhaka too', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-08T04:42:30Z') });
  await page.goto('/');
  const clock = contact(page).locator('[data-clock]');
  await expect(clock).toContainText('It’s');
  await expect(clock.locator('[data-clock-time]')).toHaveText('10:42');
  expect((await clock.locator('.flap').allTextContents()).join('')).toBe('10:42');
});

test('gates sit side by side on laptops, two on tablets, one per row on phones, with nothing spilling', async ({ page }) => {
  for (const [width, cols] of [
    [1280, 4],
    [768, 2],
    [375, 1],
    [320, 1],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const columns = await contact(page)
      .locator('[data-gate]')
      .evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size);
    expect(columns, `columns at ${width}px`).toBe(cols);
    expect(await contact(page).evaluate((el) => el.scrollWidth - el.clientWidth), `section at ${width}px`).toBeLessThanOrEqual(0);
    const crowded = await contact(page)
      .locator('[data-gate]')
      .evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth).map((e) => e.getAttribute('data-gate')));
    expect(crowded, `gates too narrow at ${width}px`).toEqual([]);
  }
});

test('FAQ shows two questions that open on click', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('#faq');
  await expect(faq.locator('details')).toHaveCount(2);
  await expect(faq.getByText('Test answer about pricing.')).toBeHidden();
  await faq.getByText('How do you price your work?').click();
  await expect(faq.getByText('Test answer about pricing.')).toBeVisible();
});

test('story pages end with the contact block', async ({ page }) => {
  await page.goto('/work/paperbase/');
  await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toHaveText('Book a seat');
});

test('404 page renders', async ({ page }) => {
  const response = await page.goto('/nope/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/');
});
