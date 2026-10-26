import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiKeysRepository } from '../repositories/api-keys.repository.js';
import { hashApiKey } from '../utils/hash-api-key.util.js';
import { ApiKeysService } from './api-keys.service.js';

describe('ApiKeysService', () => {
  const repository = { replaceActiveKey: vi.fn(), touchActiveAndFindUser: vi.fn() };
  let service: ApiKeysService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new ApiKeysService(repository as unknown as ApiKeysRepository);
  });

  it('issues a key that starts with pulse_ followed by 32 random bytes', async () => {
    const key = await service.issue('user-1');

    // 32 bytes in base64url are 43 characters
    expect(key).toMatch(/^pulse_[A-Za-z0-9_-]{43}$/);
  });

  it('issues a different key every time', async () => {
    expect(await service.issue('user-1')).not.toBe(await service.issue('user-1'));
  });

  it('stores only the hash and a short prefix, never the key itself', async () => {
    const key = await service.issue('user-1');

    expect(repository.replaceActiveKey).toHaveBeenCalledWith('user-1', {
      keyHash: hashApiKey(key),
      prefix: key.slice(0, 12),
    });
    expect(JSON.stringify(repository.replaceActiveKey.mock.calls)).not.toContain(key);
  });

  it('looks a key up by its hash', async () => {
    await service.authenticate('pulse_abc');

    expect(repository.touchActiveAndFindUser).toHaveBeenCalledWith(hashApiKey('pulse_abc'));
  });
});
