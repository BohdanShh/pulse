import { BeforeApplicationShutdown, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { getErrorStack } from '../../../common/utils/get-error-stack.util.js';
import { runWithConcurrency } from '../../../common/utils/run-with-concurrency.util.js';
import { ChecksRepository } from '../repositories/checks.repository.js';
import { ChecksService } from './checks.service.js';

@Injectable()
export class SchedulerService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(SchedulerService.name);
  private currentTick: Promise<void> | null = null;
  private isShuttingDown = false;

  constructor(
    private readonly checksRepository: ChecksRepository,
    private readonly checksService: ChecksService,
  ) {}

  async beforeApplicationShutdown(): Promise<void> {
    this.isShuttingDown = true;

    if (this.currentTick) {
      this.logger.log('Waiting for the current tick to finish before shutdown');
      await this.currentTick;
    }
  }

  @Interval(10_000)
  tick(): Promise<void> | void {
    if (this.isShuttingDown) return;

    if (this.currentTick) {
      this.logger.warn('Previous tick is still running, skipping');
      return;
    }

    this.currentTick = this.checkDueMonitors().finally(() => {
      this.currentTick = null;
    });

    return this.currentTick;
  }

  private async checkDueMonitors(): Promise<void> {
    try {
      const monitors = await this.checksRepository.claimDueMonitors(50);
      if (monitors.length === 0) return;

      const results = await runWithConcurrency(monitors, 10, monitor =>
        this.checksService.checkMonitor(monitor),
      );

      const up = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const down = results.filter(r => r.status === 'fulfilled' && !r.value.ok).length;
      const failed = results.length - up - down;

      this.logger.log(
        `Checked ${monitors.length} monitors: ${up} up, ${down} down, ${failed} failed`,
      );
    } catch (error) {
      this.logger.error('Scheduler tick failed', getErrorStack(error));
    }
  }
}
