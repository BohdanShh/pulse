import { Injectable, OnModuleInit } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { type CommandContext } from 'grammy';

import { getValidationMessages } from '../../../common/utils/get-validation-messages.util.js';
import { ChecksService } from '../../checks/services/checks.service.js';
import { CreateMonitorDto } from '../../monitors/dtos/create-monitor.dto.js';
import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { MonitorsService } from '../../monitors/services/monitors.service.js';
import { type MonitorStatus } from '../../monitors/types/monitor-status.type.js';
import { REPLY_OPTIONS } from '../constants/telegram.constant.js';
import { TelegramBotService } from '../services/telegram-bot.service.js';
import { type BotContext } from '../types/bot-context.type.js';
import { escapeHtml } from '../utils/escape-html.util.js';

const STATUS_EMOJI: Record<MonitorStatus, string> = { UP: '🟢', DOWN: '🔴', PENDING: '⏳' };

@Injectable()
export class MonitorCommands implements OnModuleInit {
  constructor(
    private readonly botService: TelegramBotService,
    private readonly monitorsService: MonitorsService,
    private readonly checksService: ChecksService,
  ) {}

  onModuleInit(): void {
    const { bot } = this.botService;

    bot.command('add', ctx => this.handleAdd(ctx));
    bot.command('list', ctx => this.handleList(ctx));
    bot.command('status', ctx => this.handleStatus(ctx));
    bot.command('remove', ctx => this.handleRemove(ctx));
  }

  private async handleAdd(ctx: CommandContext<BotContext>): Promise<void> {
    const [url, ...nameWords] = ctx.match.trim().split(/\s+/);

    if (!url) {
      const usage = [
        '➕ <b>Add a monitor</b>',
        '',
        'Send /add followed by the URL:',
        '<pre><code class="language-bash">/add https://example.com</code></pre>',
        'Optionally, give it a name:',
        '<pre><code class="language-bash">/add https://api.github.com GitHub API</code></pre>',
      ];
      await ctx.reply(usage.join('\n'), REPLY_OPTIONS);
      return;
    }

    const name = nameWords.join(' ') || URL.parse(url)?.hostname || url;

    // ValidationPipe only runs for HTTP, so the bot validates the same DTO by hand
    const dto = plainToInstance(CreateMonitorDto, { url, name });
    const errors = await validate(dto);

    if (errors.length > 0) {
      const reasons = getValidationMessages(errors).map(reason => `• ${escapeHtml(reason)}`);
      await ctx.reply(['❌ <b>Cannot add this monitor</b>', ...reasons].join('\n'), REPLY_OPTIONS);
      return;
    }

    const monitor = await this.monitorsService.create(ctx.user.id, dto);

    const message = [
      '✅ <b>Monitor added</b>',
      '',
      `<b>${escapeHtml(monitor.name)}</b>`,
      `<code>${monitor.method} ${escapeHtml(monitor.url)}</code>`,
      `⏱ Every ${monitor.intervalSeconds}s · first check in a few seconds`,
    ];

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }

  private async handleList(ctx: BotContext): Promise<void> {
    const monitors = await this.monitorsService.findAll(ctx.user.id);

    if (monitors.length === 0) {
      await ctx.reply('📭 You have no monitors yet.\nSend /add to add one.', REPLY_OPTIONS);
      return;
    }

    const items = monitors.map(
      ({ name, status }, index) =>
        `${index + 1}. ${STATUS_EMOJI[status]} ${escapeHtml(name)} — ${status}`,
    );

    const message = [
      `📋 <b>Your monitors</b> (${monitors.length})`,
      '',
      ...items,
      '',
      '<i>Send /status &lt;number&gt; for details.</i>',
    ];

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }

  private async handleStatus(ctx: CommandContext<BotContext>): Promise<void> {
    const usage = [
      '🔍 <b>Monitor status</b>',
      '',
      'Send /status followed by the monitor number from /list:',
      '<pre><code class="language-bash">/status 1</code></pre>',
    ];

    const monitor = await this.findMonitorByNumber(ctx, usage.join('\n'));
    if (!monitor) return;

    const { name, status, method, url, intervalSeconds, lastCheckedAt } = monitor;
    const stats = await this.checksService.getStats(monitor.id, ctx.user.id, { period: '24h' });

    let lastCheck = 'not checked yet';
    if (lastCheckedAt) {
      const seconds = Math.floor((Date.now() - lastCheckedAt.getTime()) / 1000);
      const ago =
        seconds < 60
          ? `${seconds}s`
          : seconds < 3600
            ? `${Math.floor(seconds / 60)}m`
            : seconds < 86400
              ? `${Math.floor(seconds / 3600)}h`
              : `${Math.floor(seconds / 86400)}d`;
      lastCheck = `last check ${ago} ago`;
    }

    const message = [
      `${STATUS_EMOJI[status]} <b>${escapeHtml(name)}</b> — ${status}`,
      '',
      `<code>${method} ${escapeHtml(url)}</code>`,
      `⏱ Every ${intervalSeconds}s · ${lastCheck}`,
      '',
      `📊 <b>Last ${stats.period}</b>`,
    ];

    if (stats.checks === 0) {
      message.push('No checks yet');
    } else {
      message.push(
        `Uptime: <b>${stats.uptimePercent}%</b> (${stats.checks} checks, ${stats.failures} failed)`,
      );
      // Response time is measured on successful checks only, so it is null when all failed
      if (stats.avgResponseTimeMs !== null) {
        message.push(
          `Response: avg ${stats.avgResponseTimeMs} ms · p95 ${stats.p95ResponseTimeMs} ms`,
        );
      }
    }

    await ctx.reply(message.join('\n'), REPLY_OPTIONS);
  }

  private async handleRemove(ctx: CommandContext<BotContext>): Promise<void> {
    const usage = [
      '🗑 <b>Remove a monitor</b>',
      '',
      'Send /remove followed by the monitor number from /list:',
      '<pre><code class="language-bash">/remove 2</code></pre>',
    ];

    const monitor = await this.findMonitorByNumber(ctx, usage.join('\n'));
    if (!monitor) return;

    await this.monitorsService.remove(monitor.id, ctx.user.id);
    await ctx.reply(`🗑 <b>Monitor removed</b>\n${escapeHtml(monitor.name)}`, REPLY_OPTIONS);
  }

  private async findMonitorByNumber(
    ctx: CommandContext<BotContext>,
    usage: string,
  ): Promise<Monitor | undefined> {
    const arg = ctx.match.trim();
    const number = /^\d+$/.test(arg) ? Number(arg) : 0;

    if (number === 0) {
      await ctx.reply(usage, REPLY_OPTIONS);
      return undefined;
    }

    const monitors = await this.monitorsService.findAll(ctx.user.id);
    const monitor = monitors.at(number - 1);

    if (!monitor) {
      await ctx.reply(
        `⚠️ There is no monitor #${number}.\nSend /list to see your monitors.`,
        REPLY_OPTIONS,
      );
    }

    return monitor;
  }
}
