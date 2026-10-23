import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const httpMethod = pgEnum('http_method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']);

export const monitors = pgTable('monitors', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  url: text().notNull(),
  method: httpMethod().notNull().default('GET'),
  intervalSeconds: integer('interval_seconds').notNull().default(60),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
