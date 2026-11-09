import { expect, test } from '@playwright/test';

// The page scripts/render-assets.ts screenshots to /og.png: a gate sign, signal yellow with a
// graphite pictogram, the name set large, and a graphite strip with the address and the reach.
test('the link preview card is a gate sign', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto('/og/');
  const card = page.locator('[data-share-card]');
  await expect(card).toHaveCSS('background-color', 'rgb(255, 208, 0)');
  const box = (await card.boundingBox())!;
  expect([box.width, box.height]).toEqual([1200, 630]);
  await expect(card.locator('[data-sign] svg')).toBeVisible();
  await expect(card.locator('[data-sign]')).toHaveCSS('background-color', 'rgb(29, 32, 37)');
  await expect(card.locator('[data-name]')).toHaveText('Mushfikur Rahman');
  await expect(card.locator('[data-role]')).toHaveText('Platform engineer + performance marketer');
  const strip = card.locator('[data-strip]');
  await expect(strip).toHaveCSS('background-color', 'rgb(29, 32, 37)');
  await expect(strip).toContainText('mushfikurahmaan.com');
  await expect(strip).toContainText('Dhaka to worldwide');
});

test('nothing on the card runs past its edges or into the strip', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto('/og/');
  const card = page.locator('[data-share-card]');
  const spill = await card.evaluate((el) => {
    const c = el.getBoundingClientRect();
    const strip = el.querySelector('[data-strip]')!.getBoundingClientRect();
    return [...el.querySelectorAll('[data-name], [data-role], [data-sign]')].map((n) => {
      const r = n.getBoundingClientRect();
      return { right: r.right - (c.right - 60), bottom: r.bottom - strip.top };
    });
  });
  for (const s of spill) {
    expect(s.right, 'keeps 60px clear of the right edge').toBeLessThanOrEqual(0);
    expect(s.bottom, 'stays above the strip').toBeLessThanOrEqual(0);
  }
});
