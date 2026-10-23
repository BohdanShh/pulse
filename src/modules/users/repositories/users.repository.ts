import { Inject, Injectable } from '@nestjs/common';

import { DB, type Database } from '../../../database/database.module.js';
import { users } from '../../../database/schema/index.js';
import { User } from '../entities/user.entity.js';
import { type TelegramProfile } from '../types/telegram-profile.type.js';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async upsertByTelegramId({ telegramId, username, firstName }: TelegramProfile): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({ telegramId, username, firstName })
      .onConflictDoUpdate({ target: users.telegramId, set: { username, firstName } })
      .returning();

    return user;
  }
}
