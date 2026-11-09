import { expect, test } from 'vitest';
import { whatsappShareUrl } from '../../src/lib/share';

test('the WhatsApp share link carries a line and the page URL', () => {
  expect(whatsappShareUrl('https://mushfikurahmaan.com/')).toBe(
    'https://wa.me/?text=' + encodeURIComponent("Mushfikur Rahman's work profile: https://mushfikurahmaan.com/"),
  );
});
