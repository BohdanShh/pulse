export const BOT_COMMANDS = [
  { command: 'start', description: 'Start using Pulse' },
  { command: 'add', description: 'Start monitoring a URL' },
  { command: 'apikey', description: 'Get a new API key (revokes the previous one)' },
  { command: 'revoke', description: 'Revoke your API key' },
];

export const POLLING_CONFLICT_ERROR_CODE = 409;

/** Telegram would otherwise fetch monitored URLs to build a preview (e.g. a JSON file card). */
export const NO_LINK_PREVIEW = { link_preview_options: { is_disabled: true } };
