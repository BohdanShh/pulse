const HTML_ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, char => HTML_ENTITIES[char]);
}
