/** A WhatsApp "send to anyone" link carrying one line and the page URL. */
export function whatsappShareUrl(pageUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`Mushfikur Rahman's work profile: ${pageUrl}`)}`;
}
