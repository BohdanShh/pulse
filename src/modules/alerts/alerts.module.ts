import { Module } from '@nestjs/common';

import { TelegramModule } from '../telegram/telegram.module.js';
import { UsersModule } from '../users/users.module.js';
import { StatusChangeListener } from './listeners/status-change.listener.js';

@Module({
  imports: [UsersModule, TelegramModule],
  providers: [StatusChangeListener],
})
export class AlertsModule {}
