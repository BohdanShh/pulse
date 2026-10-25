import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { validateEnv } from './config/env.config.js';
import { DatabaseModule } from './database/database.module.js';
import { AlertsModule } from './modules/alerts/alerts.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ChecksModule } from './modules/checks/checks.module.js';
import { MonitorsModule } from './modules/monitors/monitors.module.js';
import { TelegramModule } from './modules/telegram/telegram.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    MonitorsModule,
    ChecksModule,
    UsersModule,
    TelegramModule,
    AuthModule,
    AlertsModule,
  ],
})
export class AppModule {}
