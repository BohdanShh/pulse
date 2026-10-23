import { Inject, Injectable } from '@nestjs/common';

import { and, eq, isNull } from 'drizzle-orm';

import { DB, type Database } from '../../../database/database.module.js';
import { apiKeys } from '../../../database/schema/index.js';
import { type NewApiKey } from '../types/new-api-key.type.js';

@Injectable()
export class ApiKeysRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  replaceActiveKey(
    userId: string,
    { keyHash, prefix }: Pick<NewApiKey, 'keyHash' | 'prefix'>,
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
}
