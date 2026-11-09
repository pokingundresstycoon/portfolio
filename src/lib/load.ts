import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { buildLogSchema, faqSchema, profileSchema, toolSchema } from './schema';
import type { BuildLog, FaqItem, Profile, Tool } from './schema';

const contentRoot = () => process.env.CONTENT_ROOT ?? 'src';

function readData(file: string): unknown {
  return JSON.parse(readFileSync(join(contentRoot(), 'data', file), 'utf8'));
}

export const loadProfile = (): Profile => profileSchema.parse(readData('profile.json'));
export const loadTools = (): Tool[] => z.array(toolSchema).parse(readData('tools.json'));
export const loadFaq = (): FaqItem[] => z.array(faqSchema).parse(readData('faq.json'));
export const loadBuildLog = (): BuildLog => buildLogSchema.parse(readData('build-log.json'));
