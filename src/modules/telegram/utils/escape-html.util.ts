const HTML_ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

/** Escapes user input before it goes into an HTML-formatted Telegram message. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, char => HTML_ENTITIES[char]);
}
