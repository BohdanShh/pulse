import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { DB, type Database } from '../database/database.module.js';
import { monitors } from '../database/schema.js';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { Monitor } from './entities/monitor.entity.js';

@Injectable()
export class MonitorsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async create(dto: CreateMonitorDto): Promise<Monitor> {
    const [monitor] = await this.db.insert(monitors).values(dto).returning();
    return monitor;
  }

  findAll(): Promise<Monitor[]> {
    return this.db.select().from(monitors);
  }

  async findOne(id: string): Promise<Monitor> {
    const [monitor] = await this.db.select().from(monitors).where(eq(monitors.id, id));

    if (!monitor) {
      throw new NotFoundException(`Monitor ${id} not found`);
    }

    return monitor;
  }

  async update(id: string, dto: UpdateMonitorDto): Promise<Monitor> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Nothing to update');
    }

    const [monitor] = await this.db
      .update(monitors)
      .set(dto)
      .where(eq(monitors.id, id))
      .returning();

    if (!monitor) {
      throw new NotFoundException(`Monitor ${id} not found`);
    }

    return monitor;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.db
      .delete(monitors)
      .where(eq(monitors.id, id))
      .returning({ id: monitors.id });

    if (deleted.length === 0) {
      throw new NotFoundException(`Monitor ${id} not found`);
    }
  }
}
