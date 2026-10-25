import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PaginationQueryDto } from '../../../common/pagination/dtos/pagination-query.dto.js';
import { buildPaginationMetadata } from '../../../common/pagination/utils/build-pagination-metadata.util.js';
import { getLimitOffset } from '../../../common/pagination/utils/get-limit-offset.util.js';
import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { MonitorsService } from '../../monitors/services/monitors.service.js';
import { DEFAULT_STATS_PERIOD, STATS_PERIODS } from '../constants/stats.constant.js';
import { ChecksPageDto } from '../dtos/checks-page.dto.js';
import { StatsQueryDto } from '../dtos/stats-query.dto.js';
import { StatsDto } from '../dtos/stats.dto.js';
import { Check } from '../entities/check.entity.js';
import {
  MONITOR_STATUS_CHANGED,
  type MonitorStatusChangedEvent,
} from '../events/monitor-status-changed.event.js';
import { ChecksRepository } from '../repositories/checks.repository.js';
import { CheckerService } from './checker.service.js';

@Injectable()
export class ChecksService {
  constructor(
    private readonly checksRepository: ChecksRepository,
    private readonly checkerService: CheckerService,
    private readonly monitorsService: MonitorsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async runCheck(monitorId: string, userId: string): Promise<Check> {
    const monitor = await this.monitorsService.findOne(monitorId, userId);
    return this.checkMonitor(monitor);
  }

  async checkMonitor(monitor: Monitor): Promise<Check> {
    const checkedAt = new Date();
    const result = await this.checkerService.check(monitor);
    const status = result.ok ? 'UP' : 'DOWN';

    const check = await this.checksRepository.recordCheck(monitor.id, result, {
      status,
      checkedAt,
    });

    if (status !== monitor.status) {
      this.eventEmitter.emit(MONITOR_STATUS_CHANGED, {
        monitor,
        from: monitor.status,
        to: status,
        check,
      } satisfies MonitorStatusChangedEvent);
    }

    return check;
  }

  async findByMonitor(
    monitorId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<ChecksPageDto> {
    await this.monitorsService.findOne(monitorId, userId);

    const { items, all } = await this.checksRepository.findPageByMonitor(
      monitorId,
      getLimitOffset(query),
    );

    return { items, metadata: buildPaginationMetadata(query, all) };
  }

  async getStats(monitorId: string, userId: string, query: StatsQueryDto): Promise<StatsDto> {
    await this.monitorsService.findOne(monitorId, userId);

    const period = query.period ?? DEFAULT_STATS_PERIOD;
    const from = new Date(Date.now() - STATS_PERIODS[period]);

    const stats = await this.checksRepository.getStats(monitorId, from);
    const { checks, failures } = stats;

    // Rounded to 2 decimals; null when there are no checks to divide by
    const uptimePercent =
      checks === 0 ? null : Math.round(((checks - failures) / checks) * 100 * 100) / 100;

    return { period, from, ...stats, uptimePercent };
  }
}
