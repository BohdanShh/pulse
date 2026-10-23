import { IsIn, IsOptional } from 'class-validator';

const HOUR_MS = 60 * 60 * 1000;

export const STATS_PERIODS = {
  '1h': HOUR_MS,
  '24h': 24 * HOUR_MS,
  '7d': 7 * 24 * HOUR_MS,
  '30d': 30 * 24 * HOUR_MS,
} as const;

export type StatsPeriod = keyof typeof STATS_PERIODS;

export const DEFAULT_STATS_PERIOD: StatsPeriod = '24h';

export class StatsQueryDto {
  /** Time window to calculate stats for. Defaults to 24h. */
  @IsOptional()
  @IsIn(Object.keys(STATS_PERIODS))
  period?: StatsPeriod = DEFAULT_STATS_PERIOD;
}
