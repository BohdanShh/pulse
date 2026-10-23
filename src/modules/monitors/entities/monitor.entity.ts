import { monitors } from '../../../database/schema/index.js';
import { type HttpMethod } from '../types/http-method.type.js';
import { type MonitorStatus } from '../types/monitor-status.type.js';

type MonitorRow = typeof monitors.$inferSelect;

export class Monitor implements MonitorRow {
  /** @example "b0a4eef9-6aeb-4000-bb7a-a833e5f4b501" */
  id: string;

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

  /** PENDING until the first check, then UP or DOWN based on the last check. */
  status: MonitorStatus;

  /** When the monitor was last checked. Null if it has never been checked. */
  lastCheckedAt: Date | null;

  createdAt: Date;
}
