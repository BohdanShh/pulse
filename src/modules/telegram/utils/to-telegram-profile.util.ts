import { type User as TelegramUser } from 'grammy/types';

import { type TelegramProfile } from '../../users/types/telegram-profile.type.js';

export function toTelegramProfile(from: TelegramUser): TelegramProfile {
  return {
    telegramId: from.id,
    username: from.username ?? null,
    firstName: from.first_name,
  };
}
