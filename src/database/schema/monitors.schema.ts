import { sql } from 'drizzle-orm';
import { check, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import {
  DEFAULT_INTERVAL_SECONDS,
  MAX_INTERVAL_SECONDS,
  MIN_INTERVAL_SECONDS,
} from '../constants/monitors.constant.js';

export const httpMethod = pgEnum('http_method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']);

export const monitorStatus = pgEnum('monitor_status', ['PENDING', 'UP', 'DOWN']);

export const monitors = pgTable(
  'monitors',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    url: text().notNull(),
    method: httpMethod().notNull().default('GET'),
    intervalSeconds: integer('interval_seconds').notNull().default(DEFAULT_INTERVAL_SECONDS),
    status: monitorStatus().notNull().default('PENDING'),
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    check(
      'monitors_interval_seconds_check',
      sql`${table.intervalSeconds} BETWEEN ${sql.raw(String(MIN_INTERVAL_SECONDS))} AND ${sql.raw(String(MAX_INTERVAL_SECONDS))}`,
    ),
  ],
);
