import { users } from '../../../database/schema/index.js';

type UserRow = typeof users.$inferSelect;

export class User implements UserRow {
  /** @example "3f2b8c1e-6a4d-4b7e-9c2a-1d5e8f7a6b90" */
  id: string;

  /** @example 123456789 */
  telegramId: number;

  /**
   * Telegram username without @. Null if the user has none.
   * @example "bohdan"
   */
  username: string | null;

  /** @example "Bohdan" */
  firstName: string;

  createdAt: Date;
}
