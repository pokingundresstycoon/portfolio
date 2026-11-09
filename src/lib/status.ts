const TEXT = {
  operational: 'all systems operational',
  degraded: 'some parts are slow',
  partial: 'partial outage',
  major: 'major outage',
  maintenance: 'planned maintenance',
} as const;

export type LiveLevel = keyof typeof TEXT;

/** Older than this and the summary no longer says anything about now. */
const STALE_AFTER_S = 600;

/** Reads status.paperbase.me's summary. Anything unexpected or stale gives null: show nothing. */
export function parseSummary(json: unknown, nowSec: number): { level: LiveLevel; text: string } | null {
  if (typeof json !== 'object' || json === null) return null;
  const { overall, at } = json as Record<string, unknown>;
  if (typeof overall !== 'string' || typeof at !== 'number' || !Object.hasOwn(TEXT, overall)) return null;
  if (nowSec - at > STALE_AFTER_S) return null;
  const level = overall as LiveLevel;
  return { level, text: TEXT[level] };
}
