import type { Profile, WorkEntry } from '../../src/lib/schema';

export const fullProfile: Profile = {
  name: 'Mushfikur Rahman',
  nickname: 'Mahi',
  role: 'Platform engineer + performance marketer',
  statusLine: 'Taking new work · Dhaka to worldwide',
  photo: 'mahi.jpg',
  photoFull: 'mahi-full.jpg',
  contact: {
    email: 'hello@mushfikurahmaan.com',
    whatsapp: '8801000000000',
    telegram: 'example_handle',
    phone: '8801000000000',
  },
  github: 'https://github.com/h8b2ckrx',
  numbers: { orders: '35,000+', sales: '৳3.5 Cr+', businessesGrown: null },
};

export const growthEntry: WorkEntry = {
  title: 'Test growth story',
  kind: 'growth',
  order: 30,
  chip: 'Growth · Case study',
  summary: 'Page, content and Meta ads',
  link: null,
  story: true,
  result: { headline: '1,234 orders in 3 months' },
};

export const infraEntry: WorkEntry = {
  title: 'Paperbase',
  kind: 'infra',
  order: 10,
  chip: 'Infrastructure',
  summary: 'Commerce platform · every shop, one system',
  link: null,
  story: true,
  result: null,
};
