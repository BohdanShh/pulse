import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { type MonitorStatus } from '../../monitors/types/monitor-status.type.js';
import { Check } from '../entities/check.entity.js';

export const MONITOR_STATUS_CHANGED = 'monitor.status-changed';

/** Emitted by ChecksService when a check moves a monitor to a different status. */
export type MonitorStatusChangedEvent = {
  /** The monitor as it was before the check (its `status` is the previous one). */
  monitor: Monitor;
  from: MonitorStatus;
  to: MonitorStatus;
  check: Check;
};
