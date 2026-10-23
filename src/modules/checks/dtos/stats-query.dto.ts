import { IsIn, IsOptional } from 'class-validator';

import { DEFAULT_STATS_PERIOD, STATS_PERIODS } from '../constants/stats.constant.js';
import { type StatsPeriod } from '../types/stats-period.type.js';

export class StatsQueryDto {
  /** Time window to calculate stats for. Defaults to 24h. */
  @IsOptional()
  @IsIn(Object.keys(STATS_PERIODS))
  period?: StatsPeriod = DEFAULT_STATS_PERIOD;
}
