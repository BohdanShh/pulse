import { monitors } from '../../../database/schema/index.js';
import { type HttpMethod } from '../types/http-method.type.js';
import { type MonitorStatus } from '../types/monitor-status.type.js';

type MonitorRow = typeof monitors.$inferSelect;

export class Monitor implements MonitorRow {
  /** @example "b0a4eef9-6aeb-4000-bb7a-a833e5f4b501" */
  id: string;

  /**
   * Owner of the monitor.
   * @example "3f2b8c1e-6a4d-4b7e-9c2a-1d5e8f7a6b90"
   */
  userId: string;

  /** @example "GitHub API" */
  name: string;

  /** @example "https://api.github.com" */
  url: string;

  /** HTTP method used for the check. */
  method: HttpMethod;

  /**
   * How often the URL is checked, in seconds.
   * @example 60
   */
  intervalSeconds: number;

  /**
   * PENDING until the first successful check or 3 failed checks in a row.
   * Becomes DOWN after 3 failed checks in a row and UP again after one successful check.
   */
  status: MonitorStatus;

  /**
   * Failed checks in a row since the last successful one.
   * @example 0
   */
  consecutiveFailures: number;

  /** When the monitor was last checked. Null if it has never been checked. */
  lastCheckedAt: Date | null;

  createdAt: Date;
}
