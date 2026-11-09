import { expect, test } from '@playwright/test';

const STEPS = [
  ['Audit', 'First I look at what is really happening: your pages, ads, servers and the numbers behind them.', ['Ad account review', 'Page audit', 'Infrastructure check']],
  ['Plan', 'One clear plan with the numbers we will judge it by, so nobody argues about success later.', ['Goals in orders', 'Budget and channels', 'Architecture']],
  ['Launch', 'Campaigns go live and systems ship, finished properly. Nothing left half-wired.', ['Campaign setup', 'Pixel and Conversions API', 'Deploy and monitor']],
  ['Measure', 'Results in orders, cost per order and uptime, then we make it better every week.', ['Reporting', 'Optimisation', 'Status checks']],
] as const;

const makers = (page: import('@playwright/test').Page) => page.locator('.tools [data-maker]');

test('the grid ends on a cell that asks about your stack, so no slot is empty at any width', async ({ page }) => {
  for (const width of [1280, 1024, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const [count, columns] = await page.locator('.tools__grid > li').evaluateAll((els) => [
      els.length,
      new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size,
    ]);
    expect(count % columns, `${count} cells in ${columns} columns at ${width}px`).toBe(0);
  }
  const ask = page.locator('.tools__grid > li').last().getByRole('link', { name: 'Something else? Ask me about your stack' });
  await expect(ask).toHaveAttribute('href', '/#contact');
});

test('one cell per maker, each saying what it does', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: 'Tools I work with' })).toBeVisible();
  await expect(makers(page)).toHaveCount(19);
  await expect(makers(page).first()).toContainText('Meta');
  await expect(makers(page).first()).toContainText('Ads Manager, Events Manager, Pixel, Conversions API, Business Suite');
  await expect(page.locator('.tools img[src="/logos/meta.svg"]')).toHaveCount(1);
  await expect(makers(page).filter({ hasText: 'PostgreSQL' })).toContainText('With TimescaleDB and PgBouncer');
});

test('every maker shows its real logo', async ({ page }) => {
  await page.goto('/');
  const logo = (name: string) => makers(page).filter({ hasText: name }).locator('img');
  const docker = logo('Docker');
  await docker.scrollIntoViewIfNeeded();
  await expect(docker).toHaveAttribute('src', '/logos/docker.svg');
  await expect(docker).toHaveAttribute('alt', '');
  await expect.poll(() => docker.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(logo('Claude')).toHaveAttribute('src', '/logos/claude.svg');
  await expect(logo('Coolify')).toHaveAttribute('src', '/logos/coolify.svg');
  await expect(page.locator('.tools [data-letter]')).toHaveCount(0);
});

test('the operations tools are in, and Hetzner is out', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Kubernetes', 'Terraform', 'Ansible', 'Prometheus', 'Grafana']) {
    await expect(makers(page).filter({ hasText: name }).locator('img'), name).toHaveAttribute('src', `/logos/${name.toLowerCase()}.svg`);
  }
  await expect(makers(page).filter({ hasText: 'Hetzner' })).toHaveCount(0);
});

test('the ads and tracking makers carry the orange mark, and say so in words', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tools [data-legend]')).toHaveText('Ads and tracking');
  const growth = page.locator('.tools [data-maker][data-growth]');
  await expect(growth).toHaveCount(2);
  await expect(growth.nth(0)).toContainText('Meta');
  await expect(growth.nth(1)).toContainText('TikTok');
  for (const cell of await growth.all()) await expect(cell.locator('.visually-hidden')).toHaveText('Ads and tracking');
});

test('five columns on laptops, four on tablets, two on phones, with nothing spilling', async ({ page }) => {
  for (const [width, cols] of [
    [1280, 5],
    [1024, 5],
    [768, 4],
    [375, 2],
    [320, 2],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const columns = await makers(page).evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size);
    expect(columns, `columns at ${width}px`).toBe(cols);
    expect(await page.locator('.tools').evaluate((el) => el.scrollWidth - el.clientWidth), `section at ${width}px`).toBeLessThanOrEqual(0);
    const crowded = await makers(page).evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth).map((e) => e.textContent));
    expect(crowded, `cells too narrow at ${width}px`).toEqual([]);
  }
});

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const cards = (page: import('@playwright/test').Page) => page.locator('#process .stack > li');

