import { NotFoundException } from '@nestjs/common';

export class MonitorNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Monitor ${id} not found`);
  }
}
