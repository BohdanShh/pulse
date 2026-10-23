import { Inject, Injectable } from '@nestjs/common';

import { and, desc, eq, lt } from 'drizzle-orm';

import { DB, type Database } from '../../database/database.module.js';
import { checks } from '../../database/schema.js';
import { MonitorsService } from '../monitors/monitors.service.js';
import { ChecksPageDto } from './dto/checks-page.dto.js';
import { ListChecksQueryDto } from './dto/list-checks-query.dto.js';

const DEFAULT_LIMIT = 20;

@Injectable()
export class ChecksService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly monitorsService: MonitorsService,
  ) {}

  async findByMonitor(monitorId: string, query: ListChecksQueryDto): Promise<ChecksPageDto> {
    await this.monitorsService.findOne(monitorId);

    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = await this.db
      .select({
        id: checks.id,
        ok: checks.ok,
        statusCode: checks.statusCode,
        responseTimeMs: checks.responseTimeMs,
        error: checks.error,
        checkedAt: checks.checkedAt,
      })
      .from(checks)
      .where(
        and(
          eq(checks.monitorId, monitorId),
          query.before ? lt(checks.checkedAt, new Date(query.before)) : undefined,
        ),
      )
      .orderBy(desc(checks.checkedAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].checkedAt.toISOString() : null,
    };
  }
}
