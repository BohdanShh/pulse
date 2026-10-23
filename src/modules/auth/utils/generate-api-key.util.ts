import { randomBytes } from 'node:crypto';

import {
  API_KEY_PREFIX,
  API_KEY_RANDOM_BYTES,
  API_KEY_VISIBLE_PREFIX_LENGTH,
} from '../constants/api-key.constant.js';
import { type NewApiKey } from '../types/new-api-key.type.js';
import { hashApiKey } from './hash-api-key.util.js';

export function generateApiKey(): NewApiKey {
  const key = API_KEY_PREFIX + randomBytes(API_KEY_RANDOM_BYTES).toString('base64url');

  return {
    key,
    keyHash: hashApiKey(key),
    prefix: key.slice(0, API_KEY_VISIBLE_PREFIX_LENGTH),
  };
}
