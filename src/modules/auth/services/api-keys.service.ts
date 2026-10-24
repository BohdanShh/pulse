import { Injectable } from '@nestjs/common';

import { User } from '../../users/entities/user.entity.js';
import { ApiKeysRepository } from '../repositories/api-keys.repository.js';
import { generateApiKey } from '../utils/generate-api-key.util.js';
import { hashApiKey } from '../utils/hash-api-key.util.js';

@Injectable()
export class ApiKeysService {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) {}

  async issue(userId: string): Promise<string> {
    const { key, keyHash, prefix } = generateApiKey();
    await this.apiKeysRepository.replaceActiveKey(userId, { keyHash, prefix });
    return key;
  }

  revoke(userId: string): Promise<boolean> {
    return this.apiKeysRepository.revokeActive(userId);
  }

  authenticate(key: string): Promise<User | undefined> {
    return this.apiKeysRepository.touchActiveAndFindUser(hashApiKey(key));
  }
}
