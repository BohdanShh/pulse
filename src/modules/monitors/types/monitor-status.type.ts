import { monitorStatus } from '../../../database/schema/index.js';

export type MonitorStatus = (typeof monitorStatus.enumValues)[number];
