import { expect, test } from '@playwright/test';

const board = (page: import('@playwright/test').Page) => page.locator('#top [data-departures]');
const flights = (page: import('@playwright/test').Page) => board(page).locator('[data-flight]');
const facts = (flight: import('@playwright/test').Locator) => flight.locator('[data-fact]');
const clock = (page: import('@playwright/test').Page) => board(page).locator('[data-clock]');
const word = async (flight: import('@playwright/test').Locator, side: 'from' | 'to') =>
  (await flight.locator(`[data-flaps="${side}"] .flap`).allTextContents()).join('').replace(/\u00a0/g, ' ').trim();

test('shows the name and role', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mushfikur Rahman');
  await expect(page.locator('#top').getByText('Platform engineer + performance marketer', { exact: true })).toBeVisible();
  await expect(page.locator('#top').getByText('Taking new work · Dhaka to worldwide')).toBeVisible();
});

test('the departures board lists three flights, read as words', async ({ page }) => {
  await page.goto('/');
  await expect(board(page).getByRole('heading', { name: 'Departures' })).toBeVisible();
  await expect(flights(page)).toHaveCount(3);
  const routes = await flights(page).locator('[data-route]').allTextContents();
  expect(routes.map((r) => r.trim())).toEqual(['Server to Sale', 'Commit to Live', 'Your idea to Launch']);
});

test('each flight carries its real facts', async ({ page }) => {
  await page.goto('/');
  await expect(flights(page).nth(0)).toContainText('MR01');
  await expect(flights(page).nth(0)).toContainText('Growth class');
  await expect(facts(flights(page).nth(0))).toHaveText(['35,000+ orders', '৳3.5 Cr+ in sales']);
  await expect(flights(page).nth(1)).toContainText('Infra class');
  await expect(facts(flights(page).nth(1))).toHaveText(['7+ shops live', '99.90% uptime']);
  await expect(flights(page).nth(2)).toContainText('Now boarding');
  await expect(flights(page).nth(2).getByRole('link', { name: 'Book a seat' })).toHaveAttribute('href', '/#contact');
});

test('each fact keeps its number and label on one line, at every width', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const lines = await board(page)
      .locator('[data-fact]')
      .evaluateAll((els) =>
        els.map((el) => {
          // One rect per line the text sits on, so a wrapped number or label shows up as two.
          const lines = (sel: string) => {
            const range = document.createRange();
            range.selectNodeContents(el.querySelector(sel)!);
            return [...range.getClientRects()];
          };
          const [num, ...numMore] = lines('[data-num]');
          const [label, ...labelMore] = lines('[data-label]');
          const mid = (label.top + label.bottom) / 2;
          return {
            text: el.textContent!.trim(),
            oneLine: !numMore.length && !labelMore.length && label.left >= num.right && mid > num.top && mid < num.bottom,
          };
        }),
      );
    expect(lines.length, `facts at ${width}px`).toBe(4);
    for (const l of lines) expect(l.oneLine, `"${l.text}" at ${width}px`).toBe(true);
  }
});

test('the clock shows the time in Dhaka and turns over each minute', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-08T04:42:30Z') });
  await page.goto('/');
  await expect(clock(page)).toBeVisible();
  await expect(clock(page)).toContainText('Local time in Dhaka');
  await expect(clock(page).locator('[data-clock-time]')).toHaveText('10:42');
  expect((await clock(page).locator('.flap').allTextContents()).join('')).toBe('10:42');
  await page.clock.runFor(31_000);
  await expect(clock(page).locator('[data-clock-time]')).toHaveText('10:43');
  expect((await clock(page).locator('.flap').allTextContents()).join('')).toBe('10:43');
});

test('lines run only between flights, not above the first or below the last', async ({ page }) => {
  await page.goto('/');
  const border = (el: Element) => getComputedStyle(el).borderBottomStyle;
  expect(await board(page).locator('.dep__head').evaluate(border)).toBe('none');
  expect(await flights(page).evaluateAll((rows) => rows.map((r) => getComputedStyle(r).borderBottomStyle))).toEqual(['solid', 'solid', 'none']);
});

test('the letters roll once, then settle on the right words', async ({ page }) => {
  await page.goto('/');
  await expect(board(page)).toHaveAttribute('data-rolled', '', { timeout: 6000 });
  expect(await word(flights(page).nth(0), 'from')).toBe('SERVER');
  expect(await word(flights(page).nth(0), 'to')).toBe('SALE');
  expect(await word(flights(page).nth(2), 'from')).toBe('YOUR IDEA');
  expect(await word(flights(page).nth(2), 'to')).toBe('LAUNCH');
});

test('reduced motion shows the final letters at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await word(flights(page).nth(1), 'from')).toBe('COMMIT');
  expect(await word(flights(page).nth(1), 'to')).toBe('LIVE');
  await expect(board(page)).not.toHaveAttribute('data-rolling', '');
});

test('the board fits at every width without spilling', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scroll, `page width at ${width}px`).toBe(client);
    const spill = await board(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(spill, `board at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('no-js shows the finished board', async ({ page }) => {
    await page.goto('/');
    expect(await word(flights(page).nth(0), 'from')).toBe('SERVER');
    await expect(flights(page).nth(2).getByRole('link', { name: 'Book a seat' })).toBeVisible();
  });

  test('no-js hides the clock rather than show a wrong time', async ({ page }) => {
    await page.goto('/');
    await expect(clock(page)).toHaveCount(1);
    await expect(clock(page)).toBeHidden();
  });
});

test('on laptops the hero starts near the top, with no big empty band above it', async ({ page }) => {
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const status = (await page.locator('#top').getByText('Taking new work · Dhaka to worldwide').boundingBox())!;
    expect(status.y, `space above at ${width}px`).toBeLessThanOrEqual(72);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const status = (await page.locator('#top').getByText('Taking new work · Dhaka to worldwide').boundingBox())!;
  expect(status.y, 'phones keep their space').toBeGreaterThanOrEqual(48);
});
