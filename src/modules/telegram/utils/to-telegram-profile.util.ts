import { type User as TelegramUser } from 'grammy/types';

import { type TelegramProfile } from '../../users/types/telegram-profile.type.js';

export const toTelegramProfile = (from: TelegramUser): TelegramProfile => ({
  telegramId: from.id,
  username: from.username ?? null,
  firstName: from.first_name,
});
