import { StatsDto } from '../../checks/dtos/stats.dto.js';

export function monitorStatsLines({
  period,
  checks,
  failures,
  uptimePercent,
  avgResponseTimeMs,
  p95ResponseTimeMs,
}: StatsDto): string[] {
  const title = `📊 <b>Last ${period}</b>`;
  if (checks === 0) return [title, 'No checks yet'];

  const lines = [title, `Uptime: <b>${uptimePercent}%</b> (${checks} checks, ${failures} failed)`];

  if (avgResponseTimeMs !== null) {
    lines.push(`Response: avg ${avgResponseTimeMs} ms · p95 ${p95ResponseTimeMs} ms`);
  }

  return lines;
}
