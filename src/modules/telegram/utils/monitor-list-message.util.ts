import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { MONITOR_STATUS_EMOJI } from '../constants/telegram.constant.js';

export function monitorListMessage(monitors: Monitor[]): string {
  const items = monitors.map(
    ({ name, status }) => `${MONITOR_STATUS_EMOJI[status]} ${name} — ${status.toUpperCase()}`,
  );

  return [`📋 Your monitors (${monitors.length}):`, '', ...items].join('\n');
}
