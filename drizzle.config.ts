import { existsSync } from 'node:fs';

import { defineConfig } from 'drizzle-kit';

// In Docker there is no .env file: DATABASE_URL comes from the environment
if (existsSync('.env')) process.loadEnvFile();

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
