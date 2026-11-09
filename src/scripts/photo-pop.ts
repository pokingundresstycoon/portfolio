// The whole photo, opened from the circle in About. A click, tap or Enter opens it through
// popovertarget, with no script needed. With a mouse, resting on the circle opens it too, once its
// ring has swept round; moving away closes it again. It grows out of the circle, so this tells it
// where the circle is.
const photoOpener = document.querySelector<HTMLButtonElement>('[data-photo-open]');
const photoPopup = document.querySelector<HTMLElement>('[data-photo-pop]');
const photoFrame = document.querySelector<HTMLElement>('[data-photo-frame]');

if (photoOpener && photoPopup && photoFrame) {
  const circle = photoOpener.closest<HTMLElement>('[data-photo]')!;
  const picture = photoFrame.querySelector('img');
  // As long as the ring takes to sweep round (About.astro); a quick pass over the photo opens nothing.
  const dwell = matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 550;
  const isMouse = (e: PointerEvent) => e.pointerType === 'mouse';
  let opening = 0;
  let pointer = { x: -1, y: -1 };
  // Where the pointer was when resting opened it; only a pop-up opened that way closes on leaving.
  let restedAt: { x: number; y: number } | null = null;
  // After a close with the pointer still on the circle, resting opens nothing until it leaves.
  let armed = true;

  addEventListener('pointermove', (e) => (pointer = { x: e.clientX, y: e.clientY }), { passive: true });
  const onCircle = () => {
    const r = photoOpener.getBoundingClientRect();
    return pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
  };

  // Start fetching the big photo as soon as someone shows interest.
  const load = () => {
    if (picture) picture.loading = 'eager';
  };

  // The pop-up starts on the circle, at the circle's size; its width matches .about__frame.
  const growFromCircle = () => {
    const r = photoOpener.getBoundingClientRect();
    const width = Math.min(Math.min(720, innerHeight * 0.86) * 0.75, innerWidth * 0.92);
    photoPopup.style.setProperty('--fx', `${r.left + r.width / 2 - innerWidth / 2}px`);
    photoPopup.style.setProperty('--fy', `${r.top + r.height / 2 - innerHeight / 2}px`);
    photoPopup.style.setProperty('--fs', String(r.width / width));
  };

  const close = () => {
    if (photoPopup.matches(':popover-open')) photoPopup.hidePopover();
  };

  photoPopup.addEventListener('beforetoggle', (e) => {
    if ((e as ToggleEvent).newState === 'open') {
      load();
      growFromCircle();
    } else {
      clearTimeout(opening);
      restedAt = null;
      armed = !onCircle();
      delete circle.dataset.hover;
    }
  });

  photoOpener.addEventListener('focus', load);
  photoOpener.addEventListener('pointerenter', (e) => {
    if (!isMouse(e) || !armed) return;
    load();
    circle.dataset.hover = '';
    opening = window.setTimeout(() => {
      if (photoPopup.matches(':popover-open')) return;
      restedAt = pointer;
      photoPopup.showPopover();
    }, dwell);
  });
  photoOpener.addEventListener('pointerleave', (e) => {
    if (!isMouse(e)) return;
    armed = true;
    clearTimeout(opening);
    if (!photoPopup.matches(':popover-open')) delete circle.dataset.hover;
  });

  // The dim layer around the picture: a click there closes it, and so does moving off a pop-up
  // that resting opened, once the pointer has really moved.
  photoPopup.addEventListener('click', (e) => {
    if (e.target === photoPopup) close();
  });
  photoPopup.addEventListener('pointermove', (e) => {
    if (!isMouse(e) || e.target !== photoPopup || !restedAt) return;
    if (Math.hypot(e.clientX - restedAt.x, e.clientY - restedAt.y) > 40) close();
  });
  photoFrame.addEventListener('pointerleave', (e) => {
    if (isMouse(e) && restedAt) close();
  });
}
