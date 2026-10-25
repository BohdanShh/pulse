import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { MONITOR_STATUS_EMOJI } from '../constants/telegram.constant.js';
import { escapeHtml } from './escape-html.util.js';

export function monitorListMessage(monitors: Monitor[]): string {
  const items = monitors.map(
    ({ name, status }, index) =>
      `${index + 1}. ${MONITOR_STATUS_EMOJI[status]} ${escapeHtml(name)} — ${status}`,
  );

  return [
    `📋 <b>Your monitors</b> (${monitors.length})`,
    '',
    ...items,
    '',
    '<i>Send /status &lt;number&gt; for details.</i>',
  ].join('\n');
}
