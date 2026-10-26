import { Logger } from '@nestjs/common';

import { type MockInstance, beforeEach, describe, expect, it, vi } from 'vitest';

import { type MonitorStatusChangedEvent } from '../../checks/events/monitor-status-changed.event.js';
import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { type MonitorStatus } from '../../monitors/types/monitor-status.type.js';
import { NotificationsService } from '../../telegram/services/notifications.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { IncidentsRepository } from '../repositories/incidents.repository.js';
import { StatusChangeListener } from './status-change.listener.js';

const CHECKED_AT = new Date('2026-10-26T14:16:00Z');
const OWNER = { id: 'user-1', telegramId: 619798784 };

function makeEvent(from: MonitorStatus, to: MonitorStatus): MonitorStatusChangedEvent {
  return {
    monitor: { id: 'monitor-1', userId: OWNER.id, name: 'Payments API' } as Monitor,
    from,
    to,
    check: {
      id: 1,
      ok: to === 'UP',
      statusCode: null,
      responseTimeMs: 32,
      error: to === 'DOWN' ? 'Connection refused' : null,
      checkedAt: CHECKED_AT,
    },
  };
}

describe('StatusChangeListener.handleStatusChange', () => {
  const incidents = { open: vi.fn(), close: vi.fn() };
  const users = { findById: vi.fn() };
  const notifications = { sendStatusChange: vi.fn() };

  let listener: StatusChangeListener;
  let logError: MockInstance<Logger['error']>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    users.findById.mockResolvedValue(OWNER);

    listener = new StatusChangeListener(
      incidents as unknown as IncidentsRepository,
      users as unknown as UsersService,
      notifications as unknown as NotificationsService,
    );
  });

  it('ignores a new monitor that turns out to be UP', async () => {
    await listener.handleStatusChange(makeEvent('PENDING', 'UP'));

    expect(incidents.open).not.toHaveBeenCalled();
    expect(notifications.sendStatusChange).not.toHaveBeenCalled();
  });

  it('opens an incident and alerts the owner when a monitor goes DOWN', async () => {
    const event = makeEvent('UP', 'DOWN');

    await listener.handleStatusChange(event);

    expect(incidents.open).toHaveBeenCalledWith('monitor-1', CHECKED_AT, 'Connection refused');
    expect(notifications.sendStatusChange).toHaveBeenCalledWith(OWNER.telegramId, event, null);
  });

  it('alerts when a new monitor goes straight to DOWN', async () => {
    await listener.handleStatusChange(makeEvent('PENDING', 'DOWN'));

    expect(incidents.open).toHaveBeenCalled();
    expect(notifications.sendStatusChange).toHaveBeenCalled();
  });

  it('closes the incident and reports the downtime on recovery', async () => {
    const startedAt = new Date(CHECKED_AT.getTime() - 12 * 60_000);
    incidents.close.mockResolvedValue({ startedAt });
    const event = makeEvent('DOWN', 'UP');

    await listener.handleStatusChange(event);

    expect(incidents.close).toHaveBeenCalledWith('monitor-1', CHECKED_AT);
    expect(notifications.sendStatusChange).toHaveBeenCalledWith(
      OWNER.telegramId,
      event,
      12 * 60_000,
    );
  });

  it('still sends the recovery alert when there was no open incident', async () => {
    incidents.close.mockResolvedValue(undefined);
    const event = makeEvent('DOWN', 'UP');

    await listener.handleStatusChange(event);

    expect(notifications.sendStatusChange).toHaveBeenCalledWith(OWNER.telegramId, event, null);
  });

  it('sends nothing when the owner no longer exists', async () => {
    users.findById.mockResolvedValue(undefined);

    await listener.handleStatusChange(makeEvent('UP', 'DOWN'));

    expect(notifications.sendStatusChange).not.toHaveBeenCalled();
  });

  it('logs a failure instead of throwing, because nothing awaits the listener', async () => {
    notifications.sendStatusChange.mockRejectedValue(new Error('Forbidden: bot was blocked'));

    await expect(listener.handleStatusChange(makeEvent('UP', 'DOWN'))).resolves.toBeUndefined();
    expect(logError).toHaveBeenCalled();
  });
});
