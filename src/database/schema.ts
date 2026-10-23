import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const httpMethod = pgEnum('http_method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']);

export const monitors = pgTable(
  'monitors',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    url: text().notNull(),
    method: httpMethod().notNull().default('GET'),
    intervalSeconds: integer('interval_seconds').notNull().default(60),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    check('monitors_interval_seconds_check', sql`${table.intervalSeconds} BETWEEN 30 AND 3600`),
  ],
);

export const checks = pgTable(
  'checks',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    monitorId: uuid('monitor_id')
      .notNull()
      .references(() => monitors.id, { onDelete: 'cascade' }),
    ok: boolean().notNull(),
    statusCode: integer('status_code'),
    responseTimeMs: integer('response_time_ms').notNull(),
    error: text(),
    checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('checks_monitor_id_checked_at_idx').on(table.monitorId, table.checkedAt),
    check('checks_status_code_check', sql`${table.statusCode} BETWEEN 100 AND 599`),
    check('checks_response_time_ms_check', sql`${table.responseTimeMs} >= 0`),
  ],
);
