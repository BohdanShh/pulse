import { createHash } from 'node:crypto';

import { API_KEY_HASH_ALGORITHM } from '../constants/api-key.constant.js';

export function hashApiKey(key: string): string {
  return createHash(API_KEY_HASH_ALGORITHM).update(key).digest('hex');
}
