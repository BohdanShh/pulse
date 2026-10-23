import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { type AppConfigService } from '../config/env.config.js';
import * as schema from './schema/index.js';

export const DB = Symbol('DB');
export const PG_POOL = Symbol('PG_POOL');

export type Database = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: async (config: AppConfigService) => {
        const pool = new Pool({ connectionString: config.get('DATABASE_URL', { infer: true }) });

        try {
          await pool.query('SELECT 1');
        } catch (error) {
          await pool.end();
          throw new Error(`Cannot connect to the database: ${(error as Error).message}`);
        }

        return pool;
      },
    },
    {
      provide: DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool): Database => drizzle(pool, { schema }),
    },
  ],
  exports: [DB],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
