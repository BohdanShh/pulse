import { checks } from '../../../database/schema/index.js';

type CheckRow = Omit<typeof checks.$inferSelect, 'monitorId'>;

export class Check implements CheckRow {
  /** @example 1042 */
  id: number;

  /** Whether the check succeeded. */
  ok: boolean;

  /**
   * HTTP status code. Null when no response was received (DNS error, timeout).
   * @example 200
   */
  statusCode: number | null;

  /** @example 143 */
  responseTimeMs: number;

  /**
   * Error message when the check failed.
   * @example null
   */
  error: string | null;

  checkedAt: Date;
}
