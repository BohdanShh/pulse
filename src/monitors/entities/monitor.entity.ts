import { httpMethod, monitors } from '../../database/schema.js';

export type Monitor = typeof monitors.$inferSelect;

export type HttpMethod = (typeof httpMethod.enumValues)[number];
