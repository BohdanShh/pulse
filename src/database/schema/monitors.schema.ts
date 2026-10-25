import { sql } from 'drizzle-orm';
import { check, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import {
  DEFAULT_INTERVAL_SECONDS,
  MAX_INTERVAL_SECONDS,
  MIN_INTERVAL_SECONDS,
} from '../constants/monitors.constant.js';
import { users } from './users.schema.js';

export const httpMethod = pgEnum('http_method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']);

export const monitorStatus = pgEnum('monitor_status', ['PENDING', 'UP', 'DOWN']);

export const monitors = pgTable(
  'monitors',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    url: text().notNull(),
    method: httpMethod().notNull().default('GET'),
    intervalSeconds: integer('interval_seconds').notNull().default(DEFAULT_INTERVAL_SECONDS),
    status: monitorStatus().notNull().default('PENDING'),
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('monitors_user_id_idx').on(table.userId),
    check(
      'monitors_interval_seconds_check',
      sql`${table.intervalSeconds} BETWEEN ${sql.raw(String(MIN_INTERVAL_SECONDS))} AND ${sql.raw(String(MAX_INTERVAL_SECONDS))}`,
    ),
  ],
);
