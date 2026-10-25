import { escapeHtml } from './escape-html.util.js';

export function invalidMonitorMessage(messages: string[]): string {
  return [
    '❌ <b>Cannot add this monitor</b>',
    ...messages.map(message => `• ${escapeHtml(message)}`),
  ].join('\n');
}
