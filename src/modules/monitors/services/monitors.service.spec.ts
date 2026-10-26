import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NothingToUpdateException } from '../../../common/exceptions/nothing-to-update.exception.js';
import { CreateMonitorDto } from '../dtos/create-monitor.dto.js';
import { MonitorLimitReachedException } from '../exceptions/monitor-limit-reached.exception.js';
import { MonitorNotFoundException } from '../exceptions/monitor-not-found.exception.js';
import { MonitorsRepository } from '../repositories/monitors.repository.js';
import { MonitorsService } from './monitors.service.js';

const DTO: CreateMonitorDto = { name: 'GitHub API', url: 'https://api.github.com' };

describe('MonitorsService', () => {
  const repository = {
    countByUser: vi.fn(),
    create: vi.fn(),
    findByIdAndUser: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  let service: MonitorsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new MonitorsService(repository as unknown as MonitorsRepository);
  });

  describe('create', () => {
    it('creates a monitor while the user is under the limit', async () => {
      repository.countByUser.mockResolvedValue(19);

      await service.create('user-1', DTO);

      expect(repository.create).toHaveBeenCalledWith('user-1', DTO);
    });

    it('refuses the 21st monitor', async () => {
      repository.countByUser.mockResolvedValue(20);

      await expect(service.create('user-1', DTO)).rejects.toThrow(MonitorLimitReachedException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  it('throws 404 for a monitor that does not exist or belongs to someone else', async () => {
    repository.findByIdAndUser.mockResolvedValue(undefined);

    await expect(service.findOne('monitor-1', 'user-2')).rejects.toThrow(MonitorNotFoundException);
    expect(repository.findByIdAndUser).toHaveBeenCalledWith('monitor-1', 'user-2');
  });

  describe('update', () => {
    it('refuses an empty update without touching the database', async () => {
      await expect(service.update('monitor-1', 'user-1', {})).rejects.toThrow(
        NothingToUpdateException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws 404 when there is no such monitor', async () => {
      repository.update.mockResolvedValue(undefined);

      await expect(service.update('monitor-1', 'user-1', { name: 'New' })).rejects.toThrow(
        MonitorNotFoundException,
      );
    });
  });

  it('throws 404 when removing a monitor that was not deleted', async () => {
    repository.delete.mockResolvedValue(false);

    await expect(service.remove('monitor-1', 'user-1')).rejects.toThrow(MonitorNotFoundException);
  });
});
