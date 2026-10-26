import { EventEmitter2 } from '@nestjs/event-emitter';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { MonitorsService } from '../../monitors/services/monitors.service.js';
import { Check } from '../entities/check.entity.js';
import { MONITOR_STATUS_CHANGED } from '../events/monitor-status-changed.event.js';
import { ChecksRepository } from '../repositories/checks.repository.js';
import { type CheckResult } from '../types/check-result.type.js';
import { CheckerService } from './checker.service.js';
import { ChecksService } from './checks.service.js';

const OK: CheckResult = { ok: true, statusCode: 200, responseTimeMs: 120, error: null };
const FAILED: CheckResult = {
  ok: false,
  statusCode: null,
  responseTimeMs: 10000,
  error: 'Timeout after 10000ms',
};

function makeMonitor(overrides: Partial<Monitor> = {}): Monitor {
  return {
    id: 'monitor-1',
    userId: 'user-1',
    name: 'GitHub API',
    url: 'https://api.github.com',
    method: 'GET',
    intervalSeconds: 60,
    status: 'UP',
    consecutiveFailures: 0,
    lastCheckedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('ChecksService.checkMonitor', () => {
  const checker = { check: vi.fn() };
  const repository = { recordCheck: vi.fn() };
  const eventEmitter = { emit: vi.fn() };

  let service: ChecksService;

  beforeEach(() => {
    vi.resetAllMocks();
    repository.recordCheck.mockImplementation(
      async (_id: string, result: CheckResult, { checkedAt }: { checkedAt: Date }) =>
        ({ id: 1, ...result, checkedAt }) satisfies Check,
    );

    service = new ChecksService(
      repository as unknown as ChecksRepository,
      checker as unknown as CheckerService,
      {} as MonitorsService,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  /** Runs one check with the given result and returns what was saved to the monitor. */
  async function runCheck(
    monitor: Monitor,
    result: CheckResult,
  ): Promise<{ status: string; consecutiveFailures: number }> {
    checker.check.mockResolvedValue(result);
    await service.checkMonitor(monitor);
    return repository.recordCheck.mock.calls[0][2];
  }

  it('marks a monitor UP after one successful check and resets the failures', async () => {
    const saved = await runCheck(makeMonitor({ status: 'DOWN', consecutiveFailures: 5 }), OK);

    expect(saved).toMatchObject({ status: 'UP', consecutiveFailures: 0 });
  });

  it('keeps the status after 1 or 2 failed checks in a row', async () => {
    const saved = await runCheck(makeMonitor({ status: 'UP', consecutiveFailures: 1 }), FAILED);

    expect(saved).toMatchObject({ status: 'UP', consecutiveFailures: 2 });
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('marks a monitor DOWN on the 3rd failed check in a row', async () => {
    const saved = await runCheck(makeMonitor({ status: 'UP', consecutiveFailures: 2 }), FAILED);

    expect(saved).toMatchObject({ status: 'DOWN', consecutiveFailures: 3 });
  });

  it('keeps a PENDING monitor PENDING until it has 3 failures', async () => {
    const saved = await runCheck(
      makeMonitor({ status: 'PENDING', consecutiveFailures: 0 }),
      FAILED,
    );

    expect(saved).toMatchObject({ status: 'PENDING', consecutiveFailures: 1 });
  });

  it('emits a status change event with the old and new status', async () => {
    const monitor = makeMonitor({ status: 'UP', consecutiveFailures: 2 });

    await runCheck(monitor, FAILED);

    expect(eventEmitter.emit).toHaveBeenCalledExactlyOnceWith(
      MONITOR_STATUS_CHANGED,
      expect.objectContaining({ monitor, from: 'UP', to: 'DOWN' }),
    );
  });

  it('emits nothing when the status stays the same', async () => {
    await runCheck(makeMonitor({ status: 'UP' }), OK);

    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('emits nothing for a monitor that is already DOWN and still failing', async () => {
    await runCheck(makeMonitor({ status: 'DOWN', consecutiveFailures: 7 }), FAILED);

    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});

describe('ChecksService.getStats', () => {
  const repository = { getStats: vi.fn() };
  const monitors = { findOne: vi.fn() };
  const service = new ChecksService(
    repository as unknown as ChecksRepository,
    {} as CheckerService,
    monitors as unknown as MonitorsService,
    {} as EventEmitter2,
  );

  /** Returns the stats for a period with the given number of checks and failures. */
  async function statsFor(checks: number, failures: number): Promise<number | null> {
    repository.getStats.mockResolvedValue({
      checks,
      failures,
      avgResponseTimeMs: null,
      p95ResponseTimeMs: null,
    });
    const { uptimePercent } = await service.getStats('monitor-1', 'user-1', { period: '24h' });
    return uptimePercent;
  }

  it('rounds the uptime to 2 decimals', async () => {
    expect(await statsFor(1433, 25)).toBe(98.26);
  });

  it('is 100 when nothing failed and 0 when everything failed', async () => {
    expect(await statsFor(10, 0)).toBe(100);
    expect(await statsFor(10, 10)).toBe(0);
  });

  it('is null when there are no checks to count', async () => {
    expect(await statsFor(0, 0)).toBeNull();
  });

  it('checks that the monitor belongs to the user first', async () => {
    await statsFor(1, 0);

    expect(monitors.findOne).toHaveBeenCalledWith('monitor-1', 'user-1');
  });
});
