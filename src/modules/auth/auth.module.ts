import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ApiKeyGuard } from './guards/api-key.guard.js';
import { ApiKeysRepository } from './repositories/api-keys.repository.js';
import { ApiKeysService } from './services/api-keys.service.js';

@Module({
  providers: [ApiKeysService, ApiKeysRepository, { provide: APP_GUARD, useClass: ApiKeyGuard }],
  exports: [ApiKeysService],
})
export class AuthModule {}
