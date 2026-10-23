import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { MAX_HTTP_STATUS_CODE, MIN_HTTP_STATUS_CODE } from '../constants/checks.constant.js';
import { monitors } from './monitors.schema.js';

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
    check(
      'checks_status_code_check',
      sql`${table.statusCode} BETWEEN ${sql.raw(String(MIN_HTTP_STATUS_CODE))} AND ${sql.raw(String(MAX_HTTP_STATUS_CODE))}`,
    ),
    check('checks_response_time_ms_check', sql`${table.responseTimeMs} >= 0`),
  ],
);
