import { expect, test } from '@playwright/test';

const MILESTONES = ['First test step', 'Two become one', 'A test audit', 'Test ads count sales', 'Status goes up', 'Still testing'];
const log = (page: import('@playwright/test').Page) => page.locator('#work [data-log] > li');

test('tells the build story in order, each step dated', async ({ page }) => {
  await page.goto('/');
  await expect(log(page)).toHaveCount(MILESTONES.length);
  expect((await log(page).locator('h3').allTextContents()).map((t) => t.trim())).toEqual(MILESTONES);
  await expect(log(page).first().locator('[data-when]')).toHaveText('Jan 2026');
  await expect(log(page).last().locator('[data-when]')).toHaveText('Today');
});

test('the Paperbase card states its facts and links to the full story', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#work [data-paperbase]');
  await expect(card.getByRole('heading', { name: 'Paperbase' })).toBeVisible();
  const fact = (label: string) => card.locator('dl > div').filter({ has: page.locator('dt', { hasText: label }) }).locator('dd');
  await expect(fact('commits')).toHaveText('1,111');
  await expect(fact('checkout uptime')).toHaveText('99.90%');
  await expect(fact('shops live')).toHaveText('7+');
  await expect(fact('months building')).toHaveText(/^\d+$/);
  await expect(card.getByRole('link', { name: 'Read the full story' })).toHaveAttribute('href', '/work/paperbase/');
});

test('the merge step draws five shop servers becoming one lit stack', async ({ page }) => {
  await page.goto('/');
  const merge = log(page).nth(1).locator('[data-merge]');
  await expect(merge).toBeVisible();
  await expect(merge).toHaveAttribute('aria-hidden', 'true');
  await expect(merge.locator('.old')).toHaveCount(5);
  await expect(merge.locator('.unit')).toHaveCount(3);
  await expect(merge.locator('.led:not(.led--off)')).toHaveCount(3);
  await expect(merge.locator('.led:not(.led--off)').first()).toHaveCSS('fill', 'rgb(255, 208, 0)');
  // It fits the timeline column, phones included.
  const box = (await merge.boundingBox())!;
  const width = page.viewportSize()!.width;
  expect(box.x + box.width).toBeLessThanOrEqual(width - 12);
});

test('the status step links the live status page', async ({ page }) => {
  await page.goto('/');
  const link = log(page).nth(4).getByRole('link', { name: 'status.paperbase.me' });
  await expect(link).toHaveAttribute('href', 'https://status.paperbase.me');
  await expect(link, 'opens in a new tab').toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(link, 'says so to screen readers').toContainText('opens in a new tab');
});

test('on a laptop the card stays put while the log scrolls', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'side by side on wide screens');
  await page.goto('/');
  await log(page).nth(3).scrollIntoViewIfNeeded();
  const card = (await page.locator('#work [data-paperbase]').boundingBox())!;
  const list = (await page.locator('#work [data-log]').boundingBox())!;
  expect(card.y, 'clear of the menu').toBeGreaterThan(70);
  expect(card.y, 'near the top').toBeLessThan(140);
  expect(list.y, 'the log has moved past it').toBeLessThan(card.y);
});

test('on a phone the card comes first, then the log', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'one column on phones');
  await page.goto('/');
  const card = (await page.locator('#work [data-paperbase]').boundingBox())!;
  const list = (await page.locator('#work [data-log]').boundingBox())!;
  expect(list.y).toBeGreaterThanOrEqual(card.y + card.height);
});

test('the page never scrolls sideways', async ({ page }) => {
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.locator('#work').scrollIntoViewIfNeeded();
    const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scroll, `page width at ${width}px`).toBe(client);
  }
});

test('the growth half shows the numbers and links a growth story', async ({ page }) => {
  await page.goto('/');
  const band = page.locator('#work [data-growth]');
  await expect(band).toContainText('35,000+');
  await expect(band).toContainText('৳3.5 Cr+');
  await expect(band.getByRole('link', { name: 'Read a growth story' })).toHaveAttribute('href', '/work/growth-test/');
});

test('About leaves the orders and sales numbers to the work section', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).not.toContainText('35,000+');
  await expect(page.locator('#about')).not.toContainText('৳3.5 Cr+');
  await expect(page.locator('#work').getByText('35,000+', { exact: true })).toHaveCount(1);
});

test('the section ends with the growth half, no shop or project list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#work [data-also]')).toHaveCount(0);
  await expect(page.locator('#work')).not.toContainText('has also powered');
});

test('a story page renders', async ({ page }) => {
  await page.goto('/work/paperbase/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paperbase');
  for (const h of ['The problem', 'What I built', 'The result', 'Stack']) {
    await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Back to work' })).toHaveAttribute('href', '/#work');
});

test('no story page for dusk', async ({ page }) => {
  const response = await page.goto('/work/dusk/');
  expect(response?.status()).toBe(404);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('no-js shows the whole story', async ({ page }) => {
    await page.goto('/');
    await expect(log(page)).toHaveCount(MILESTONES.length);
    await expect(log(page).last()).toBeVisible();
    await expect(page.locator('#work [data-growth]')).toBeVisible();
  });
});
