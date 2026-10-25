import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  MONITOR_STATUS_CHANGED,
  type MonitorStatusChangedEvent,
} from '../../checks/events/monitor-status-changed.event.js';

@Injectable()
export class StatusChangeListener {
  private readonly logger = new Logger(StatusChangeListener.name);

  @OnEvent(MONITOR_STATUS_CHANGED)
  handleStatusChange({ monitor, from, to }: MonitorStatusChangedEvent): void {
    // A new monitor that turns out to be fine is not news
    if (from === 'PENDING' && to === 'UP') return;

    this.logger.log(`${monitor.name}: ${from} → ${to}`);
  }
}
