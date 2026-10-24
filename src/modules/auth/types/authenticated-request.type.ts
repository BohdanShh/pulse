import { type Request } from 'express';

import { User } from '../../users/entities/user.entity.js';

export type AuthenticatedRequest = Request & { user: User };
