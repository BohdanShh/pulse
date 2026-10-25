import { StatsDto } from '../../checks/dtos/stats.dto.js';
import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { MONITOR_STATUS_EMOJI } from '../constants/telegram.constant.js';
import { escapeHtml } from './escape-html.util.js';
import { formatTimeAgo } from './format-time-ago.util.js';
import { monitorStatsLines } from './monitor-stats-lines.util.js';

export function monitorStatusMessage(monitor: Monitor, stats: StatsDto): string {
  const { name, status, method, url, intervalSeconds, lastCheckedAt } = monitor;
  const lastCheck = lastCheckedAt
    ? `last check ${formatTimeAgo(lastCheckedAt)}`
    : 'not checked yet';

  return [
    `${MONITOR_STATUS_EMOJI[status]} <b>${escapeHtml(name)}</b> — ${status}`,
    '',
    `<code>${method} ${escapeHtml(url)}</code>`,
    `⏱ Every ${intervalSeconds}s · ${lastCheck}`,
    '',
    ...monitorStatsLines(stats),
  ].join('\n');
}
