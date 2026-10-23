import { Inject, Injectable } from '@nestjs/common';

import { and, count, desc, eq, gte, sql } from 'drizzle-orm';

import { DEFAULT_LIMIT, PaginationQueryDto } from '../../common/pagination/pagination-query.dto.js';
import { buildPaginationMetadata, getOffset } from '../../common/pagination/pagination.js';
import { DB, type Database } from '../../database/database.module.js';
import { checks } from '../../database/schema.js';
import { MonitorsService } from '../monitors/monitors.service.js';
import { ChecksPageDto } from './dto/checks-page.dto.js';
import { DEFAULT_STATS_PERIOD, STATS_PERIODS, StatsQueryDto } from './dto/stats-query.dto.js';
import { StatsDto } from './dto/stats.dto.js';

@Injectable()
export class ChecksService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly monitorsService: MonitorsService,
  ) {}

  async findByMonitor(monitorId: string, query: PaginationQueryDto): Promise<ChecksPageDto> {
    await this.monitorsService.findOne(monitorId);

    const byMonitor = eq(checks.monitorId, monitorId);

    const [items, all] = await Promise.all([
      this.db
        .select({
          id: checks.id,
          ok: checks.ok,
          statusCode: checks.statusCode,
          responseTimeMs: checks.responseTimeMs,
          error: checks.error,
          checkedAt: checks.checkedAt,
        })
        .from(checks)
        .where(byMonitor)
        .orderBy(desc(checks.checkedAt))
        .limit(query.limit ?? DEFAULT_LIMIT)
        .offset(getOffset(query)),
      this.db.$count(checks, byMonitor),
    ]);

    return { items, metadata: buildPaginationMetadata(query, all) };
  }

  async getStats(monitorId: string, query: StatsQueryDto): Promise<StatsDto> {
    await this.monitorsService.findOne(monitorId);

    const period = query.period ?? DEFAULT_STATS_PERIOD;
    const from = new Date(Date.now() - STATS_PERIODS[period]);

    const onlyOk = sql`filter (where ${checks.ok})`;
    const avg = sql`round(avg(${checks.responseTimeMs}) ${onlyOk})`;
    const p95 = sql`round(percentile_cont(0.95) within group (order by ${checks.responseTimeMs}) ${onlyOk})`;

    const [row] = await this.db
      .select({
        checks: count(),
        failures: sql<number>`count(*) filter (where not ${checks.ok})`.mapWith(Number),
        avgResponseTimeMs: sql<number | null>`${avg}`.mapWith(Number),
        p95ResponseTimeMs: sql<number | null>`${p95}`.mapWith(Number),
      })
      .from(checks)
      .where(and(eq(checks.monitorId, monitorId), gte(checks.checkedAt, from)));

    const uptimePercent =
      row.checks > 0 ? Math.round(((row.checks - row.failures) / row.checks) * 10_000) / 100 : null;

    return { period, from, ...row, uptimePercent };
  }
}
