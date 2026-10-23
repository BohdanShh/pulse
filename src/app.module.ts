import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { MonitorsModule } from './monitors/monitors.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    DatabaseModule,
    MonitorsModule,
  ],
})
export class AppModule {}
