import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { monitors } from './monitors.schema.js';

export const incidents = pgTable(
  'incidents',
  {
    id: uuid().primaryKey().defaultRandom(),
    monitorId: uuid('monitor_id')
      .notNull()
      .references(() => monitors.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    cause: text(),
  },
  table => [
    index('incidents_monitor_id_started_at_idx').on(table.monitorId, table.startedAt),
    uniqueIndex('incidents_one_open_per_monitor_idx')
      .on(table.monitorId)
      .where(sql`${table.endedAt} IS NULL`),
  ],
);
