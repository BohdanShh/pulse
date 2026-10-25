import { ForbiddenException } from '@nestjs/common';

export class MonitorLimitReachedException extends ForbiddenException {
  constructor(readonly limit: number) {
    super(`You can have at most ${limit} monitors. Remove one to add another.`);
  }
}
