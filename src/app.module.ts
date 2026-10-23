import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { validateEnv } from './config/env.config.js';
import { DatabaseModule } from './database/database.module.js';
import { ChecksModule } from './modules/checks/checks.module.js';
import { MonitorsModule } from './modules/monitors/monitors.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    MonitorsModule,
    ChecksModule,
  ],
})
export class AppModule {}
