import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Bot, type Context, GrammyError } from 'grammy';

import { getErrorStack } from '../../../common/utils/get-error-stack.util.js';
import { type AppConfigService } from '../../../config/env.config.js';
import { ApiKeysService } from '../../auth/services/api-keys.service.js';
import { User } from '../../users/entities/user.entity.js';
import { UsersService } from '../../users/services/users.service.js';
import {
  API_KEY_REVOKED_MESSAGE,
  NO_ACTIVE_API_KEY_MESSAGE,
} from '../constants/messages.constant.js';
import { BOT_COMMANDS, POLLING_CONFLICT_ERROR_CODE } from '../constants/telegram.constant.js';
import { apiKeyIssuedMessage } from '../utils/api-key-issued-message.util.js';
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
    private readonly apiKeysService: ApiKeysService,
  ) {
    this.bot = new Bot(config.get('TELEGRAM_BOT_TOKEN', { infer: true }));
  }

  onModuleInit(): void {
    this.bot.command('start', ctx => this.handleStart(ctx));
    this.bot.command('apikey', ctx => this.handleApiKey(ctx));
    this.bot.command('revoke', ctx => this.handleRevoke(ctx));

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

  private async handleStart(ctx: Context): Promise<void> {
    const user = await this.resolveUser(ctx);
    if (!user) return;

    await ctx.reply(welcomeMessage(user.firstName));
  }

  private async handleApiKey(ctx: Context): Promise<void> {
    const user = await this.resolveUser(ctx);
    if (!user) return;

    const key = await this.apiKeysService.issue(user.id);
    await ctx.reply(apiKeyIssuedMessage(key), { parse_mode: 'HTML' });
  }

  private async handleRevoke(ctx: Context): Promise<void> {
    const user = await this.resolveUser(ctx);
    if (!user) return;

    const revoked = await this.apiKeysService.revoke(user.id);
    await ctx.reply(revoked ? API_KEY_REVOKED_MESSAGE : NO_ACTIVE_API_KEY_MESSAGE);
  }

  private async resolveUser(ctx: Context): Promise<User | null> {
    if (!ctx.from) return null;
    return this.usersService.findOrCreateFromTelegram(toTelegramProfile(ctx.from));
  }
}
