import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { checks, monitors } from './schema.js';

type NewMonitor = typeof monitors.$inferInsert;
type NewCheck = typeof checks.$inferInsert;
type CheckResult = Omit<NewCheck, 'monitorId' | 'checkedAt'>;

const DAYS = 7;
const BATCH_SIZE = 5000;
const TIMEOUT_MS = 10_000;

const now = Date.now();
const startedAt = now - DAYS * 24 * 60 * 60 * 1000;

const randomBetween = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

const success = (min: number, max: number): CheckResult => ({
  ok: true,
  statusCode: 200,
  responseTimeMs: randomBetween(min, max),
});

const serverError = (): CheckResult => ({
  ok: false,
  statusCode: 500,
  responseTimeMs: randomBetween(50, 300),
  error: 'Unexpected status code 500',
});

const timeout = (): CheckResult => ({
  ok: false,
  statusCode: null,
  responseTimeMs: TIMEOUT_MS,
  error: `Timeout after ${TIMEOUT_MS}ms`,
});

const outageStart = now - 3 * 24 * 60 * 60 * 1000;
const outageEnd = outageStart + 25 * 60 * 1000;

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
  const step = monitor.intervalSeconds! * 1000;
  const rows: NewCheck[] = [];

  for (let time = startedAt; time <= now; time += step) {
    rows.push({ ...check(time), monitorId: monitor.id!, checkedAt: new Date(time) });
  }

  return rows;
}

async function seed() {
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

        console.log(`${demo.monitor.name}: ${rows.length} checks`);
      }
    });

    console.log('Seed completed');
  } finally {
    await pool.end();
  }
}

await seed();
