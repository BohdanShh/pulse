import { type StatsPeriod } from '../../checks/types/stats-period.type.js';
import { type MonitorStatus } from '../../monitors/types/monitor-status.type.js';
import { type BotCommand } from '../types/bot-command.type.js';

/** The bot menu and /help are both built from this list. */
export const BOT_COMMANDS: BotCommand[] = [
  { command: 'start', description: 'Start using Pulse' },
  { command: 'help', description: 'Show available commands' },
  { command: 'add', args: '<url> [name]', description: 'Start monitoring a URL' },
  { command: 'list', description: 'Show your monitors' },
  { command: 'status', args: '<number>', description: 'Show monitor details and uptime' },
  { command: 'remove', args: '<number>', description: 'Stop monitoring a URL' },
  { command: 'apikey', description: 'Get a key to use the REST API outside Telegram' },
  { command: 'revoke', description: 'Revoke your REST API key' },
];

export const POLLING_CONFLICT_ERROR_CODE = 409;

/**
 * Options for every bot reply: HTML formatting, and no link previews
 * (Telegram would otherwise fetch monitored URLs to build one, e.g. a JSON file card).
 */
export const REPLY_OPTIONS = {
  parse_mode: 'HTML',
  link_preview_options: { is_disabled: true },
} as const;

export const MONITOR_STATUS_EMOJI: Record<MonitorStatus, string> = {
  UP: '🟢',
  DOWN: '🔴',
  PENDING: '⏳',
};

export const STATUS_STATS_PERIOD = '24h' satisfies StatsPeriod;
