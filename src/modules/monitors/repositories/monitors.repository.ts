import { Inject, Injectable } from '@nestjs/common';

import { and, eq } from 'drizzle-orm';

import { DB, type Database } from '../../../database/database.module.js';
import { monitors } from '../../../database/schema/index.js';
import { Monitor } from '../entities/monitor.entity.js';
import { type NewMonitor } from '../types/new-monitor.type.js';

const byIdAndUser = (id: string, userId: string) =>
  and(eq(monitors.id, id), eq(monitors.userId, userId));

@Injectable()
export class MonitorsRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async create(userId: string, data: Omit<NewMonitor, 'userId'>): Promise<Monitor> {
    const [monitor] = await this.db
      .insert(monitors)
      .values({ ...data, userId })
      .returning();
    return monitor;
  }

  findAllByUser(userId: string): Promise<Monitor[]> {
    return this.db.select().from(monitors).where(eq(monitors.userId, userId));
  }

  async findByIdAndUser(id: string, userId: string): Promise<Monitor | undefined> {
    const [monitor] = await this.db.select().from(monitors).where(byIdAndUser(id, userId));
    return monitor;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<NewMonitor>,
  ): Promise<Monitor | undefined> {
    const [monitor] = await this.db
      .update(monitors)
      .set(data)
      .where(byIdAndUser(id, userId))
      .returning();
    return monitor;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(monitors)
      .where(byIdAndUser(id, userId))
      .returning({ id: monitors.id });
    return deleted.length > 0;
  }
}
