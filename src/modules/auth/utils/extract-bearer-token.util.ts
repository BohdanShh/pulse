import { AUTH_SCHEME } from '../constants/auth.constant.js';

export function extractBearerToken(header: string | undefined): string | undefined {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme === AUTH_SCHEME && token ? token : undefined;
}
