import { escapeHtml } from './escape-html.util.js';

export function welcomeMessage(firstName: string): string {
  return [
    `👋 <b>Hi, ${escapeHtml(firstName)}!</b>`,
    '',
    "I'm Pulse — I check your APIs and websites and let you know here when they go down or recover.",
    '',
    '➕ /add — start monitoring a URL',
    '📖 /help — all commands',
  ].join('\n');
}
