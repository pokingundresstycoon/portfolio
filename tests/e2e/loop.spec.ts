import { expect, test, type Page } from '@playwright/test';

const SUMMARY = 'https://status.paperbase.me/api/v1/summary.json';
const fresh = () => ({ overall: 'operational', at: Math.floor(Date.now() / 1000), parts: [], incidents: [], maintenance: [] });

async function loopHeight(page: Page) {
  return (await page.locator('#loop').boundingBox())!.height;
}

test('shows the live line for a fresh summary', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.fulfill({ json: fresh() }));
  await page.goto('/');
  await expect(page.locator('[data-live-status]')).toBeVisible();
  await expect(page.locator('[data-live-status]')).toContainText('Paperbase right now: all systems operational');
});

const failures: [string, Parameters<Page['route']>[1]][] = [
  ['on 500', (route) => route.fulfill({ status: 500, body: 'oops' })],
  ['on an aborted request', (route) => route.abort()],
  ['on malformed JSON', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{not json' })],
  ['on a 5 s delay', async (route) => {
    await new Promise((r) => setTimeout(r, 5000));
    await route.fulfill({ json: fresh() }).catch(() => {});
  }],
];

for (const [name, handler] of failures) {
  test(`stays hidden ${name}`, async ({ page }) => {
    await page.route(SUMMARY, handler);
    await page.goto('/');
    await page.waitForTimeout(name === 'on a 5 s delay' ? 6000 : 1500);
    await expect(page.locator('[data-live-status]')).toBeHidden();
  });
}

test('hiding shifts nothing', async ({ page, browser }) => {
  await page.route(SUMMARY, (route) => route.fulfill({ json: fresh() }));
  await page.goto('/');
  await expect(page.locator('[data-live-status]')).toBeVisible();
  const shown = await loopHeight(page);

  const failed = await browser.newPage({ viewport: page.viewportSize()! });
  await failed.route(SUMMARY, (route) => route.abort());
  await failed.goto('/');
  await failed.waitForTimeout(1500);
  expect(await loopHeight(failed)).toBe(shown);
  await failed.close();
});

test('shows all five stops, each with a short caption and its kind', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const steps = page.locator('#loop ol > li');
  await expect(steps).toHaveCount(5);
  const expected = [
    ['Ad click', 'Meta and TikTok ads', 'Growth stop'],
    ['Shop loads', 'On my servers', 'Infrastructure stop'],
    ['Order placed', 'Fast checkout', 'Infrastructure stop'],
    ['Order confirmed', 'Cash on delivery', 'Growth stop'],
    ['Signal sent back', 'Conversions API', 'Growth stop'],
  ];
  for (const [i, [title, caption, kind]] of expected.entries()) {
    const step = steps.nth(i);
    await expect(step.locator('.stop__title')).toHaveText(title);
    await expect(step.locator('.stop__text')).toHaveText(caption);
    await expect(step).toContainText(kind);
  }
  await expect(page.locator('#loop h2')).toHaveText('From server to sale');
});

test('the section stays light on words', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const words = (await page.locator('#loop').innerText()).split(/\s+/).filter(Boolean).length;
  expect(words).toBeLessThanOrEqual(90);
});

test('names every service, with where they meet', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const services = page.getByRole('list', { name: 'Services' });
  for (const text of [
    'Social Media Strategy & Community Management',
    'Performance Marketing & Paid Acquisition',
    'Campaign Analytics & Attribution',
    'Platform & Reliability Engineering',
    'Self-hosted Cloud Infrastructure',
    'Observability & Incident Response',
    'Conversion Signal Engineering',
  ]) {
    await expect(services.getByText(text, { exact: true }), text).toBeVisible();
  }
});

test('an order runs round the loop', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const order = page.locator('#loop .circuit__order').first();
  await expect(order).toBeVisible();
  const style = await order.evaluate((el) => ({ name: getComputedStyle(el).animationName, path: getComputedStyle(el).offsetPath }));
  expect(style.name).toBe('circuit-travel');
  expect(style.path).toContain('path(');
});

test('reduced motion parks the order at the first stop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  expect(await page.locator('#loop .circuit__order').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('each stop sits on the track', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const track = page.locator('#loop .circuit__track:visible');
  const box = (await track.boundingBox())!;
  for (const dot of await page.locator('#loop .stop__dot').all()) {
    const d = (await dot.boundingBox())!;
    const cx = d.x + d.width / 2;
    const cy = d.y + d.height / 2;
    expect(cx).toBeGreaterThanOrEqual(box.x - 1);
    expect(cx).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(cy).toBeGreaterThanOrEqual(box.y - 1);
    expect(cy).toBeLessThanOrEqual(box.y + box.height + 1);
  }
});

test('no big empty gap under the loop when the status line is hidden', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const section = (await page.locator('#loop').boundingBox())!;
  const lastContent = Math.max(
    ...(await Promise.all(['#loop .circuit', '#loop .circuit__services'].map(async (s) => {
      const b = (await page.locator(s).boundingBox())!;
      return b.y + b.height;
    }))),
  );
  expect(section.y + section.height - lastContent).toBeLessThanOrEqual(160);
});

test('the live line, when shown, sits above the headline without pushing anything', async ({ page }) => {
  await page.route(SUMMARY, (route) =>
    route.fulfill({ json: { overall: 'operational', at: Math.floor(Date.now() / 1000), parts: [], incidents: [], maintenance: [] } }),
  );
  await page.goto('/');
  const line = page.locator('[data-live-status]');
  await expect(line).toBeVisible();
  await expect(line).toHaveAttribute('href', 'https://status.paperbase.me');
  const l = (await line.boundingBox())!;
  const s = (await page.locator('#loop').boundingBox())!;
  const title = (await page.locator('#loop h2').boundingBox())!;
  expect(l.y).toBeGreaterThanOrEqual(s.y);
  expect(l.y + l.height).toBeLessThanOrEqual(title.y);
  expect(l.x).toBeGreaterThanOrEqual(s.x);
  expect(l.x + l.width).toBeLessThanOrEqual(s.x + s.width);
});

test('the gap under the loop matches the normal section spacing', async ({ page }) => {
  await page.route(SUMMARY, (route) => route.abort());
  await page.goto('/');
  const [loopPad, aboutPad] = await Promise.all(['#loop', '#about'].map((id) => page.locator(id).evaluate((el) => getComputedStyle(el).paddingBottom)));
  expect(loopPad).toBe(aboutPad);
});