test('shows the four steps as cards, in order, with their content', async ({ page }) => {
  await page.goto('/');
  await expect(cards(page)).toHaveCount(4);
  for (const [i, [word, text, chips]] of STEPS.entries()) {
    const card = cards(page).nth(i);
    await expect(card.locator('.card__n')).toHaveText(`0${i + 1} / 04`);
    await expect(card.locator('.card__word')).toHaveText(word);
    await expect(card.locator('.card__text')).toHaveText(text);
    for (const chip of chips) await expect(card).toContainText(chip);
  }
});

test('cards stick and stack as you scroll, earlier ones peeking above', async ({ page }) => {
  await page.goto('/');
  await cards(page).nth(3).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  const tops = await cards(page).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  for (let i = 1; i < tops.length; i++) {
    expect(tops[i], `card ${i + 1} sits below card ${i}`).toBeGreaterThan(tops[i - 1]);
    expect(tops[i] - tops[i - 1], `card ${i} peeks by a strip`).toBeLessThanOrEqual(40);
  }
  expect(tops[0]).toBeGreaterThanOrEqual(0);
});

test('every card fits on one screen while stuck', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize()!;
  for (let i = 0; i < 4; i++) {
    const card = cards(page).nth(i);
    await card.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(200);
    const b = (await card.boundingBox())!;
    expect(b.y + b.height, `card ${i + 1} bottom`).toBeLessThanOrEqual(viewport.height);
  }
});

test('the step word never covers the drawing', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 4; i++) {
    const card = cards(page).nth(i);
    await card.scrollIntoViewIfNeeded();
    const letters = await card.locator('.card__word').evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    expect(overlaps(letters, (await card.locator('.card__art').boundingBox())!), STEPS[i][0]).toBe(false);
  }
});

test('each card has its own isometric drawing', async ({ page }) => {
  await page.goto('/');
  const art = page.locator('#process .stack > li svg.card__art');
  await expect(art).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await cards(page).nth(i).scrollIntoViewIfNeeded();
    await expect(art.nth(i)).toBeVisible();
    expect(await art.nth(i).locator('polygon').count(), 'at least two blocks').toBeGreaterThanOrEqual(6);
  }
});

test('the blocks settle into place as a card rises into view', async ({ page }) => {
  await page.goto('/');
  const block = cards(page).nth(1).locator('.rise').first();
  const opacity = () => block.evaluate((el) => Number(getComputedStyle(el).opacity));
  await page.locator('#process h2').scrollIntoViewIfNeeded();
  expect(await opacity(), 'still below the fold').toBeLessThan(1);
  await cards(page).nth(1).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(200);
  expect(await opacity(), 'in view').toBe(1);
});

test('reduced motion shows the drawings still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const moving = await page
    .locator('#process .card__art *')
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).animationName !== 'none').length);
  expect(moving).toBe(0);
  expect(await cards(page).nth(1).locator('.rise').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('no-js still shows every step and its drawing', async ({ page }) => {
    await page.goto('/');
    for (const [word, text] of STEPS) {
      await expect(page.locator('#process').getByText(word, { exact: true })).toBeVisible();
      await expect(page.locator('#process').getByText(text)).toBeVisible();
    }
    await expect(page.locator('#process svg.card__art').first()).toBeVisible();
  });
});

test('How I work has a subheading like the other sections', async ({ page }) => {
  await page.goto('/');
  const sub = page.locator('#process .process__sub');
  await expect(sub).toHaveText('The same four steps, whether it’s ads or servers.');
  expect(await sub.evaluate((el) => getComputedStyle(el).textAlign)).toBe('center');
  const title = (await page.locator('#process h2').boundingBox())!;
  const s = (await sub.boundingBox())!;
  expect(s.y).toBeGreaterThan(title.y + title.height - 1);
});
