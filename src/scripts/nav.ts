// The nav stays out of sight at the top of the page. Browsers with scroll-linked animation do
// this in CSS alone; the rest get it from this scroll listener.
if (!CSS.supports('animation-timeline: scroll()')) {
  const nav = document.querySelector<HTMLElement>('header.nav');
  if (nav) {
    const update = () => nav.toggleAttribute('data-at-top', scrollY < 40);
    addEventListener('scroll', update, { passive: true });
    update();
  }
}
