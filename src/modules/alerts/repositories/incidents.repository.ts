import { Inject, Injectable } from '@nestjs/common';

import { and, eq, isNull, sql } from 'drizzle-orm';

import { DB, type Database } from '../../../database/database.module.js';
import { incidents } from '../../../database/schema/index.js';
import { Incident } from '../entities/incident.entity.js';

@Injectable()
export class IncidentsRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async open(monitorId: string, startedAt: Date, cause: string | null): Promise<void> {
    // The partial unique index allows one open incident per monitor; a second open is a no-op
    await this.db
      .insert(incidents)
      .values({ monitorId, startedAt, cause })
      .onConflictDoNothing({
        target: incidents.monitorId,
        where: sql`${incidents.endedAt} IS NULL`,
      });
  }

  async close(monitorId: string, endedAt: Date): Promise<Incident | undefined> {
    const [incident] = await this.db
      .update(incidents)
      .set({ endedAt })
      .where(and(eq(incidents.monitorId, monitorId), isNull(incidents.endedAt)))
      .returning();

    return incident;
  }
}
