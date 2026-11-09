// "Copy email address": the Clipboard API where it exists, otherwise the address is selected so it
// can be copied by hand. A status line tells screen readers it worked.
const emailButton = document.querySelector<HTMLButtonElement>('[data-copy-email]');
const emailAddress = document.querySelector<HTMLElement>('[data-email]');
const emailStatus = document.querySelector<HTMLElement>('[data-copy-email-status]');

if (emailButton && emailAddress) {
  let reset: number | undefined;
  emailButton.hidden = false;
  emailButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('No Clipboard API');
      await navigator.clipboard.writeText(emailAddress.textContent!.trim());
      emailButton.dataset.copied = '';
      if (emailStatus) emailStatus.textContent = 'Email address copied';
      clearTimeout(reset);
      reset = window.setTimeout(() => {
        delete emailButton.dataset.copied;
        if (emailStatus) emailStatus.textContent = '';
      }, 2000);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(emailAddress);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(range);
    }
  });
}
