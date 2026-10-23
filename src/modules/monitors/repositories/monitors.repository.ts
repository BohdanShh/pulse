import { Inject, Injectable } from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { DB, type Database } from '../../../database/database.module.js';
import { monitors } from '../../../database/schema/index.js';
import { Monitor } from '../entities/monitor.entity.js';
import { type NewMonitor } from '../types/new-monitor.type.js';

@Injectable()
export class MonitorsRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async create(data: NewMonitor): Promise<Monitor> {
    const [monitor] = await this.db.insert(monitors).values(data).returning();
    return monitor;
  }

  findAll(): Promise<Monitor[]> {
    return this.db.select().from(monitors);
  }

  async findById(id: string): Promise<Monitor | undefined> {
    const [monitor] = await this.db.select().from(monitors).where(eq(monitors.id, id));
    return monitor;
  }

  async update(id: string, data: Partial<NewMonitor>): Promise<Monitor | undefined> {
    const [monitor] = await this.db
      .update(monitors)
      .set(data)
      .where(eq(monitors.id, id))
      .returning();
    return monitor;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(monitors)
      .where(eq(monitors.id, id))
      .returning({ id: monitors.id });
    return deleted.length > 0;
  }
}
