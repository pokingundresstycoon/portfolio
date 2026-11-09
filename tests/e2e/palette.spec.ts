import { expect, test, type Page } from '@playwright/test';

// Contrast between two computed colours, as WCAG measures it. Takes 'rgb(…)' or 'rgba(…)'.
const CONTRAST = `
  const lum = (c) => {
    const [r, g, b] = c.match(/[\\d.]+/g).slice(0, 3).map((v) => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const opaque = (c) => c !== 'transparent' && !/rgba\\([^)]*,\\s*0(\\.\\d+)?\\)$/.test(c);
  const behind = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (opaque(bg)) return bg;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
`;

test('the site wears Gate Yellow: graphite, signal yellow and exit-sign green', async ({ page }) => {
  await page.goto('/');
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return ['--deep', '--deep-2', '--tint', '--accent', '--peach'].map((t) => s.getPropertyValue(t).trim());
  });
  expect(tokens).toEqual(['#1d2025', '#2b2f36', '#eceef1', '#ffd000', '#9be5b0']);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(29, 32, 37)');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1d2025');
});

// Every focus ring has to show against whatever it is drawn on: yellow on graphite, graphite on the
// pale and yellow sections.
async function focusRings(page: Page) {
  const seen: { what: string; ratio: number }[] = [];
  let first = '';
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(`(() => {
      ${CONTRAST}
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const what = el.tagName + '.' + el.className + ' ' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30);
      if (s.outlineStyle === 'none') return { what, ratio: null };
      // The ring sits outside the element, so it is seen against what is behind the element.
      return { what, ratio: contrast(s.outlineColor, behind(el.parentElement)) };
    })()`);
    if (!ring) break;
    const r = ring as { what: string; ratio: number | null };
    if (r.what === first) break;
    if (!first) first = r.what;
    if (r.ratio !== null) seen.push({ what: r.what, ratio: r.ratio });
  }
  return seen;
}

test('every focus ring stands out from the background it is drawn on', async ({ page }) => {
  await page.goto('/');
  const rings = await focusRings(page);
  expect(rings.length).toBeGreaterThan(10);
  const faint = rings.filter((r) => r.ratio < 3).map((r) => `${r.what} (${r.ratio.toFixed(2)})`);
  expect(faint).toEqual([]);
});

test('small yellow marks on pale backgrounds have an edge you can see', async ({ page }) => {
  await page.goto('/');
  const marks = await page.evaluate(`(() => {
    ${CONTRAST}
    const edge = (s) => (s.boxShadow.match(/rgba?\\([^)]*\\)/) || [null])[0];
    const check = (el, pseudo, name) => {
      const s = getComputedStyle(el, pseudo);
      const around = pseudo ? behind(el) : behind(el.parentElement);
      const e = edge(s);
      const ratio = Math.max(contrast(s.backgroundColor, around), e ? contrast(e, around) : 0);
      return { name, ratio };
    };
    return [
      ...[...document.querySelectorAll('.tools__dot')].map((el, i) => check(el, null, 'tools dot ' + i)),
      check(document.querySelector('.log__item:first-child'), '::before', 'first timeline mark'),
      check(document.querySelector('.log__item:last-child'), '::before', 'last timeline mark'),
    ];
  })()`);
  const list = marks as { name: string; ratio: number }[];
  expect(list.length).toBeGreaterThan(2);
  expect(list.filter((m) => m.ratio < 3).map((m) => `${m.name} (${m.ratio.toFixed(2)})`)).toEqual([]);
});
