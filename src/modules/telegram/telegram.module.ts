import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { MonitorsModule } from '../monitors/monitors.module.js';
import { UsersModule } from '../users/users.module.js';
import { TelegramBotService } from './services/telegram-bot.service.js';

@Module({
  imports: [UsersModule, AuthModule, MonitorsModule],
  providers: [TelegramBotService],
})
export class TelegramModule {}
