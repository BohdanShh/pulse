import { Injectable } from '@nestjs/common';

import { NothingToUpdateException } from '../../../common/exceptions/nothing-to-update.exception.js';
import { CreateMonitorDto } from '../dtos/create-monitor.dto.js';
import { UpdateMonitorDto } from '../dtos/update-monitor.dto.js';
import { Monitor } from '../entities/monitor.entity.js';
import { MonitorNotFoundException } from '../exceptions/monitor-not-found.exception.js';
import { MonitorsRepository } from '../repositories/monitors.repository.js';

@Injectable()
export class MonitorsService {
  constructor(private readonly monitorsRepository: MonitorsRepository) {}

  create(dto: CreateMonitorDto): Promise<Monitor> {
    return this.monitorsRepository.create(dto);
  }

  findAll(): Promise<Monitor[]> {
    return this.monitorsRepository.findAll();
  }

  async findOne(id: string): Promise<Monitor> {
    const monitor = await this.monitorsRepository.findById(id);

    if (!monitor) {
      throw new MonitorNotFoundException(id);
    }

    return monitor;
  }

  async update(id: string, dto: UpdateMonitorDto): Promise<Monitor> {
    if (Object.keys(dto).length === 0) {
      throw new NothingToUpdateException();
    }

    const monitor = await this.monitorsRepository.update(id, dto);

    if (!monitor) {
      throw new MonitorNotFoundException(id);
    }

    return monitor;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.monitorsRepository.delete(id);

    if (!deleted) {
      throw new MonitorNotFoundException(id);
    }
  }
}
