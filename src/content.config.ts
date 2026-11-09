import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const root = process.env.CONTENT_ROOT ?? 'src';

// Front-matter is validated by parseWork (src/lib/schema.ts) where the pages read it.
export const collections = {
  work: defineCollection({ loader: glob({ pattern: '*.md', base: `./${root}/content/work` }) }),
};
