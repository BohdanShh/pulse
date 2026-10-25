import { StatsDto } from '../../checks/dtos/stats.dto.js';

export function monitorStatsLines({
  period,
  checks,
  failures,
  uptimePercent,
  avgResponseTimeMs,
  p95ResponseTimeMs,
}: StatsDto): string[] {
  if (checks === 0) return [`Last ${period}: no checks yet`];

  const lines = [
    `Last ${period}:`,
    `Uptime: ${uptimePercent}% (${checks} checks, ${failures} failed)`,
  ];

  if (avgResponseTimeMs !== null) {
    lines.push(`Response time: avg ${avgResponseTimeMs} ms, p95 ${p95ResponseTimeMs} ms`);
  }

  return lines;
}
