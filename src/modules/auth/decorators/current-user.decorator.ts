import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { User } from '../../users/entities/user.entity.js';
import { type AuthenticatedRequest } from '../types/authenticated-request.type.js';

/** The user authenticated by `ApiKeyGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
