import { expect, test } from '@playwright/test';

for (const width of [320, 375, 390]) {
  for (const path of ['/', '/work/paperbase/']) {
    test(`no sideways scroll at ${width}px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(scroll).toBe(client);
    });
  }
}

test('images have alt text and controls have names', async ({ page }) => {
  await page.goto('/');
  const problems = await page.evaluate(() => {
    const out: string[] = [];
    for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) out.push(`img ${img.src}`);
    for (const el of document.querySelectorAll<HTMLElement>('a, button')) {
      const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
      if (!name) out.push(`${el.tagName} ${el.outerHTML.slice(0, 80)}`);
    }
    return out;
  });
  expect(problems).toEqual([]);
});

test('sections come in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['top', 'about', 'loop', 'work', 'process', 'faq', 'contact']);
});
