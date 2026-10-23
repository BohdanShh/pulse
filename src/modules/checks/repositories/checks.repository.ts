import { Inject, Injectable } from '@nestjs/common';

import { and, desc, eq, gte, sql } from 'drizzle-orm';

import { DB, type Database } from '../../../database/database.module.js';
import { checks, monitors } from '../../../database/schema/index.js';
import { type MonitorStatus } from '../../monitors/entities/monitor.entity.js';
import { RESPONSE_TIME_PERCENTILE } from '../constants/stats.constant.js';
import { Check } from '../entities/check.entity.js';
import { type CheckResult } from '../types/check-result.type.js';

const checkColumns = {
  id: checks.id,
  ok: checks.ok,
  statusCode: checks.statusCode,
  responseTimeMs: checks.responseTimeMs,
  error: checks.error,
  checkedAt: checks.checkedAt,
};

const onlyOk = sql`filter (where ${checks.ok})`;
const onlyFailed = sql`filter (where not ${checks.ok})`;
const percentile = sql.raw(String(RESPONSE_TIME_PERCENTILE));

const avgResponseTime = sql`round(avg(${checks.responseTimeMs}) ${onlyOk})`;
const percentileResponseTime = sql`round(percentile_cont(${percentile}) within group (order by ${checks.responseTimeMs}) ${onlyOk})`;

const statsColumns = {
  checks: sql<number>`count(*)`.mapWith(Number),
  failures: sql<number>`count(*) ${onlyFailed}`.mapWith(Number),
  avgResponseTimeMs: sql<number | null>`${avgResponseTime}`.mapWith(Number),
  p95ResponseTimeMs: sql<number | null>`${percentileResponseTime}`.mapWith(Number),
};

@Injectable()
export class ChecksRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  recordCheck(
    monitorId: string,
    result: CheckResult,
    { status, checkedAt }: { status: MonitorStatus; checkedAt: Date },
  ): Promise<Check> {
    return this.db.transaction(async tx => {
      const [check] = await tx
        .insert(checks)
        .values({ ...result, monitorId, checkedAt })
        .returning(checkColumns);

      await tx
        .update(monitors)
        .set({ status, lastCheckedAt: checkedAt })
        .where(eq(monitors.id, monitorId));

      return check;
    });
  }

  async findPageByMonitor(
    monitorId: string,
    { limit, offset }: { limit: number; offset: number },
  ): Promise<{ items: Check[]; all: number }> {
    const byMonitor = eq(checks.monitorId, monitorId);

    const [items, all] = await Promise.all([
      this.db
        .select(checkColumns)
        .from(checks)
        .where(byMonitor)
        .orderBy(desc(checks.checkedAt))
        .limit(limit)
        .offset(offset),
      this.db.$count(checks, byMonitor),
    ]);

    return { items, all };
  }

  async getStats(monitorId: string, from: Date) {
    const [stats] = await this.db
      .select(statsColumns)
      .from(checks)
      .where(and(eq(checks.monitorId, monitorId), gte(checks.checkedAt, from)));

    return stats;
  }
}
