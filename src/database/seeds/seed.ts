import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DAY_MS, MINUTE_MS, SECOND_MS } from '../../common/constants/time.constant.js';
import { CHECK_TIMEOUT_MS } from '../../modules/checks/constants/checker.constant.js';
import { type CheckResult } from '../../modules/checks/types/check-result.type.js';
import { type NewCheck } from '../../modules/checks/types/new-check.type.js';
import {
  timeoutErrorMessage,
  unexpectedStatusErrorMessage,
} from '../../modules/checks/utils/check-error-message.util.js';
import { type NewMonitor } from '../../modules/monitors/types/new-monitor.type.js';
import { checks, monitors } from '../schema/index.js';

const DAYS = 7;
const BATCH_SIZE = 5000;
const OUTAGE_DAYS_AGO = 3;
const OUTAGE_MINUTES = 25;

const now = Date.now();
const startedAt = now - DAYS * DAY_MS;

const randomBetween = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

const success = (min: number, max: number): CheckResult => ({
  ok: true,
  statusCode: 200,
  responseTimeMs: randomBetween(min, max),
  error: null,
});

const serverError = (): CheckResult => ({
  ok: false,
  statusCode: 500,
  responseTimeMs: randomBetween(50, 300),
  error: unexpectedStatusErrorMessage(500),
});

const timeout = (): CheckResult => ({
  ok: false,
  statusCode: null,
  responseTimeMs: CHECK_TIMEOUT_MS,
  error: timeoutErrorMessage(),
});

const outageStart = now - OUTAGE_DAYS_AGO * DAY_MS;
const outageEnd = outageStart + OUTAGE_MINUTES * MINUTE_MS;

const demoMonitors: { monitor: NewMonitor; check: (time: number) => CheckResult }[] = [
  {
    monitor: {
      id: '5eed0000-0000-4000-8000-000000000001',
      name: 'GitHub API',
      url: 'https://api.github.com',
      intervalSeconds: 60,
    },
    check: () => (Math.random() < 0.001 ? timeout() : success(100, 200)),
  },
  {
    monitor: {
      id: '5eed0000-0000-4000-8000-000000000002',
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      intervalSeconds: 60,
    },
    check: () => success(60, 120),
  },
  {
    monitor: {
      id: '5eed0000-0000-4000-8000-000000000003',
      name: 'Slow API',
      url: 'https://httpbin.org/delay/2',
      intervalSeconds: 120,
    },
    check: () => success(2000, 3000),
  },
  {
    monitor: {
      id: '5eed0000-0000-4000-8000-000000000004',
      name: 'Flaky service',
      url: 'https://httpbin.org/status/200,500',
      intervalSeconds: 60,
    },
    check: time => {
      if (time >= outageStart && time < outageEnd) return serverError();

      const roll = Math.random();
      if (roll < 0.05) return serverError();
      if (roll < 0.07) return timeout();
      return success(150, 400);
    },
  },
];

function generateChecks({ monitor, check }: (typeof demoMonitors)[number]): NewCheck[] {
  const step = monitor.intervalSeconds! * SECOND_MS;
  const rows: NewCheck[] = [];

  for (let time = startedAt; time <= now; time += step) {
    rows.push({ ...check(time), monitorId: monitor.id!, checkedAt: new Date(time) });
  }

  return rows;
}

async function seed(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await db.transaction(async tx => {
      const ids = demoMonitors.map(({ monitor }) => monitor.id!);
      await tx.delete(monitors).where(inArray(monitors.id, ids));

      await tx
        .insert(monitors)
        .values(
          demoMonitors.map(({ monitor }) => ({ ...monitor, createdAt: new Date(startedAt) })),
        );

      for (const demo of demoMonitors) {
        const rows = generateChecks(demo);

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          await tx.insert(checks).values(rows.slice(i, i + BATCH_SIZE));
        }

        const lastCheck = rows[rows.length - 1];
        await tx
          .update(monitors)
          .set({ status: lastCheck.ok ? 'UP' : 'DOWN', lastCheckedAt: lastCheck.checkedAt })
          .where(eq(monitors.id, demo.monitor.id!));

        console.log(`${demo.monitor.name}: ${rows.length} checks`);
      }
    });

    console.log('Seed completed');
  } finally {
    await pool.end();
  }
}

await seed();
