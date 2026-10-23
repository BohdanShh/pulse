import { httpMethod, monitors } from '../../database/schema.js';

export type HttpMethod = (typeof httpMethod.enumValues)[number];

type MonitorRow = typeof monitors.$inferSelect;

export class Monitor implements MonitorRow {
  /** @example "b0a4eef9-6aeb-4000-bb7a-a833e5f4b501" */
  id: string;

  /** @example "GitHub API" */
  name: string;

  /** @example "https://api.github.com" */
  url: string;

  /** HTTP method used for the check. */
  method: HttpMethod;

  /**
   * How often the URL is checked, in seconds.
   * @example 60
   */
  intervalSeconds: number;

  createdAt: Date;
}
