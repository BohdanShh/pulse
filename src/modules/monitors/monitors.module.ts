import { Module } from '@nestjs/common';

import { MonitorsController } from './monitors.controller.js';
import { MonitorsRepository } from './repositories/monitors.repository.js';
import { MonitorsService } from './services/monitors.service.js';

@Module({
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsRepository],
  exports: [MonitorsService],
})
export class MonitorsModule {}
