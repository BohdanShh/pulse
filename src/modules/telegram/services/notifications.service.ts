import { Injectable } from '@nestjs/common';

import { type MonitorStatusChangedEvent } from '../../checks/events/monitor-status-changed.event.js';
import { REPLY_OPTIONS } from '../constants/telegram.constant.js';
import { escapeHtml } from '../utils/escape-html.util.js';
import { TelegramBotService } from './telegram-bot.service.js';

/** Messages the bot sends on its own, not as a reply to a command. */
@Injectable()
export class NotificationsService {
  constructor(private readonly botService: TelegramBotService) {}

  async sendStatusChange(
    telegramId: number,
    { monitor, to, check }: MonitorStatusChangedEvent,
  ): Promise<void> {
    const name = escapeHtml(monitor.name);
    const target = `<code>${monitor.method} ${escapeHtml(monitor.url)}</code>`;

    const message =
      to === 'DOWN'
        ? [`🔴 <b>${name} is down</b>`, target, `Reason: ${escapeHtml(check.error ?? 'unknown')}`]
        : [`🟢 <b>${name} is up again</b>`, target, `Response: ${check.responseTimeMs} ms`];

    // A user's Telegram id is also the id of their private chat with the bot
    await this.botService.bot.api.sendMessage(telegramId, message.join('\n'), REPLY_OPTIONS);
  }
}
