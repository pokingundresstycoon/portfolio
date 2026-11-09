import { expect, test, type Locator } from '@playwright/test';

const box = async (l: Locator) => (await l.boundingBox())!;

test('the story chip sits below the back link', async ({ page }) => {
  await page.goto('/work/paperbase/');
  const back = await box(page.getByRole('link', { name: 'Back to work' }));
  const chip = await box(page.locator('.story__chip'));
  expect(chip.y).toBeGreaterThanOrEqual(back.y + back.height);
});

for (const id of ['about', 'loop', 'process']) {
  test(`the ${id} headline is centred in its section`, async ({ page }) => {
    await page.goto('/');
    const section = (await page.locator(`#${id}`).boundingBox())!;
    const heading = page.locator(`#${id} h2`).first();
    expect(await heading.evaluate((el) => getComputedStyle(el).textAlign)).toBe('center');
    const text = await heading.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      return { x: r.x, width: r.width };
    });
    const offCentre = Math.abs(text.x + text.width / 2 - (section.x + section.width / 2));
    expect(offCentre).toBeLessThanOrEqual(4);
  });
}

test('the main section headlines share one size', async ({ page }) => {
  await page.goto('/');
  const sizes = await Promise.all(
    ['#about', '#loop', '#work', '#process'].map((id) => page.locator(`${id} h2`).first().evaluate((el) => getComputedStyle(el).fontSize)),
  );
  expect(new Set(sizes).size, sizes.join(' / ')).toBe(1);
});

test('How I work starts as close to its top as other sections do', async ({ page }) => {
  await page.goto('/');
  const aboutPad = parseFloat(await page.locator('#about').evaluate((el) => getComputedStyle(el).paddingTop));
  const section = (await page.locator('#process').boundingBox())!;
  const title = (await page.locator('#process h2').boundingBox())!;
  expect(title.y - section.y).toBeLessThanOrEqual(Math.max(aboutPad, 96) + 8);
});

