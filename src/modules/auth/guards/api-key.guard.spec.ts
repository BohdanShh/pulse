import { type ExecutionContext } from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvalidApiKeyException } from '../exceptions/invalid-api-key.exception.js';
import { ApiKeysService } from '../services/api-keys.service.js';
import { type AuthenticatedRequest } from '../types/authenticated-request.type.js';
import { ApiKeyGuard } from './api-key.guard.js';

const USER = { id: 'user-1', telegramId: 619798784 };

/** A minimal HTTP execution context around a request with the given Authorization header. */
function makeContext(authorization?: string): {
  context: ExecutionContext;
  request: AuthenticatedRequest;
} {
  const request = { headers: { authorization } } as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe('ApiKeyGuard', () => {
  const apiKeys = { authenticate: vi.fn() };
  let guard: ApiKeyGuard;

  beforeEach(() => {
    vi.resetAllMocks();
    guard = new ApiKeyGuard(apiKeys as unknown as ApiKeysService);
  });

  it('lets a valid key through and puts its user on the request', async () => {
    apiKeys.authenticate.mockResolvedValue(USER);
    const { context, request } = makeContext('Bearer pulse_abc');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(apiKeys.authenticate).toHaveBeenCalledWith('pulse_abc');
    expect(request.user).toBe(USER);
  });

  it.each([
    ['no header', undefined],
    ['an empty header', ''],
    ['another scheme', 'Basic pulse_abc'],
    ['no key after Bearer', 'Bearer'],
  ])('rejects a request with %s without looking the key up', async (_case, authorization) => {
    const { context } = makeContext(authorization);

    await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
    expect(apiKeys.authenticate).not.toHaveBeenCalled();
  });

  it('rejects an unknown or revoked key', async () => {
    apiKeys.authenticate.mockResolvedValue(undefined);
    const { context } = makeContext('Bearer pulse_revoked');

    await expect(guard.canActivate(context)).rejects.toThrow(InvalidApiKeyException);
  });
});
