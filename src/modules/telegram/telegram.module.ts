import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ChecksModule } from '../checks/checks.module.js';
import { MonitorsModule } from '../monitors/monitors.module.js';
import { UsersModule } from '../users/users.module.js';
import { AccountCommands } from './commands/account.commands.js';
import { MonitorCommands } from './commands/monitor.commands.js';
import { TelegramBotService } from './services/telegram-bot.service.js';

@Module({
  imports: [UsersModule, AuthModule, MonitorsModule, ChecksModule],
  providers: [TelegramBotService, AccountCommands, MonitorCommands],
})
export class TelegramModule {}
