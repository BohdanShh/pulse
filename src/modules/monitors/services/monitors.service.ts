import { Injectable } from '@nestjs/common';

import { NothingToUpdateException } from '../../../common/exceptions/nothing-to-update.exception.js';
import { CreateMonitorDto } from '../dtos/create-monitor.dto.js';
import { UpdateMonitorDto } from '../dtos/update-monitor.dto.js';
import { Monitor } from '../entities/monitor.entity.js';
import { MonitorLimitReachedException } from '../exceptions/monitor-limit-reached.exception.js';
import { MonitorNotFoundException } from '../exceptions/monitor-not-found.exception.js';
import { MonitorsRepository } from '../repositories/monitors.repository.js';

@Injectable()
export class MonitorsService {
  constructor(private readonly monitorsRepository: MonitorsRepository) {}

  async create(userId: string, dto: CreateMonitorDto): Promise<Monitor> {
    // Keeps the scheduler load per user bounded and /list within Telegram's 4096-char message limit
    const limit = 20;

    if ((await this.monitorsRepository.countByUser(userId)) >= limit) {
      throw new MonitorLimitReachedException(limit);
    }

    return this.monitorsRepository.create(userId, dto);
  }

  findAll(userId: string): Promise<Monitor[]> {
    return this.monitorsRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<Monitor> {
    const monitor = await this.monitorsRepository.findByIdAndUser(id, userId);

    if (!monitor) {
      throw new MonitorNotFoundException(id);
    }

    return monitor;
  }

  async update(id: string, userId: string, dto: UpdateMonitorDto): Promise<Monitor> {
    if (Object.keys(dto).length === 0) {
      throw new NothingToUpdateException();
    }

    const monitor = await this.monitorsRepository.update(id, userId, dto);

    if (!monitor) {
      throw new MonitorNotFoundException(id);
    }

    return monitor;
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.monitorsRepository.delete(id, userId);

    if (!deleted) {
      throw new MonitorNotFoundException(id);
    }
  }
}
