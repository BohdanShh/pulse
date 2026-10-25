/** The bot menu and /help are both built from this list. `args` is shown only in /help. */
export const BOT_COMMANDS: { command: string; description: string; args?: string }[] = [
  { command: 'start', description: 'Start using Pulse' },
  { command: 'help', description: 'Show available commands' },
  { command: 'add', args: '<url> [name]', description: 'Start monitoring a URL' },
  { command: 'list', description: 'Show your monitors' },
  { command: 'status', args: '<number>', description: 'Show monitor details and uptime' },
  { command: 'remove', args: '<number>', description: 'Stop monitoring a URL' },
  { command: 'apikey', description: 'Get a key to use the REST API outside Telegram' },
  { command: 'revoke', description: 'Revoke your REST API key' },
];

/**
 * Options for every bot reply: HTML formatting, and no link previews
 * (Telegram would otherwise fetch monitored URLs to build one, e.g. a JSON file card).
 * User input in a reply must go through escapeHtml().
 */
export const REPLY_OPTIONS = {
  parse_mode: 'HTML',
  link_preview_options: { is_disabled: true },
} as const;
