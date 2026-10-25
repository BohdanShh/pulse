import { Module } from '@nestjs/common';

import { MonitorsModule } from '../monitors/monitors.module.js';
import { ChecksController } from './checks.controller.js';
import { ChecksRepository } from './repositories/checks.repository.js';
import { CheckerService } from './services/checker.service.js';
import { ChecksService } from './services/checks.service.js';
import { SchedulerService } from './services/scheduler.service.js';

@Module({
  imports: [MonitorsModule],
  controllers: [ChecksController],
  providers: [ChecksService, CheckerService, ChecksRepository, SchedulerService],
  exports: [ChecksService],
})
export class ChecksModule {}
