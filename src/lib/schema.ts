import { z } from 'zod';

export const profileSchema = z.strictObject({
  name: z.string().min(1),
  nickname: z.string().min(1),
  role: z.string().min(1),
  statusLine: z.string().min(1),
  photo: z.string().regex(/\.(jpe?g|png|webp|avif)$/i).nullable(),
  contact: z.strictObject({
    email: z.email(),
    whatsapp: z.string().regex(/^\d{10,15}$/).nullable(),
    telegram: z.string().regex(/^[A-Za-z0-9_]{5,32}$/).nullable(),
    /** For calls, digits with the country code first, like the WhatsApp number. */
    phone: z.string().regex(/^\d{10,15}$/).nullable(),
  }),
  github: z.url(),
  numbers: z.strictObject({
    orders: z.string().min(1),
    sales: z.string().min(1),
    businessesGrown: z.string().min(1).nullable(),
  }),
});

export const workSchema = z
  .strictObject({
    title: z.string().min(1),
    kind: z.enum(['growth', 'infra', 'oss']),
    order: z.number().int(),
    chip: z.string().min(1),
    summary: z.string().min(1),
    link: z.url().nullable(),
    story: z.boolean(),
    result: z
      .strictObject({ headline: z.string().min(1) })
      .nullable(),
  })
  .refine((w) => w.kind !== 'growth' || w.result !== null, { message: 'Growth work needs a result', path: ['result'] });

/** One maker on the Tools grid: Meta once, with its five tools, rather than five Meta pills. */
export const toolSchema = z.strictObject({
  name: z.string().min(1),
  side: z.enum(['growth', 'infra']),
  /** File name (without .svg) of the maker's full-colour logo in public/logos/, or null for a letter. */
  logo: z.string().regex(/^[a-z0-9-]+$/).nullable(),
  /** Every tool by its full name, as the PDF lists them. */
  tools: z.array(z.string().min(1)).min(1),
  /** The short line under the name on the site: what it does here, or which of its tools. */
  note: z.string().min(1),
});

export const buildLogSchema = z.strictObject({
  /** The first commit, as YYYY-MM-DD; the months building are counted from it at build time. */
  started: z.iso.date(),
  commits: z.string().min(1),
  shopsLive: z.string().min(1),
  uptime: z.strictObject({ value: z.string().min(1), label: z.string().min(1) }),
  milestones: z
    .array(
      z.strictObject({
        when: z.string().min(1),
        title: z.string().min(1),
        text: z.string().min(1),
        visual: z.enum(['merge']).optional(),
        link: z.strictObject({ label: z.string().min(1), href: z.url() }).optional(),
      }),
    )
    .min(1),
});

export const faqSchema = z.strictObject({ q: z.string().min(1), a: z.string().min(1) });

export type Profile = z.infer<typeof profileSchema>;
export type WorkEntry = z.infer<typeof workSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type FaqItem = z.infer<typeof faqSchema>;
export type BuildLog = z.infer<typeof buildLogSchema>;

/** Validates the work collection's entries; a bad front-matter fails the build. */
export function parseWork(entries: { id: string; data: unknown }[]): (WorkEntry & { id: string })[] {
  return entries.map(({ id, data }) => ({ id, ...workSchema.parse(data) }));
}
