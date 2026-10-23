import { Inject, Injectable } from '@nestjs/common';

import { desc, eq } from 'drizzle-orm';

import { DEFAULT_LIMIT, PaginationQueryDto } from '../../common/pagination/pagination-query.dto.js';
import { buildPaginationMetadata, getOffset } from '../../common/pagination/pagination.js';
import { DB, type Database } from '../../database/database.module.js';
import { checks } from '../../database/schema.js';
import { MonitorsService } from '../monitors/monitors.service.js';
import { ChecksPageDto } from './dto/checks-page.dto.js';

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
}
