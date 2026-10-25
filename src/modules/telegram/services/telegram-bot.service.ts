import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Bot, GrammyError } from 'grammy';

import { getErrorStack } from '../../../common/utils/get-error-stack.util.js';
import { type AppConfigService } from '../../../config/env.config.js';
import { UsersService } from '../../users/services/users.service.js';
import { BOT_COMMANDS } from '../constants/telegram.constant.js';
import { type BotContext } from '../types/bot-context.type.js';

/** Owns the bot instance and its lifecycle. Commands are registered by the *Commands classes. */
@Injectable()
export class TelegramBotService implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private readonly logger = new Logger(TelegramBotService.name);
  readonly bot: Bot<BotContext>;

  constructor(@Inject(ConfigService) config: AppConfigService, usersService: UsersService) {
    this.bot = new Bot<BotContext>(config.get('TELEGRAM_BOT_TOKEN', { infer: true }));

    // Runs before every command handler (they are registered later, in onModuleInit)
    this.bot.use(async (ctx, next) => {
      if (!ctx.from) return;

      ctx.user = await usersService.findOrCreateFromTelegram({
        telegramId: ctx.from.id,
        username: ctx.from.username ?? null,
        firstName: ctx.from.first_name,
      });
      await next();
    });

    this.bot.catch(async ({ error, ctx }) => {
      this.logger.error(`Failed to handle update ${ctx.update.update_id}`, getErrorStack(error));

      try {
        await ctx.reply('⚠️ Something went wrong. Please try again in a moment.');
      } catch {
        // already logged above
      }
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.bot.init();
    await this.bot.api.setMyCommands(
      BOT_COMMANDS.map(({ command, description }) => ({ command, description })),
    );

    this.bot
      .start({
        onStart: ({ username }) => this.logger.log(`Bot @${username} is polling for updates`),
      })
      .catch((error: unknown) => {
        if (error instanceof GrammyError && error.error_code === 409) {
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
