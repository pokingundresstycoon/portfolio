import type { Profile } from './schema';

export function contactLinks(profile: Profile): {
  email: string;
  whatsapp: string | null;
  telegram: string | null;
  phone: string | null;
} {
  const { email, whatsapp, telegram, phone } = profile.contact;
  return {
    email: `mailto:${email}`,
    whatsapp: whatsapp && `https://wa.me/${whatsapp}`,
    telegram: telegram && `https://t.me/${telegram}`,
    phone: phone && `tel:+${phone}`,
  };
}

/** A WhatsApp number (digits, country code first) as people write it: Bangladeshi mobiles as
 * "+880 1601-571480", anything else as "+" and the digits. */
export function displayPhone(digits: string): string {
  if (/^880\d{10}$/.test(digits)) return `+880 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  return `+${digits}`;
}
