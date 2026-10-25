import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Bot, type CommandContext, type Context, GrammyError } from 'grammy';

import { getErrorStack } from '../../../common/utils/get-error-stack.util.js';
import { getValidationMessages } from '../../../common/utils/get-validation-messages.util.js';
import { type AppConfigService } from '../../../config/env.config.js';
import { ApiKeysService } from '../../auth/services/api-keys.service.js';
import { CreateMonitorDto } from '../../monitors/dtos/create-monitor.dto.js';
import { MonitorsService } from '../../monitors/services/monitors.service.js';
import { User } from '../../users/entities/user.entity.js';
import { UsersService } from '../../users/services/users.service.js';
import {
  ADD_USAGE_MESSAGE,
  API_KEY_REVOKED_MESSAGE,
  NO_ACTIVE_API_KEY_MESSAGE,
  NO_MONITORS_MESSAGE,
} from '../constants/messages.constant.js';
import {
  BOT_COMMANDS,
  NO_LINK_PREVIEW,
  POLLING_CONFLICT_ERROR_CODE,
} from '../constants/telegram.constant.js';
import { apiKeyIssuedMessage } from '../utils/api-key-issued-message.util.js';
import { invalidMonitorMessage } from '../utils/invalid-monitor-message.util.js';
import { monitorAddedMessage } from '../utils/monitor-added-message.util.js';
import { monitorListMessage } from '../utils/monitor-list-message.util.js';
import { parseAddCommandArgs } from '../utils/parse-add-command-args.util.js';
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
    private readonly monitorsService: MonitorsService,
  ) {
    this.bot = new Bot(config.get('TELEGRAM_BOT_TOKEN', { infer: true }));
  }

  onModuleInit(): void {
    this.bot.command('start', ctx => this.handleStart(ctx));
    this.bot.command('apikey', ctx => this.handleApiKey(ctx));
    this.bot.command('revoke', ctx => this.handleRevoke(ctx));
    this.bot.command('add', ctx => this.handleAdd(ctx));
    this.bot.command('list', ctx => this.handleList(ctx));

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

  private async handleAdd(ctx: CommandContext<Context>): Promise<void> {
    const args = parseAddCommandArgs(ctx.match);
    if (!args) {
      await ctx.reply(ADD_USAGE_MESSAGE, { parse_mode: 'MarkdownV2', ...NO_LINK_PREVIEW });
      return;
    }

    const dto = plainToInstance(CreateMonitorDto, args);
    const errors = await validate(dto);
    if (errors.length > 0) {
      await ctx.reply(invalidMonitorMessage(getValidationMessages(errors)), NO_LINK_PREVIEW);
      return;
    }

    const user = await this.resolveUser(ctx);
    if (!user) return;

    const monitor = await this.monitorsService.create(user.id, dto);
    await ctx.reply(monitorAddedMessage(monitor), NO_LINK_PREVIEW);
  }

  private async handleList(ctx: Context): Promise<void> {
    const user = await this.resolveUser(ctx);
    if (!user) return;

    const monitors = await this.monitorsService.findAll(user.id);
    await ctx.reply(monitors.length > 0 ? monitorListMessage(monitors) : NO_MONITORS_MESSAGE);
  }

  private async resolveUser(ctx: Context): Promise<User | null> {
    if (!ctx.from) return null;
    return this.usersService.findOrCreateFromTelegram(toTelegramProfile(ctx.from));
  }
}
