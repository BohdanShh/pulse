import { type Context } from 'grammy';

import { User } from '../../users/entities/user.entity.js';

/** Context with the sender resolved to a Pulse user by the middleware in TelegramBotService. */
export type BotContext = Context & { user: User };
