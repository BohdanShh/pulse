import { Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { type TelegramProfile } from '../types/telegram-profile.type.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findOrCreateFromTelegram(profile: TelegramProfile): Promise<User> {
    return this.usersRepository.upsertByTelegramId(profile);
  }
}
