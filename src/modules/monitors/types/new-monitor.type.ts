import { monitors } from '../../../database/schema/index.js';

export type NewMonitor = typeof monitors.$inferInsert;
