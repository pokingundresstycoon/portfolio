// "Copy link": the Clipboard API where it exists, otherwise a selected read-only field to copy from.
// The button says "Copied" for two seconds and a status line tells screen readers the same.
const button = document.querySelector<HTMLButtonElement>('[data-copy]');
const label = button?.querySelector<HTMLElement>('[data-copy-label]');
const field = document.querySelector<HTMLInputElement>('[data-copy-field]');
const copyStatus = document.querySelector<HTMLElement>('[data-copy-status]');

if (button && label && field) {
  const url = button.dataset.shareUrl ?? location.href;
  let reset: number | undefined;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('No Clipboard API');
      await navigator.clipboard.writeText(url);
      label.textContent = 'Copied';
      if (copyStatus) copyStatus.textContent = 'Link copied';
      clearTimeout(reset);
      reset = window.setTimeout(() => {
        label.textContent = 'Copy link';
        if (copyStatus) copyStatus.textContent = '';
      }, 2000);
    } catch {
      field.hidden = false;
      field.focus();
      field.select();
    }
  });
}
