import { type MonitorStatus } from '../../monitors/types/monitor-status.type.js';

export type RecordCheckOptions = {
  status: MonitorStatus;
  checkedAt: Date;
};
