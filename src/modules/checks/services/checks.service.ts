import { Injectable } from '@nestjs/common';

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
import { ChecksRepository } from '../repositories/checks.repository.js';
import { calculateUptimePercent } from '../utils/calculate-uptime.util.js';
import { CheckerService } from './checker.service.js';

@Injectable()
export class ChecksService {
  constructor(
    private readonly checksRepository: ChecksRepository,
    private readonly checkerService: CheckerService,
    private readonly monitorsService: MonitorsService,
  ) {}

  async runCheck(monitorId: string): Promise<Check> {
    const monitor = await this.monitorsService.findOne(monitorId);
    return this.checkMonitor(monitor);
  }

  async checkMonitor(monitor: Monitor): Promise<Check> {
    const checkedAt = new Date();
    const result = await this.checkerService.check(monitor);

    return this.checksRepository.recordCheck(monitor.id, result, {
      status: result.ok ? 'UP' : 'DOWN',
      checkedAt,
    });
  }

  async findByMonitor(monitorId: string, query: PaginationQueryDto): Promise<ChecksPageDto> {
    await this.monitorsService.findOne(monitorId);

    const { items, all } = await this.checksRepository.findPageByMonitor(
      monitorId,
      getLimitOffset(query),
    );

    return { items, metadata: buildPaginationMetadata(query, all) };
  }

  async getStats(monitorId: string, query: StatsQueryDto): Promise<StatsDto> {
    await this.monitorsService.findOne(monitorId);

    const period = query.period ?? DEFAULT_STATS_PERIOD;
    const from = new Date(Date.now() - STATS_PERIODS[period]);

    const stats = await this.checksRepository.getStats(monitorId, from);

    return {
      period,
      from,
      ...stats,
      uptimePercent: calculateUptimePercent(stats.checks, stats.failures),
    };
  }
}
