import { Injectable } from '@nestjs/common';

import { randomBytes } from 'node:crypto';

import { User } from '../../users/entities/user.entity.js';
import { ApiKeysRepository } from '../repositories/api-keys.repository.js';
import { hashApiKey } from '../utils/hash-api-key.util.js';

@Injectable()
export class ApiKeysService {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) {}

  async issue(userId: string): Promise<string> {
    const key = 'pulse_' + randomBytes(32).toString('base64url');

    // The key itself is never stored: only its hash, plus a short prefix to recognise it by
    await this.apiKeysRepository.replaceActiveKey(userId, {
      keyHash: hashApiKey(key),
      prefix: key.slice(0, 12),
    });

    return key;
  }

  revoke(userId: string): Promise<boolean> {
    return this.apiKeysRepository.revokeActive(userId);
  }

  authenticate(key: string): Promise<User | undefined> {
    return this.apiKeysRepository.touchActiveAndFindUser(hashApiKey(key));
  }
}
