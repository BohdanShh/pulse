import { checks } from '../../../database/schema/index.js';

export type NewCheck = typeof checks.$inferInsert;
