import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { runWithConcurrency } from '../../../common/utils/run-with-concurrency.util.js';
import {
  CHECK_CONCURRENCY,
  CLAIM_BATCH_SIZE,
  SCHEDULER_TICK_MS,
} from '../constants/scheduler.constant.js';
import { ChecksRepository } from '../repositories/checks.repository.js';
import { ChecksService } from './checks.service.js';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly checksRepository: ChecksRepository,
    private readonly checksService: ChecksService,
  ) {}

  @Interval(SCHEDULER_TICK_MS)
  async tick(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Previous tick is still running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      const monitors = await this.checksRepository.claimDueMonitors(CLAIM_BATCH_SIZE);
      if (monitors.length === 0) return;

      const results = await runWithConcurrency(monitors, CHECK_CONCURRENCY, monitor =>
        this.checksService.checkMonitor(monitor),
      );

      const up = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const down = results.filter(r => r.status === 'fulfilled' && !r.value.ok).length;
      const failed = results.length - up - down;

      this.logger.log(
        `Checked ${monitors.length} monitors: ${up} up, ${down} down, ${failed} failed`,
      );
    } catch (error) {
      this.logger.error('Scheduler tick failed', error instanceof Error ? error.stack : error);
    } finally {
      this.isRunning = false;
    }
  }
}
