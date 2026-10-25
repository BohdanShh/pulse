import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { escapeHtml } from './escape-html.util.js';

export function monitorAddedMessage({ name, url, method, intervalSeconds }: Monitor): string {
  return [
    '✅ <b>Monitor added</b>',
    '',
    `<b>${escapeHtml(name)}</b>`,
    `<code>${method} ${escapeHtml(url)}</code>`,
    `⏱ Every ${intervalSeconds}s · first check in a few seconds`,
  ].join('\n');
}
