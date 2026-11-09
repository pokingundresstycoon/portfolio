import { expect, test } from 'vitest';
import { contactLinks, displayPhone } from '../../src/lib/contact';
import { fullProfile } from './fixtures';

test('builds every channel link', () => {
  expect(contactLinks(fullProfile)).toEqual({
    email: 'mailto:hello@mushfikurahmaan.com',
    whatsapp: 'https://wa.me/8801000000000',
    telegram: 'https://t.me/example_handle',
    phone: 'tel:+8801000000000',
  });
});

test('leaves unset channels out', () => {
  const p = { ...fullProfile, contact: { ...fullProfile.contact, whatsapp: null, telegram: null, phone: null } };
  expect(contactLinks(p)).toEqual({ email: 'mailto:hello@mushfikurahmaan.com', whatsapp: null, telegram: null, phone: null });
});

test('shows a Bangladeshi WhatsApp number the way people write it', () => {
  expect(displayPhone('8801601571480')).toBe('+880 1601-571480');
});

test('shows other numbers with just a plus', () => {
  expect(displayPhone('447700900123')).toBe('+447700900123');
});
