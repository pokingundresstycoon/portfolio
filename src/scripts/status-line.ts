// Fills the live status line from status.paperbase.me. Any failure leaves it hidden.
import { parseSummary } from '../lib/status';

const SUMMARY_URL = 'https://status.paperbase.me/api/v1/summary.json';

async function showLiveStatus() {
  const line = document.querySelector<HTMLElement>('[data-live-status]');
  const text = line?.querySelector<HTMLElement>('[data-live-text]');
  if (!line || !text) return;
  try {
    const response = await fetch(SUMMARY_URL, { signal: AbortSignal.timeout(4000), credentials: 'omit', cache: 'no-store' });
    if (!response.ok) return;
    const live = parseSummary(await response.json(), Date.now() / 1000);
    if (!live) return;
    text.textContent = live.text;
    line.dataset.level = live.level;
    line.hidden = false;
  } catch {
    // Unreachable, blocked, slow or not JSON: the line stays hidden.
  }
}

if (document.readyState === 'complete') void showLiveStatus();
else addEventListener('load', () => void showLiveStatus(), { once: true });
