// The departures board rolls its letters into place once, left to right and row by row, like a
// split-flap board. Without this script, or with reduced motion, the letters simply sit in place.
import { rollSequence } from '../lib/flap';

const STEP_MS = 55;
const ROW_DELAY_MS = 180;
const board = document.querySelector<HTMLElement>('[data-departures]');

if (board && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  let pending = 0;
  const done = () => {
    board.removeAttribute('data-rolling');
    board.setAttribute('data-rolled', '');
  };
  board.setAttribute('data-rolling', '');
  board.querySelectorAll<HTMLElement>('[data-flight]').forEach((row, r) => {
    row.querySelectorAll<HTMLElement>('.flap').forEach((flap, c) => {
      const target = flap.textContent ?? '';
      // Later columns turn a few more times, so the letters land in a sweep from the left.
      const seq = rollSequence(target === ' ' ? ' ' : target, 4 + c);
      if (seq.length === 1) return;
      pending++;
      let k = 0;
      flap.textContent = seq[0];
      const turn = () => {
        k++;
        flap.textContent = seq[k];
        flap.dataset.f = String(k % 2);
        if (k < seq.length - 1) setTimeout(turn, STEP_MS);
        else if (--pending === 0) done();
      };
      setTimeout(turn, r * ROW_DELAY_MS + STEP_MS);
    });
  });
  if (pending === 0) done();
}
