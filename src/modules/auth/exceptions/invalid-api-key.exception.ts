import { UnauthorizedException } from '@nestjs/common';

export class InvalidApiKeyException extends UnauthorizedException {
  constructor() {
    super('Missing or invalid API key');
  }
}
