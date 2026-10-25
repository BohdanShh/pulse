# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Workflow rules (explain first, small steps, talk in Russian, never commit without being asked), code conventions (folder/suffix layout, `type` not `interface`, one util per file, explicit return types, ESM `.js` imports) and the staged roadmap live in `AGENTS.md` (local only, excluded via `.git/info/exclude`):

@AGENTS.md

## Commands

```bash
bun install
bun run start:dev        # watch mode; Swagger UI at http://localhost:3000/docs
bun run build            # nest build -> dist/
bun run lint             # oxlint --type-aware src/ (no-floating-promises is an error)
bun run format           # prettier + import sorting

bun run db:generate      # drizzle-kit: SQL migration from src/database/schema/index.ts -> drizzle/
bun run db:migrate       # apply migrations to DATABASE_URL
bun run db:studio
```

- There are no tests yet (by design, until stage 8). Verify changes with `bun run build`, `bun run lint`, and manual requests (curl / Swagger / the bot).
- `.env` needs `PORT`, `DATABASE_URL`, `TELEGRAM_BOT_TOKEN` (see `.env.example`); `validateEnv` in `src/config/env.config.ts` fails startup on invalid values, and `DatabaseModule` fails startup if `SELECT 1` fails.
- Starting the app also starts Telegram long polling. Never run a second instance (e.g. `node dist/main` next to `start:dev`) with the same token — Telegram returns 409 and one poller stops.
- `drizzle.config.ts` reads `.env` via `process.loadEnvFile()`. Migrations have descriptive names (`0004_create_api_keys.sql`) — pass `--name <name>` to `db:generate`, and review the generated SQL before migrating.

## Code style

- A constant, type or helper used in only one place is written where it is used (inline value or object type, or a private method), not extracted. Move it to `constants/` · `types/` · `utils/` only when a second place needs it; a value used several times in one file is a file-local `const`. `src/common/` and `src/database/constants/` stay extracted. Comment inline values whose meaning is not obvious.

## Architecture

One NestJS app (`src/main.ts` → `AppModule`) serves REST + Swagger, runs the background checker, and runs the Telegram bot in the same process.

- **Database access**: `DatabaseModule` is `@Global` and exports the Drizzle instance under the `DB` symbol (type `Database` = `NodePgDatabase<typeof schema>`). Repositories inject it with `@Inject(DB)`; services never touch Drizzle. All tables are re-exported from `src/database/schema/index.ts` — a new table must be added there or neither drizzle-kit nor the typed `db.query` will see it.
- **Config**: inject `ConfigService` typed as `AppConfigService` and read with `config.get('KEY', { infer: true })`. Because `AppConfigService` is a type-only import, constructor injection needs an explicit `@Inject(ConfigService)`.
- **Module graph**: `ChecksModule` → `MonitorsModule` (uses `MonitorsService.findOne` for 404s); `TelegramModule` → `UsersModule` + `AuthModule` + `MonitorsModule`. Bot input is validated with the same DTOs as REST, manually (`plainToInstance` + `validate`), since `ValidationPipe` only runs for HTTP. Every bot reply is sent with `REPLY_OPTIONS` (HTML, no link previews), so user input (monitor names, URLs, first names) must go through `escapeHtml()`. The bot menu and `/help` are both built from `BOT_COMMANDS`. The bot is just another client of these services, no logic of its own beyond formatting replies.
- **Check pipeline** (`modules/checks`):
  - `SchedulerService` ticks every `SCHEDULER_TICK_MS` via `@Interval`, skips overlapping ticks, and waits for the running tick in `beforeApplicationShutdown` (`enableShutdownHooks()` is on in `main.ts`).
  - `ChecksRepository.claimDueMonitors` atomically claims due monitors (`UPDATE ... WHERE id IN (SELECT ... FOR UPDATE SKIP LOCKED LIMIT n) RETURNING`), so multiple instances do not double-check a monitor.
  - `CheckerService` performs the HTTP request (timeout, redirects, no body download, maps network errors to text) and returns a `CheckResult`; it never throws for target failures.
  - `ChecksRepository.recordCheck` inserts the check and updates `monitors.status` / `last_checked_at` in one transaction. `POST /monitors/:monitorId/check` goes through the same `ChecksService.checkMonitor` path.
  - `monitors.status` and `last_checked_at` are written only by the checker, never by the API DTOs.
- **Auth**: users are identified by Telegram (`UsersRepository.upsertByTelegramId` on any bot command). API keys (`pulse_` + random bytes) are stored only as SHA-256 hashes; a partial unique index allows one active (non-revoked) key per user, and `/apikey` rotates by revoke + insert in one transaction. `ApiKeyGuard` is registered globally (`APP_GUARD` in `AuthModule`), so every REST route requires `Authorization: Bearer <key>`; it resolves the user and bumps `last_used_at` in one `UPDATE ... FROM users RETURNING` query and puts the user on `request.user`, read with `@CurrentUser()`. There is no `@Public()` opt-out yet, so a route that must work without a key needs one added to the guard (Swagger UI at `/docs` is mounted on the HTTP adapter and is not guarded). Every monitor has an owner (`monitors.user_id`): controllers pass `user.id` from `@CurrentUser()`, and `MonitorsRepository` filters every read/update/delete by id **and** user id, so another user's monitor is a 404 (not 403, to not reveal it exists). Checks endpoints are scoped through `MonitorsService.findOne(monitorId, userId)`; only the scheduler works across all users.
- **Indexes**: don't use `.desc()` in Drizzle index definitions — it emits `DESC NULLS LAST`, which doesn't match `ORDER BY ... DESC`. A plain `(monitor_id, checked_at)` index is used with an Index Scan Backward (checked with EXPLAIN).
- **Pagination**: shared `src/common/pagination/` — `PaginationQueryDto` → `getLimitOffset` → repository returns `{ items, all }` → `buildPaginationMetadata` builds `{ all, next, prev }`.
- **Swagger** is generated by the `@nestjs/swagger` CLI plugin (`introspectComments`, `classValidatorShim`) from JSDoc in `*.dto.ts` / `*.entity.ts` files only — document fields with JSDoc comments, not `@ApiProperty`.
