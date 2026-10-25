import { Inject, Injectable } from '@nestjs/common';

import { and, eq, getTableColumns, isNull } from 'drizzle-orm';

import { DB, type Database } from '../../../database/database.module.js';
import { apiKeys, users } from '../../../database/schema/index.js';
import { User } from '../../users/entities/user.entity.js';

@Injectable()
export class ApiKeysRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  replaceActiveKey(
    userId: string,
    { keyHash, prefix }: { keyHash: string; prefix: string },
  ): Promise<void> {
    return this.db.transaction(async tx => {
      await tx
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)));

      await tx.insert(apiKeys).values({ userId, keyHash, prefix });
    });
  }

  async revokeActive(userId: string): Promise<boolean> {
    const revoked = await this.db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
      .returning({ id: apiKeys.id });

    return revoked.length > 0;
  }

  async touchActiveAndFindUser(keyHash: string): Promise<User | undefined> {
    const [user] = await this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .from(users)
      .where(
        and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt), eq(users.id, apiKeys.userId)),
      )
      .returning(getTableColumns(users));

    return user;
  }
}
