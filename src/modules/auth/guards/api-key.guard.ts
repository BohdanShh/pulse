import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';

import { InvalidApiKeyException } from '../exceptions/invalid-api-key.exception.js';
import { ApiKeysService } from '../services/api-keys.service.js';
import { type AuthenticatedRequest } from '../types/authenticated-request.type.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, key] = request.headers.authorization?.split(' ') ?? [];

    const user = scheme === 'Bearer' && key && (await this.apiKeysService.authenticate(key));

    if (!user) {
      throw new InvalidApiKeyException();
    }

    request.user = user;
    return true;
  }
}
