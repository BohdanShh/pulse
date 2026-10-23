import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Bot, GrammyError } from 'grammy';

import { getErrorStack } from '../../../common/utils/get-error-stack.util.js';
import { type AppConfigService } from '../../../config/env.config.js';
import { UsersService } from '../../users/services/users.service.js';
import { BOT_COMMANDS, POLLING_CONFLICT_ERROR_CODE } from '../constants/telegram.constant.js';
import { toTelegramProfile } from '../utils/to-telegram-profile.util.js';
import { welcomeMessage } from '../utils/welcome-message.util.js';

@Injectable()
export class TelegramBotService
  implements OnModuleInit, OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly bot: Bot;

  constructor(
    @Inject(ConfigService) config: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    this.bot = new Bot(config.get('TELEGRAM_BOT_TOKEN', { infer: true }));
  }

  onModuleInit(): void {
    this.bot.command('start', async ctx => {
      if (!ctx.from) return;

      const user = await this.usersService.findOrCreateFromTelegram(toTelegramProfile(ctx.from));
      await ctx.reply(welcomeMessage(user.firstName));
    });

    this.bot.catch(({ error, ctx }) => {
      this.logger.error(`Failed to handle update ${ctx.update.update_id}`, getErrorStack(error));
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.bot.init();
    await this.bot.api.setMyCommands(BOT_COMMANDS);

    this.bot
      .start({
        onStart: ({ username }) => this.logger.log(`Bot @${username} is polling for updates`),
      })
      .catch((error: unknown) => {
        if (error instanceof GrammyError && error.error_code === POLLING_CONFLICT_ERROR_CODE) {
          this.logger.error('Another process is already polling with this bot token');
          return;
        }
        this.logger.error('Bot polling stopped', getErrorStack(error));
      });
  }

  async beforeApplicationShutdown(): Promise<void> {
    await this.bot.stop();
  }
}
