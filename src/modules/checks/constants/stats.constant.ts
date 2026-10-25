import { DAY_MS, HOUR_MS } from '../../../common/constants/time.constant.js';

export const STATS_PERIODS = {
  '1h': HOUR_MS,
  '24h': DAY_MS,
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS,
} as const;

export const DEFAULT_STATS_PERIOD = '24h' satisfies keyof typeof STATS_PERIODS;
