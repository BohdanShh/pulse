import { type StatsPeriod } from '../types/stats-period.type.js';

export class StatsDto {
  /** @example "24h" */
  period: StatsPeriod;

  /** Start of the time window. */
  from: Date;

  /**
   * Number of checks in the period.
   * @example 1440
   */
  checks: number;

  /**
   * Number of failed checks.
   * @example 98
   */
  failures: number;

  /**
   * Share of successful checks, %. Null when there are no checks.
   * @example 93.19
   */
  uptimePercent: number | null;

  /**
   * Average response time of successful checks. Null when there are none.
   * @example 455
   */
  avgResponseTimeMs: number | null;

  /**
   * 95th percentile response time of successful checks. Null when there are none.
   * @example 392
   */
  p95ResponseTimeMs: number | null;
}
