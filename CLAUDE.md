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

docker compose up -d --build   # Postgres + migrations + app in containers (needs .env for TELEGRAM_BOT_TOKEN)
docker compose logs -f app
docker compose down            # stop; add -v to also delete the database volume
```

- Docker: `compose.yaml` runs `db` (Postgres 18, not published to the host, data in the `pgdata` volume), a one-off `migrate` job (the Dockerfile `build` stage, which has drizzle-kit) and `app` (Node running `dist/`, starts only after `migrate` exits successfully). `DATABASE_URL` is set in `compose.yaml` and overrides the one from `.env`. The Docker app uses the same bot token, so never run it next to `start:dev`.

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
- **Module graph**: `ChecksModule` → `MonitorsModule` (uses `MonitorsService.findOne` for 404s); `TelegramModule` → `UsersModule` + `AuthModule` + `MonitorsModule` + `ChecksModule`. The bot is just another client of these services, no logic of its own beyond parsing input and formatting replies.
- **Telegram bot** (`modules/telegram`): `TelegramBotService` owns the grammY `Bot<BotContext>` and its lifecycle (init, `setMyCommands`, polling, stop). Its middleware, registered in the constructor, upserts the sender and puts the user on `ctx.user` before any handler runs. Command handlers live in `commands/*.commands.ts` (`AccountCommands`, `MonitorCommands`), which register on `botService.bot` in `onModuleInit`. Bot input is validated with the same DTOs as REST, by hand (`plainToInstance` + `validate`), since `ValidationPipe` only runs for HTTP. Every reply is sent with `REPLY_OPTIONS` (HTML, no link previews), so user input (monitor names, URLs, first names) must go through `escapeHtml()`. The bot menu and `/help` are both built from `BOT_COMMANDS`. `bot.catch` logs the error and replies "Something went wrong", so a failing handler never leaves the user without an answer. Monitors are addressed by their 1-based `/list` number (`findAllByUser` orders by `created_at`, `id`).
- **Alerts** (`modules/alerts`): `ChecksService.checkMonitor` emits `monitor.status-changed` (`MonitorStatusChangedEvent` in `checks/events/`, via `@nestjs/event-emitter`) after the check is saved, only when the status actually changes. `StatusChangeListener` (`@OnEvent`) skips `PENDING → UP`, opens an incident on `→ DOWN` / closes it on `DOWN → UP` (`incidents` table, partial unique index = one open incident per monitor; `started_at` is when the monitor was marked DOWN, i.e. the 3rd failure), looks up the owner and sends the alert (with the downtime on recovery) through `NotificationsService`, which `TelegramModule` exports for messages the bot sends on its own (`bot.api.sendMessage` to the user's Telegram id). `checks` never imports `alerts` or `telegram`; nothing awaits the listener, so it catches and logs its own errors.
- **Check pipeline** (`modules/checks`):
  - `SchedulerService` ticks every `SCHEDULER_TICK_MS` via `@Interval`, skips overlapping ticks, and waits for the running tick in `beforeApplicationShutdown` (`enableShutdownHooks()` is on in `main.ts`).
  - `ChecksRepository.claimDueMonitors` atomically claims due monitors (`UPDATE ... WHERE id IN (SELECT ... FOR UPDATE SKIP LOCKED LIMIT n) RETURNING`), so multiple instances do not double-check a monitor.
  - `CheckerService` performs the HTTP request (timeout, redirects, no body download, maps network errors to text) and returns a `CheckResult`; it never throws for target failures.
  - `ChecksRepository.recordCheck` inserts the check and updates `monitors.status` / `last_checked_at` in one transaction. `POST /monitors/:monitorId/check` goes through the same `ChecksService.checkMonitor` path.
  - `monitors.status`, `consecutive_failures` and `last_checked_at` are written only by the checker, never by the API DTOs. Status rule (in `ChecksService.checkMonitor`): one successful check → `UP`; `DOWN` only after 3 failed checks in a row; otherwise the status stays as it was, so a single blip sends no alert.
- **Auth**: users are identified by Telegram (`UsersRepository.upsertByTelegramId` on every bot update, via the bot middleware). API keys (`pulse_` + random bytes) are stored only as SHA-256 hashes; a partial unique index allows one active (non-revoked) key per user, and `/apikey` rotates by revoke + insert in one transaction. `ApiKeyGuard` is registered globally (`APP_GUARD` in `AuthModule`), so every REST route requires `Authorization: Bearer <key>`; it resolves the user and bumps `last_used_at` in one `UPDATE ... FROM users RETURNING` query and puts the user on `request.user`, read with `@CurrentUser()`. There is no `@Public()` opt-out yet, so a route that must work without a key needs one added to the guard (Swagger UI at `/docs` is mounted on the HTTP adapter and is not guarded). Every monitor has an owner (`monitors.user_id`): controllers pass `user.id` from `@CurrentUser()`, and `MonitorsRepository` filters every read/update/delete by id **and** user id, so another user's monitor is a 404 (not 403, to not reveal it exists). Checks endpoints are scoped through `MonitorsService.findOne(monitorId, userId)`; only the scheduler works across all users. A user can have at most 20 monitors (`MonitorsService.create` throws `MonitorLimitReachedException` → 403); this also keeps `/list` under Telegram's 4096-char message limit.
- **Indexes**: don't use `.desc()` in Drizzle index definitions — it emits `DESC NULLS LAST`, which doesn't match `ORDER BY ... DESC`. A plain `(monitor_id, checked_at)` index is used with an Index Scan Backward (checked with EXPLAIN).
- **Pagination**: shared `src/common/pagination/` — `PaginationQueryDto` → `getLimitOffset` → repository returns `{ items, all }` → `buildPaginationMetadata` builds `{ all, next, prev }`.
- **Swagger** is generated by the `@nestjs/swagger` CLI plugin (`introspectComments`, `classValidatorShim`) from JSDoc in `*.dto.ts` / `*.entity.ts` files only — document fields with JSDoc comments, not `@ApiProperty`.
