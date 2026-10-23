import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module.js';
import { MonitorsModule } from './monitors/monitors.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, MonitorsModule],
})
export class AppModule {}
