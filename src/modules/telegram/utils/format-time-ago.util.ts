import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from '../../../common/constants/time.constant.js';

export function formatTimeAgo(date: Date, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - date.getTime());

  if (elapsed < MINUTE_MS) return `${Math.floor(elapsed / SECOND_MS)}s ago`;
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  return `${Math.floor(elapsed / DAY_MS)}d ago`;
}
