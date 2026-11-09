import type { Profile, WorkEntry } from './schema';

/** What still stands between the site and going live (spec §8, launch rule). Empty = ready. */
export function launchProblems(profile: Profile, work: WorkEntry[]): string[] {
  const problems: string[] = [];
  if (!profile.photo) problems.push('Missing profile photo');
  if (!profile.contact.whatsapp) problems.push('Missing WhatsApp number');
  if (!profile.contact.telegram) problems.push('Missing Telegram handle');
  if (!work.some((w) => w.kind === 'growth')) problems.push('No growth story yet');
  return problems;
}
