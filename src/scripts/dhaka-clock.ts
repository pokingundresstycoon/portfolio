// The site's clocks show the time in Dhaka and turn over on the minute. Each stays hidden until
// this script has set it, so a page without JavaScript never shows a wrong time.
import { dhakaTime, msToNextMinute } from '../lib/clock';

for (const clock of document.querySelectorAll<HTMLElement>('[data-clock]')) {
  const tiles = [...clock.querySelectorAll<HTMLElement>('.flap')];
  const text = clock.querySelector<HTMLElement>('[data-clock-time]')!;
  const show = () => {
    const now = new Date();
    const time = dhakaTime(now);
    [...time].forEach((ch, i) => {
      if (tiles[i].textContent === ch) return;
      tiles[i].textContent = ch;
      // After the first showing, a tile that changes folds once, like the board's letters.
      if (clock.hasAttribute('data-ticking')) tiles[i].dataset.f = tiles[i].dataset.f === '0' ? '1' : '0';
    });
    text.textContent = time;
    clock.setAttribute('data-ticking', '');
    setTimeout(show, msToNextMinute(now.getTime()));
  };
  show();
}
