import { Module } from '@nestjs/common';

import { ApiKeysRepository } from './repositories/api-keys.repository.js';
import { ApiKeysService } from './services/api-keys.service.js';

@Module({
  providers: [ApiKeysService, ApiKeysRepository],
  exports: [ApiKeysService],
})
export class AuthModule {}
