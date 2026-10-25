import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { getErrorStack } from '../../../common/utils/get-error-stack.util.js';
import {
  MONITOR_STATUS_CHANGED,
  type MonitorStatusChangedEvent,
} from '../../checks/events/monitor-status-changed.event.js';
import { NotificationsService } from '../../telegram/services/notifications.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { IncidentsRepository } from '../repositories/incidents.repository.js';

@Injectable()
export class StatusChangeListener {
  private readonly logger = new Logger(StatusChangeListener.name);

  constructor(
    private readonly incidentsRepository: IncidentsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent(MONITOR_STATUS_CHANGED)
  async handleStatusChange(event: MonitorStatusChangedEvent): Promise<void> {
    const { monitor, from, to, check } = event;

    // A new monitor that turns out to be fine is not news
    if (from === 'PENDING' && to === 'UP') return;

    this.logger.log(`${monitor.name}: ${from} → ${to}`);

    // Nothing awaits this handler, so a failure here (e.g. the user blocked the bot) is only logged
    try {
      let downtimeMs: number | null = null;

      if (to === 'DOWN') {
        await this.incidentsRepository.open(monitor.id, check.checkedAt, check.error);
      } else {
        const incident = await this.incidentsRepository.close(monitor.id, check.checkedAt);
        if (incident) downtimeMs = check.checkedAt.getTime() - incident.startedAt.getTime();
      }

      const owner = await this.usersService.findById(monitor.userId);
      if (!owner) return;

      await this.notificationsService.sendStatusChange(owner.telegramId, event, downtimeMs);
    } catch (error) {
      this.logger.error(`Failed to handle status change of ${monitor.name}`, getErrorStack(error));
    }
  }
}
