import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { TelegramBotService } from './services/telegram-bot.service.js';

@Module({
  imports: [UsersModule],
  providers: [TelegramBotService],
})
export class TelegramModule {}
