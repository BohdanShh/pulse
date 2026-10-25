import { Injectable, OnModuleInit } from '@nestjs/common';

import { ApiKeysService } from '../../auth/services/api-keys.service.js';
import { BOT_COMMANDS, REPLY_OPTIONS } from '../constants/telegram.constant.js';
import { TelegramBotService } from '../services/telegram-bot.service.js';
import { type BotContext } from '../types/bot-context.type.js';
import { escapeHtml } from '../utils/escape-html.util.js';

@Injectable()
export class AccountCommands implements OnModuleInit {
  constructor(
    private readonly botService: TelegramBotService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  onModuleInit(): void {
    const { bot } = this.botService;

    bot.command('start', ctx => this.handleStart(ctx));
    bot.command('help', ctx => this.handleHelp(ctx));
    bot.command('apikey', ctx => this.handleApiKey(ctx));
    bot.command('revoke', ctx => this.handleRevoke(ctx));
  }

  private async handleStart(ctx: BotContext): Promise<void> {
    const message = [
      `👋 <b>Hi, ${escapeHtml(ctx.user.firstName)}!</b>`,
      '',
      "I'm Pulse — I check your APIs and websites and let you know here when they go down or recover.",
      '',
      '➕ /add — start monitoring a URL',
      '📖 /help — all commands',
    ];

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }

  private async handleHelp(ctx: BotContext): Promise<void> {
    const commands = BOT_COMMANDS.map(({ command, description, args }) =>
      [`/${command}`, args && `<i>${escapeHtml(args)}</i>`, '—', description]
        .filter(Boolean)
        .join(' '),
    );

    const message = [
      '📖 <b>Pulse commands</b>',
      'Pulse checks your URLs and tells you here when they go down or recover.',
      '',
      ...commands,
    ];

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }

  private async handleApiKey(ctx: BotContext): Promise<void> {
    const key = await this.apiKeysService.issue(ctx.user.id);

    const message = [
      '🔑 <b>Your new REST API key</b>',
      'For scripts and tools outside Telegram.',
      '',
      `<code>${key}</code>`,
      '',
      'Tap it to copy, then send it in the header:',
      '<code>Authorization: Bearer &lt;key&gt;</code>',
      '',
      "⚠️ It's shown only once. Your previous key no longer works.",
    ];

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }

  private async handleRevoke(ctx: BotContext): Promise<void> {
    const revoked = await this.apiKeysService.revoke(ctx.user.id);

    const message = revoked
      ? ['🔒 <b>REST API key revoked</b>', 'The bot keeps working as usual.']
      : ['ℹ️ You have no active REST API key.', 'Send /apikey to get one.'];

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }
}
